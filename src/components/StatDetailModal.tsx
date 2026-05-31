import { motion } from 'framer-motion'
import { StatKey, STAT_DEFINITIONS, calculateMaxHp } from '../lib/stat-system'
import { Dino } from '../game/types'
import SvgIcon from './SvgIcon'

interface StatDetailModalProps {
  stat: StatKey
  dino: Dino
  isOpen: boolean
  onClose: () => void
}

export default function StatDetailModal({ stat, dino, isOpen, onClose }: StatDetailModalProps) {
  if (!isOpen) return null

  const def = STAT_DEFINITIONS[stat]
  const currentValue = dino[stat] || 0
  const bonusValue = dino.pendingRewards?.unspentStatPoints || 0

  // Calculate different values based on stat type
  let displayInfo: { label: string; value: string; source: string }[] = []

  if (stat === 'sta') {
    const multiplier = dino.staminaToHpMultiplier || 1.5
    const currentHp = calculateMaxHp(currentValue || 0, multiplier)
    displayInfo = [
      {
        label: 'Dayanıklılık Değeri',
        value: String(currentValue),
        source: `Class (${dino.class}) + Spec (${dino.spec})`,
      },
      {
        label: 'Maksimum HP',
        value: String(currentHp),
        source: `${currentValue} × ${multiplier} (sınıftan gelen bonus)`,
      },
    ]
  } else {
    displayInfo = [
      {
        label: 'Mevcut Değer',
        value: String(currentValue),
        source: 'Temel + Sınıf + Özelleştirme Bonusu',
      },
    ]
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[250] p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className={`rounded-2xl max-w-md w-full border-2 ${def.borderColor} bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-lg p-6 space-y-4`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="text-3xl">{def.emoji}</div>
            <div>
              <h1 className={`text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r ${def.gradient}`}>
                {def.labelTr}
              </h1>
              <p className="text-xs text-slate-400 mt-1">{def.labelTr.toUpperCase()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hs-btn hs-btn-sm"
          >
            ✕
          </button>
        </div>

        {/* Description */}
        <div className={`p-4 bg-gradient-to-r ${def.gradientBg} border ${def.borderColor} rounded-xl`}>
          <p className="text-sm text-slate-200">{def.descriptionTr}</p>
        </div>

        {/* Details */}
        <div className="space-y-3">
          {displayInfo.map((info, idx) => (
            <div
              key={idx}
              className={`p-3 bg-gradient-to-r ${def.gradientBg} border ${def.borderColor} rounded-lg`}
            >
              <p className="text-xs font-bold text-slate-300 mb-1">{info.label}</p>
              <div className="flex items-end gap-2">
                <p className={`text-3xl font-black ${def.textColor}`}>{info.value}</p>
                <p className="text-xs text-slate-400 pb-1">({info.source})</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bonus Info */}
        {bonusValue > 0 && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/40 rounded-xl">
            <p className="text-xs font-bold text-yellow-300 mb-2">⚡ Harcamaya Hazır Bonus</p>
            <p className="text-2xl font-black text-yellow-200">+{bonusValue} puan</p>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="hs-btn hs-btn-block"
        >
          Kapat
        </button>
      </motion.div>
    </motion.div>
  )
}
