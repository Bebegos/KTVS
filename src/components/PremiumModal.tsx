import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import PremiumCard from './PremiumCard'
import { modalAssets } from '../lib/gameAssets'

interface PremiumModalProps {
  onClose: () => void
  children: ReactNode
  /** Stacking order of the overlay. */
  zIndex?: number
  /** Max width utility class for the dialog. */
  maxWidthClass?: string
}

/**
 * Hearthstone-style modal shell: a dimmed backdrop with a parchment frame card
 * (PremiumCard) and the premium PNG close button overlaid on the corner. Used
 * so every popup matches the Dino Detail page theme.
 */
export default function PremiumModal({
  onClose,
  children,
  zIndex = 250,
  maxWidthClass = 'max-w-md',
}: PremiumModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${maxWidthClass}`}
      >
        <PremiumCard variant="frame">
          <div className="max-h-[80vh] overflow-y-auto">{children}</div>
        </PremiumCard>

        {/* Premium PNG close button, seated on the top-right corner */}
        <button
          onClick={onClose}
          aria-label="Kapat"
          className="absolute -top-2 -right-2 w-11 h-11 z-10 hover:scale-110 active:scale-95 transition-transform"
        >
          <img
            src={modalAssets.close}
            alt=""
            className="w-full h-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
            draggable={false}
          />
        </button>
      </motion.div>
    </motion.div>
  )
}
