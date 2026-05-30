import { motion, AnimatePresence } from 'framer-motion'

interface DiceRollerProps {
  rolling: boolean
  lastValue: number | null
}

export default function DiceRoller({ rolling, lastValue }: DiceRollerProps) {
  const getResultColor = () => {
    if (!lastValue) return 'glass-dark neon-border-cyan'
    if (lastValue === 1) return 'glass-dark border-2 border-red-500/50'
    if (lastValue === 6) return 'glass-dark neon-border-purple'
    return 'glass-dark neon-border-cyan'
  }

  const getResultText = () => {
    if (!lastValue) return '?'
    if (lastValue === 1) return '❌ Işka!'
    if (lastValue === 6) return '🌟 KRİTİK!'
    return '✓ İsabet'
  }

  const getResultTextColor = () => {
    if (!lastValue) return 'text-neon-cyan'
    if (lastValue === 1) return 'text-red-400'
    if (lastValue === 6) return 'text-neon-purple'
    return 'text-neon-cyan'
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={rolling ? { rotateX: 360, rotateY: 360 } : {}}
        transition={{ duration: 0.6 }}
        className={`w-32 h-32 flex items-center justify-center text-6xl font-bold rounded-lg shadow-lg cursor-pointer ${getResultColor()}`}
      >
        {rolling ? '🎲' : lastValue || '🎲'}
      </motion.div>

      <AnimatePresence>
        {lastValue && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`text-2xl font-bold ${getResultTextColor()}`}
          >
            {getResultText()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
