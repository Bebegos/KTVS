import { motion } from 'framer-motion'
import { homeAssets, menuButtonAssets } from '../lib/gameAssets'

interface DinoCoinsDisplayProps {
  coins: number
  showAmount?: boolean
  size?: 'sm' | 'md' | 'lg'
}

/**
 * DinoCoin display rendered on the premium menu-button plate, with the coin
 * overlapping the left edge (Hearthstone-style currency card).
 */
export default function DinoCoinsDisplay({
  coins,
  showAmount = true,
  size = 'md',
}: DinoCoinsDisplayProps) {
  const heightCls = { sm: 'h-9', md: 'h-12', lg: 'h-16' }[size]
  const textCls = { sm: 'text-xs', md: 'text-base', lg: 'text-xl' }[size]

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`relative inline-flex items-center ${heightCls} cursor-pointer`}
      style={{ aspectRatio: '819 / 249' }}
    >
      {/* Premium plate background */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: `url('${menuButtonAssets.base}')`, backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}
      />

      {/* Coin, overlapping the left edge */}
      <motion.img
        src={homeAssets.dinoCoin}
        alt="DinoCoin"
        animate={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute -left-[10%] top-1/2 -translate-y-1/2 h-[125%] aspect-square object-contain drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)]"
        draggable={false}
      />

      {/* Amount on the parchment center */}
      {showAmount && (
        <motion.span
          key={coins}
          initial={{ scale: 1.2, y: -4 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`absolute left-[32%] right-[13%] top-1/2 -translate-y-1/2 text-center font-black text-amber-950 ${textCls}`}
          style={{ textShadow: '0 1px 1px rgba(255,255,255,0.45)' }}
        >
          {coins.toLocaleString()}
        </motion.span>
      )}
    </motion.div>
  )
}
