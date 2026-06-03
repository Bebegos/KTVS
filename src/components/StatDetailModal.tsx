import { StatKey, STAT_DEFINITIONS, getDinoMaxHp } from '../lib/stat-system'
import { Dino } from '../game/types'
import StatIcon from './StatIcon'
import PremiumModal from './PremiumModal'
import PremiumButton from './PremiumButton'
import { uiAssets } from '../lib/gameAssets'

interface StatDetailModalProps {
  stat: StatKey
  dino: Dino
  isOpen: boolean
  onClose: () => void
}

// Parchment-readable accent per stat (matches the Dino Detail stat cards).
const accent: Record<StatKey, string> = {
  sta: '#b91c1c',
  atk: '#c2410c',
  def: '#1d4ed8',
  spd: '#a16207',
}

export default function StatDetailModal({ stat, dino, isOpen, onClose }: StatDetailModalProps) {
  if (!isOpen) return null

  const def = STAT_DEFINITIONS[stat]
  const color = accent[stat]
  const currentValue = dino[stat] || 0
  const bonusValue = dino.pendingRewards?.unspentStatPoints || 0

  let displayInfo: { label: string; value: string; source?: string }[] = []

  if (stat === 'sta') {
    const currentHp = getDinoMaxHp(dino)
    displayInfo = [
      {
        label: 'Dayanıklılık Değeri',
        value: String(currentValue),
      },
      {
        label: 'Maksimum HP',
        value: String(currentHp),
      },
    ]
  } else {
    displayInfo = [
      {
        label: 'Mevcut Değer',
        value: String(currentValue),
      },
    ]
  }

  return (
    <PremiumModal onClose={onClose} zIndex={250}>
      <div className="p-4 sm:p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <span
            className="flex items-center justify-center w-14 h-14 rounded-full flex-shrink-0"
            style={{ background: `${color}1a`, border: `1.5px solid ${color}55` }}
          >
            <StatIcon stat={stat as any} size="lg" />
          </span>
          <div>
            <h1 className="text-2xl font-black text-amber-950 leading-tight">{def.labelTr}</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-800/80">
              İstatistik Detayı
            </p>
          </div>
        </div>

        {/* Gold hairline separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-amber-700/55 to-transparent" />

        {/* Description */}
        <div className="bg-amber-900/10 border border-amber-900/25 rounded-lg p-3">
          <p className="text-sm font-semibold text-amber-950/90 leading-relaxed">{def.descriptionTr}</p>
        </div>

        {/* Details */}
        <div className="space-y-3">
          {displayInfo.map((info, idx) => (
            <div key={idx} className="bg-amber-900/8 border border-amber-900/25 rounded-lg p-3">
              <p className="text-[11px] font-black uppercase tracking-wide text-amber-800/80 mb-1">
                {info.label}
              </p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-black leading-none" style={{ color }}>
                  {info.value}
                </p>
                {info.source && <p className="text-[11px] text-amber-800/70 pb-1">({info.source})</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Pending bonus */}
        {bonusValue > 0 && (
          <div className="flex items-center gap-3 bg-amber-900/10 border border-amber-900/30 rounded-lg p-3">
            <img src={uiAssets.statPoints} alt="" className="w-9 h-9 object-contain flex-shrink-0" draggable={false} />
            <div>
              <p className="text-[11px] font-black uppercase tracking-wide text-amber-800/80">
                Harcamaya Hazır Bonus
              </p>
              <p className="text-xl font-black text-amber-950">+{bonusValue} puan</p>
            </div>
          </div>
        )}

        {/* Close */}
        <PremiumButton onClick={onClose} className="w-full" contentClassName="text-sm">
          Kapat
        </PremiumButton>
      </div>
    </PremiumModal>
  )
}
