import { motion } from 'framer-motion'
import { homeAssets } from '../lib/gameAssets'

interface DinoCoinsDisplayProps {
  coins: number
  showAmount?: boolean
  size?: 'sm' | 'md' | 'lg'
}

/**
 * DinoCoin display — a compact Hearthstone-style currency pill: parchment
 * capsule with the coin seated in a gold-rimmed socket on the left so it reads
 * clearly against the parchment.
 */
export default function DinoCoinsDisplay({
  coins,
  showAmount = true,
  size = 'md',
}: DinoCoinsDisplayProps) {
  const cfg = {
    sm: { h: 'h-8', pl: 'pl-8', socket: 'w-9 h-9', text: 'text-xs' },
    md: { h: 'h-10 sm:h-11', pl: 'pl-9 sm:pl-10', socket: 'w-11 h-11 sm:w-12 sm:h-12', text: 'text-base' },
    lg: { h: 'h-14', pl: 'pl-14', socket: 'w-16 h-16', text: 'text-xl' },
  }[size]

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`relative inline-flex items-center rounded-full ${cfg.h} ${cfg.pl} pr-4 cursor-pointer`}
      style={{
        background: 'linear-gradient(180deg, #efe1c2 0%, #d6c49e 100%)',
        border: '2px solid #b8860b',
        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.45), 0 2px 5px rgba(0,0,0,0.5)',
      }}
    >
      {/* Coin in a dark gold-rimmed socket so it pops on the parchment */}
      <span
        className={`absolute -left-1.5 top-1/2 -translate-y-1/2 ${cfg.socket} rounded-full flex items-center justify-center`}
        style={{
          background: 'radial-gradient(circle at 50% 38%, #5a4326 0%, #241608 100%)',
          border: '2px solid #d4af37',
          boxShadow: '0 2px 5px rgba(0,0,0,0.6)',
        }}
      >
        <motion.img
          src={homeAssets.dinoCoin}
          alt="DinoCoin"
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-[86%] h-[86%] object-contain drop-shadow"
          draggable={false}
        />
      </span>

      {showAmount && (
        <motion.span
          key={coins}
          initial={{ scale: 1.2, y: -4 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`font-black text-amber-950 ${cfg.text}`}
          style={{ textShadow: '0 1px 1px rgba(255,255,255,0.45)' }}
        >
          {coins.toLocaleString()}
        </motion.span>
      )}
    </motion.div>
  )
}
