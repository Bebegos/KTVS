import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino, ActiveEffect, BattleVisualEffects } from '../game/types'
import { Adventure, AdventureEnemy } from '../lib/adventures'
import { BattleEngine } from '../lib/battleEngine'
import { supabase, addXpToDino, addCoinsToUser } from '../lib/supabase'
import { useAuth } from '../lib/auth-context'
import { slotService, battleVisualService } from '../lib/services'
import HealthBar from './HealthBar'
import EffectInfoModal from './EffectInfoModal'
import BattleArena, { BattleArenaSlot } from './battle/BattleArena'

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
  const [selectedAbility, setSelectedAbility] = useState<number | null>(null)
  const [roundInProgress, setRoundInProgress] = useState(false)
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [adventureEnded, setAdventureEnded] = useState(false)
  const [adventureWon, setAdventureWon] = useState(false)
  const [totalXpGained, setTotalXpGained] = useState(0)
  const [totalCoinsGained, setTotalCoinsGained] = useState(0)
  const [effectInfoOpen, setEffectInfoOpen] = useState(false)
  const [selectedEffectInfo, setSelectedEffectInfo] = useState<ActiveEffect | null>(null)

  // Immersive battle effect system
  const [activeEffectOverlay, setActiveEffectOverlay] = useState(false)
  const [currentVisualEffects, setCurrentVisualEffects] = useState<BattleVisualEffects | null>(null)
  const [floatingDamages, setFloatingDamages] = useState<
    Array<{ id: string; damage: number; isCritical: boolean; isHealing: boolean; x: number; y: number }>
  >([])

  const currentScene = adventure.scenes[currentSceneIdx]
  const currentEnemyData = currentScene?.enemies[currentEnemyIdx]

  const openEffectInfo = (effect: ActiveEffect) => {
    setSelectedEffectInfo(effect)
    setEffectInfoOpen(true)
  }

  // Create battle engine when entering battle
  useEffect(() => {
    if (inBattle && currentEnemyData && !battleEngine) {
      const opponentDino = generateOpponentFromData(playerDino, currentEnemyData)
      const engine = new BattleEngine(playerDino, opponentDino)

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

      const playerVisuals = battleVisualService.getVisualEffects(playerAbility)
      const opponentVisuals = battleVisualService.getVisualEffects(opponentAbility)

      setBattleLog(prev => [result.playerAction.message, ...prev.slice(0, 14)])

      setCurrentVisualEffects(playerVisuals)
      setActiveEffectOverlay(true)

      if (result.playerAction.damage > 0) {
        setFloatingDamages(prev => [...prev, {
          id: `${Date.now()}-player`,
          damage: result.playerAction.damage,
          isCritical: false,
          isHealing: false,
          x: window.innerWidth * 0.75,
          y: window.innerHeight * 0.3,
        }])
      }

      setTimeout(() => {
        setActiveEffectOverlay(false)

        if (!result.playerAction.targetDied) {
          setBattleLog(prev => [result.opponentAction.message, ...prev.slice(0, 14)])

          setTimeout(() => {
            setCurrentVisualEffects(opponentVisuals)
            setActiveEffectOverlay(true)

            if (result.opponentAction.damage > 0) {
              setFloatingDamages(prev => [...prev, {
                id: `${Date.now()}-opponent`,
                damage: result.opponentAction.damage,
                isCritical: false,
                isHealing: false,
                x: window.innerWidth * 0.25,
                y: window.innerHeight * 0.3,
              }])
            }
          }, playerVisuals.animationDuration + 200)

          setTimeout(() => {
            setActiveEffectOverlay(false)
          }, playerVisuals.animationDuration + 200 + opponentVisuals.animationDuration)
        }

        setTimeout(() => {
          setBattleState(battleEngine.getState())
          setPlayerCurrentHp(battleEngine.getState().player.currentHp)

          if (result.battleEnded) {
            handleBattleEnd(result.winner === 'player')
          }

          setSelectedAbility(null)
          setRoundInProgress(false)
          setFloatingDamages([])
        }, result.playerAction.targetDied ? playerVisuals.animationDuration + 300 : playerVisuals.animationDuration + opponentVisuals.animationDuration + 500)
      }, playerVisuals.animationDuration)
    }, 800)
  }

  async function handleBattleEnd(playerWon: boolean) {
    if (!battleEngine) return

    if (!playerWon) {
      setAdventureEnded(true)
      setAdventureWon(false)
      return
    }

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

    const newHp = battleEngine.getState().player.currentHp
    setPlayerCurrentHp(newHp)

    if (currentEnemyIdx < currentScene.enemies.length - 1) {
      setCurrentEnemyIdx(currentEnemyIdx + 1)
      setInBattle(false)
      setBattleEngine(null)
      setBattleState(null)
      setBattleLog([])
    } else if (currentSceneIdx < adventure.scenes.length - 1) {
      setCurrentSceneIdx(currentSceneIdx + 1)
      setCurrentEnemyIdx(0)
      setInBattle(false)
      setBattleEngine(null)
      setBattleState(null)
      setBattleLog([])
    } else {
      setAdventureEnded(true)
      setAdventureWon(true)
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

  // IN BATTLE — unified WoW-style arena
  if (inBattle && battleState) {
    const slots: BattleArenaSlot[] = [0, 1, 2, 3, 4, 5].map((idx) => {
      const ability = battleState.player.abilities[idx] || null
      const isLocked = slotService.isSlotLocked(playerDino, idx)
      const canUse = !isLocked && !!battleEngine?.canUseAbility('player', idx)
      return {
        ability,
        index: idx,
        isUltimate: idx === 5,
        isSelected: selectedAbility === idx,
        isLocked,
        canUse,
        cooldown: battleState.player.cooldowns[idx] || 0,
        maxCooldown: ability?.maxCd || 0,
        disabled: selectedAbility !== null || !canUse || roundInProgress,
        lockedLevel: isLocked ? slotService.getSlotRequiredLevel(idx) : undefined,
      }
    })

    return (
      <>
        <BattleArena
          player={{
            name: playerDino.name,
            level: playerDino.level,
            currentHp: battleState.player.currentHp,
            maxHp: playerDino.maxHp,
            effects: battleState.player.effects,
          }}
          opponent={{
            name: battleState.opponent.dino.name,
            level: battleState.opponent.dino.level,
            currentHp: battleState.opponent.currentHp,
            maxHp: battleState.opponent.dino.maxHp,
            effects: battleState.opponent.effects,
          }}
          playerAtk={battleState.player.atk}
          round={battleState.round}
          battleLog={battleLog}
          slots={slots}
          onSelectAbility={selectAbility}
          onEffectClick={openEffectInfo}
          activeEffectOverlay={activeEffectOverlay}
          currentVisualEffects={currentVisualEffects}
          onEffectOverlayComplete={() => setActiveEffectOverlay(false)}
          floatingDamages={floatingDamages}
        />

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
      </>
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
