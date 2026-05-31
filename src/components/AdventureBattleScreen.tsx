import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino, ActiveEffect } from '../game/types'
import { Adventure, AdventureScene, AdventureEnemy } from '../lib/adventures'
import { BattleEngine } from '../lib/battleEngine'
import { supabase, addXpToDino, addCoinsToUser } from '../lib/supabase'
import { useAuth } from '../lib/auth-context'
import { slotService } from '../lib/services'
import BattleStatsCard from './BattleStatsCard'
import EffectsDisplay from './EffectsDisplay'
import AbilityIcon from './AbilityIcon'
import HealthBar from './HealthBar'
import BattleEffectVisuals from './BattleEffectVisuals'
import AbilityInfoModal from './AbilityInfoModal'
import EffectInfoModal from './EffectInfoModal'
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

      setBattleLog(prev => [result.playerAction.message, ...prev.slice(0, 14)])
      setCurrentEffectVisual('damage')
      setShowEffectVisual(true)
      setTimeout(() => setShowEffectVisual(false), 1500)

      setTimeout(() => {
        if (!result.playerAction.targetDied) {
          setBattleLog(prev => [result.opponentAction.message, ...prev.slice(0, 14)])
          setCurrentEffectVisual('damage')
          setShowEffectVisual(true)
          setTimeout(() => setShowEffectVisual(false), 1500)
        }

        setBattleState(battleEngine.getState())
        setPlayerCurrentHp(battleEngine.getState().player.currentHp)

        if (result.battleEnded) {
          handleBattleEnd(result.winner === 'player')
        }

        setSelectedAbility(null)
        setRoundInProgress(false)
      }, 2000)
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
            className="w-full px-6 py-3 glass-dark neon-border-cyan rounded-lg font-bold text-neon-cyan hover:shadow-neon-cyan transition"
          >
            {adventureWon ? '✨ Sonraki Macera' : '← Geri Dön'}
          </button>
        </motion.div>
      </div>
    )
  }

  // IN BATTLE
  if (inBattle && battleState) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 p-4 overflow-y-auto relative">
        <BattleEffectVisuals effectType={currentEffectVisual} isVisible={showEffectVisual} />

        <div className="mb-4 flex justify-between items-center">
          <div className="glass-dark neon-border-cyan rounded-lg px-4 py-2">
            <p className="text-sm font-bold text-neon-cyan">🔄 Tur {battleState.round}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Player */}
          <div>
            <div className="glass-dark neon-border-cyan rounded-lg p-4 mb-3">
              <p className="text-xs font-bold text-neon-cyan mb-2">OYUNCU</p>
              <h2 className="text-lg font-black text-neon-cyan mb-2">{playerDino.name}</h2>
              <div className="mb-3">
                <HealthBar current={playerCurrentHp} max={playerDino.maxHp} variant="player" />
              </div>

              <div className="mb-3 p-3 bg-neon-cyan/5 rounded-lg border border-neon-cyan/20">
                <EffectsDisplay effects={battleState.player.effects} battleCharacterMaxHp={playerDino.maxHp} />
              </div>
            </div>

            <BattleStatsCard dino={battleState.player.dino} effects={battleState.player.effects} isPlayer={true} />
          </div>

          {/* Enemy */}
          <div>
            <div className="glass-dark neon-border-purple rounded-lg p-4 mb-3">
              <p className="text-xs font-bold text-neon-purple mb-2">DÜŞMAN</p>
              <h2 className="text-lg font-black text-neon-purple mb-2">{battleState.opponent.dino.name}</h2>
              <div className="mb-3">
                <HealthBar current={battleState.opponent.currentHp} max={battleState.opponent.dino.maxHp} variant="enemy" />
              </div>

              <div className="mb-3 p-3 bg-neon-purple/5 rounded-lg border border-neon-purple/20">
                <EffectsDisplay effects={battleState.opponent.effects} />
              </div>
            </div>

            <BattleStatsCard dino={battleState.opponent.dino} effects={battleState.opponent.effects} isPlayer={false} />
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs font-bold text-neon-cyan mb-2">⚔️ YETENEKLERİ SEÇ</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {[0, 1, 2, 3, 4].map((idx) => {
              const ability = battleState.player.abilities[idx]
              const isLocked = slotService.isSlotLocked(playerDino, idx)
              const canUse = !isLocked && battleEngine?.canUseAbility('player', idx)
              const isSelected = selectedAbility === idx

              if (isLocked) {
                const requiredLevel = slotService.getSlotRequiredLevel(idx)
                return (
                  <motion.button
                    key={idx}
                    onClick={() => {}}
                    disabled={true}
                    className="p-4 rounded-xl font-bold transition flex flex-col items-center justify-center gap-2 min-h-[120px] hs-card border-2 border-dashed border-gray-500/30 text-gray-500 opacity-40 cursor-not-allowed"
                  >
                    <span className="text-2xl">🔒</span>
                    <p className="text-xs">Boş Slot</p>
                    <p className="text-xs text-gray-400">Seviye {requiredLevel}</p>
                  </motion.button>
                )
              }

              if (!ability) {
                return (
                  <motion.button
                    key={idx}
                    onClick={() => {}}
                    disabled={true}
                    className="p-4 rounded-xl font-bold transition flex flex-col items-center justify-center gap-2 min-h-[120px] hs-card border-2 border-dashed border-neon-cyan/30 text-neon-cyan/50 opacity-60 cursor-not-allowed"
                  >
                    <span className="text-2xl">➕</span>
                    <p className="text-xs">Yetenek Ekle</p>
                  </motion.button>
                )
              }

              return (
                <motion.button
                  key={idx}
                  whileHover={{ scale: selectedAbility === null && canUse ? 1.05 : 1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => selectAbility(idx)}
                  disabled={selectedAbility !== null || !canUse || roundInProgress}
                  className={`p-4 rounded-xl font-bold transition flex flex-col items-start gap-2 min-h-[120px] relative ${
                    isSelected
                      ? 'neon-border-cyan hs-card text-neon-cyan border-2 scale-105'
                      : !canUse
                      ? 'glass border border-gray-500/30 text-gray-500 opacity-50 cursor-not-allowed'
                      : 'hs-card neon-border-cyan text-neon-cyan hover:shadow-neon-cyan'
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openAbilityInfo(battleState.player.abilityIds[idx], idx)
                    }}
                    className="absolute top-2 right-2 text-neon-cyan hover:text-neon-cyan/70 text-lg transition"
                  >
                    ℹ️
                  </button>
                  <div className="flex items-center gap-2 w-full">
                    <AbilityIcon iconId={ability.icon} size="md" />
                    <p className="font-black text-sm">{ability.name}</p>
                  </div>
                  <div className="text-xs space-y-1 w-full">
                    <div className="flex justify-between">
                      <span>×{ability.multiplier || 1}</span>
                    </div>
                    {battleState.player.cooldowns[idx] > 0 && (
                      <div className="text-red-400 font-bold">CD: {battleState.player.cooldowns[idx]}</div>
                    )}
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Ultimate Slot */}
          {battleState.player.abilities[5] ? (
            <motion.button
              whileHover={{ scale: selectedAbility === null && battleEngine?.canUseAbility('player', 5) ? 1.05 : 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => selectAbility(5)}
              disabled={selectedAbility !== null || !battleEngine?.canUseAbility('player', 5) || roundInProgress}
              className={`w-full p-4 rounded-xl font-bold transition flex flex-col items-start gap-2 min-h-[100px] relative bg-gradient-to-b from-yellow-600/40 via-purple-500/30 to-yellow-700/40 border-4 border-yellow-500/80 shadow-[0_0_30px_rgba(234,179,8,0.4)] ${
                selectedAbility === 5
                  ? 'scale-105'
                  : !battleEngine?.canUseAbility('player', 5)
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:shadow-lg'
              }`}
            >
              <div className="absolute top-2 left-1/2 -translate-x-1/2 text-2xl">👑</div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openAbilityInfo(battleState.player.abilityIds[5], 5)
                }}
                className="absolute top-2 right-2 text-yellow-300 hover:text-yellow-300/70 text-lg transition"
              >
                ℹ️
              </button>
              <div className="flex items-center gap-2 w-full mt-4">
                <AbilityIcon iconId={battleState.player.abilities[5].icon} size="md" />
                <p className="font-black text-sm text-yellow-300">{battleState.player.abilities[5].name}</p>
              </div>
              <div className="text-xs space-y-1 w-full">
                <p className="text-yellow-200 font-bold">ULTIMATE</p>
                <div className="flex justify-between">
                  <span className="text-yellow-100">×{battleState.player.abilities[5].multiplier || 1}</span>
                </div>
                {battleState.player.cooldowns[5] > 0 && (
                  <div className="text-red-400 font-bold">CD: {battleState.player.cooldowns[5]}</div>
                )}
              </div>
            </motion.button>
          ) : (
            <motion.button
              disabled={true}
              className="w-full p-4 rounded-xl font-bold transition flex flex-col items-center justify-center gap-2 min-h-[100px] bg-gradient-to-b from-slate-700/30 via-purple-900/30 to-slate-800/30 border-4 border-dashed border-yellow-600/40 opacity-50 cursor-not-allowed"
            >
              <div className="text-4xl">🔐</div>
              <p className="text-sm font-black text-yellow-400">ULTIMATE SLOT</p>
              <p className="text-xs text-yellow-300/70">Seviye {slotService.getSlotRequiredLevel(5)} açılır</p>
            </motion.button>
          )}
        </div>

        <div className="glass-dark border border-neon-purple/30 rounded-lg p-4 flex-1 flex flex-col">
          <p className="text-sm font-bold text-neon-purple mb-3">📋 SAVAŞ GÜNLÜĞÜ</p>
          <div className="space-y-2 flex-1 overflow-y-auto text-sm">
            {battleLog.map((log, idx) => (
              <motion.p
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-bold break-words text-neon-purple"
              >
                {log}
              </motion.p>
            ))}
          </div>
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
        className="absolute top-4 left-4 px-4 py-2 glass-dark neon-border-cyan rounded-lg font-bold text-neon-cyan hover:shadow-neon-cyan z-10 transition"
      >
        ← Geri
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
            className="w-full px-6 py-4 glass-dark neon-border-cyan rounded-lg font-black text-lg text-neon-cyan hover:shadow-neon-cyan transition"
          >
            ⚔️ {currentScene.actionText || 'İlerle'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

function generateOpponentFromData(playerDino: Dino, enemyData: AdventureEnemy): Dino {
  // Create opponent with same abilities as player dino
  // Note: In the library-based system, ability modifications happen at the library level,
  // not per-instance. Balance is controlled via ability definitions, not sanitization here.

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
    abilityIds: playerDino.abilityIds,
  }
}
