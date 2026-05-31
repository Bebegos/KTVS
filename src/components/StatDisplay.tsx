import { useState } from 'react'
import { motion } from 'framer-motion'
import { StatKey, STAT_DEFINITIONS, calculateMaxHp } from '../lib/stat-system'
import { Dino } from '../game/types'
import StatDetailModal from './StatDetailModal'
import StatIcon from './StatIcon'

interface StatDisplayProps {
  stat: StatKey
  dino: Dino
  value: number
  size?: 'sm' | 'md' | 'lg' // sm for cards, md for detail page, lg for full page
  showBonus?: boolean
  bonus?: number
  showDetailButton?: boolean
}

export default function StatDisplay({
  stat,
  dino,
  value,
  size = 'md',
  showBonus = false,
  bonus = 0,
  showDetailButton = true,
}: StatDisplayProps) {
  const [detailOpen, setDetailOpen] = useState(false)
  const def = STAT_DEFINITIONS[stat]

  // Stamina shows its own value as the primary number; the derived max HP is
  // shown as a secondary line (previously the HP value replaced stamina, which
  // made stamina look like maxHp).
  const isStamina = stat === 'sta'
  const derivedHp = isStamina && dino.staminaToHpMultiplier
    ? calculateMaxHp(value, dino.staminaToHpMultiplier)
    : isStamina
      ? dino.maxHp
      : null
  const displayValue = value

  const sizeClasses = {
    sm: 'p-2 text-xs',
    md: 'p-3 text-sm',
    lg: 'p-4 text-base',
  }

  const iconSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  }

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`${sizeClasses[size]} rounded-lg border-2 ${def.borderColor} bg-gradient-to-r ${def.gradientBg} transition cursor-pointer group`}
        onClick={() => showDetailButton && setDetailOpen(true)}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <StatIcon stat={stat as any} size={size === 'sm' ? 'sm' : size === 'md' ? 'md' : 'lg'} />
            {(size === 'md' || size === 'lg') && (
              <div className="min-w-0">
                <p className={`font-black text-slate-100 ${size === 'lg' ? 'text-base' : 'text-sm'}`}>
                  {def.labelTr}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className={`font-black ${def.textColor} ${size === 'sm' ? 'text-sm' : 'text-lg'}`}>
                {displayValue}
              </p>
              {isStamina && derivedHp != null && (
                <p className="text-red-300/90 font-bold text-[10px] leading-none mt-0.5">❤ {derivedHp} HP</p>
              )}
              {showBonus && bonus > 0 && (
                <p className="text-yellow-300 font-bold text-xs">+{bonus}</p>
              )}
            </div>

            {showDetailButton && (size === 'md' || size === 'lg') && (
              <button
                onClick={e => {
                  e.stopPropagation()
                  setDetailOpen(true)
                }}
                className={`ml-1 opacity-0 group-hover:opacity-100 transition text-slate-400 hover:${def.textColor} text-lg text-sm font-bold`}
                title="Detayları göster"
              >
                ℹ
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <StatDetailModal
        stat={stat}
        dino={dino}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </>
  )
}
