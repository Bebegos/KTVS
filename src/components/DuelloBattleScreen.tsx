import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino } from '../game/types'
import { BattleEngine } from '../lib/battleEngine'
import { getEffectNameTR } from '../lib/effect-translations'
import { supabase, addXpToDino, recordDuelloMatch, abandonDuelloSession } from '../lib/supabase'
import AbilityIcon from './AbilityIcon'
import BattleEffectVisuals from './BattleEffectVisuals'
import EffectsDisplay from './EffectsDisplay'
import BattleStatsCard from './BattleStatsCard'
import HealthBar from './HealthBar'

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
  const [engine] = useState(() => new BattleEngine(playerDino, opponentDino))
  const [battleState, setBattleState] = useState(engine.getState())
  const [roundInProgress, setRoundInProgress] = useState(false)
  const [currentEffectVisual, setCurrentEffectVisual] = useState<'buff' | 'debuff' | 'damage' | null>(null)
  const [showEffectVisual, setShowEffectVisual] = useState(false)
  const [debugLogs, setDebugLogs] = useState<string[]>(['Battle başladı'])
  const [showDebug, setShowDebug] = useState(true)
  const [showAbandonModal, setShowAbandonModal] = useState(false)
  const [matchRecordingDone, setMatchRecordingDone] = useState(false)
  const [matchRecordingError, setMatchRecordingError] = useState<string | null>(null)
  const [playerSelectedAbility, setPlayerSelectedAbility] = useState<number | null>(null)
  const [opponentSelectedAbility, setOpponentSelectedAbility] = useState<number | null>(null)
  const subscriptionRef = useRef<any>(null)

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

    setTimeout(() => {
      const status = channel.state
      addLog(`📊 Subscription state: ${status}`)
    }, 500)

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!battleState.battleEnded) {
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
  }, [sessionId, playerId, battleState.battleEnded])

  // When both players have selected, execute their actions
  useEffect(() => {
    if (playerSelectedAbility !== null && opponentSelectedAbility !== null && !roundInProgress) {
      setRoundInProgress(true)
      executeRound()
    }
  }, [playerSelectedAbility, opponentSelectedAbility])

  // Record match result when battle ends
  useEffect(() => {
    if (!battleState.battleEnded || !battleState.winner) return

    const recordMatchResult = async () => {
      try {
        const winnerDinoId = battleState.winner === 'player' ? playerDino.id : opponentDino.id
        const xpReward = engine.getXpReward()

        addLog('📊 Maç sonuçlandırılıyor...')

        if (xpReward > 0) {
          addLog(`🎁 ${xpReward} XP veriliyor...`)
          await addXpToDino(winnerDinoId, xpReward)
          addLog('✅ XP verildi')
        }

        addLog('📝 Maç günlüğüne yazılıyor...')
        await recordDuelloMatch(sessionId, playerDino.id, opponentDino.id, winnerDinoId)
        addLog('✅ Maç kaydedildi')

        addLog('🔄 Oturum tamamlanıyor...')
        await supabase
          .from('duello_sessions')
          .update({ status: 'completed' })
          .eq('session_id', sessionId)
        addLog('✅ Oturum tamamlandı')

        setMatchRecordingDone(true)

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
  }, [battleState.battleEnded, battleState.winner, playerDino.id, opponentDino.id, sessionId, onBack, engine])

  async function selectAbility(abilityIdx: number) {
    if (roundInProgress || playerSelectedAbility !== null) {
      addLog(`⛔ Bloklandı: roundInProgress=${roundInProgress}, selected=${playerSelectedAbility}`)
      return
    }

    if (!engine.canUseAbility('player', abilityIdx)) {
      addLog(`❌ Yetenek kullanılamıyor`)
      return
    }

    try {
      addLog(`💾 Supabase'e yazılıyor...`)
      const { error } = await supabase.from('battle_actions').insert({
        session_id: sessionId,
        player_id: playerId,
        ability_index: abilityIdx,
        dice_result: 0,
        timestamp: Date.now(),
      })

      if (error) {
        addLog(`❌ Supabase HATASI: ${error.message}`)
        return
      }

      addLog(`✅ Supabase'e yazıldı`)
      setPlayerSelectedAbility(abilityIdx)
      addLog(`👤 Seçim yapıldı, rakip bekleniyor...`)
    } catch (err) {
      addLog(`❌ Exception: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  function executeRound() {
    if (playerSelectedAbility === null || opponentSelectedAbility === null) return

    setTimeout(() => {
      try {
        const result = engine.executeRound(playerSelectedAbility, opponentSelectedAbility)

        addLog(`👤 ${result.playerAction.message}`)
        setCurrentEffectVisual('damage')
        setShowEffectVisual(true)
        setTimeout(() => setShowEffectVisual(false), 1500)

        setTimeout(() => {
          if (result.playerAction.effectApplied) {
            addLog(`✨ ${result.playerAction.effectApplied} uygulandı`)
            setCurrentEffectVisual('debuff')
            setShowEffectVisual(true)
            setTimeout(() => setShowEffectVisual(false), 1500)
          }

          setTimeout(() => {
            addLog(`👹 ${result.opponentAction.message}`)
            if (!result.opponentAction.targetDied) {
              setCurrentEffectVisual('damage')
              setShowEffectVisual(true)
              setTimeout(() => setShowEffectVisual(false), 1500)
            }

            if (result.opponentAction.effectApplied) {
              addLog(`✨ ${result.opponentAction.effectApplied} uygulandı`)
              setCurrentEffectVisual('debuff')
              setShowEffectVisual(true)
              setTimeout(() => setShowEffectVisual(false), 1500)
            }

            if (result.effectDamage.playerDamage > 0) {
              addLog(`💀 Efekt hasarı (Oyuncu): -${result.effectDamage.playerDamage} HP`)
            }
            if (result.effectDamage.opponentDamage > 0) {
              addLog(`🔴 Efekt hasarı (Rakip): -${result.effectDamage.opponentDamage} HP`)
            }

            setBattleState(engine.getState())

            if (result.battleEnded) {
              onBattleEnd(result.winner!)
              return
            }

            addLog(`🔄 Tur ${engine.getCurrentRound()}`)
            setPlayerSelectedAbility(null)
            setOpponentSelectedAbility(null)
            setRoundInProgress(false)
          }, result.opponentAction.targetDied ? 0 : 2000)
        }, result.playerAction.effectApplied ? 2000 : 1000)
      } catch (err) {
        addLog(`❌ Round hatası: ${err instanceof Error ? err.message : String(err)}`)
        setRoundInProgress(false)
      }
    }, 800)
  }

  async function handleAbandonBattle() {
    addLog('⚠️ Düello terk ediliyor...')
    try {
      await supabase.from('battle_actions').insert({
        session_id: sessionId,
        player_id: playerId,
        ability_index: -1,
        dice_result: 0,
        timestamp: Date.now(),
      })
      addLog('✅ Terk işlemi kaydedildi')

      await abandonDuelloSession(sessionId)
      addLog('📝 Oturum terk etme olarak işaretlendi')

      addLog('🎁 Rakip XP veriliyor...')
      await addXpToDino(opponentDino.id, 10)
      addLog('✅ Rakip 10 XP aldı')

      addLog('📊 Maç günlüğüne yazılıyor...')
      await recordDuelloMatch(sessionId, playerDino.id, opponentDino.id, opponentDino.id)
      addLog('✅ Maç kaydedildi')

      engine.abandon(true)
      setBattleState(engine.getState())
      onBattleEnd('opponent')
    } catch (err) {
      addLog(`❌ Hata: ${err instanceof Error ? err.message : String(err)}`)
      console.error(err)
    }
  }


  if (battleState.battleEnded) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 relative overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-dark neon-border-cyan rounded-2xl p-12 text-center max-w-md"
        >
          <div className="text-9xl mb-6">{battleState.winner === 'player' ? '🎉' : '💀'}</div>

          <h1 className="text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">
            {battleState.winner === 'player' ? 'KAZANDINIZ!' : 'YENİLDİNİZ!'}
          </h1>

          {matchRecordingDone ? (
            <>
              <div className="mb-6 space-y-3">
                <p className="text-xl font-bold text-green-400">✅ {engine.getXpReward()} XP Kazandı</p>
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
                className="hs-btn hs-btn-block"
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
              className="hs-btn flex-1"
            >
              ← Devam Et
            </button>
            <button
              onClick={handleAbandonBattle}
              className="hs-btn hs-btn-red flex-1"
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
      <BattleEffectVisuals effectType={currentEffectVisual} isVisible={showEffectVisual} />

      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowAbandonModal(true)}
          className="hs-btn hs-btn-red hs-btn-sm"
        >
          🚪 Terk Et
        </button>
      </div>

      <div className="flex justify-between items-start mb-6">
        <div className="flex-1" />
        <div className="glass-dark border border-neon-pink/50 rounded-lg px-4 py-2 text-center">
          <p className="text-lg font-black text-neon-pink">🔄 Tur {battleState.round}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="glass-dark neon-border-cyan rounded-lg p-4 mb-3">
            <p className="text-xs font-bold text-neon-cyan mb-2">OYUNCU</p>
            <h2 className="text-lg font-black text-neon-cyan mb-2">{playerDino.name}</h2>
            <div className="mb-3">
              <HealthBar current={battleState.player.currentHp} max={battleState.player.dino.maxHp} variant="player" />
            </div>

            <div className="mb-3 p-3 bg-neon-cyan/5 rounded-lg border border-neon-cyan/20">
              <EffectsDisplay effects={battleState.player.effects} />
            </div>
          </div>

          <BattleStatsCard dino={battleState.player.dino} effects={battleState.player.effects} isPlayer={true} />
        </div>

        <div>
          <div className="glass-dark neon-border-purple rounded-lg p-4 mb-3">
            <p className="text-xs font-bold text-neon-purple mb-2">RAKİP</p>
            <h2 className="text-lg font-black text-neon-purple mb-2">{opponentDino.name}</h2>
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
        <p className="text-xs font-bold text-neon-cyan mb-2">⚔️ YETENEKLERİ SEÇ (Her turda 1)</p>
        <div className="grid grid-cols-2 gap-3">
          {battleState.player.abilities.map((ability, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: playerSelectedAbility === null && engine.canUseAbility('player', idx) ? 1.05 : 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => selectAbility(idx)}
              disabled={playerSelectedAbility !== null || !engine.canUseAbility('player', idx) || roundInProgress}
              className={`p-4 rounded-xl font-bold transition flex flex-col items-start gap-2 min-h-[140px] ${
                playerSelectedAbility === idx
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
                  <span>Hasar Çarpanı:</span>
                  <span className="font-black">×{ability.multiplier || 1}</span>
                </div>
                {ability.effects && ability.effects.length > 0 && (
                  <div className="flex justify-between">
                    <span>Efektler:</span>
                    <span className="font-black">{ability.effects.map((e: string) => getEffectNameTR(e)).join(' + ')}</span>
                  </div>
                )}
                {battleState.player.cooldowns[idx] > 0 && (
                  <div className="flex justify-between text-red-400">
                    <span>Hazır olmaya:</span>
                    <span className="font-black">{battleState.player.cooldowns[idx]} tur</span>
                  </div>
                )}
              </div>

              {playerSelectedAbility === idx && (
                <div className="w-full text-center mt-auto">
                  <p className="text-xs font-black text-neon-cyan">✓ SEÇİLDİ</p>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="glass-dark border border-neon-cyan/30 rounded-lg p-4 mb-6 text-center">
        <p className="text-neon-cyan font-bold">
          {playerSelectedAbility !== null && opponentSelectedAbility === null
            ? '⏳ Rakip beklemede...'
            : playerSelectedAbility === null && opponentSelectedAbility === null
            ? '👉 Yetenek seç'
            : '⚔️ Savaş başlamak üzere...'}
        </p>
      </div>

      <div className="glass-dark border border-neon-purple/30 rounded-lg p-4 min-h-64 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-bold text-neon-purple">
            {showDebug ? '🔧 DEBUG PANELI' : '📋 SAVAŞ GÜNLÜĞÜ'}
          </p>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="hs-btn hs-btn-sm"
          >
            {showDebug ? '📋 Değiştir' : '🔧 Değiştir'}
          </button>
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto text-sm">
          {(showDebug ? debugLogs : battleState.battleLog).map((log, idx) => (
            <motion.p
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`font-bold break-words ${showDebug ? 'text-neon-cyan' : 'text-neon-purple'}`}
            >
              {log}
            </motion.p>
          ))}
          {(showDebug ? debugLogs : battleState.battleLog).length === 0 && (
            <p className="text-neon-cyan/50 italic">Henüz log yok...</p>
          )}
        </div>
      </div>
    </div>
  )
}
