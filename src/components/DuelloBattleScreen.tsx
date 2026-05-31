import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino, Ability, ActiveEffect } from '../game/types'
import { rollDice, calculateDamage, hasEffect, applyEffect } from '../game/engine'
import { getEffectNameTR } from '../lib/effect-translations'
import { getEffectDamage } from '../lib/effects'
import { supabase, addXpToDino, recordDuelloMatch, abandonDuelloSession } from '../lib/supabase'
import AbilityIcon from './AbilityIcon'
import BattleEffectVisuals from './BattleEffectVisuals'
import EffectsDisplay from './EffectsDisplay'
import BattleStatsCard from './BattleStatsCard'

interface DuelloBattleScreenProps {
  playerDino: Dino
  opponentDino: Dino
  sessionId: string
  isHost: boolean
  playerId: string
  opponentId: string
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
  playerId,
  opponentId,
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
  const [round, setRound] = useState(1)

  const [playerHpPercent, setPlayerHpPercent] = useState(0)
  const [opponentHpPercent, setOpponentHpPercent] = useState(0)
  const [debugLogs, setDebugLogs] = useState<string[]>(['Battle başladı'])
  const [showDebug, setShowDebug] = useState(true)
  const [showAbandonModal, setShowAbandonModal] = useState(false)
  const [matchRecordingDone, setMatchRecordingDone] = useState(false)
  const [matchRecordingError, setMatchRecordingError] = useState<string | null>(null)
  const subscriptionRef = useRef<any>(null)

  // Update HP percentages
  useEffect(() => {
    setPlayerHpPercent((playerChar.currentHp / playerChar.dino.maxHp) * 100)
    setOpponentHpPercent((opponentChar.currentHp / opponentChar.dino.maxHp) * 100)
  }, [playerChar.currentHp, opponentChar.currentHp, playerChar.dino.maxHp, opponentChar.dino.maxHp])

  // Helper function to add debug logs
  const addLog = (msg: string) => {
    console.log(msg)
    setDebugLogs(prev => [msg, ...prev.slice(0, 14)])
  }

  // Subscribe to opponent's ability selections
  useEffect(() => {
    if (!sessionId) {
      addLog('❌ sessionId yok!')
      return
    }

    addLog(`📡 Subscription: ${sessionId}`)

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
          addLog(`📥 Action: idx=${action.ability_index}, player=${action.player_id?.substring(0, 8)}...`)
          // If this is from opponent, update their selected ability
          if (action.player_id !== playerId) {
            addLog(`👹 Rakip seçti: ability #${action.ability_index}`)
            setOpponentSelectedAbility(action.ability_index)
          } else {
            addLog(`👤 Kendi seçim (skip)`)
          }
        }
      )
      .subscribe((status) => {
        addLog(`🔌 Status: ${status}`)
      })

    subscriptionRef.current = channel

    // Wait a bit and check subscription status
    setTimeout(() => {
      const status = channel.state
      addLog(`📊 Subscription state: ${status}`)
    }, 500)

    // Handle page unload - mark as abandoned if battle not ended
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!battleEnded) {
        addLog('⚠️ Sayfa kapatılıyor, düello terk ediliyor')
        e.preventDefault()
        e.returnValue = 'Düello devam ediyor! Terk ederseniz kaybedeceksiniz.'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      addLog('🧹 Subscription temizleniyor')
      channel.unsubscribe()
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [sessionId, playerId, battleEnded])

  // When both players have selected, execute their actions
  useEffect(() => {
    if (playerSelectedAbility !== null && opponentSelectedAbility !== null && !roundInProgress) {
      setRoundInProgress(true)
      executeRound()
    }
  }, [playerSelectedAbility, opponentSelectedAbility])

  // Record match result when battle ends
  useEffect(() => {
    if (!battleEnded || !winner) return

    const recordMatchResult = async () => {
      try {
        const winnerDinoId = winner === 'player' ? playerDino.id : opponentDino.id
        const xpReward = 20 // Base XP for winning

        addLog('📊 Maç sonuçlandırılıyor...')

        // Give XP to winner
        addLog(`🎁 ${xpReward} XP veriliyor...`)
        await addXpToDino(winnerDinoId, xpReward)
        addLog('✅ XP verildi')

        // Record the match
        addLog('📝 Maç günlüğüne yazılıyor...')
        await recordDuelloMatch(sessionId, playerDino.id, opponentDino.id, winnerDinoId)
        addLog('✅ Maç kaydedildi')

        // Update session status
        addLog('🔄 Oturum tamamlanıyor...')
        await supabase
          .from('duello_sessions')
          .update({ status: 'completed' })
          .eq('session_id', sessionId)
        addLog('✅ Oturum tamamlandı')

        setMatchRecordingDone(true)

        // Auto-close after 3 seconds
        setTimeout(() => {
          onBack()
        }, 3000)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        addLog(`❌ Kayıt hatası: ${errorMsg}`)
        console.error('Match recording error:', err)
        setMatchRecordingError(errorMsg)
      }
    }

    recordMatchResult()
  }, [battleEnded, winner, playerDino.id, opponentDino.id, sessionId, onBack])

  async function selectAbility(abilityIdx: number) {
    if (roundInProgress || playerSelectedAbility !== null) {
      addLog(`⛔ Bloklandı: roundInProgress=${roundInProgress}, selected=${playerSelectedAbility}`)
      return
    }
    if (playerChar.abilities[abilityIdx].cd > 0) {
      addLog(`⏳ CD: ${playerChar.abilities[abilityIdx].cd} tur`)
      setBattleLog(prev => ['❌ Yetenek henüz hazır değil!', ...prev.slice(0, 9)])
      return
    }

    // Check if stunned or stopped
    if (playerChar.effects.some(e => e.type === 'stun' || e.type === 'stop')) {
      addLog('🌀 Sersem/Dur effekti aktif')
      setBattleLog(prev => ['❌ Harekete geçilemez!', ...prev.slice(0, 9)])
      return
    }

    // Roll dice
    const diceResult = rollDice()
    addLog(`🎲 Zar: ${diceResult.value}, Yetenek: ${playerChar.abilities[abilityIdx].name}`)

    // Store in Supabase so opponent knows
    try {
      addLog(`💾 Supabase'e yazılıyor...`)
      const { error } = await supabase.from('battle_actions').insert({
        session_id: sessionId,
        player_id: playerId,
        ability_index: abilityIdx,
        dice_result: diceResult.value,
        timestamp: Date.now(),
      })

      if (error) {
        addLog(`❌ Supabase HATASI: ${error.message}`)
        setBattleLog(prev => ['❌ Yetenek kaydedilemedi!', ...prev.slice(0, 9)])
        return
      }

      addLog(`✅ Supabase'e yazıldı`)
    } catch (err) {
      addLog(`❌ Exception: ${err instanceof Error ? err.message : String(err)}`)
      setBattleLog(prev => ['❌ Hata oluştu!', ...prev.slice(0, 9)])
      return
    }

    setPlayerSelectedAbility(abilityIdx)
    setLastDiceResult(diceResult.value)
    addLog(`👤 Seçim yapıldı, rakip bekleniyor...`)
  }

  function applyEffectsAndCleanup() {
    setPlayerChar(c => {
      let newHp = c.currentHp
      const newEffects: ActiveEffect[] = []

      for (const effect of c.effects) {
        const damage = getEffectDamage(effect.type, 1, c.dino.maxHp)
        newHp = Math.max(0, newHp - damage)

        if (damage > 0) {
          addLog(`💀 ${getEffectNameTR(effect.type)}: -${damage} HP`)
        }

        // Decrement duration
        const newDuration = effect.duration - 1
        if (newDuration > 0) {
          newEffects.push({ ...effect, duration: newDuration })
        }
      }

      // Check if player died from effects
      if (newHp <= 0) {
        setBattleEnded(true)
        setWinner('opponent')
        onBattleEnd('opponent')
        setBattleLog(prev => ['💀 YENİLDİNİZ! (Efekt hasarı)', ...prev.slice(0, 9)])
        setRoundInProgress(false)
      }

      return { ...c, currentHp: newHp, effects: newEffects }
    })

    setOpponentChar(c => {
      let newHp = c.currentHp
      const newEffects: ActiveEffect[] = []

      for (const effect of c.effects) {
        const damage = getEffectDamage(effect.type, 1, c.dino.maxHp)
        newHp = Math.max(0, newHp - damage)

        if (damage > 0) {
          addLog(`🔴 ${getEffectNameTR(effect.type)}: -${damage} HP`)
        }

        // Decrement duration
        const newDuration = effect.duration - 1
        if (newDuration > 0) {
          newEffects.push({ ...effect, duration: newDuration })
        }
      }

      // Check if opponent died from effects
      if (newHp <= 0) {
        setBattleEnded(true)
        setWinner('player')
        onBattleEnd('player')
        setBattleLog(prev => ['🎉 KAZANDINIZ! (Efekt hasarı)', ...prev.slice(0, 9)])
        setRoundInProgress(false)
      }

      return { ...c, currentHp: newHp, effects: newEffects }
    })
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

      // Apply effects and cleanup before next round
      setTimeout(() => {
        applyEffectsAndCleanup()
      }, 1500)

      // Reset round
      setTimeout(() => {
        setPlayerSelectedAbility(null)
        setOpponentSelectedAbility(null)
        setRoundInProgress(false)
        setRound(prev => prev + 1)
      }, 2000)
    }
  }

  async function handleAbandonBattle() {
    addLog('⚠️ Düello terk ediliyor...')
    try {
      // Record that player abandoned
      await supabase.from('battle_actions').insert({
        session_id: sessionId,
        player_id: playerId,
        ability_index: -1, // Special code for abandon
        dice_result: 0,
        timestamp: Date.now(),
      })
      addLog('✅ Terk işlemi kaydedildi')

      // Mark session as abandoned
      await abandonDuelloSession(sessionId)
      addLog('📝 Oturum terk etme olarak işaretlendi')

      // Give opponent XP (10 XP for winning by abandon)
      addLog('🎁 Rakip XP veriliyor...')
      await addXpToDino(opponentDino.id, 10)
      addLog('✅ Rakip 10 XP aldı')

      // Record the match
      addLog('📊 Maç günlüğüne yazılıyor...')
      await recordDuelloMatch(sessionId, playerDino.id, opponentDino.id, opponentDino.id)
      addLog('✅ Maç kaydedildi')
    } catch (err) {
      addLog(`❌ Hata: ${err instanceof Error ? err.message : String(err)}`)
      console.error(err)
    }

    setWinner('opponent')
    setBattleEnded(true)
    onBattleEnd('opponent')
  }

  if (battleEnded) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 relative overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-dark neon-border-cyan rounded-2xl p-12 text-center max-w-md"
        >
          <div className="text-9xl mb-6">{winner === 'player' ? '🎉' : '💀'}</div>

          <h1 className="text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">
            {winner === 'player' ? 'KAZANDINIZ!' : 'YENİLDİNİZ!'}
          </h1>

          {matchRecordingDone ? (
            <>
              <div className="mb-6 space-y-3">
                <p className="text-xl font-bold text-green-400">✅ 20 XP Kazandı</p>
                <p className="text-lg font-bold text-neon-cyan">✅ Maç Kaydedildi</p>
              </div>
              <p className="text-sm text-neon-cyan/70 mb-6">
                Ana ekrana yönlendiriliyorsun...
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

  // Abandon modal
  if (showAbandonModal) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 relative bg-gradient-to-br from-slate-900 to-slate-800">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-dark neon-border-cyan rounded-xl p-8 max-w-sm text-center"
        >
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-black text-neon-cyan mb-4">Düelloyu Terk Et?</h2>
          <p className="text-neon-cyan/80 mb-6">
            Eğer çıkarsan <span className="font-black text-red-400">KAYBEDECEKSIN</span> ve rakip XP kazanacak.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setShowAbandonModal(false)}
              className="flex-1 px-4 py-3 glass-dark neon-border-cyan rounded-lg font-bold text-neon-cyan hover:shadow-neon-cyan transition"
            >
              ← Devam Et
            </button>
            <button
              onClick={handleAbandonBattle}
              className="flex-1 px-4 py-3 glass-dark border border-red-500/50 rounded-lg font-bold text-red-400 hover:shadow-red-500/50 transition"
            >
              💀 Terk Et
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 p-4 overflow-y-auto relative">
      {/* Battle effect visuals */}
      <BattleEffectVisuals effectType={currentEffectVisual} isVisible={showEffectVisual} />

      {/* Abandon button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowAbandonModal(true)}
          className="px-4 py-2 glass border border-red-500/50 rounded-lg font-bold text-sm text-red-400 hover:shadow-red-500/50 transition"
        >
          🚪 Terk Et
        </button>
      </div>

      {/* Header with turn counter badge */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1" />
        <div className="glass-dark border border-neon-pink/50 rounded-lg px-4 py-2 text-center">
          <p className="text-lg font-black text-neon-pink">🔄 Tur {round}</p>
        </div>
      </div>

      {/* Battle stats section */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Player card */}
        <div>
          {/* HP Bar */}
          <div className="glass-dark neon-border-cyan rounded-lg p-4 mb-3">
            <p className="text-xs font-bold text-neon-cyan mb-2">OYUNCU</p>
            <h2 className="text-lg font-black text-neon-cyan mb-2">{playerChar.dino.name}</h2>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden border border-red-500/30 mb-1">
              <div
                className="bg-gradient-to-r from-red-500 to-red-600 h-full transition-all"
                style={{ width: `${Math.max(0, playerHpPercent)}%` }}
              />
            </div>
            <p className="text-xs text-neon-cyan mb-3">{Math.max(0, playerChar.currentHp)}/{playerChar.dino.maxHp}</p>

            {/* Effects display */}
            <div className="mb-3 p-3 bg-neon-cyan/5 rounded-lg border border-neon-cyan/20">
              <EffectsDisplay effects={playerChar.effects} />
            </div>
          </div>

          {/* Stats Card */}
          <BattleStatsCard dino={playerChar.dino} effects={playerChar.effects} isPlayer={true} />
        </div>

        {/* Opponent card */}
        <div>
          {/* HP Bar */}
          <div className="glass-dark neon-border-purple rounded-lg p-4 mb-3">
            <p className="text-xs font-bold text-neon-purple mb-2">RAKİP</p>
            <h2 className="text-lg font-black text-neon-purple mb-2">{opponentChar.dino.name}</h2>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden border border-red-500/30 mb-1">
              <div
                className="bg-gradient-to-r from-red-500 to-red-600 h-full transition-all"
                style={{ width: `${Math.max(0, opponentHpPercent)}%` }}
              />
            </div>
            <p className="text-xs text-neon-purple mb-3">{Math.max(0, opponentChar.currentHp)}/{opponentChar.dino.maxHp}</p>

            {/* Effects display */}
            <div className="mb-3 p-3 bg-neon-purple/5 rounded-lg border border-neon-purple/20">
              <EffectsDisplay effects={opponentChar.effects} />
            </div>
          </div>

          {/* Stats Card */}
          <BattleStatsCard dino={opponentChar.dino} effects={opponentChar.effects} isPlayer={false} />
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
                    <span className="font-black">{getEffectNameTR(ability.effect)}</span>
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

      {/* Battle log / Debug Panel */}
      <div className="glass-dark border border-neon-purple/30 rounded-lg p-4 min-h-64 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-bold text-neon-purple">
            {showDebug ? '🔧 DEBUG PANELI' : '📋 SAVAŞ GÜNLÜĞÜ'}
          </p>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs px-3 py-1 glass neon-border-cyan rounded text-neon-cyan hover:shadow-neon-cyan transition font-bold"
          >
            {showDebug ? '📋 Değiştir' : '🔧 Değiştir'}
          </button>
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto text-sm">
          {(showDebug ? debugLogs : battleLog).map((log, idx) => (
            <motion.p
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`font-bold break-words ${showDebug ? 'text-neon-cyan' : 'text-neon-purple'}`}
            >
              {log}
            </motion.p>
          ))}
          {(showDebug ? debugLogs : battleLog).length === 0 && (
            <p className="text-neon-cyan/50 italic">Henüz log yok...</p>
          )}
        </div>
      </div>
    </div>
  )
}
