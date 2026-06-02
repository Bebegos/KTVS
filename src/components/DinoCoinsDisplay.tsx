import { motion } from 'framer-motion'
import { homeAssets } from '../lib/gameAssets'

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
      className="hs-wood-frame flex items-center gap-2 rounded-full pl-1.5 pr-4 py-1 cursor-pointer group relative"
    >
      {/* Coin icon */}
      <motion.img
        src={homeAssets.dinoCoin}
        alt="DinoCoin"
        animate={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className={`${sizeClasses[size]} flex-shrink-0 object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]`}
        draggable={false}
      />

      {/* Coin amount */}
      {showAmount && (
        <motion.span
          key={coins}
          initial={{ scale: 1.2, y: -5 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`${textSizes[size]} font-black text-gold-light`}
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
        >
          {coins.toLocaleString()}
        </motion.span>
      )}
    </motion.div>
  )
}
