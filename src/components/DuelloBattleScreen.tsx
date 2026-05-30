import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino, Ability, ActiveEffect } from '../game/types'
import { rollDice, calculateDamage, hasEffect, applyEffect } from '../game/engine'
import { supabase } from '../lib/supabase'
import AbilityIcon from './AbilityIcon'
import BattleEffectVisuals from './BattleEffectVisuals'

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

interface BattleAction {
  sessionId: string
  playerId: string
  abilityIndex: number
  diceResult: number
  timestamp: number
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
      icon: a.icon,
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
      icon: a.icon,
    })),
  })

  // Determine turn order based on speed
  const playerIsFirst = playerDino.spd >= opponentDino.spd
  const [battleLog, setBattleLog] = useState<string[]>([
    playerIsFirst ? '🚀 Oyuncu başlıyor!' : '🚀 Rakip başlıyor!',
  ])
  const [diceRolling, setDiceRolling] = useState(false)
  const [lastDiceResult, setLastDiceResult] = useState<number | null>(null)
  const [battleEnded, setBattleEnded] = useState(false)
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null)
  const [playerSelectedAbility, setPlayerSelectedAbility] = useState<number | null>(null)
  const [opponentSelectedAbility, setOpponentSelectedAbility] = useState<number | null>(null)
  const [roundInProgress, setRoundInProgress] = useState(false)
  const [currentEffectVisual, setCurrentEffectVisual] = useState<'buff' | 'debuff' | 'damage' | null>(null)
  const [showEffectVisual, setShowEffectVisual] = useState(false)

  const playerHpPercent = (playerChar.currentHp / playerChar.dino.maxHp) * 100
  const opponentHpPercent = (opponentChar.currentHp / opponentChar.dino.maxHp) * 100
  const subscriptionRef = useRef<any>(null)

  // Subscribe to opponent's ability selections
  useEffect(() => {
    if (!sessionId) return

    const channel = supabase
      .channel(`battle:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'battle_actions',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const action = payload.new as any
          // If this is from opponent, update their selected ability
          if (action.player_id !== playerDino.id) {
            setOpponentSelectedAbility(action.ability_index)
          }
        }
      )
      .subscribe()

    subscriptionRef.current = channel
    return () => {
      channel.unsubscribe()
    }
  }, [sessionId, playerDino.id])

  // When both players have selected, execute their actions
  useEffect(() => {
    if (playerSelectedAbility !== null && opponentSelectedAbility !== null && !roundInProgress) {
      setRoundInProgress(true)
      executeRound()
    }
  }, [playerSelectedAbility, opponentSelectedAbility])

  async function selectAbility(abilityIdx: number) {
    if (roundInProgress || playerSelectedAbility !== null) return
    if (playerChar.abilities[abilityIdx].cd > 0) {
      setBattleLog(prev => ['❌ Yetenek henüz hazır değil!', ...prev.slice(0, 9)])
      return
    }

    // Check if stunned or stopped
    if (playerChar.effects.some(e => e.type === 'stun' || e.type === 'stop')) {
      setBattleLog(prev => ['❌ Harekete geçilemez!', ...prev.slice(0, 9)])
      return
    }

    // Roll dice
    const diceResult = rollDice()

    // Store in Supabase so opponent knows
    try {
      await supabase.from('battle_actions').insert({
        session_id: sessionId,
        player_id: playerDino.id,
        ability_index: abilityIdx,
        dice_result: diceResult.value,
        timestamp: Date.now(),
      })
    } catch (err) {
      console.error('Failed to save ability selection:', err)
    }

    setPlayerSelectedAbility(abilityIdx)
    setLastDiceResult(diceResult.value)
  }

  function executeRound() {
    if (playerSelectedAbility === null || opponentSelectedAbility === null) return

    setDiceRolling(true)

    setTimeout(() => {
      // Determine who goes first based on speed
      const playerAbility = playerChar.abilities[playerSelectedAbility]
      const opponentAbility = opponentChar.abilities[opponentSelectedAbility]
      const goPlayerFirst = playerChar.dino.spd >= opponentChar.dino.spd

      if (goPlayerFirst) {
        executeAction('player', playerSelectedAbility)
      } else {
        executeAction('opponent', opponentSelectedAbility)
      }

      setDiceRolling(false)
    }, 800)
  }

  function executeAction(actor: 'player' | 'opponent', abilityIdx: number) {
    if (actor === 'player') {
      const attacker = playerChar
      const defender = opponentChar
      const ability = attacker.abilities[abilityIdx]
      const diceValue = lastDiceResult || 6

      const finalDamage = calculateDamage(
        {
          ...attacker,
          name: attacker.dino.name,
          dinoId: attacker.dino.id,
          maxHp: attacker.dino.maxHp,
          atk: attacker.dino.atk,
          def: attacker.dino.def,
          spd: attacker.dino.spd,
          round: 0,
          effects: attacker.effects,
        },
        {
          ...defender,
          name: defender.dino.name,
          dinoId: defender.dino.id,
          maxHp: defender.dino.maxHp,
          atk: defender.dino.atk,
          def: defender.dino.def,
          spd: defender.dino.spd,
          round: 0,
          effects: defender.effects,
        },
        diceValue,
        ability.multiplier
      )

      const logMsg = `${ability.name} [Zar: ${diceValue}] → ${Math.round(finalDamage)} hasar`
      setBattleLog(prev => [logMsg, ...prev.slice(0, 9)])

      // Show damage effect visual
      setCurrentEffectVisual('damage')
      setShowEffectVisual(true)
      setTimeout(() => setShowEffectVisual(false), 1500)

      setOpponentChar(c => ({
        ...c,
        currentHp: Math.max(0, c.currentHp - finalDamage),
      }))

      if (ability.effect !== 'none') {
        // Show buff/debuff effect visual
        const isBuff = ability.kind === 'buff'
        setCurrentEffectVisual(isBuff ? 'buff' : 'debuff')
        setShowEffectVisual(true)
        setTimeout(() => setShowEffectVisual(false), 1500)

        setOpponentChar(c => {
          const newEffects = [...c.effects]
          const existing = newEffects.findIndex(e => e.type === ability.effect)

          if (existing !== -1) {
            // Efekt zaten var, süresi resetle
            newEffects[existing].duration = 2
          } else if (newEffects.length < 2) {
            // Slot boş
            newEffects.push({ type: ability.effect as any, duration: 2 })
          } else {
            // Max 2 efekt, en eskisini çıkar (FIFO)
            newEffects.shift()
            newEffects.push({ type: ability.effect as any, duration: 2 })
          }

          return { ...c, effects: newEffects }
        })
      }

      // Update ability cooldown
      const newAbilities = [...attacker.abilities]
      newAbilities[abilityIdx].cd = ability.maxCd
      setPlayerChar(c => ({ ...c, abilities: newAbilities }))

      if (opponentChar.currentHp - finalDamage <= 0) {
        setBattleEnded(true)
        setWinner('player')
        onBattleEnd('player')
        setBattleLog(prev => ['🎉 KAZANDINIZ!', ...prev.slice(0, 9)])
        setRoundInProgress(false)
        return
      }

      // Execute opponent's action after delay
      setTimeout(() => {
        executeAction('opponent', opponentSelectedAbility!)
      }, 1500)
    } else {
      const attacker = opponentChar
      const defender = playerChar
      const ability = attacker.abilities[abilityIdx]

      const finalDamage = calculateDamage(
        {
          ...attacker,
          name: attacker.dino.name,
          dinoId: attacker.dino.id,
          maxHp: attacker.dino.maxHp,
          atk: attacker.dino.atk,
          def: attacker.dino.def,
          spd: attacker.dino.spd,
          round: 0,
          effects: attacker.effects,
        },
        {
          ...defender,
          name: defender.dino.name,
          dinoId: defender.dino.id,
          maxHp: defender.dino.maxHp,
          atk: defender.dino.atk,
          def: defender.dino.def,
          spd: defender.dino.spd,
          round: 0,
          effects: defender.effects,
        },
        6,
        ability.multiplier
      )

      const logMsg = `🔴 ${ability.name} → ${Math.round(finalDamage)} hasar`
      setBattleLog(prev => [logMsg, ...prev.slice(0, 9)])

      setPlayerChar(c => ({
        ...c,
        currentHp: Math.max(0, c.currentHp - finalDamage),
      }))

      if (ability.effect !== 'none') {
        setPlayerChar(c => {
          const newEffects = [...c.effects]
          const existing = newEffects.findIndex(e => e.type === ability.effect)

          if (existing !== -1) {
            // Efekt zaten var, süresi resetle
            newEffects[existing].duration = 2
          } else if (newEffects.length < 2) {
            // Slot boş
            newEffects.push({ type: ability.effect as any, duration: 2 })
          } else {
            // Max 2 efekt, en eskisini çıkar (FIFO)
            newEffects.shift()
            newEffects.push({ type: ability.effect as any, duration: 2 })
          }

          return { ...c, effects: newEffects }
        })
      }

      // Update ability cooldown
      const newAbilities = [...attacker.abilities]
      newAbilities[abilityIdx].cd = ability.maxCd
      setOpponentChar(c => ({ ...c, abilities: newAbilities }))

      if (playerChar.currentHp - finalDamage <= 0) {
        setBattleEnded(true)
        setWinner('opponent')
        onBattleEnd('opponent')
        setBattleLog(prev => ['💀 YENİLDİNİZ!', ...prev.slice(0, 9)])
        setRoundInProgress(false)
        return
      }

      // Reset round
      setTimeout(() => {
        setPlayerSelectedAbility(null)
        setOpponentSelectedAbility(null)
        setRoundInProgress(false)
      }, 1500)
    }
  }

  if (battleEnded) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 relative overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="text-8xl mb-4">{winner === 'player' ? '🎉' : '💀'}</div>
          <h1 className="text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">
            {winner === 'player' ? 'KAZANDINIZ!' : 'YENİLDİNİZ!'}
          </h1>
          <button
            onClick={onBack}
            className="mt-8 px-8 py-4 glass-dark neon-border-cyan rounded-lg font-bold text-neon-cyan hover:shadow-neon-cyan"
          >
            Geri Dön
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 p-4 overflow-y-auto relative">
      {/* Battle effect visuals */}
      <BattleEffectVisuals effectType={currentEffectVisual} isVisible={showEffectVisual} />

      {/* Header with stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Player */}
        <div className="glass-dark neon-border-cyan rounded-lg p-4">
          <p className="text-xs font-bold text-neon-cyan mb-2">OYUNCU</p>
          <h2 className="text-lg font-black text-neon-cyan mb-2">{playerChar.dino.name}</h2>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden border border-red-500/30 mb-1">
            <div
              className="bg-gradient-to-r from-red-500 to-red-600 h-full transition-all"
              style={{ width: `${Math.max(0, playerHpPercent)}%` }}
            />
          </div>
          <p className="text-xs text-neon-cyan">{Math.max(0, playerChar.currentHp)}/{playerChar.dino.maxHp}</p>
        </div>

        {/* Opponent */}
        <div className="glass-dark neon-border-purple rounded-lg p-4">
          <p className="text-xs font-bold text-neon-purple mb-2">RAKİP</p>
          <h2 className="text-lg font-black text-neon-purple mb-2">{opponentChar.dino.name}</h2>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden border border-red-500/30 mb-1">
            <div
              className="bg-gradient-to-r from-red-500 to-red-600 h-full transition-all"
              style={{ width: `${Math.max(0, opponentHpPercent)}%` }}
            />
          </div>
          <p className="text-xs text-neon-purple">{Math.max(0, opponentChar.currentHp)}/{opponentChar.dino.maxHp}</p>
        </div>
      </div>

      {/* Ability buttons - Grid layout with full details */}
      <div className="mb-6">
        <p className="text-xs font-bold text-neon-cyan mb-2">⚔️ YETENEKLERİ SEÇ (Her turda 1)</p>
        <div className="grid grid-cols-2 gap-3">
          {playerChar.abilities.map((ability, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: playerSelectedAbility === null && ability.cd === 0 ? 1.05 : 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => selectAbility(idx)}
              disabled={playerSelectedAbility !== null || ability.cd > 0 || roundInProgress}
              className={`p-4 rounded-xl font-bold transition flex flex-col items-start gap-2 min-h-[140px] ${
                playerSelectedAbility === idx
                  ? 'neon-border-cyan glass-dark text-neon-cyan border-2 scale-105'
                  : ability.cd > 0
                  ? 'glass border border-gray-500/30 text-gray-500 opacity-50 cursor-not-allowed'
                  : 'glass-dark neon-border-cyan text-neon-cyan hover:shadow-neon-cyan'
              }`}
            >
              {/* Icon and Name */}
              <div className="flex items-center gap-3 w-full">
                <AbilityIcon iconId={ability.icon} size="lg" />
                <div className="flex-1 text-left">
                  <p className="font-black text-sm leading-tight">{ability.name}</p>
                  <p className={`text-xs font-bold ${ability.kind === 'buff' ? 'text-green-400' : 'text-red-400'}`}>
                    {ability.kind === 'buff' ? '⬆️ BUFF' : '⬇️ DEBUFF'}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="w-full text-left text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Hasar Çarpanı:</span>
                  <span className="font-black">×{ability.multiplier || 1}</span>
                </div>
                {ability.effect !== 'none' && (
                  <div className="flex justify-between">
                    <span>Efekt:</span>
                    <span className="font-black">{ability.effect}</span>
                  </div>
                )}
                {ability.cd > 0 && (
                  <div className="flex justify-between text-red-400">
                    <span>Hazır olmaya:</span>
                    <span className="font-black">{ability.cd} tur</span>
                  </div>
                )}
              </div>

              {/* Selected indicator */}
              {playerSelectedAbility === idx && (
                <div className="w-full text-center mt-auto">
                  <p className="text-xs font-black text-neon-cyan">✓ SEÇİLDİ</p>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="glass-dark border border-neon-cyan/30 rounded-lg p-4 mb-6 text-center">
        <p className="text-neon-cyan font-bold">
          {playerSelectedAbility !== null && opponentSelectedAbility === null
            ? '⏳ Rakip beklemede...'
            : playerSelectedAbility === null && opponentSelectedAbility === null
            ? '👉 Yetenek seç'
            : '⚔️ Savaş başlamak üzere...'}
        </p>
      </div>

      {/* Battle log */}
      <div className="glass-dark border border-neon-purple/30 rounded-lg p-4 flex-1 overflow-y-auto">
        <div className="space-y-2">
          {battleLog.map((log, idx) => (
            <motion.p
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-neon-purple font-bold"
            >
              {log}
            </motion.p>
          ))}
        </div>
      </div>
    </div>
  )
}
