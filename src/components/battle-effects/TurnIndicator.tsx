import { motion } from 'framer-motion'

interface TurnIndicatorProps {
  round: number
  isPlayerTurn?: boolean
  message?: string
}

export default function TurnIndicator({ round, isPlayerTurn = false, message }: TurnIndicatorProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed top-8 left-1/2 -translate-x-1/2 z-100"
    >
      <div className="glass-dark neon-border-cyan rounded-2xl px-8 py-4 text-center space-y-2">
        {/* Round number with glow */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple"
        >
          🔄 Turn {round}
        </motion.div>

        {/* Turn indicator */}
        {isPlayerTurn !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-sm font-black uppercase tracking-widest ${
              isPlayerTurn ? 'text-neon-cyan' : 'text-neon-purple'
            }`}
          >
            {isPlayerTurn ? '👤 Your Turn' : '👹 Enemy Turn'}
          </motion.div>
        )}

        {/* Message */}
        {message && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-neon-cyan/70"
          >
            {message}
          </motion.p>
        )}
      </div>

      {/* Pulsing background */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-neon-cyan/10 -z-10"
        animate={{
          boxShadow: [
            '0 0 20px rgba(6, 182, 212, 0.3)',
            '0 0 40px rgba(6, 182, 212, 0.5)',
            '0 0 20px rgba(6, 182, 212, 0.3)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  )
}
