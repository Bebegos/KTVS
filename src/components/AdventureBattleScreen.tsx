import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino, ActiveEffect, BattleVisualEffects } from '../game/types'
import { Adventure, AdventureScene, AdventureEnemy } from '../lib/adventures'
import { BattleEngine } from '../lib/battleEngine'
import { supabase, addXpToDino, addCoinsToUser } from '../lib/supabase'
import { useAuth } from '../lib/auth-context'
import { slotService, abilityDefinitionService, battleVisualService } from '../lib/services'
import BattleStatsCard from './BattleStatsCard'
import EffectsDisplay from './EffectsDisplay'
import AbilityIcon from './AbilityIcon'
import HealthBar from './HealthBar'
import BattleEffectVisuals from './BattleEffectVisuals'
import AbilityInfoModal from './AbilityInfoModal'
import EffectInfoModal from './EffectInfoModal'
import PremiumAbilityButton from './PremiumAbilityButton'
import BattleEffectOverlay from './battle-effects/BattleEffectOverlay'
import FloatingDamageNumber from './battle-effects/FloatingDamageNumber'
import BattleDinoHUD from './battle-effects/BattleDinoHUD'
import TurnIndicator from './battle-effects/TurnIndicator'
import EnhancedBattleLog from './battle-effects/EnhancedBattleLog'
import SvgIcon from './SvgIcon'
import { getEffectNameTR } from '../lib/effect-translations'

interface AdventureBattleScreenProps {
  playerDino: Dino
  adventure: Adventure
  onComplete: (won: boolean, xpGained: number) => void
  onBack: () => void
}

export default function AdventureBattleScreen({
  playerDino,
  adventure,
  onComplete,
  onBack,
}: AdventureBattleScreenProps) {
  const { user } = useAuth()
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0)
  const [currentEnemyIdx, setCurrentEnemyIdx] = useState(0)
  const [inBattle, setInBattle] = useState(false)
  const [playerCurrentHp, setPlayerCurrentHp] = useState(playerDino.maxHp)
  const [battleEngine, setBattleEngine] = useState<BattleEngine | null>(null)
  const [battleState, setBattleState] = useState<any>(null)
  const [currentEffectVisual, setCurrentEffectVisual] = useState<'buff' | 'debuff' | 'damage' | null>(null)
  const [showEffectVisual, setShowEffectVisual] = useState(false)
  const [selectedAbility, setSelectedAbility] = useState<number | null>(null)
  const [roundInProgress, setRoundInProgress] = useState(false)
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [adventureEnded, setAdventureEnded] = useState(false)
  const [adventureWon, setAdventureWon] = useState(false)
  const [recordingMatch, setRecordingMatch] = useState(false)
  const [totalXpGained, setTotalXpGained] = useState(0)
  const [totalCoinsGained, setTotalCoinsGained] = useState(0)
  const [abilityInfoOpen, setAbilityInfoOpen] = useState(false)
  const [selectedAbilityInfo, setSelectedAbilityInfo] = useState<any>(null)
  const [effectInfoOpen, setEffectInfoOpen] = useState(false)
  const [selectedEffectInfo, setSelectedEffectInfo] = useState<ActiveEffect | null>(null)

  // New immersive battle effect system
  const [activeEffectOverlay, setActiveEffectOverlay] = useState(false)
  const [currentVisualEffects, setCurrentVisualEffects] = useState<BattleVisualEffects | null>(null)
  const [floatingDamages, setFloatingDamages] = useState<
    Array<{ id: string; damage: number; isCritical: boolean; isHealing: boolean; x: number; y: number }>
  >([])

  const currentScene = adventure.scenes[currentSceneIdx]
  const currentEnemyData = currentScene?.enemies[currentEnemyIdx]

  // Helper functions for modals
  const openAbilityInfo = (abilityId: string, idx: number) => {
    setSelectedAbilityInfo({ abilityId, idx })
    setAbilityInfoOpen(true)
  }

  const openEffectInfo = (effect: ActiveEffect) => {
    setSelectedEffectInfo(effect)
    setEffectInfoOpen(true)
  }

  // Create battle engine when entering battle
  useEffect(() => {
    if (inBattle && currentEnemyData && !battleEngine) {
      const opponentDino = generateOpponentFromData(playerDino, currentEnemyData)
      // Set opponent HP based on previous battle result
      const engine = new BattleEngine(playerDino, opponentDino)

      // Modify player's current HP in the engine
      const state = engine.getState()
      state.player.currentHp = playerCurrentHp

      setBattleEngine(engine)
      setBattleState(state)
      setBattleLog(state.battleLog)
    }
  }, [inBattle, currentEnemyData, playerDino, playerCurrentHp, battleEngine])

  function startBattle() {
    setInBattle(true)
    setSelectedAbility(null)
    setRoundInProgress(false)
  }

  function selectAbility(abilityIdx: number) {
    if (roundInProgress || selectedAbility !== null || !battleEngine) return

    // CRITICAL: Check if slot is locked before allowing execution
    if (slotService.isSlotLocked(playerDino, abilityIdx)) {
      const requiredLevel = slotService.getSlotRequiredLevel(abilityIdx)
      console.warn(`Slot ${abilityIdx} is locked. Requires level ${requiredLevel}`)
      return
    }

    if (!battleEngine.canUseAbility('player', abilityIdx)) return

    setSelectedAbility(abilityIdx)

    setTimeout(() => {
      executeRound(abilityIdx)
    }, 500)
  }

  function executeRound(playerAbilityIdx: number) {
    if (!battleEngine) return

    let availableAbilities = battleState.opponent.abilities
      .map((_: any, idx: number) => idx)
      .filter((idx: number) => battleEngine.canUseAbility('opponent', idx))

    // In adventures up to level 10, enemies cannot use abilities with effects
    if (currentScene && adventure.minLevel <= 10) {
      availableAbilities = availableAbilities.filter((idx: number) => {
        const ability = battleState.opponent.abilities[idx]
        return !ability.effects || ability.effects.length === 0
      })
    }

    const opponentAbilityIdx =
      availableAbilities.length > 0
        ? availableAbilities[Math.floor(Math.random() * availableAbilities.length)]
        : 0

    setRoundInProgress(true)

    setTimeout(() => {
      const result = battleEngine.executeRound(playerAbilityIdx, opponentAbilityIdx)
      const playerAbility = battleState.player.abilities[playerAbilityIdx]
      const opponentAbility = battleState.opponent.abilities[opponentAbilityIdx]

      // Get visual effects for both abilities upfront
      const playerVisuals = battleVisualService.getVisualEffects(playerAbility)
      const opponentVisuals = battleVisualService.getVisualEffects(opponentAbility)

      setBattleLog(prev => [result.playerAction.message, ...prev.slice(0, 14)])

      // Show player ability effect overlay
      setCurrentVisualEffects(playerVisuals)
      setActiveEffectOverlay(true)

      // Add floating damage numbers
      if (result.playerAction.damage > 0) {
        const newDamage = {
          id: `${Date.now()}-player`,
          damage: result.playerAction.damage,
          isCritical: false, // TODO: Add isCrit to result type
          isHealing: false,
          x: window.innerWidth * 0.75,
          y: window.innerHeight * 0.3,
        }
        setFloatingDamages(prev => [...prev, newDamage])
      }

      setTimeout(() => {
        setActiveEffectOverlay(false)

        if (!result.playerAction.targetDied) {
          // Opponent's turn
          setBattleLog(prev => [result.opponentAction.message, ...prev.slice(0, 14)])

          // Show opponent ability effect overlay
          setTimeout(() => {
            setCurrentVisualEffects(opponentVisuals)
            setActiveEffectOverlay(true)

            // Add floating damage numbers for opponent
            if (result.opponentAction.damage > 0) {
              const newDamage = {
                id: `${Date.now()}-opponent`,
                damage: result.opponentAction.damage,
                isCritical: false, // TODO: Add isCrit to result type
                isHealing: false,
                x: window.innerWidth * 0.25,
                y: window.innerHeight * 0.3,
              }
              setFloatingDamages(prev => [...prev, newDamage])
            }
          }, playerVisuals.animationDuration + 200)

          // Hide opponent effect overlay
          setTimeout(() => {
            setActiveEffectOverlay(false)
          }, playerVisuals.animationDuration + 200 + opponentVisuals.animationDuration)
        }

        // Wait for all animations to complete before updating state
        setTimeout(() => {
          setBattleState(battleEngine.getState())
          setPlayerCurrentHp(battleEngine.getState().player.currentHp)

          if (result.battleEnded) {
            handleBattleEnd(result.winner === 'player')
          }

          setSelectedAbility(null)
          setRoundInProgress(false)
          setFloatingDamages([]) // Clear floating damages
        }, result.playerAction.targetDied ? playerVisuals.animationDuration + 300 : playerVisuals.animationDuration + opponentVisuals.animationDuration + 500)
      }, playerVisuals.animationDuration)
    }, 800)
  }

  async function handleBattleEnd(playerWon: boolean) {
    if (!battleEngine) return

    if (!playerWon) {
      // Player lost
      setAdventureEnded(true)
      setAdventureWon(false)
      return
    }

    // Player won - give XP and coins for this enemy
    const enemyXpReward = Math.floor(adventure.xpReward / adventure.scenes.length)
    const enemyCoinReward = Math.floor(adventure.coinReward / adventure.scenes.length)

    try {
      await addXpToDino(playerDino.id, enemyXpReward)
      if (user?.id) {
        await addCoinsToUser(user.id, enemyCoinReward)
      }

      setTotalXpGained(prev => prev + enemyXpReward)
      setTotalCoinsGained(prev => prev + enemyCoinReward)
    } catch (err) {
      console.error('Error giving rewards:', err)
    }

    // Save HP and move to next enemy or scene
    const newHp = battleEngine.getState().player.currentHp
    setPlayerCurrentHp(newHp)

    if (currentEnemyIdx < currentScene.enemies.length - 1) {
      // Next enemy in same scene
      setCurrentEnemyIdx(currentEnemyIdx + 1)
      setInBattle(false)
      setBattleEngine(null)
      setBattleState(null)
      setBattleLog([])
    } else if (currentSceneIdx < adventure.scenes.length - 1) {
      // Next scene
      setCurrentSceneIdx(currentSceneIdx + 1)
      setCurrentEnemyIdx(0)
      setInBattle(false)
      setBattleEngine(null)
      setBattleState(null)
      setBattleLog([])
    } else {
      // Adventure complete!
      setAdventureEnded(true)
      setAdventureWon(true)
      // Give final bonus (remaining XP/coins)
      const finalXpBonus = adventure.xpReward - totalXpGained
      const finalCoinBonus = adventure.coinReward - totalCoinsGained

      try {
        if (finalXpBonus > 0) {
          await addXpToDino(playerDino.id, finalXpBonus)
          setTotalXpGained(prev => prev + finalXpBonus)
        }
        if (finalCoinBonus > 0 && user?.id) {
          await addCoinsToUser(user.id, finalCoinBonus)
          setTotalCoinsGained(prev => prev + finalCoinBonus)
        }
      } catch (err) {
        console.error('Error giving final rewards:', err)
      }
    }
  }



  // ADVENTURE COMPLETE SCREEN
  if (adventureEnded) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 relative overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-dark neon-border-cyan rounded-2xl p-12 text-center max-w-md"
        >
          <div className="text-9xl mb-6">{adventureWon ? '🎉' : '💀'}</div>

          <h1 className="text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">
            {adventureWon ? 'MACERAYı TAMAMLA!' : 'MACERAYı KAYBETTİN!'}
          </h1>

          {adventureWon && (
            <div className="mb-6 space-y-3">
              <div className="glass-dark neon-border-cyan rounded-lg p-4 space-y-2">
                <p className="text-xl font-bold text-green-400">✅ {totalXpGained} XP Kazandı</p>
                <p className="text-xl font-bold text-yellow-400">✨ {totalCoinsGained} DinoCoin Kazandı</p>
              </div>
              <p className="text-lg font-bold text-neon-cyan">🎉 Macera Tamamlandı!</p>
            </div>
          )}

          {!adventureWon && (
            <p className="text-lg font-bold text-red-400 mb-6">😔 Maceradan Başarısız Oldun</p>
          )}

          <button
            onClick={() => onComplete(adventureWon, totalXpGained)}
            className="hs-btn hs-btn-block"
          >
            <span>{adventureWon ? 'Sonraki Macera' : 'Geri Dön'}</span>
          </button>
        </motion.div>
      </div>
    )
  }

  // IN BATTLE
  if (inBattle && battleState) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 p-4 overflow-y-auto relative">
        {/* New immersive effect overlay */}
        <AnimatePresence>
          {activeEffectOverlay && currentVisualEffects && (
            <BattleEffectOverlay
              isActive={activeEffectOverlay}
              visualEffects={currentVisualEffects}
              onComplete={() => setActiveEffectOverlay(false)}
            />
          )}
        </AnimatePresence>

        {/* Floating damage numbers */}
        <AnimatePresence>
          {floatingDamages.map((damage) => (
            <FloatingDamageNumber
              key={damage.id}
              damage={damage.damage}
              isCritical={damage.isCritical}
              isHealing={damage.isHealing}
              x={damage.x}
              y={damage.y}
            />
          ))}
        </AnimatePresence>

        <BattleEffectVisuals effectType={currentEffectVisual} isVisible={showEffectVisual} />

        {/* Enhanced turn indicator */}
        <AnimatePresence>
          <TurnIndicator round={battleState.round} isPlayerTurn={battleState.round % 2 === 1} />
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Player */}
          <div>
            <div className="hs-battle-frame hs-battle-frame-player mb-3">
              <div className="glass-dark neon-border-cyan rounded-lg p-4">
                <p className="text-xs font-bold text-neon-cyan mb-2">OYUNCU</p>
                <BattleDinoHUD
                  dinoName={playerDino.name}
                  currentHp={playerCurrentHp}
                  maxHp={playerDino.maxHp}
                  effects={battleState.player.effects}
                  isPlayer={true}
                />
              </div>
            </div>

            <BattleStatsCard dino={battleState.player.dino} effects={battleState.player.effects} isPlayer={true} />
          </div>

          {/* Enemy */}
          <div>
            <div className="hs-battle-frame hs-battle-frame-opponent mb-3">
              <div className="glass-dark neon-border-purple rounded-lg p-4">
                <p className="text-xs font-bold text-neon-purple mb-2">DÜŞMAN</p>
                <BattleDinoHUD
                  dinoName={battleState.opponent.dino.name}
                  currentHp={battleState.opponent.currentHp}
                  maxHp={battleState.opponent.dino.maxHp}
                  effects={battleState.opponent.effects}
                  isPlayer={false}
                />
              </div>
            </div>

            <BattleStatsCard dino={battleState.opponent.dino} effects={battleState.opponent.effects} isPlayer={false} />
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs font-bold text-neon-cyan mb-2 uppercase tracking-widest">⚔️ Yetenek Seç</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[0, 1, 2, 3, 4].map((idx) => {
              const ability = battleState.player.abilities[idx]
              const isLocked = slotService.isSlotLocked(playerDino, idx)
              const canUse = !isLocked && battleEngine?.canUseAbility('player', idx)
              const isSelected = selectedAbility === idx
              const cooldown = battleState.player.cooldowns[idx] || 0

              return (
                <PremiumAbilityButton
                  key={idx}
                  ability={ability || null}
                  index={idx}
                  isSelected={isSelected}
                  isLocked={isLocked}
                  canUse={canUse}
                  cooldown={cooldown}
                  maxCooldown={ability?.maxCd || 0}
                  disabled={selectedAbility !== null || !canUse || roundInProgress}
                  onClick={() => selectAbility(idx)}
                  onInfo={() => openAbilityInfo(battleState.player.abilityIds[idx], idx)}
                  lockedLevel={isLocked ? slotService.getSlotRequiredLevel(idx) : undefined}
                />
              )
            })}
          </div>

          {/* Ultimate Slot */}
          <PremiumAbilityButton
            ability={battleState.player.abilities[5] || null}
            index={5}
            isUltimate={true}
            isSelected={selectedAbility === 5}
            isLocked={slotService.isSlotLocked(playerDino, 5)}
            canUse={battleEngine?.canUseAbility('player', 5) || false}
            cooldown={battleState.player.cooldowns[5] || 0}
            maxCooldown={battleState.player.abilities[5]?.maxCd || 0}
            disabled={selectedAbility !== null || !battleEngine?.canUseAbility('player', 5) || roundInProgress}
            onClick={() => selectAbility(5)}
            onInfo={() => openAbilityInfo(battleState.player.abilityIds[5], 5)}
            lockedLevel={slotService.isSlotLocked(playerDino, 5) ? slotService.getSlotRequiredLevel(5) : undefined}
          />
        </div>

        <div className="flex-1">
          <EnhancedBattleLog entries={battleLog} maxEntries={6} />
        </div>

        <AnimatePresence>
          {abilityInfoOpen && selectedAbilityInfo && (
            <AbilityInfoModal
              abilityId={selectedAbilityInfo.abilityId}
              dino={playerDino}
              cooldown={battleState.player.cooldowns[selectedAbilityInfo.idx] || 0}
              isOpen={abilityInfoOpen}
              onClose={() => setAbilityInfoOpen(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {effectInfoOpen && selectedEffectInfo && (
            <EffectInfoModal
              effect={selectedEffectInfo}
              battleCharacterMaxHp={playerDino.maxHp}
              isOpen={effectInfoOpen}
              onClose={() => setEffectInfoOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    )
  }

  // STORY VIEW
  return (
    <div className="w-full min-h-screen flex flex-col p-4 gap-6 relative overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-neon-cyan opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-neon-purple opacity-5 rounded-full blur-3xl"></div>
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        className="hs-btn absolute top-4 left-4 z-10"
      >
        <span>Geri</span>
      </button>

      <div className="flex flex-col items-center gap-6 z-10 mt-8 max-w-2xl mx-auto">
        {/* Adventure header */}
        <div className="w-full glass-dark neon-border-purple rounded-lg p-6 text-center">
          <h1 className="text-3xl font-black text-neon-purple mb-2">{adventure.name}</h1>
          <p className="text-neon-purple/70">Sahne {currentSceneIdx + 1}/{adventure.scenes.length}</p>
        </div>

        {/* Illustration */}
        <div className="text-8xl animate-bounce">{currentScene.illustration}</div>

        {/* Story */}
        <div className="glass-dark neon-border-cyan rounded-lg p-8 text-center">
          <h2 className="text-2xl font-black text-neon-cyan mb-4">{currentScene.title}</h2>
          <p className="text-neon-cyan/80 leading-relaxed text-lg mb-6">{currentScene.story}</p>

          {/* Enemy preview */}
          {currentEnemyData && (
            <div className="mt-6 pt-6 border-t border-neon-cyan/30">
              <p className="text-xs font-bold text-neon-cyan/70 mb-3">KARŞILAŞACAĞIN DÜŞMAN:</p>
              <div className="glass border border-red-500/30 rounded-lg p-4">
                <p className="text-2xl font-black text-red-400">{currentEnemyData.name}</p>
                <p className="text-sm text-red-400/70 mt-2">Seviye {currentEnemyData.level}</p>
              </div>
            </div>
          )}
        </div>

        {/* Player status */}
        <div className="w-full glass-dark neon-border-cyan rounded-lg p-4">
          <p className="text-xs font-bold text-neon-cyan mb-2">SENİN DURUMUN</p>
          <HealthBar current={playerCurrentHp} max={playerDino.maxHp} variant="player" />
        </div>

        {/* Action buttons */}
        <div className="w-full space-y-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startBattle}
            className="hs-btn hs-btn-lg hs-btn-block"
          >
            <span>{currentScene.actionText || 'İlerle'}</span>
          </motion.button>
        </div>
      </div>
    </div>
  )
}

function generateOpponentFromData(playerDino: Dino, enemyData: AdventureEnemy): Dino {
  // Create opponent with themed abilities if available, otherwise use player abilities
  // Each enemy has unique themed abilities based on adventure type and enemy name

  return {
    id: 'adventure-enemy-' + Date.now(),
    name: enemyData.name,
    familyCode: '',
    level: enemyData.level,
    xp: 0,
    maxHp: Math.floor((playerDino.maxHp ?? 30) * enemyData.hpMultiplier),
    atk: Math.floor((playerDino.atk ?? 5) * enemyData.atkMultiplier),
    def: Math.floor((playerDino.def ?? 5) * enemyData.defMultiplier),
    spd: Math.floor((playerDino.spd ?? 5) * enemyData.spdMultiplier),
    element: playerDino.element,
    abilityIds: enemyData.abilityIds || playerDino.abilityIds,
  }
}
