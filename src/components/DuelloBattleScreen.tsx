import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino, Ability, ActiveEffect } from '../game/types'
import { rollDice } from '../game/engine'

interface DuelloBattleScreenProps {
  playerDino: Dino
  opponentDino: Dino
  sessionId: string
  isHost: boolean
  onBattleEnd: (winner: 'player' | 'opponent') => void
  onBack: () => void
}

interface DuelloBattleChar {
  dino: Dino
  currentHp: number
  effects: ActiveEffect[]
  abilities: Ability[]
}

export default function DuelloBattleScreen({
  playerDino,
  opponentDino,
  sessionId,
  isHost,
  onBattleEnd,
  onBack,
}: DuelloBattleScreenProps) {
  const [playerChar, setPlayerChar] = useState<DuelloBattleChar>({
    dino: playerDino,
    currentHp: playerDino.maxHp,
    effects: [],
    abilities: playerDino.abilities.map((a, idx) => ({
      id: `${playerDino.id}-${idx}`,
      name: a.name,
      cd: 0,
      maxCd: a.cd,
      kind: a.kind,
      effect: a.effect,
      multiplier: a.multiplier,
    })),
  })

  const [opponentChar, setOpponentChar] = useState<DuelloBattleChar>({
    dino: opponentDino,
    currentHp: opponentDino.maxHp,
    effects: [],
    abilities: opponentDino.abilities.map((a, idx) => ({
      id: `${opponentDino.id}-${idx}`,
      name: a.name,
      cd: 0,
      maxCd: a.cd,
      kind: a.kind,
      effect: a.effect,
      multiplier: a.multiplier,
    })),
  })

  // Determine turn order based on speed
  const playerIsFirst = playerDino.spd >= opponentDino.spd
  const [currentTurn, setCurrentTurn] = useState<'player' | 'opponent'>(playerIsFirst ? 'player' : 'opponent')
  const [battleLog, setBattleLog] = useState<string[]>([
    playerIsFirst ? '🚀 Oyuncu başlıyor!' : '🚀 Rakip başlıyor!',
  ])
  const [diceRolling, setDiceRolling] = useState(false)
  const [lastDiceResult, setLastDiceResult] = useState<number | null>(null)
  const [battleEnded, setBattleEnded] = useState(false)
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null)

  const playerHpPercent = (playerChar.currentHp / playerChar.dino.maxHp) * 100
  const opponentHpPercent = (opponentChar.currentHp / opponentChar.dino.maxHp) * 100

  function rollDiceForAttack(abilityIdx: number) {
    if (diceRolling || currentTurn !== 'player') return
    if (playerChar.abilities[abilityIdx].cd > 0) {
      setBattleLog(prev => ['❌ Yetenek henüz hazır değil!', ...prev.slice(0, 9)])
      return
    }

    // Check if stunned or stopped
    if (playerChar.effects.some(e => e.type === 'stun' || e.type === 'stop')) {
      setBattleLog(prev => ['❌ Harekete geçilemez!', ...prev.slice(0, 9)])
      endTurn()
      return
    }

    setDiceRolling(true)
    const ability = playerChar.abilities[abilityIdx]
    const diceResult = rollDice()
    setLastDiceResult(diceResult.value)

    setTimeout(() => {
      let damage = (diceResult.value + playerChar.dino.atk) * (ability.multiplier || 1)

      if (diceResult.isCrit) {
        damage *= 2
      } else if (diceResult.isMiss) {
        damage = 0
      }

      const logMsg = `${ability.name} [Zar: ${diceResult.value}] → ${Math.round(damage)} hasar${
        diceResult.isCrit ? ' 🌟 KRİTİK!' : diceResult.isMiss ? ' ❌ IŞKA!' : ''
      }`
      setBattleLog(prev => [logMsg, ...prev.slice(0, 9)])

      // Apply damage
      const finalDamage = Math.max(0, damage - opponentChar.dino.def)
      setOpponentChar(c => ({
        ...c,
        currentHp: Math.max(0, c.currentHp - finalDamage),
      }))

      // Apply cooldown
      const newAbilities = [...playerChar.abilities]
      newAbilities[abilityIdx].cd = ability.maxCd
      setPlayerChar(c => ({ ...c, abilities: newAbilities }))

      // Check if opponent is defeated
      if (opponentChar.currentHp - finalDamage <= 0) {
        setBattleEnded(true)
        setWinner('player')
        onBattleEnd('player')
        setBattleLog(prev => ['🎉 KAZANDINIZ!', ...prev.slice(0, 9)])
      } else {
        setTimeout(() => {
          setCurrentTurn('opponent')
        }, 1000)
      }

      setDiceRolling(false)
    }, 800)
  }

  function endTurn() {
    if (currentTurn === 'player') {
      // Decrease cooldowns for player
      const newAbilities = playerChar.abilities.map(a => ({
        ...a,
        cd: Math.max(0, a.cd - 1),
      }))

      // Update effects
      let newEffects = playerChar.effects.map(e => ({
        ...e,
        duration: e.duration - 1,
      })).filter(e => e.duration > 0)

      // Apply poison damage
      if (playerChar.effects.some(e => e.type === 'poison')) {
        setPlayerChar(c => ({
          ...c,
          currentHp: Math.max(0, c.currentHp - 3),
          abilities: newAbilities,
          effects: newEffects,
        }))
        setBattleLog(prev => ['☠️ Zehir hasarı: -3', ...prev.slice(0, 9)])
      } else {
        setPlayerChar(c => ({
          ...c,
          abilities: newAbilities,
          effects: newEffects,
        }))
      }

      setCurrentTurn('opponent')
    } else {
      // Opponent's turn handling
      const newAbilities = opponentChar.abilities.map(a => ({
        ...a,
        cd: Math.max(0, a.cd - 1),
      }))

      let newEffects = opponentChar.effects.map(e => ({
        ...e,
        duration: e.duration - 1,
      })).filter(e => e.duration > 0)

      if (opponentChar.effects.some(e => e.type === 'poison')) {
        setOpponentChar(c => ({
          ...c,
          currentHp: Math.max(0, c.currentHp - 3),
          abilities: newAbilities,
          effects: newEffects,
        }))
        setBattleLog(prev => ['☠️ Rakibin zehir hasarı: -3', ...prev.slice(0, 9)])
      } else {
        setOpponentChar(c => ({
          ...c,
          abilities: newAbilities,
          effects: newEffects,
        }))
      }

      // Simulate opponent action (simplified for now)
      setTimeout(() => {
        setBattleLog(prev => ['⚔️ Rakip saldırı yaptı!', ...prev.slice(0, 9)])
        setCurrentTurn('player')
      }, 1500)
    }
  }

  function addEffect(target: 'player' | 'opponent', effectType: string) {
    const targetChar = target === 'player' ? playerChar : opponentChar
    const newEffects = [...targetChar.effects]
    const existing = newEffects.find(e => e.type === effectType as any)

    if (existing) {
      existing.duration = 2
    } else if (newEffects.length < 2) {
      newEffects.push({ type: effectType as any, duration: 2 })
    } else {
      return
    }

    if (target === 'player') {
      setPlayerChar(c => ({ ...c, effects: newEffects }))
    } else {
      setOpponentChar(c => ({ ...c, effects: newEffects }))
    }
  }

  return (
    <div className="w-screen h-screen flex flex-col relative overflow-hidden">
      {/* Arka plan blur efektleri */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-20 w-96 h-96 bg-neon-cyan opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-20 w-96 h-96 bg-neon-purple opacity-5 rounded-full blur-3xl"></div>
      </div>

      {/* Üst Bar - Turn göstergesi */}
      <div className="relative z-10 flex justify-between items-center p-4 glass-dark neon-border-cyan border-b">
        <button
          onClick={onBack}
          className="px-4 py-2 glass-dark neon-border-pink rounded-lg font-bold text-neon-pink hover:shadow-neon-pink transition"
        >
          🚪 Çık
        </button>
        <div className="flex items-center gap-4">
          <h1 className="font-black text-2xl text-neon-purple">⚔️ DUELLO</h1>
          <div className="text-center">
            <p className="text-xs font-bold text-neon-cyan mb-1">SIRA:</p>
            <p className="font-black text-lg">
              {currentTurn === 'player' ? `🎯 ${playerChar.dino.name}` : `👾 ${opponentChar.dino.name}`}
            </p>
          </div>
        </div>
        <div className="w-20"></div>
      </div>

      {/* Ana İçerik */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* İki Oyuncu Görünümü */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Oyuncu Kartı */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className={`glass-dark rounded-2xl p-6 border-2 transition ${
                currentTurn === 'player' ? 'neon-border-cyan shadow-lg shadow-cyan-500/50' : 'border-neon-cyan/30'
              }`}
            >
              <div className="text-center mb-4">
                <p className="text-5xl mb-2">🦖</p>
                <h2 className="font-black text-2xl text-neon-cyan">{playerChar.dino.name}</h2>
                <p className="text-sm font-bold text-neon-cyan/80">Lvl {playerChar.dino.level}</p>
              </div>

              {/* HP Bar */}
              <div className="mb-4 glass border border-red-500/30 rounded-xl p-3">
                <div className="flex justify-between mb-2">
                  <span className="font-black text-red-400">❤️ CAN</span>
                  <span className="font-bold text-red-400">{Math.round(playerChar.currentHp)}/{playerChar.dino.maxHp}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-700 h-full transition-all duration-300"
                    style={{ width: `${playerHpPercent}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-xs font-bold">
                <div className="glass border border-orange-500/30 p-2 rounded text-orange-400">⚔️ {playerChar.dino.atk}</div>
                <div className="glass border border-blue-500/30 p-2 rounded text-blue-400">🛡️ {playerChar.dino.def}</div>
                <div className="glass border border-yellow-500/30 p-2 rounded text-yellow-400">⚡ {playerChar.dino.spd}</div>
              </div>

              {/* Effects */}
              {playerChar.effects.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-neon-cyan mb-2">ETKİLER:</p>
                  <div className="flex gap-2 flex-wrap">
                    {playerChar.effects.map((effect, idx) => (
                      <div
                        key={idx}
                        className={`px-3 py-1 rounded-lg text-sm font-bold ${
                          ['power', 'speed', 'shield'].includes(effect.type)
                            ? 'border-2 border-green-500 text-green-400'
                            : 'border-2 border-red-500 text-red-400'
                        }`}
                      >
                        {getEffectEmoji(effect.type)} {effect.duration}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Yetenekler */}
              {currentTurn === 'player' && !battleEnded && (
                <div className="space-y-2">
                  {playerChar.abilities.map((ability, idx) => (
                    <button
                      key={idx}
                      onClick={() => rollDiceForAttack(idx)}
                      disabled={diceRolling || ability.cd > 0 || playerChar.currentHp <= 0}
                      className={`w-full p-3 glass-dark rounded-lg font-bold transition ${
                        ability.cd > 0
                          ? 'border border-gray-600/50 text-gray-500 opacity-50 cursor-not-allowed'
                          : 'neon-border-cyan text-neon-cyan hover:shadow-neon-cyan'
                      }`}
                    >
                      {ability.name} {ability.cd > 0 && `(${ability.cd})`}
                    </button>
                  ))}
                  <button
                    onClick={endTurn}
                    className="w-full p-3 glass-dark neon-border-purple text-neon-purple rounded-lg font-bold hover:shadow-neon-purple transition"
                  >
                    ⏭️ TURU BİTİR
                  </button>
                </div>
              )}

              {currentTurn !== 'player' && !battleEnded && (
                <div className="text-center p-4 glass-dark rounded-lg border border-neon-purple/30">
                  <p className="text-neon-purple font-bold">Rakibin sırasını bekliyorsunuz...</p>
                </div>
              )}

              {battleEnded && winner === 'player' && (
                <div className="text-center p-4 glass-dark neon-border-cyan rounded-lg">
                  <p className="text-2xl font-black text-neon-cyan">🎉 KAZANDINIZ!</p>
                </div>
              )}

              {battleEnded && winner === 'opponent' && (
                <div className="text-center p-4 glass-dark neon-border-purple rounded-lg">
                  <p className="text-xl font-bold text-neon-purple">Yenildiniz...</p>
                </div>
              )}
            </motion.div>

            {/* Rakip Kartı */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className={`glass-dark rounded-2xl p-6 border-2 transition ${
                currentTurn === 'opponent' ? 'neon-border-purple shadow-lg shadow-purple-500/50' : 'border-neon-purple/30'
              }`}
            >
              <div className="text-center mb-4">
                <p className="text-5xl mb-2">🦖</p>
                <h2 className="font-black text-2xl text-neon-purple">{opponentChar.dino.name}</h2>
                <p className="text-sm font-bold text-neon-purple/80">Lvl {opponentChar.dino.level}</p>
              </div>

              {/* HP Bar */}
              <div className="mb-4 glass border border-red-500/30 rounded-xl p-3">
                <div className="flex justify-between mb-2">
                  <span className="font-black text-red-400">❤️ CAN</span>
                  <span className="font-bold text-red-400">{Math.round(opponentChar.currentHp)}/{opponentChar.dino.maxHp}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-700 h-full transition-all duration-300"
                    style={{ width: `${opponentHpPercent}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-xs font-bold">
                <div className="glass border border-orange-500/30 p-2 rounded text-orange-400">⚔️ {opponentChar.dino.atk}</div>
                <div className="glass border border-blue-500/30 p-2 rounded text-blue-400">🛡️ {opponentChar.dino.def}</div>
                <div className="glass border border-yellow-500/30 p-2 rounded text-yellow-400">⚡ {opponentChar.dino.spd}</div>
              </div>

              {/* Effects */}
              {opponentChar.effects.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-neon-purple mb-2">ETKİLER:</p>
                  <div className="flex gap-2 flex-wrap">
                    {opponentChar.effects.map((effect, idx) => (
                      <div
                        key={idx}
                        className={`px-3 py-1 rounded-lg text-sm font-bold ${
                          ['power', 'speed', 'shield'].includes(effect.type)
                            ? 'border-2 border-green-500 text-green-400'
                            : 'border-2 border-red-500 text-red-400'
                        }`}
                      >
                        {getEffectEmoji(effect.type)} {effect.duration}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="text-center p-4 glass-dark rounded-lg border border-neon-purple/30">
                <p className="text-sm text-neon-purple font-bold">Rakip hazır</p>
              </div>

              {battleEnded && winner === 'opponent' && (
                <div className="text-center p-4 glass-dark neon-border-purple rounded-lg">
                  <p className="text-2xl font-black text-neon-purple">🎉 KAZANDI!</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Battle Log */}
          <div className="mt-6 glass-dark neon-border-cyan rounded-xl p-4">
            <p className="font-black text-neon-cyan text-sm mb-2">SAVAŞ GÜNLÜĞÜ:</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {battleLog.map((log, idx) => (
                <p key={idx} className="text-xs text-neon-cyan/80">
                  {log}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pasif Yetenekler Devre Dışı Notu */}
      <div className="absolute bottom-4 right-4 bg-orange-500/20 border border-orange-500/50 rounded-lg p-3 max-w-xs z-20">
        <p className="text-xs font-bold text-orange-400">
          ℹ️ Bu modda pasif yetenekler devre dışıdır.
        </p>
      </div>
    </div>
  )
}

function getEffectEmoji(type: string): string {
  const emojis: Record<string, string> = {
    poison: '☠️',
    stun: '🌀',
    stop: '🛑',
    power: '⚔️',
    speed: '⚡',
    shield: '🛡️',
  }
  return emojis[type] || '❓'
}
