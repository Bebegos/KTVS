import { useState, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { menuButtonAssets, squareMenuButtonAssets } from '../lib/gameAssets'

interface PremiumButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  /** 'wide' uses the horizontal frame, 'square' uses the 1:1 frame. */
  shape?: 'wide' | 'square'
  className?: string
  /** Extra classes for the inner text/content wrapper. */
  contentClassName?: string
  type?: 'button' | 'submit'
}

/**
 * Hearthstone-style menu button backed by the premium PNG frame art.
 * Swaps the frame image across base / hover / pressed / disabled states
 * and lays children over the parchment center panel.
 */
export default function PremiumButton({
  children,
  onClick,
  disabled = false,
  shape = 'wide',
  className = '',
  contentClassName = '',
  type = 'button',
}: PremiumButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  const assets = shape === 'square' ? squareMenuButtonAssets : menuButtonAssets

  const frame = disabled
    ? assets.disabled
    : isPressed
    ? assets.pressed
    : isHovering
    ? assets.hover
    : assets.base

  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      onClick={() => !disabled && onClick?.()}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false)
        setIsPressed(false)
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      className={`relative bg-transparent border-0 p-0 select-none ${
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      } ${shape === 'square' ? 'aspect-square' : ''} ${className}`}
      style={{
        backgroundImage: `url('${frame}')`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Content sits over the parchment center, inset from the ornate frame. */}
      <span
        className={`relative z-10 flex items-center justify-center font-black text-center ${
          shape === 'square' ? 'px-3 py-3' : 'px-6 py-3'
        } ${
          disabled ? 'text-stone-500/70' : 'text-amber-950'
        } ${contentClassName}`}
        style={{ textShadow: disabled ? 'none' : '0 1px 1px rgba(255,255,255,0.3)' }}
      >
        {children}
      </span>
    </motion.button>
  )
}
