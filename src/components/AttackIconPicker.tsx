import { useState } from 'react'
import { attackIcons } from '../lib/attack-icons'

interface AttackIconPickerProps {
  selectedId?: string
  onSelect: (iconId: string) => void
}

export default function AttackIconPicker({ selectedId, onSelect }: AttackIconPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedIcon = attackIcons.find(icon => icon.id === selectedId)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
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
        <span className={`transition transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-neon-cyan rounded-lg p-3 z-[100] max-h-96 overflow-y-auto shadow-lg shadow-neon-cyan/50">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {attackIcons.map(icon => (
              <button
                key={icon.id}
                type="button"
                onClick={() => {
                  onSelect(icon.id)
                  setIsOpen(false)
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition ${
                  selectedId === icon.id
                    ? 'glass-dark neon-border-cyan border'
                    : 'glass hover:border hover:border-neon-cyan/50'
                } hover:shadow-neon-cyan`}
                title={icon.name}
              >
                <div
                  className="w-8 h-8 mb-1"
                  dangerouslySetInnerHTML={{ __html: icon.svg }}
                />
                <span className="text-xs text-neon-cyan text-center line-clamp-2">
                  {icon.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
