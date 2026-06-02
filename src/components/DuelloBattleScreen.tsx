import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino, BattleVisualEffects, ActiveEffect } from '../game/types'
import { BattleEngine } from '../lib/battleEngine'
import { supabase, addXpToDino, recordDuelloMatch, abandonDuelloSession } from '../lib/supabase'
import { battleVisualService } from '../lib/services'
import PremiumButton from './PremiumButton'
import EffectInfoModal from './EffectInfoModal'
import BattleArena, { BattleArenaSlot } from './battle/BattleArena'
import { modalAssets } from '../lib/gameAssets'

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
  const [effectInfoOpen, setEffectInfoOpen] = useState(false)
  const [selectedEffectInfo, setSelectedEffectInfo] = useState<ActiveEffect | null>(null)
  const subscriptionRef = useRef<any>(null)

  const openEffectInfo = (effect: ActiveEffect) => {
    setSelectedEffectInfo(effect)
    setEffectInfoOpen(true)
  }

  // New immersive battle effect system
  const [activeEffectOverlay, setActiveEffectOverlay] = useState(false)
  const [currentVisualEffects, setCurrentVisualEffects] = useState<BattleVisualEffects | null>(null)
  const [castIconId, setCastIconId] = useState<string | undefined>(undefined)
  const [floatingDamages, setFloatingDamages] = useState<
    Array<{ id: string; damage: number; isCritical: boolean; isHealing: boolean; x: number; y: number }>
  >([])

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
        addLog('Sayfa kapatılıyor, düello terk ediliyor')
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
        const playerAbility = battleState.player.abilities[playerSelectedAbility]
        const opponentAbility = battleState.opponent.abilities[opponentSelectedAbility]

        // Get visual effects for both abilities
        const playerVisuals = battleVisualService.getVisualEffects(playerAbility)
        const opponentVisuals = battleVisualService.getVisualEffects(opponentAbility)

        addLog(`👤 ${result.playerAction.message}`)

        // Show player ability effect overlay
        setCurrentVisualEffects(playerVisuals)
        setCastIconId(playerAbility?.icon)
        setActiveEffectOverlay(true)

        // Add floating damage numbers for player
        if (result.playerAction.damage > 0) {
          const newDamage = {
            id: `${Date.now()}-player`,
            damage: result.playerAction.damage,
            isCritical: false,
            isHealing: false,
            x: window.innerWidth * 0.25,
            y: window.innerHeight * 0.3,
          }
          setFloatingDamages(prev => [...prev, newDamage])
        }

        setTimeout(() => {
          setActiveEffectOverlay(false)

          if (result.playerAction.effectApplied) {
            addLog(`✨ ${result.playerAction.effectApplied} uygulandı`)
          }

          setTimeout(() => {
            addLog(`👹 ${result.opponentAction.message}`)

            if (!result.opponentAction.targetDied) {
              // Show opponent ability effect overlay
              setCurrentVisualEffects(opponentVisuals)
              setCastIconId(opponentAbility?.icon)
              setActiveEffectOverlay(true)

              // Add floating damage numbers for opponent
              if (result.opponentAction.damage > 0) {
                const newDamage = {
                  id: `${Date.now()}-opponent`,
                  damage: result.opponentAction.damage,
                  isCritical: false,
                  isHealing: false,
                  x: window.innerWidth * 0.75,
                  y: window.innerHeight * 0.3,
                }
                setFloatingDamages(prev => [...prev, newDamage])
              }
            }

            if (result.opponentAction.effectApplied) {
              addLog(`✨ ${result.opponentAction.effectApplied} uygulandı`)
            }

            if (result.effectDamage.playerDamage > 0) {
              addLog(`💀 Efekt hasarı (Oyuncu): -${result.effectDamage.playerDamage} HP`)
            }
            if (result.effectDamage.opponentDamage > 0) {
              addLog(`🔴 Efekt hasarı (Rakip): -${result.effectDamage.opponentDamage} HP`)
            }

            setTimeout(() => {
              setActiveEffectOverlay(false)
              setBattleState(engine.getState())

              if (result.battleEnded) {
                onBattleEnd(result.winner!)
                return
              }

              addLog(`🔄 Tur ${engine.getCurrentRound()}`)
              setPlayerSelectedAbility(null)
              setOpponentSelectedAbility(null)
              setRoundInProgress(false)
              setFloatingDamages([])
            }, result.opponentAction.targetDied ? opponentVisuals.animationDuration : opponentVisuals.animationDuration + 500)
          }, playerVisuals.animationDuration + 200)
        }, playerVisuals.animationDuration)
      } catch (err) {
        addLog(`❌ Round hatası: ${err instanceof Error ? err.message : String(err)}`)
        setRoundInProgress(false)
      }
    }, 800)
  }

  async function handleAbandonBattle() {
    addLog('Düello terk ediliyor...')
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
      <div
        className="w-full min-h-screen flex flex-col items-center justify-center p-4 relative"
        style={{
          backgroundImage: `url('${modalAssets.background}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative max-w-sm w-full text-center"
          style={{
            backgroundImage: `url('${modalAssets.frame}')`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="px-10 py-10 space-y-4">
            <div className="text-3xl font-black text-red-600">!</div>
            <h2 className="text-2xl font-black text-amber-950">Düelloyu Terk Et?</h2>
            <p className="text-amber-950/80 font-semibold text-sm">
              Eğer çıkarsan <span className="font-black text-red-600">KAYBEDECEKSIN</span> ve rakip XP
              kazanacak.
            </p>

            <div className="flex gap-3 pt-2">
              <PremiumButton onClick={() => setShowAbandonModal(false)} className="flex-1 h-14">
                ← Devam Et
              </PremiumButton>
              <button
                onClick={handleAbandonBattle}
                className="hs-btn hs-btn-red flex-1"
              >
                💀 Terk Et
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  const slots: BattleArenaSlot[] = battleState.player.abilities.map((ability, idx) => {
    const canUse = engine.canUseAbility('player', idx)
    return {
      ability,
      index: idx,
      isUltimate: idx === 5,
      isSelected: playerSelectedAbility === idx,
      isLocked: false,
      canUse,
      cooldown: battleState.player.cooldowns[idx] || 0,
      maxCooldown: ability.maxCd || 0,
      disabled: playerSelectedAbility !== null || !canUse || roundInProgress,
    }
  })

  const statusText =
    playerSelectedAbility !== null && opponentSelectedAbility === null
      ? 'Rakip beklemede...'
      : playerSelectedAbility === null && opponentSelectedAbility === null
      ? 'Yetenek seç'
      : 'Savaş başlamak üzere...'

  return (
    <>
      <BattleArena
        player={{
          name: playerDino.name,
          level: playerDino.level,
          currentHp: battleState.player.currentHp,
          maxHp: battleState.player.dino.maxHp,
          effects: battleState.player.effects,
          specId: playerDino.spec,
          classId: playerDino.class,
        }}
        opponent={{
          name: opponentDino.name,
          level: opponentDino.level,
          currentHp: battleState.opponent.currentHp,
          maxHp: battleState.opponent.dino.maxHp,
          effects: battleState.opponent.effects,
          specId: opponentDino.spec,
          classId: opponentDino.class,
        }}
        playerAtk={playerDino.atk}
        round={battleState.round}
        battleLog={battleState.battleLog}
        slots={slots}
        onSelectAbility={selectAbility}
        onEffectClick={openEffectInfo}
        statusText={statusText}
        onAbandon={() => setShowAbandonModal(true)}
        activeEffectOverlay={activeEffectOverlay}
        currentVisualEffects={currentVisualEffects}
        onEffectOverlayComplete={() => setActiveEffectOverlay(false)}
        floatingDamages={floatingDamages}
        castIconId={castIconId}
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
