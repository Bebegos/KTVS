import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino, BattleVisualEffects } from '../game/types'
import { BattleEngine } from '../lib/battleEngine'
import { getEffectNameTR } from '../lib/effect-translations'
import { supabase, addXpToDino, recordDuelloMatch, abandonDuelloSession } from '../lib/supabase'
import { slotService, battleVisualService } from '../lib/services'
import AbilityIcon from './AbilityIcon'
import BattleEffectVisuals from './BattleEffectVisuals'
import EffectsDisplay from './EffectsDisplay'
import BattleStatsCard from './BattleStatsCard'
import HealthBar from './HealthBar'
import PremiumAbilityButton from './PremiumAbilityButton'
import PremiumButton from './PremiumButton'
import { modalAssets } from '../lib/gameAssets'
import BattleEffectOverlay from './battle-effects/BattleEffectOverlay'
import FloatingDamageNumber from './battle-effects/FloatingDamageNumber'
import BattleDinoHUD from './battle-effects/BattleDinoHUD'
import TurnIndicator from './battle-effects/TurnIndicator'
import EnhancedBattleLog from './battle-effects/EnhancedBattleLog'

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

  // New immersive battle effect system
  const [activeEffectOverlay, setActiveEffectOverlay] = useState(false)
  const [currentVisualEffects, setCurrentVisualEffects] = useState<BattleVisualEffects | null>(null)
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

  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-neon-cyan opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-neon-purple opacity-5 rounded-full blur-3xl"></div>
      </div>

      {/* IMMERSIVE EFFECTS (Absolute positioned) */}
      <AnimatePresence>
        {activeEffectOverlay && currentVisualEffects && (
          <BattleEffectOverlay
            isActive={activeEffectOverlay}
            visualEffects={currentVisualEffects}
            onComplete={() => setActiveEffectOverlay(false)}
          />
        )}
      </AnimatePresence>

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

      <AnimatePresence>
        <TurnIndicator round={battleState.round} isPlayerTurn={battleState.round % 2 === 1} />
      </AnimatePresence>

      {/* HEADER - Abandon button (Desktop only) */}
      <div className="hidden lg:flex px-3 pt-3 justify-end z-10">
        <button
          onClick={() => setShowAbandonModal(true)}
          className="hs-btn hs-btn-red hs-btn-sm"
        >
          🚪 Terk Et
        </button>
      </div>

      {/* DESKTOP: 3-COLUMN LAYOUT */}
      <div className="hidden lg:relative lg:flex-1 lg:flex lg:flex-row lg:gap-3 lg:p-3 lg:overflow-hidden">
        {/* Player side */}
        <div className="w-1/3 flex flex-col gap-2">
          <div className="hs-battle-frame hs-battle-frame-player">
            <div className="glass-dark neon-border-cyan rounded-lg p-3">
              <p className="text-xs font-bold text-neon-cyan mb-1">OYUNCU</p>
              <BattleDinoHUD
                dinoName={playerDino.name}
                currentHp={battleState.player.currentHp}
                maxHp={battleState.player.dino.maxHp}
                effects={battleState.player.effects}
                isPlayer={true}
              />
            </div>
          </div>
          <BattleStatsCard dino={battleState.player.dino} effects={battleState.player.effects} isPlayer={true} />
        </div>

        {/* Center arena */}
        <div className="w-1/3 flex flex-col items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-6xl opacity-20">⚔️</div>
            <p className="text-neon-cyan/40 text-sm font-bold uppercase tracking-wider">Düello Alanı</p>
          </div>
        </div>

        {/* Opponent side */}
        <div className="w-1/3 flex flex-col gap-2">
          <div className="hs-battle-frame hs-battle-frame-opponent">
            <div className="glass-dark neon-border-purple rounded-lg p-3">
              <p className="text-xs font-bold text-neon-purple mb-1">RAKİP</p>
              <BattleDinoHUD
                dinoName={opponentDino.name}
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

      {/* MOBILE: VERTICAL STACKED LAYOUT (lg:hidden) */}
      <div className="flex flex-col flex-1 gap-2 p-2 overflow-y-auto lg:hidden">
        {/* Abandon button (Mobile) */}
        <button
          onClick={() => setShowAbandonModal(true)}
          className="hs-btn hs-btn-red hs-btn-sm w-full"
        >
          🚪 Terk Et
        </button>

        {/* PLAYER */}
        <div className="flex-shrink-0">
          <div className="hs-battle-frame hs-battle-frame-player">
            <div className="glass-dark neon-border-cyan rounded-lg p-2">
              <p className="text-xs font-bold text-neon-cyan mb-1">OYUNCU</p>
              <BattleDinoHUD
                dinoName={playerDino.name}
                currentHp={battleState.player.currentHp}
                maxHp={battleState.player.dino.maxHp}
                effects={battleState.player.effects}
                isPlayer={true}
              />
            </div>
          </div>
        </div>

        {/* PLAYER STATS */}
        <div className="flex-shrink-0">
          <BattleStatsCard dino={battleState.player.dino} effects={battleState.player.effects} isPlayer={true} />
        </div>

        {/* OPPONENT */}
        <div className="flex-shrink-0">
          <div className="hs-battle-frame hs-battle-frame-opponent">
            <div className="glass-dark neon-border-purple rounded-lg p-2">
              <p className="text-xs font-bold text-neon-purple mb-1">RAKİP</p>
              <BattleDinoHUD
                dinoName={opponentDino.name}
                currentHp={battleState.opponent.currentHp}
                maxHp={battleState.opponent.dino.maxHp}
                effects={battleState.opponent.effects}
                isPlayer={false}
              />
            </div>
          </div>
        </div>

        {/* OPPONENT STATS */}
        <div className="flex-shrink-0">
          <BattleStatsCard dino={battleState.opponent.dino} effects={battleState.opponent.effects} isPlayer={false} />
        </div>

        {/* BATTLE LOG */}
        <div className="flex-shrink-0 h-24">
          <EnhancedBattleLog entries={battleState.battleLog} maxEntries={4} />
        </div>
      </div>

      {/* BOTTOM CONTROL PANEL */}
      <div className="flex-shrink-0 flex flex-col lg:flex-row gap-3 p-3 bg-gradient-to-t from-slate-900/90 to-transparent border-t border-neon-cyan/10">

        {/* ABILITY SELECTION */}
        <div className="w-full lg:w-2/5">
          <div className="space-y-2">
            <p className="text-xs font-bold text-neon-cyan uppercase tracking-widest">⚔️ Yetenek Seç (1/Tur)</p>
            <div className="grid grid-cols-3 gap-1.5">
              {battleState.player.abilities.map((ability, idx) => {
                const canUse = engine.canUseAbility('player', idx)
                const isSelected = playerSelectedAbility === idx
                const cooldown = battleState.player.cooldowns[idx] || 0

                return (
                  <PremiumAbilityButton
                    key={idx}
                    ability={ability}
                    index={idx}
                    atk={playerDino.atk}
                    isUltimate={idx === 5}
                    isSelected={isSelected}
                    isLocked={false}
                    canUse={canUse}
                    cooldown={cooldown}
                    maxCooldown={ability.maxCd || 0}
                    disabled={playerSelectedAbility !== null || !canUse || roundInProgress}
                    onClick={() => selectAbility(idx)}
                  />
                )
              })}
            </div>
            <div className="glass-dark border border-neon-cyan/30 rounded-lg p-2 text-center text-xs h-8 flex items-center justify-center font-bold text-neon-cyan">
              {playerSelectedAbility !== null && opponentSelectedAbility === null
                ? 'Rakip beklemede...'
                : playerSelectedAbility === null && opponentSelectedAbility === null
                ? 'Yetenek seç'
                : 'Savaş başlamak üzere...'}
            </div>
          </div>
        </div>

        {/* BATTLE LOG (Desktop only) */}
        <div className="hidden lg:block lg:w-3/5 lg:h-32">
          <EnhancedBattleLog entries={battleState.battleLog} maxEntries={6} />
        </div>

        {/* DEBUG TOGGLE (Desktop only) */}
        <div className="hidden lg:flex lg:w-3/5 flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-neon-purple uppercase">
              {showDebug ? '🔧 DEBUG' : '📋 LOG'}
            </p>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="hs-btn hs-btn-xs"
            >
              {showDebug ? '📋' : '🔧'}
            </button>
          </div>
          {showDebug && (
            <div className="glass-dark border border-neon-purple/30 rounded-lg p-2 flex-1 overflow-y-auto max-h-24">
              <div className="space-y-1 text-xs">
                {debugLogs.slice(0, 8).map((log, idx) => (
                  <p key={idx} className="font-bold text-neon-cyan/80 break-words">
                    {log}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
