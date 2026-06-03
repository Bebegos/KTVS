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
  const coinSize = { sm: 'w-9 h-9', md: 'w-12 h-12', lg: 'w-16 h-16' }[size]
  const pad = { sm: 'h-8 pl-8 pr-3', md: 'h-11 pl-11 pr-5', lg: 'h-14 pl-14 pr-6' }[size]
  const textSize = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' }[size]

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`relative inline-flex items-center rounded-full cursor-pointer ${pad}`}
      style={{
        background: 'linear-gradient(180deg, #3a2a16 0%, #241608 100%)',
        border: '2px solid #d4af37',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.5)',
      }}
    >
      {/* Coin icon, overlapping the left edge (Hearthstone-style) */}
      <motion.img
        src={homeAssets.dinoCoin}
        alt="DinoCoin"
        animate={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className={`absolute -left-1.5 top-1/2 -translate-y-1/2 ${coinSize} object-contain drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)]`}
        draggable={false}
      />

      {showAmount && (
        <motion.span
          key={coins}
          initial={{ scale: 1.2, y: -5 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`${textSize} font-black text-amber-200`}
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}
        >
          {coins.toLocaleString()}
        </motion.span>
      )}
    </motion.div>
  )
}
