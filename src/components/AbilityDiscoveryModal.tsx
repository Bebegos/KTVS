import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino, PendingDiscovery, PendingRewards, DiscoveryCategory } from '../game/types'
import { discoveryService, slotService } from '../lib/services'
import { abilityDefinitionService } from '../lib/services'
import { updateDino } from '../lib/supabase'
import AbilityIcon from './AbilityIcon'
import SvgIcon from './SvgIcon'
import { getEffectEmoji } from '../lib/effect-translations'
import TreasureChest from './TreasureChest'

interface AbilityDiscoveryModalProps {
  dino: Dino
  abilityCount?: number // legacy / ignored - derived from pending discoveries
  isOpen: boolean
  onClose: () => void
  onComplete: (updatedDino: Dino) => void
}

type Phase = 'loading' | 'chest' | 'choosing' | 'slots' | 'done' | 'empty'

const CATEGORY_META: Record<DiscoveryCategory, { label: string; color: string; sub: string }> = {
  class: { label: 'SINIF YETENEĞİ', color: 'from-amber-400 to-yellow-600', sub: 'Sınıfına özgü bir yetenek keşfet' },
  spec: { label: 'UZMANLIK YETENEĞİ', color: 'from-fuchsia-400 to-purple-600', sub: 'Uzmanlığına ait güçlü bir yetenek' },
  ultimate: { label: 'ULTIMATE YETENEK', color: 'from-orange-400 to-red-600', sub: 'Efsanevi bir ultimate güç' },
}

export default function AbilityDiscoveryModal({ dino, isOpen, onClose, onComplete }: AbilityDiscoveryModalProps) {
  const [phase, setPhase] = useState<Phase>('loading')
  const [workingDino, setWorkingDino] = useState<Dino>(dino)
  const [discoveries, setDiscoveries] = useState<PendingDiscovery[]>([])
  const [index, setIndex] = useState(0)
  const [chestOpen, setChestOpen] = useState(false)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [learnedCount, setLearnedCount] = useState(0)

  // On open: load discoveries, generate + persist options once.
  useEffect(() => {
    if (!isOpen) return
    let cancelled = false

    async function init() {
      const base = { ...dino }
      let list = discoveryService.getDiscoveries(base)
      // Drop discoveries that cannot produce options (e.g. spec missing)
      const { discoveries: withOptions } = discoveryService.ensureOptions(base, list)
      const valid = withOptions.filter(d => d.optionIds && d.optionIds.length > 0)

      if (valid.length === 0) {
        if (!cancelled) setPhase('empty')
        return
      }

      // Persist generated options + migrate away any legacy placeholders.
      const pending: PendingRewards = {
        unspentStatPoints: base.pendingRewards?.unspentStatPoints || 0,
        pendingAbilityIds: [],
        pendingDiscoveries: valid,
      }
      const updated: Dino = { ...base, pendingRewards: pending }

      try {
        await updateDino(base.id, { pending_rewards: discoveryService.serialize(pending) })
      } catch (err) {
        console.error('Discovery options persist error:', err)
      }

      if (cancelled) return
      setWorkingDino(updated)
      setDiscoveries(valid)
      setIndex(0)
      setSelectedOptionId(null)
      setChestOpen(false)
      setLearnedCount(0)
      setPhase('chest')
    }

    init()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, dino.id])

  if (!isOpen) return null

  const current = discoveries[index]
  const meta = current ? CATEGORY_META[current.category] : CATEGORY_META.class
  const options = current?.optionIds || []

  function openChest() {
    setChestOpen(true)
    setTimeout(() => setPhase('choosing'), 750)
  }

  async function learnIntoSlot(slot: number) {
    if (!current || !selectedOptionId || saving) return
    setSaving(true)
    try {
      const newAbilityIds = [...(workingDino.abilityIds || [])]
      while (newAbilityIds.length <= slot) newAbilityIds.push('')
      newAbilityIds[slot] = selectedOptionId

      const remaining = discoveries.filter((_, i) => i !== index)
      const pending: PendingRewards = {
        unspentStatPoints: workingDino.pendingRewards?.unspentStatPoints || 0,
        pendingAbilityIds: [],
        pendingDiscoveries: remaining,
      }
      const updated: Dino = { ...workingDino, abilityIds: newAbilityIds, pendingRewards: remaining.length || pending.unspentStatPoints ? pending : undefined }

      await updateDino(workingDino.id, {
        ability_ids: newAbilityIds,
        pending_rewards: discoveryService.serialize(pending),
      })

      setWorkingDino(updated)
      setLearnedCount(c => c + 1)
      setSelectedOptionId(null)
      setChestOpen(false)

      if (remaining.length > 0) {
        setDiscoveries(remaining)
        setIndex(0)
        setPhase('chest')
      } else {
        setPhase('done')
      }
    } catch (err) {
      console.error('Yetenek öğrenme hatası:', err)
    } finally {
      setSaving(false)
    }
  }

  function handleFinish() {
    onComplete(workingDino)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={phase === 'done' || phase === 'empty' ? handleFinish : undefined}
      className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-[260] p-4 overflow-y-auto"
    >
      <motion.div
        onClick={e => e.stopPropagation()}
        className="relative max-w-3xl w-full my-8"
      >
        {/* Close */}
        <div className="flex justify-between items-center mb-3">
          <div className="text-xs font-bold text-gold-light/80 uppercase tracking-widest">
            {discoveries.length > 0 && `Kalan keşif: ${discoveries.length}`}
          </div>
          <button onClick={phase === 'done' || phase === 'empty' ? handleFinish : onClose} className="hs-btn hs-btn-sm">
            <span>✕</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* LOADING */}
          {phase === 'loading' && (
            <motion.div key="loading" className="flex flex-col items-center justify-center py-24 gap-4">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="text-5xl">
                ⚙️
              </motion.div>
              <p className="text-gold-light/80 font-bold">Keşifler hazırlanıyor...</p>
            </motion.div>
          )}

          {/* EMPTY */}
          {phase === 'empty' && (
            <motion.div key="empty" className="text-center py-20 space-y-4">
              <p className="text-5xl">📭</p>
              <p className="text-xl font-black text-gold-light">Keşfedilecek yetenek yok</p>
              <button onClick={handleFinish} className="hs-btn hs-btn-block"><span>Kapat</span></button>
            </motion.div>
          )}

          {/* CHEST */}
          {phase === 'chest' && current && (
            <motion.div key={`chest-${current.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6 py-6">
              <div className="space-y-1">
                <p className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${meta.color}`}>{meta.label}</p>
                <p className="text-sm text-gold-light/70">{meta.sub}</p>
                <p className="text-xs text-gold-light/50">Seviye {current.level} ödülü</p>
              </div>

              <div className="flex justify-center">
                <TreasureChest open={chestOpen} category={current.category} onClick={!chestOpen ? openChest : undefined} />
              </div>

              {!chestOpen && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={openChest}
                  className="hs-btn hs-btn-lg hs-btn-premium"
                >
                  <span>✦ Sandığı Aç ✦</span>
                </motion.button>
              )}
            </motion.div>
          )}

          {/* CHOOSING - cards fly out */}
          {phase === 'choosing' && current && (
            <motion.div key={`choose-${current.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="text-center space-y-1">
                <p className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${meta.color}`}>Bir yetenek seç</p>
                <p className="text-xs text-gold-light/60">{meta.label}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {options.map((abilityId, i) => {
                  const ability = abilityDefinitionService.getAbility(abilityId)
                  if (!ability) return null
                  const isSelected = selectedOptionId === abilityId
                  return (
                    <motion.button
                      key={abilityId}
                      onClick={() => setSelectedOptionId(abilityId)}
                      initial={{ opacity: 0, y: -80, scale: 0.5, rotate: -8 + i * 8 }}
                      animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 16, delay: i * 0.18 }}
                      whileHover={{ y: -6, scale: 1.03 }}
                      className={`discovery-card relative text-left rounded-2xl p-4 border-2 transition ${
                        isSelected
                          ? 'border-gold-light shadow-[0_0_24px_rgba(245,225,164,0.6)] bg-gradient-to-br from-amber-500/25 to-amber-700/10'
                          : 'border-gold-dark/40 bg-gradient-to-br from-slate-800/80 to-slate-900/80 hover:border-gold-light/60'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gold-light text-slate-900 flex items-center justify-center text-sm font-black shadow-lg">✓</div>
                      )}
                      <div className="flex flex-col items-center text-center gap-2">
                        <div className="p-2 rounded-xl bg-black/30 border border-gold-dark/30">
                          <AbilityIcon iconId={ability.icon} size="lg" />
                        </div>
                        <p className="font-black text-gold-light text-sm leading-tight">{ability.name}</p>
                        <p className="text-[11px] text-slate-300/80 leading-snug min-h-[34px]">{ability.description}</p>
                        <div className="flex items-center gap-2 flex-wrap justify-center text-[11px] text-slate-200/80">
                          <span className="px-2 py-0.5 rounded bg-orange-500/20 border border-orange-500/30">⚔️ ×{ability.damageMultiplier || 1}</span>
                          {ability.cooldown > 0 && <span className="px-2 py-0.5 rounded bg-sky-500/20 border border-sky-500/30">❄️ {ability.cooldown}</span>}
                          {ability.effects && ability.effects.filter(e => e && e !== 'none').map((e, k) => (
                            <span key={k} className="px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30">
                              <SvgIcon id={e} type="effect" size="xs" fallback={getEffectEmoji(e)} />
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              <button
                onClick={() => setPhase('slots')}
                disabled={!selectedOptionId}
                className="hs-btn hs-btn-block hs-btn-green disabled:opacity-50"
              >
                <span>{selectedOptionId ? 'Öğren →' : 'Bir yetenek seç'}</span>
              </button>
            </motion.div>
          )}

          {/* SLOTS */}
          {phase === 'slots' && current && selectedOptionId && (
            <motion.div key={`slots-${current.id}`} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="text-center space-y-1">
                <p className="text-2xl font-black text-gold-light">Hangi slota öğrenilsin?</p>
                <p className="text-xs text-gold-light/60">
                  {current.category === 'ultimate'
                    ? 'Ultimate yalnızca ultimate slotuna öğrenilir'
                    : 'Sınıf ve uzmanlık yetenekleri 5 slottan birine öğrenilir'}
                </p>
              </div>

              <SlotPicker
                dino={workingDino}
                category={current.category}
                onPick={learnIntoSlot}
                saving={saving}
              />

              <button onClick={() => setPhase('choosing')} className="hs-btn hs-btn-block">
                <span>← Geri</span>
              </button>
            </motion.div>
          )}

          {/* DONE */}
          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 space-y-5">
              <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }} className="text-6xl">🎉</motion.p>
              <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600">
                {learnedCount} yetenek öğrenildi!
              </p>
              <button onClick={handleFinish} className="hs-btn hs-btn-lg hs-btn-block hs-btn-green">
                <span>Harika!</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

// ---- Slot Picker ----

function SlotPicker({
  dino,
  category,
  onPick,
  saving,
}: {
  dino: Dino
  category: DiscoveryCategory
  onPick: (slot: number) => void
  saving: boolean
}) {
  const validSlots = discoveryService.getValidSlots(category)

  return (
    <div className={`grid gap-3 ${category === 'ultimate' ? 'grid-cols-1 max-w-xs mx-auto' : 'grid-cols-1 sm:grid-cols-2'}`}>
      {validSlots.map(slot => {
        const requiredLevel = slotService.getSlotRequiredLevel(slot)
        const locked = dino.level < requiredLevel
        const currentAbilityId = dino.abilityIds?.[slot]
        const filled = !!currentAbilityId
        const currentAbility = filled ? abilityDefinitionService.getAbility(currentAbilityId!) : undefined

        const isUltimateSlot = slot === 5
        const label = isUltimateSlot ? 'ULTIMATE SLOT' : `SLOT ${slot + 1}`

        return (
          <div
            key={slot}
            className={`rounded-xl p-3 border-2 ${
              locked
                ? 'border-slate-600/40 bg-slate-800/40 opacity-60'
                : filled
                ? 'border-amber-500/40 bg-amber-500/5'
                : 'border-green-500/40 bg-green-500/5'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-black tracking-widest ${isUltimateSlot ? 'text-orange-300' : 'text-gold-light/70'}`}>{label}</span>
              {locked && <span className="text-[10px] font-bold text-slate-400">🔒 Seviye {requiredLevel}</span>}
            </div>

            <div className="flex items-center gap-2 min-h-[44px]">
              {filled && currentAbility ? (
                <>
                  <AbilityIcon iconId={currentAbility.icon} size="md" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-100 truncate">{currentAbility.name}</p>
                    <p className="text-[10px] text-slate-400">Mevcut yetenek</p>
                  </div>
                </>
              ) : locked ? (
                <p className="text-xs text-slate-400">Kilitli</p>
              ) : (
                <p className="text-xs text-green-300/80">Boş slot</p>
              )}
            </div>

            <button
              onClick={() => onPick(slot)}
              disabled={locked || saving}
              className={`hs-btn hs-btn-sm hs-btn-block mt-2 ${filled ? 'hs-btn-red' : 'hs-btn-green'} disabled:opacity-40`}
            >
              <span>{saving ? '...' : filled ? 'Yerine Öğren' : 'Öğren'}</span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
