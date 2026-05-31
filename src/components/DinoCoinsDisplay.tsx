import { motion } from 'framer-motion'
import { STAT_ICONS } from '../lib/svgIcons'

interface DinoCoinsDisplayProps {
  coins: number
  showAmount?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function DinoCoinsDisplay({
  coins,
  showAmount = true,
  size = 'md',
}: DinoCoinsDisplayProps) {
  const coinIcon = STAT_ICONS.coin

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="flex items-center gap-2 bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-500 rounded-full px-4 py-2 shadow-lg border-2 border-yellow-600 cursor-pointer group relative"
    >
      {/* Shine effect */}
      <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity" />

      {/* Coin icon */}
      {coinIcon && (
        <motion.div
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className={`${sizeClasses[size]} flex-shrink-0`}
          dangerouslySetInnerHTML={{ __html: coinIcon.svg }}
        />
      )}

      {/* Coin amount */}
      {showAmount && (
        <motion.span
          key={coins}
          initial={{ scale: 1.2, y: -5 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`${textSizes[size]} font-black text-yellow-900 drop-shadow-md`}
        >
          {coins.toLocaleString()}
        </motion.span>
      )}

      {/* Glow effect behind */}
      <div className="absolute inset-0 rounded-full bg-yellow-400 opacity-20 blur-md -z-10 group-hover:opacity-40 transition-opacity" />
    </motion.div>
  )
}
