import { motion } from 'framer-motion'

interface FloatingDamageNumberProps {
  damage: number
  isCritical: boolean
  isHealing: boolean
  x: number // viewport x position
  y: number // viewport y position
  duration?: number // milliseconds
}

export default function FloatingDamageNumber({
  damage,
  isCritical,
  isHealing,
  x,
  y,
  duration = 1500,
}: FloatingDamageNumberProps) {
  const durationSeconds = duration / 1000

  return (
    <motion.div
      initial={{
        x,
        y,
        opacity: 1,
        scale: 1,
      }}
      animate={{
        y: y - 80,
        opacity: 0,
        scale: isCritical ? 1.3 : 1.1,
      }}
      transition={{
        duration: durationSeconds,
        ease: 'easeOut',
      }}
      className={`fixed pointer-events-none font-black whitespace-nowrap ${
        isHealing
          ? isCritical
            ? 'text-3xl text-green-400'
            : 'text-2xl text-green-300'
          : isCritical
          ? 'text-4xl text-yellow-300'
          : 'text-3xl text-red-400'
      }`}
      style={{
        textShadow: `
          0 0 10px ${isHealing ? '#22c55e' : isCritical ? '#fbbf24' : '#ef4444'},
          0 2px 4px rgba(0,0,0,0.5)
        `,
      }}
    >
      <span>
        {isHealing ? '+' : '-'}{damage}
        {isCritical && <span className="ml-1">!</span>}
      </span>
    </motion.div>
  )
}
