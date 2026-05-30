import { useState } from 'react'
import { motion } from 'framer-motion'
import { attackIcons } from '../lib/attack-icons'

interface AttackIconPickerModalProps {
  selectedId?: string
  onSelect: (iconId: string) => void
}

export default function AttackIconPickerModal({ selectedId, onSelect }: AttackIconPickerModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedIcon = attackIcons.find(icon => icon.id === selectedId)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full px-4 py-2 glass-dark neon-border-cyan rounded-lg text-neon-cyan hover:shadow-neon-cyan transition flex items-center justify-between font-bold"
      >
        <span className="flex items-center gap-2">
          {selectedIcon ? (
            <>
              <div
                className="w-8 h-8"
                dangerouslySetInnerHTML={{ __html: selectedIcon.svg }}
              />
              {selectedIcon.name}
            </>
          ) : (
            'İkon Seç'
          )}
        </span>
        <span>▼</span>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="glass-dark neon-border-cyan rounded-xl p-6 max-w-2xl max-h-96 overflow-y-auto w-full"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-black text-neon-cyan mb-4">Saldırı İkonu Seç</h2>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {attackIcons.map(icon => (
                <button
                  key={icon.id}
                  type="button"
                  onClick={() => {
                    onSelect(icon.id)
                    setIsOpen(false)
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg transition ${
                    selectedId === icon.id
                      ? 'glass-dark neon-border-cyan border-2 scale-110'
                      : 'glass hover:border hover:border-neon-cyan/50'
                  } hover:shadow-neon-cyan`}
                  title={icon.name}
                >
                  <div
                    className="w-10 h-10 mb-1"
                    dangerouslySetInnerHTML={{ __html: icon.svg }}
                  />
                  <span className="text-xs text-neon-cyan text-center line-clamp-2 font-bold">
                    {icon.name}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
