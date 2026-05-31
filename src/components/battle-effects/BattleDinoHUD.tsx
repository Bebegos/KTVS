import { motion } from 'framer-motion'
import { ActiveEffect } from '../../game/types'
import StatusEffectVisualizer from './StatusEffectVisualizer'

interface BattleDinoHUDProps {
  dinoName: string
  currentHp: number
  maxHp: number
  effects: ActiveEffect[]
  isPlayer?: boolean
}

export default function BattleDinoHUD({
  dinoName,
  currentHp,
  maxHp,
  effects,
  isPlayer = false,
}: BattleDinoHUDProps) {
  const hpPercent = (currentHp / maxHp) * 100
  const isDanger = hpPercent < 30
  const isWounded = hpPercent < 60

  return (
    <motion.div
      initial={{ opacity: 0, y: isPlayer ? 20 : -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      {/* Name and HP */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-black ${isPlayer ? 'text-neon-cyan' : 'text-neon-purple'}`}>
            {dinoName}
          </h3>
          <span className="text-xs font-bold text-neon-cyan/70">
            {currentHp}/{maxHp}
          </span>
        </div>

        {/* HP Bar with gradient */}
        <div className="relative h-6 bg-slate-800/60 border border-slate-600/40 rounded-lg overflow-hidden">
          {/* Damage flash */}
          <motion.div
            className="absolute inset-0 bg-red-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.6 }}
          />

          {/* HP Fill */}
          <motion.div
            initial={{ width: `${hpPercent}%` }}
            animate={{ width: `${hpPercent}%` }}
            transition={{ duration: 0.4, type: 'spring', bounce: 0.2 }}
            className={`h-full transition-all ${
              isDanger
                ? 'bg-gradient-to-r from-red-600 to-red-400 shadow-lg shadow-red-500/50'
                : isWounded
                ? 'bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-lg shadow-yellow-500/30'
                : 'bg-gradient-to-r from-green-600 to-green-400 shadow-lg shadow-green-500/30'
            }`}
          >
            {/* HP shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse" />
          </motion.div>

          {/* Border glow effect */}
          <div
            className={`absolute inset-0 rounded-lg border border-transparent pointer-events-none ${
              isDanger
                ? 'shadow-inset shadow-red-500/20'
                : isWounded
                ? 'shadow-inset shadow-yellow-500/10'
                : 'shadow-inset shadow-green-500/10'
            }`}
          />
        </div>
      </div>

      {/* Status Effects */}
      {effects && effects.length > 0 && <StatusEffectVisualizer effects={effects} maxHp={maxHp} />}
    </motion.div>
  )
}
