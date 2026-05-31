import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Dino } from '../game/types'
import { Adventure, AdventureScene, AdventureEnemy } from '../lib/adventures'
import { BattleEngine } from '../lib/battleEngine'
import { supabase, addXpToDino, addCoinsToUser } from '../lib/supabase'
import { useAuth } from '../lib/auth-context'
import BattleStatsCard from './BattleStatsCard'
import EffectsDisplay from './EffectsDisplay'
import AbilityIcon from './AbilityIcon'
import BattleEffectVisuals from './BattleEffectVisuals'
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

  const currentScene = adventure.scenes[currentSceneIdx]
  const currentEnemyData = currentScene?.enemies[currentEnemyIdx]

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
    if (!battleEngine.canUseAbility('player', abilityIdx)) return

    setSelectedAbility(abilityIdx)

    setTimeout(() => {
      executeRound(abilityIdx)
    }, 500)
  }

  function executeRound(playerAbilityIdx: number) {
    if (!battleEngine) return

    const availableAbilities = battleState.opponent.abilities
      .map((_: any, idx: number) => idx)
      .filter((idx: number) => battleEngine.canUseAbility('opponent', idx))

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


  const playerHpPercent = (playerCurrentHp / playerDino.maxHp) * 100

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
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden border border-red-500/30 mb-1">
                <div
                  className="bg-gradient-to-r from-red-500 to-red-600 h-full transition-all"
                  style={{ width: `${Math.max(0, playerHpPercent)}%` }}
                />
              </div>
              <p className="text-xs text-neon-cyan mb-3">{Math.max(0, playerCurrentHp)}/{playerDino.maxHp}</p>

              <div className="mb-3 p-3 bg-neon-cyan/5 rounded-lg border border-neon-cyan/20">
                <EffectsDisplay effects={battleState.player.effects} />
              </div>
            </div>

            <BattleStatsCard dino={battleState.player.dino} effects={battleState.player.effects} isPlayer={true} />
          </div>

          {/* Enemy */}
          <div>
            <div className="glass-dark neon-border-purple rounded-lg p-4 mb-3">
              <p className="text-xs font-bold text-neon-purple mb-2">DÜŞMAN</p>
              <h2 className="text-lg font-black text-neon-purple mb-2">{battleState.opponent.dino.name}</h2>
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden border border-red-500/30 mb-1">
                <div
                  className="bg-gradient-to-r from-red-500 to-red-600 h-full transition-all"
                  style={{ width: `${Math.max(0, (battleState.opponent.currentHp / battleState.opponent.dino.maxHp) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-neon-purple mb-3">{Math.max(0, battleState.opponent.currentHp)}/{battleState.opponent.dino.maxHp}</p>

              <div className="mb-3 p-3 bg-neon-purple/5 rounded-lg border border-neon-purple/20">
                <EffectsDisplay effects={battleState.opponent.effects} />
              </div>
            </div>

            <BattleStatsCard dino={battleState.opponent.dino} effects={battleState.opponent.effects} isPlayer={false} />
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs font-bold text-neon-cyan mb-2">⚔️ YETENEKLERİ SEÇ</p>
          <div className="grid grid-cols-2 gap-3">
            {battleState.player.abilities.map((ability: any, idx: number) => (
              <motion.button
                key={idx}
                whileHover={{ scale: selectedAbility === null && battleEngine?.canUseAbility('player', idx) ? 1.05 : 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => selectAbility(idx)}
                disabled={selectedAbility !== null || !battleEngine?.canUseAbility('player', idx) || roundInProgress}
                className={`p-4 rounded-xl font-bold transition flex flex-col items-start gap-2 min-h-[120px] ${
                  selectedAbility === idx
                    ? 'neon-border-cyan glass-dark text-neon-cyan border-2 scale-105'
                    : !battleEngine?.canUseAbility('player', idx)
                    ? 'glass border border-gray-500/30 text-gray-500 opacity-50 cursor-not-allowed'
                    : 'glass-dark neon-border-cyan text-neon-cyan hover:shadow-neon-cyan'
                }`}
              >
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
            ))}
          </div>
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
          <div className="grid grid-cols-2 gap-3">
            <div className="glass border border-red-500/30 p-2 rounded text-center">
              <p className="text-xs text-red-400 font-bold">❤️ CAN</p>
              <p className="text-lg font-black text-red-400">{playerCurrentHp}/{playerDino.maxHp}</p>
            </div>
            <div className="w-full col-span-2 bg-slate-700 rounded-full h-2 overflow-hidden border border-red-500/30">
              <div
                className="bg-gradient-to-r from-red-500 to-red-600 h-full transition-all"
                style={{ width: `${playerHpPercent}%` }}
              />
            </div>
          </div>
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
    abilities: playerDino.abilities,
  }
}
