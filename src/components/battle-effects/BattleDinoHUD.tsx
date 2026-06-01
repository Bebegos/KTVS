import { motion } from 'framer-motion'
import { ActiveEffect } from '../../game/types'
import StatusEffectVisualizer from './StatusEffectVisualizer'
import { hpBarAssets } from '../../lib/gameAssets'

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
  const hpPercent = Math.max(0, (currentHp / maxHp) * 100)
  const isDanger = hpPercent < 30
  const isWounded = hpPercent < 60

  const fillImage = isDanger
    ? hpBarAssets.danger
    : isWounded
    ? hpBarAssets.wounded
    : hpBarAssets.healthy

  return (
    <motion.div
      initial={{ opacity: 0, y: isPlayer ? 20 : -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2 lg:space-y-2"
    >
      {/* Name and HP - Enhanced for mobile */}
      <div className="space-y-2 lg:space-y-1">
        <div className="flex items-center justify-between">
          <h3
            className={`text-sm lg:text-sm font-black ${
              isPlayer ? 'text-neon-cyan' : 'text-neon-purple'
            }`}
          >
            {dinoName}
          </h3>
          <motion.span
            key={`${currentHp}`}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={`text-xs lg:text-xs font-bold ${
              isDanger
                ? 'text-red-300'
                : isWounded
                ? 'text-yellow-300'
                : 'text-green-300'
            }`}
          >
            {currentHp}/{maxHp} ({Math.round(hpPercent)}%)
          </motion.span>
        </div>

        {/* HP Bar - premium framed art with PNG fill */}
        <div
          className="relative lg:h-7 h-9 rounded-lg overflow-hidden"
          style={{
            backgroundImage: `url('${hpBarAssets.background}')`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Inset fill track — keeps the colored fill inside the frame bevel */}
          <div className="absolute inset-y-[18%] left-[3%] right-[3%] rounded-md overflow-hidden">
            {/* Damage flash */}
            <motion.div
              className="absolute inset-0 bg-red-500/40 z-20 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.6 }}
            />

            {/* HP Fill (PNG art, width animated to current HP) */}
            <motion.div
              initial={{ width: `${hpPercent}%` }}
              animate={{ width: `${hpPercent}%` }}
              transition={{ duration: 0.4, type: 'spring', bounce: 0.2 }}
              className="h-full"
              style={{
                backgroundImage: `url('${fillImage}')`,
                backgroundSize: 'auto 100%',
                backgroundRepeat: 'repeat-x',
              }}
            >
              {/* Moving shimmer highlight */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </motion.div>
          </div>

          {/* Center HP percentage on mobile */}
          {hpPercent < 99 && (
            <div
              className="absolute inset-0 flex items-center justify-center font-black text-xs lg:hidden z-30 pointer-events-none"
              style={{
                color: isDanger ? '#fca5a5' : isWounded ? '#fef08a' : '#86efac',
                textShadow: '0 2px 4px rgba(0,0,0,0.9)',
              }}
            >
              {Math.round(hpPercent)}%
            </div>
          )}
        </div>
      </div>

      {/* Status Effects */}
      {effects && effects.length > 0 && <StatusEffectVisualizer effects={effects} maxHp={maxHp} />}
    </motion.div>
  )
}
