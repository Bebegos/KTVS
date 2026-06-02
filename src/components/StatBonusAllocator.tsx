import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino } from '../game/types'
import { STAT_DEFINITIONS, StatKey, getStatOrder } from '../lib/stat-system'
import { discoveryService } from '../lib/services'
import { updateDino } from '../lib/supabase'
import StatIcon from './StatIcon'
import PremiumCard from './PremiumCard'
import PremiumButton from './PremiumButton'
import { uiAssets } from '../lib/gameAssets'

interface StatBonusAllocatorProps {
  dino: Dino
  bonusPoints: number
  onComplete: (updatedDino: Dino) => void
  onCancel: () => void
}

// Parchment-readable accent per stat (matches the Dino Detail stat cards).
const accent: Record<StatKey, string> = {
  sta: '#b91c1c',
  atk: '#c2410c',
  def: '#1d4ed8',
  spd: '#a16207',
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

      if (allocation.sta > 0) updatedDino.sta = (updatedDino.sta || 0) + allocation.sta
      if (allocation.atk > 0) updatedDino.atk += allocation.atk
      if (allocation.def > 0) updatedDino.def += allocation.def
      if (allocation.spd > 0) updatedDino.spd += allocation.spd

      const remainingPending = updatedDino.pendingRewards
        ? {
            ...updatedDino.pendingRewards,
            unspentStatPoints: Math.max(0, updatedDino.pendingRewards.unspentStatPoints - bonusPoints),
          }
        : undefined
      updatedDino.pendingRewards = remainingPending

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

  const stepBtn =
    'w-9 h-9 rounded-full bg-amber-900/15 border border-amber-900/40 text-amber-950 font-black text-xl leading-none flex items-center justify-center transition hover:bg-amber-900/25 disabled:opacity-35 disabled:cursor-not-allowed'

  return (
    <PremiumCard variant="frame">
      <div className="p-4 sm:p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-center gap-3">
          <img src={uiAssets.levelUp} alt="" className="w-10 h-10 object-contain animate-pulse" draggable={false} />
          <div className="text-center">
            <p className="text-2xl font-black text-amber-950 leading-tight">SEVİYE ATLADI!</p>
            <p className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-800">
              <img src={uiAssets.statPoints} alt="" className="w-4 h-4 object-contain" draggable={false} />
              {bonusPoints} stat puanını dağıt
            </p>
          </div>
        </div>

        {/* Stat Allocators */}
        <div className="space-y-3">
          {getStatOrder().map(statKey => {
            const def = STAT_DEFINITIONS[statKey]
            const color = accent[statKey]
            const alloc = allocation[statKey]
            const current = dino[statKey] || 0
            const pct = (alloc / bonusPoints) * 100

            return (
              <motion.div
                key={statKey}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-amber-900/8 border border-amber-900/25 rounded-lg p-3 space-y-3"
              >
                {/* Stat Label */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex items-center justify-center w-11 h-11 rounded-full flex-shrink-0"
                      style={{ background: `${color}1a`, border: `1.5px solid ${color}55` }}
                    >
                      <StatIcon stat={statKey as any} size="md" />
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-black text-sm text-amber-950">{def.labelTr}</p>
                        <button
                          type="button"
                          onClick={() => setInfoStat(infoStat === statKey ? null : statKey)}
                          className={`w-5 h-5 rounded-full border text-[11px] font-black leading-none flex items-center justify-center transition ${
                            infoStat === statKey
                              ? 'bg-amber-900 text-amber-50 border-amber-900'
                              : 'border-amber-900/40 text-amber-800 hover:border-amber-900 hover:text-amber-950'
                          }`}
                          title="Bu stat ne işe yarar?"
                          aria-label={`${def.labelTr} bilgisi`}
                        >
                          ?
                        </button>
                      </div>
                      <p className="text-xs font-bold" style={{ color }}>
                        {current} → {current + alloc}
                      </p>
                    </div>
                  </div>
                  <p
                    className="text-2xl font-black px-3 py-1 rounded-lg"
                    style={{ color, background: `${color}14`, border: `1px solid ${color}33` }}
                  >
                    +{alloc}
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
                      <div className="text-xs font-semibold text-amber-950/90 bg-amber-900/10 border border-amber-900/25 rounded-lg p-3 leading-relaxed">
                        {def.descriptionTr}
                        {statKey === 'sta' && (
                          <span className="block mt-1 font-black" style={{ color: accent.sta }}>
                            1 Dayanıklılık ≈ {(dino.staminaToHpMultiplier || 1.5).toFixed(1)} HP
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Slider & Buttons */}
                <div className="flex items-center gap-2.5">
                  <button onClick={() => handleDecrement(statKey)} disabled={alloc === 0} className={stepBtn}>
                    −
                  </button>

                  <input
                    type="range"
                    min="0"
                    max={bonusPoints}
                    value={alloc}
                    onChange={e => handleAllocationChange(statKey, parseInt(e.target.value))}
                    className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, rgba(120,80,30,0.25) ${pct}%, rgba(120,80,30,0.25) 100%)`,
                    }}
                  />

                  <button onClick={() => handleIncrement(statKey)} disabled={remaining === 0} className={stepBtn}>
                    +
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Remaining Points */}
        <div
          className="rounded-lg text-center py-2.5 border"
          style={
            remaining === 0
              ? { background: '#15803d18', borderColor: '#15803d55' }
              : { background: '#b91c1c14', borderColor: '#b91c1c44' }
          }
        >
          <p className="font-black text-xl" style={{ color: remaining === 0 ? '#15803d' : '#b91c1c' }}>
            {remaining === 0 ? 'Tamamlandı!' : `${remaining} puan kaldı`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <PremiumButton onClick={onCancel} className="w-40" contentClassName="text-sm">
            İptal
          </PremiumButton>
          <PremiumButton
            onClick={handleConfirm}
            disabled={allocated !== bonusPoints || saving}
            className="w-40"
            contentClassName="text-sm"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </PremiumButton>
        </div>
      </div>
    </PremiumCard>
  )
}
