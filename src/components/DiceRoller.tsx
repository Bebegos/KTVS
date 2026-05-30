import { motion, AnimatePresence } from 'framer-motion'

interface DiceRollerProps {
  rolling: boolean
  lastValue: number | null
}

export default function DiceRoller({ rolling, lastValue }: DiceRollerProps) {
  const getResultColor = () => {
    if (!lastValue) return 'bg-white'
    if (lastValue === 1) return 'bg-gray-400'
    if (lastValue === 6) return 'bg-yellow-400'
    return 'bg-green-400'
  }

  const getResultText = () => {
    if (!lastValue) return '?'
    if (lastValue === 1) return 'Işka!'
    if (lastValue === 6) return 'KRİTİK!'
    return '✓ İsabet'
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={rolling ? { rotateX: 360, rotateY: 360 } : {}}
        transition={{ duration: 0.6 }}
        className={`w-32 h-32 flex items-center justify-center text-6xl font-bold rounded-lg border-4 border-dino-500 shadow-lg cursor-pointer ${getResultColor()}`}
      >
        {rolling ? '🎲' : lastValue || '🎲'}
      </motion.div>

      <AnimatePresence>
        {lastValue && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`text-2xl font-bold ${
              lastValue === 1
                ? 'text-gray-600'
                : lastValue === 6
                ? 'text-yellow-600'
                : 'text-green-600'
            }`}
          >
            {getResultText()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
