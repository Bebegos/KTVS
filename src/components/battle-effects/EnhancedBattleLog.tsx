import { motion, AnimatePresence } from 'framer-motion'

interface BattleLogEntry {
  id: string
  message: string
  type?: 'action' | 'damage' | 'heal' | 'effect' | 'status'
}

interface EnhancedBattleLogProps {
  entries: string[]
  maxEntries?: number
}

export default function EnhancedBattleLog({ entries, maxEntries = 6 }: EnhancedBattleLogProps) {
  const displayEntries = entries.slice(0, maxEntries)

  const getLogType = (message: string): 'action' | 'damage' | 'heal' | 'effect' | 'status' => {
    if (message.includes('💀') || message.includes('hasarı')) return 'damage'
    if (message.includes('💚') || message.includes('+')) return 'heal'
    if (message.includes('✨') || message.includes('uygulandı')) return 'effect'
    if (message.includes('🔄') || message.includes('Tur')) return 'status'
    return 'action'
  }

  const getLogColor = (type: string): string => {
    switch (type) {
      case 'damage':
        return 'text-red-400'
      case 'heal':
        return 'text-green-400'
      case 'effect':
        return 'text-purple-400'
      case 'status':
        return 'text-neon-cyan'
      default:
        return 'text-neon-cyan/80'
    }
  }

  return (
    <div className="glass-dark border border-neon-cyan/30 rounded-lg p-3 h-48 flex flex-col">
      <p className="text-xs font-bold text-neon-cyan mb-2 uppercase">📋 Battle Log</p>
      <div className="flex-1 overflow-y-auto space-y-1">
        <AnimatePresence mode="popLayout">
          {displayEntries.map((message, idx) => {
            const type = getLogType(message)
            const color = getLogColor(type)

            return (
              <motion.div
                key={`${idx}-${message.substring(0, 10)}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className={`text-xs font-semibold break-words p-2 rounded border ${color} ${
                  type === 'damage'
                    ? 'border-red-500/30 bg-red-500/5'
                    : type === 'heal'
                    ? 'border-green-500/30 bg-green-500/5'
                    : type === 'effect'
                    ? 'border-purple-500/30 bg-purple-500/5'
                    : 'border-neon-cyan/20 bg-neon-cyan/5'
                }`}
              >
                {message}
              </motion.div>
            )
          })}
        </AnimatePresence>

        {displayEntries.length === 0 && (
          <div className="flex items-center justify-center h-full text-neon-cyan/40 text-sm">
            Battle hasn't started yet...
          </div>
        )}
      </div>
    </div>
  )
}
