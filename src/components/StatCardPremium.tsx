import { useState } from 'react'
import { motion } from 'framer-motion'
import { StatKey, STAT_DEFINITIONS, calculateMaxHp } from '../lib/stat-system'
import { Dino } from '../game/types'
import StatIcon from './StatIcon'
import StatDetailModal from './StatDetailModal'
import PremiumCard from './PremiumCard'

interface StatCardPremiumProps {
  stat: StatKey
  dino: Dino
  value: number
}

// Strong, parchment-readable accent colors per stat.
const accent: Record<StatKey, string> = {
  sta: '#b91c1c', // red
  atk: '#c2410c', // orange
  def: '#1d4ed8', // blue
  spd: '#a16207', // amber-yellow
}

/**
 * A single stat rendered as its own premium Hearthstone parchment card,
 * tappable to open the stat detail modal.
 */
export default function StatCardPremium({ stat, dino, value }: StatCardPremiumProps) {
  const [detailOpen, setDetailOpen] = useState(false)
  const def = STAT_DEFINITIONS[stat]
  const color = accent[stat]

  const isStamina = stat === 'sta'
  const derivedHp = isStamina
    ? dino.staminaToHpMultiplier
      ? calculateMaxHp(value, dino.staminaToHpMultiplier)
      : dino.maxHp
    : null

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setDetailOpen(true)}
        className="w-full text-left"
      >
        <PremiumCard variant="panel">
          <div className="flex items-center gap-3 px-6 py-2.5">
            <span
              className="flex items-center justify-center w-14 h-14 rounded-full flex-shrink-0"
              style={{ background: `${color}1a`, border: `1.5px solid ${color}55` }}
            >
              <StatIcon stat={stat} size="lg" />
            </span>

            <span className="font-black text-amber-950 text-base flex-1">{def.labelTr}</span>

            <div className="text-right leading-none">
              <span className="font-black text-xl" style={{ color }}>
                {value}
              </span>
              {isStamina && derivedHp != null && (
                <span className="block text-[11px] font-bold text-red-700/80 mt-0.5">
                  ❤ {derivedHp} HP
                </span>
              )}
            </div>
          </div>
        </PremiumCard>
      </motion.button>

      <StatDetailModal stat={stat} dino={dino} isOpen={detailOpen} onClose={() => setDetailOpen(false)} />
    </>
  )
}
