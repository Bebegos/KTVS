import { motion } from 'framer-motion'

interface BattleEffectVisualsProps {
  effectType?: 'buff' | 'debuff' | 'damage' | null
  isVisible: boolean
  duration?: number
}

export default function BattleEffectVisuals({ effectType, isVisible, duration = 1500 }: BattleEffectVisualsProps) {
  if (!isVisible || !effectType) return null

  if (effectType === 'buff') {
    return (
      <>
        {/* Green glow edges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration / 1000, times: [0, 0.5, 1] }}
          className="fixed inset-0 border-4 border-green-500 pointer-events-none"
        />

        {/* Particle effects */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.cos((i / 8) * Math.PI * 2) * 100,
              y: Math.sin((i / 8) * Math.PI * 2) * 100,
              opacity: 1,
              scale: 1,
            }}
            animate={{
              x: Math.cos((i / 8) * Math.PI * 2) * 300,
              y: Math.sin((i / 8) * Math.PI * 2) * 300,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: duration / 1000, ease: 'easeOut' }}
            className="fixed top-1/2 left-1/2 w-4 h-4 bg-green-400 rounded-full pointer-events-none"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            🍃
          </motion.div>
        ))}

        {/* Center flash */}
        <motion.div
          initial={{ opacity: 1, scale: 0 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{ duration: 0.6 }}
          className="fixed top-1/2 left-1/2 w-32 h-32 bg-green-500 rounded-full blur-3xl pointer-events-none"
          style={{ transform: 'translate(-50%, -50%)' }}
        />
      </>
    )
  }

  if (effectType === 'debuff') {
    return (
      <>
        {/* Red cracking effect */}
        <motion.svg
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.5, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration / 1000, times: [0, 0.2, 0.5, 0.8, 1] }}
          className="fixed inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
        >
          {/* Cracks */}
          <path d="M 50 0 L 45 20 L 40 10 L 35 30 L 30 15 L 25 35 L 20 20 L 15 40 L 10 25 L 5 50" stroke="#ff006e" strokeWidth="2" fill="none" opacity="0.8" />
          <path d="M 50 100 L 55 80 L 60 90 L 65 70 L 70 85 L 75 65 L 80 80 L 85 60 L 90 75 L 95 50" stroke="#ff006e" strokeWidth="2" fill="none" opacity="0.8" />
          <path d="M 0 50 L 20 45 L 10 40 L 30 35 L 15 30 L 35 25 L 20 20 L 40 15 L 25 10 L 50 5" stroke="#ff006e" strokeWidth="2" fill="none" opacity="0.8" />
          <path d="M 100 50 L 80 55 L 90 60 L 70 65 L 85 70 L 65 75 L 80 80 L 60 85 L 75 90 L 50 95" stroke="#ff006e" strokeWidth="2" fill="none" opacity="0.8" />
        </motion.svg>

        {/* Red screen tint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration / 1000, times: [0, 0.5, 1] }}
          className="fixed inset-0 bg-red-500 pointer-events-none"
        />

        {/* Debuff particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: window.innerWidth * (0.2 + Math.random() * 0.6),
              y: -20,
              opacity: 1,
            }}
            animate={{
              y: window.innerHeight + 20,
              opacity: 0,
            }}
            transition={{ duration: duration / 1000, ease: 'easeIn', delay: (i / 6) * 0.2 }}
            className="fixed text-2xl pointer-events-none"
          >
            ☠️
          </motion.div>
        ))}
      </>
    )
  }

  if (effectType === 'damage') {
    return (
      <>
        {/* Damage flash */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: duration / 1000 }}
          className="fixed inset-0 bg-yellow-500 pointer-events-none"
        />

        {/* Impact waves */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              width: 0,
              height: 0,
              opacity: 0.8,
            }}
            animate={{
              width: window.innerWidth,
              height: window.innerHeight,
              opacity: 0,
            }}
            transition={{
              duration: duration / 1000,
              delay: (i / 3) * 0.2,
              ease: 'easeOut',
            }}
            className="fixed top-1/2 left-1/2 border-2 border-yellow-500 rounded-full pointer-events-none"
            style={{ transform: 'translate(-50%, -50%)' }}
          />
        ))}
      </>
    )
  }

  return null
}
