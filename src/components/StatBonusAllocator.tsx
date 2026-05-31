import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino } from '../game/types'
import { STAT_DEFINITIONS, StatKey, getStatOrder } from '../lib/stat-system'
import { discoveryService } from '../lib/services'
import { updateDino } from '../lib/supabase'
import StatIcon from './StatIcon'

interface StatBonusAllocatorProps {
  dino: Dino
  bonusPoints: number
  onComplete: (updatedDino: Dino) => void
  onCancel: () => void
}

export default function StatBonusAllocator({
  dino,
  bonusPoints,
  onComplete,
  onCancel,
}: StatBonusAllocatorProps) {
  const [allocation, setAllocation] = useState<Record<StatKey, number>>({
    sta: 0,
    atk: 0,
    def: 0,
    spd: 0,
  })
  const [saving, setSaving] = useState(false)
  const [infoStat, setInfoStat] = useState<StatKey | null>(null)

  const allocated = Object.values(allocation).reduce((a, b) => a + b, 0)
  const remaining = bonusPoints - allocated

  function handleAllocationChange(stat: StatKey, value: number) {
    const newValue = Math.max(0, Math.min(bonusPoints, value))
    setAllocation(prev => ({
      ...prev,
      [stat]: newValue,
    }))
  }

  function handleIncrement(stat: StatKey) {
    if (remaining > 0) {
      handleAllocationChange(stat, allocation[stat] + 1)
    }
  }

  function handleDecrement(stat: StatKey) {
    if (allocation[stat] > 0) {
      handleAllocationChange(stat, allocation[stat] - 1)
    }
  }

  async function handleConfirm() {
    if (allocated !== bonusPoints) return

    setSaving(true)
    try {
      const updatedDino = { ...dino }

      // Apply stat bonuses
      if (allocation.sta > 0) updatedDino.sta = (updatedDino.sta || 0) + allocation.sta
      if (allocation.atk > 0) updatedDino.atk += allocation.atk
      if (allocation.def > 0) updatedDino.def += allocation.def
      if (allocation.spd > 0) updatedDino.spd += allocation.spd

      // Spend the stat points but PRESERVE pending ability discoveries.
      const remainingPending = updatedDino.pendingRewards
        ? {
            ...updatedDino.pendingRewards,
            unspentStatPoints: Math.max(0, updatedDino.pendingRewards.unspentStatPoints - bonusPoints),
          }
        : undefined
      updatedDino.pendingRewards = remainingPending

      // Save to database
      const dbUpdates: any = {
        sta: updatedDino.sta,
        atk: updatedDino.atk,
        def: updatedDino.def,
        spd: updatedDino.spd,
        pending_rewards: discoveryService.serialize(remainingPending),
      }

      await updateDino(dino.id, dbUpdates)
      onComplete(updatedDino)
    } catch (err) {
      console.error('Bonus kaydetme hatası:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-neon-yellow/30 p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-yellow to-gold-light">
          SEVİYE ATLADI!
        </p>
        <p className="text-sm text-neon-yellow/70">
          {bonusPoints} stat puanını dağıt
        </p>
      </div>

      {/* Stat Allocators */}
      <div className="space-y-4">
        {getStatOrder().map(statKey => {
          const def = STAT_DEFINITIONS[statKey]
          const allocated = allocation[statKey]
          const current = dino[statKey] || 0

          return (
            <motion.div
              key={statKey}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 rounded-xl border-2 ${def.borderColor} bg-gradient-to-r ${def.gradientBg} space-y-3`}
            >
              {/* Stat Label */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatIcon stat={statKey as any} size="lg" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-black text-sm text-slate-100">{def.labelTr}</p>
                      <button
                        type="button"
                        onClick={() => setInfoStat(infoStat === statKey ? null : statKey)}
                        className={`w-5 h-5 rounded-full border text-[11px] font-black leading-none flex items-center justify-center transition ${
                          infoStat === statKey
                            ? 'bg-gold-light text-slate-900 border-gold-light'
                            : 'border-slate-400/50 text-slate-300 hover:border-gold-light hover:text-gold-light'
                        }`}
                        title="Bu stat ne işe yarar?"
                        aria-label={`${def.labelTr} bilgisi`}
                      >
                        ?
                      </button>
                    </div>
                    <p className={`text-xs ${def.textColor}`}>{current} → {current + allocated}</p>
                  </div>
                </div>
                <p className="text-3xl font-black text-white bg-gradient-to-r from-slate-700 to-slate-800 px-3 py-2 rounded-lg">
                  +{allocated}
                </p>
              </div>

              {/* Stat info panel (toggle via ? button) */}
              <AnimatePresence>
                {infoStat === statKey && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="text-xs text-slate-200/90 bg-black/30 border border-slate-500/30 rounded-lg p-3 leading-relaxed">
                      {def.descriptionTr}
                      {statKey === 'sta' && (
                        <span className="block mt-1 text-red-300/90 font-bold">
                          1 Dayanıklılık ≈ {Math.round((dino.staminaToHpMultiplier || 1) * 10)} HP
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Slider & Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDecrement(statKey)}
                  disabled={allocated === 0}
                  className="hs-btn hs-btn-red hs-btn-xs"
                >
                  −
                </button>

                <input
                  type="range"
                  min="0"
                  max={bonusPoints}
                  value={allocated}
                  onChange={e => handleAllocationChange(statKey, parseInt(e.target.value))}
                  className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--gradient-start) 0%, var(--gradient-start) ${
                      (allocated / bonusPoints) * 100
                    }%, rgba(100, 116, 139, 0.5) ${(allocated / bonusPoints) * 100}%, rgba(100, 116, 139, 0.5) 100%)`,
                  }}
                />

                <button
                  onClick={() => handleIncrement(statKey)}
                  disabled={remaining === 0}
                  className="hs-btn hs-btn-green hs-btn-xs"
                >
                  +
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Remaining Points */}
      <div
        className={`p-4 rounded-xl text-center transition ${
          remaining === 0
            ? 'bg-green-500/20 border border-green-500/40'
            : 'bg-red-500/20 border border-red-500/40'
        }`}
      >
        <p className={`font-black text-2xl ${remaining === 0 ? 'text-green-300' : 'text-red-300'}`}>
          {remaining === 0 ? 'Tamamlandı!' : `${remaining} puan kaldı`}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="hs-btn flex-1"
        >
          İptal
        </button>
        <button
          onClick={handleConfirm}
          disabled={allocated !== bonusPoints || saving}
          className="hs-btn hs-btn-green flex-1"
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </div>
  )
}
