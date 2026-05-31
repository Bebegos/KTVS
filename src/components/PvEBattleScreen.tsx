import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Dino, DinoAbility } from '../game/types'
import { BattleEngine } from '../lib/battleEngine'
import { getEffectNameTR } from '../lib/effect-translations'
import { supabase, addXpToDino } from '../lib/supabase'
import AbilityIcon from './AbilityIcon'
import BattleEffectVisuals from './BattleEffectVisuals'
import EffectsDisplay from './EffectsDisplay'
import BattleStatsCard from './BattleStatsCard'

interface PvEBattleScreenProps {
  playerDino: Dino
  difficulty: 'easy' | 'normal' | 'hard'
  onBattleEnd: (won: boolean, xpGained: number) => void
  onBack: () => void
}

export default function PvEBattleScreen({
  playerDino,
  difficulty,
  onBattleEnd,
  onBack,
}: PvEBattleScreenProps) {
  const opponentDino = generateOpponent(playerDino, difficulty)
  const [engine] = useState(() => new BattleEngine(playerDino, opponentDino))
  const [battleState, setBattleState] = useState(engine.getState())
  const [roundInProgress, setRoundInProgress] = useState(false)
  const [currentEffectVisual, setCurrentEffectVisual] = useState<'buff' | 'debuff' | 'damage' | null>(null)
  const [showEffectVisual, setShowEffectVisual] = useState(false)
  const [battleLog, setBattleLog] = useState<string[]>(engine.getBattleLog())
  const [matchRecordingDone, setMatchRecordingDone] = useState(false)
  const [matchRecordingError, setMatchRecordingError] = useState<string | null>(null)
  const [selectedAbility, setSelectedAbility] = useState<number | null>(null)

  const playerHpPercent = engine.getPlayerHpPercent()
  const opponentHpPercent = engine.getOpponentHpPercent()

  // Auto-save match when battle ends
  useEffect(() => {
    if (!battleState.battleEnded || !battleState.winner) return

    const saveMatch = async () => {
      try {
        const xpReward = engine.getXpReward()
        if (xpReward > 0) {
          await addXpToDino(playerDino.id, xpReward)
        }

        setMatchRecordingDone(true)
        setTimeout(() => {
          onBattleEnd(battleState.winner === 'player', xpReward)
        }, 2000)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        console.error('Match save error:', err)
        setMatchRecordingError(errorMsg)
      }
    }

    saveMatch()
  }, [battleState.battleEnded, battleState.winner, playerDino.id, engine, onBattleEnd])

  function selectAbility(abilityIdx: number) {
    if (roundInProgress || selectedAbility !== null) return
    if (!engine.canUseAbility('player', abilityIdx)) return

    setSelectedAbility(abilityIdx)

    // Execute round after brief delay
    setTimeout(() => {
      executeRound(abilityIdx)
    }, 500)
  }

  function executeRound(playerAbilityIdx: number) {
    // Choose random opponent ability
    const availableAbilities = battleState.opponent.abilities
      .map((_, idx) => idx)
      .filter(idx => engine.canUseAbility('opponent', idx))

    const opponentAbilityIdx =
      availableAbilities.length > 0
        ? availableAbilities[Math.floor(Math.random() * availableAbilities.length)]
        : 0

    setRoundInProgress(true)

    setTimeout(() => {
      try {
        const result = engine.executeRound(playerAbilityIdx, opponentAbilityIdx)

        // Show player action
        setBattleLog(prev => [result.playerAction.message, ...prev.slice(0, 14)])
        setCurrentEffectVisual('damage')
        setShowEffectVisual(true)
        setTimeout(() => setShowEffectVisual(false), 1500)

        if (result.playerAction.effectApplied) {
          setBattleLog(prev => [`✨ ${result.playerAction.effectApplied} uygulandı`, ...prev.slice(0, 14)])
        }

        setTimeout(() => {
          // Show opponent action
          if (!result.playerAction.targetDied) {
            setBattleLog(prev => [result.opponentAction.message, ...prev.slice(0, 14)])
            setCurrentEffectVisual('damage')
            setShowEffectVisual(true)
            setTimeout(() => setShowEffectVisual(false), 1500)

            if (result.opponentAction.effectApplied) {
              setBattleLog(prev => [`✨ ${result.opponentAction.effectApplied} uygulandı`, ...prev.slice(0, 14)])
            }
          }

          // Show effect damages
          if (result.effectDamage.playerDamage > 0) {
            setBattleLog(prev => [`💀 Efekt hasarı: -${result.effectDamage.playerDamage} HP`, ...prev.slice(0, 14)])
          }
          if (result.effectDamage.opponentDamage > 0) {
            setBattleLog(prev => [`🔴 Rakip efekt hasarı: -${result.effectDamage.opponentDamage} HP`, ...prev.slice(0, 14)])
          }

          setBattleState(engine.getState())

          if (result.battleEnded) {
            setBattleLog(prev => [
              result.winner === 'player' ? '🎉 KAZANDINIZ!' : '💀 YENİLDİNİZ!',
              ...prev.slice(0, 14),
            ])
          } else {
            setBattleLog(prev => [`🔄 Tur ${engine.getCurrentRound()}`, ...prev.slice(0, 14)])
          }

          setSelectedAbility(null)
          setRoundInProgress(false)
        }, 2000)
      } catch (err) {
        console.error('Round error:', err)
        setRoundInProgress(false)
      }
    }, 800)
  }

  if (battleState.battleEnded) {
    const won = battleState.winner === 'player'
    const xpReward = engine.getXpReward()

    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 relative overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-dark neon-border-cyan rounded-2xl p-12 text-center max-w-md"
        >
          <div className="text-9xl mb-6">{won ? '🎉' : '💀'}</div>

          <h1 className="text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">
            {won ? 'KAZANDINIZ!' : 'YENİLDİNİZ!'}
          </h1>

          {matchRecordingDone ? (
            <>
              <div className="mb-6 space-y-3">
                {xpReward > 0 && <p className="text-xl font-bold text-green-400">✅ {xpReward} XP Kazandı</p>}
                <p className="text-lg font-bold text-neon-cyan">✅ Maç Kaydedildi</p>
              </div>
              <p className="text-sm text-neon-cyan/70 mb-6">
                Yönlendiriliyorsun...
              </p>
            </>
          ) : matchRecordingError ? (
            <>
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400 font-bold text-sm mb-2">❌ Hata oluştu:</p>
                <p className="text-red-300 text-xs">{matchRecordingError}</p>
              </div>
              <button
                onClick={onBack}
                className="w-full px-6 py-3 glass-dark neon-border-cyan rounded-lg font-bold text-neon-cyan hover:shadow-neon-cyan transition"
              >
                Ana Ekrana Dön
              </button>
            </>
          ) : (
            <>
              <div className="mb-6 space-y-2">
                <p className="text-neon-cyan font-bold">⏳ İşleniyor...</p>
                <div className="flex gap-2 justify-center">
                  <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse delay-100"></div>
                  <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse delay-200"></div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 p-4 overflow-y-auto relative">
      <BattleEffectVisuals effectType={currentEffectVisual} isVisible={showEffectVisual} />

      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={onBack}
          className="px-4 py-2 glass border border-red-500/50 rounded-lg font-bold text-sm text-red-400 hover:shadow-red-500/50 transition"
        >
          🚪 Çık
        </button>
        <div className="glass-dark border border-neon-pink/50 rounded-lg px-4 py-2 text-center">
          <p className="text-lg font-black text-neon-pink">🔄 Tur {battleState.round}</p>
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
            <p className="text-xs text-neon-cyan mb-3">{Math.max(0, battleState.player.currentHp)}/{battleState.player.dino.maxHp}</p>

            <div className="mb-3 p-3 bg-neon-cyan/5 rounded-lg border border-neon-cyan/20">
              <EffectsDisplay effects={battleState.player.effects} />
            </div>
          </div>

          <BattleStatsCard dino={battleState.player.dino} effects={battleState.player.effects} isPlayer={true} />
        </div>

        {/* Opponent */}
        <div>
          <div className="glass-dark neon-border-purple rounded-lg p-4 mb-3">
            <p className="text-xs font-bold text-neon-purple mb-2">DÜŞMAN</p>
            <h2 className="text-lg font-black text-neon-purple mb-2">{opponentDino.name}</h2>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden border border-red-500/30 mb-1">
              <div
                className="bg-gradient-to-r from-red-500 to-red-600 h-full transition-all"
                style={{ width: `${Math.max(0, opponentHpPercent)}%` }}
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
          {battleState.player.abilities.map((ability, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: selectedAbility === null && engine.canUseAbility('player', idx) ? 1.05 : 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => selectAbility(idx)}
              disabled={selectedAbility !== null || !engine.canUseAbility('player', idx) || roundInProgress}
              className={`p-4 rounded-xl font-bold transition flex flex-col items-start gap-2 min-h-[140px] ${
                selectedAbility === idx
                  ? 'neon-border-cyan glass-dark text-neon-cyan border-2 scale-105'
                  : !engine.canUseAbility('player', idx)
                  ? 'glass border border-gray-500/30 text-gray-500 opacity-50 cursor-not-allowed'
                  : 'glass-dark neon-border-cyan text-neon-cyan hover:shadow-neon-cyan'
              }`}
            >
              <div className="flex items-center gap-3 w-full">
                <AbilityIcon iconId={ability.icon} size="lg" />
                <div className="flex-1 text-left">
                  <p className="font-black text-sm leading-tight">{ability.name}</p>
                  <p className="text-xs font-bold text-red-400">⬇️ SALDIRI</p>
                </div>
              </div>

              <div className="w-full text-left text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Çarpan:</span>
                  <span className="font-black">×{ability.multiplier || 1}</span>
                </div>
                {ability.effect !== 'none' && (
                  <div className="flex justify-between">
                    <span>Efekt:</span>
                    <span className="font-black">{getEffectNameTR(ability.effect)}</span>
                  </div>
                )}
                {battleState.player.cooldowns[idx] > 0 && (
                  <div className="flex justify-between text-red-400">
                    <span>CD:</span>
                    <span className="font-black">{battleState.player.cooldowns[idx]} tur</span>
                  </div>
                )}
              </div>

              {selectedAbility === idx && (
                <div className="w-full text-center mt-auto">
                  <p className="text-xs font-black text-neon-cyan">✓ SEÇİLDİ</p>
                </div>
              )}
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

function generateOpponent(playerDino: Dino, difficulty: 'easy' | 'normal' | 'hard'): Dino {
  const statMultiplier = difficulty === 'easy' ? 0.7 : difficulty === 'normal' ? 1.0 : 1.3
  const hpMultiplier = difficulty === 'easy' ? 0.8 : difficulty === 'normal' ? 1.0 : 1.2

  const baseHp = playerDino.maxHp ?? 30
  const baseAtk = playerDino.atk ?? 5
  const baseDef = playerDino.def ?? 5
  const baseSpd = playerDino.spd ?? 5

  return {
    id: 'opponent-' + Date.now(),
    name: getDifficultyName(difficulty),
    familyCode: '',
    class: playerDino.class || 'big_carnivore',
    spec: playerDino.spec || 'armored',
    level: playerDino.level,
    xp: 0,
    maxHp: Math.floor(baseHp * hpMultiplier),
    atk: Math.floor(baseAtk * statMultiplier),
    def: Math.floor(baseDef * statMultiplier),
    spd: Math.floor(baseSpd * statMultiplier),
    element: playerDino.element,
    abilities: playerDino.abilities,
  }
}

function getDifficultyName(difficulty: 'easy' | 'normal' | 'hard'): string {
  switch (difficulty) {
    case 'easy':
      return '🐣 Acemi Düşman'
    case 'normal':
      return '🦖 Orta Düşman'
    case 'hard':
      return '👹 Zor Düşman'
  }
}
