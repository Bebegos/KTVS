import { useState, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { menuButtonAssets, squareMenuButtonAssets } from '../lib/gameAssets'

interface PremiumButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  /** 'wide' uses the horizontal frame (819x249), 'square' uses the 1:1 frame. */
  shape?: 'wide' | 'square'
  /** Sizing classes (width for wide, width/height for square). Aspect ratio is locked. */
  className?: string
  /** Extra classes for the inner text/content wrapper. */
  contentClassName?: string
  /** Optional icon image shown at a fixed position on the left of the plate. */
  iconSrc?: string
  type?: 'button' | 'submit'
}

/**
 * Hearthstone-style menu button backed by the premium PNG frame art.
 *
 * The button locks itself to the source PNG's native aspect ratio
 * (819:249 wide, 1:1 square) so the frame art is NEVER stretched out of
 * proportion. Size it by setting a width via `className` (e.g. "w-40").
 */
export default function PremiumButton({
  children,
  onClick,
  disabled = false,
  shape = 'wide',
  className = '',
  contentClassName = '',
  iconSrc,
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

  // Content inset keeps text on the parchment center, clear of the ornate frame.
  const contentInset =
    shape === 'square' ? 'inset-[18%]' : 'inset-y-[24%] inset-x-[11%]'

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
      } ${shape === 'square' ? 'aspect-square' : 'aspect-[819/249]'} ${className}`}
      style={{
        backgroundImage: `url('${frame}')`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Optional left icon at a fixed position (so it aligns across buttons) */}
      {iconSrc && shape === 'wide' && (
        <img
          src={iconSrc}
          alt=""
          aria-hidden
          draggable={false}
          className="absolute left-[6%] top-1/2 -translate-y-1/2 w-[15%] aspect-square object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
        />
      )}

      {/* Content overlaid on the parchment center, inset from the ornate frame. */}
      <span
        className={`absolute ${contentInset} flex items-center justify-center font-black text-center leading-tight ${
          disabled ? 'text-stone-500/70' : 'text-amber-950'
        } ${contentClassName}`}
        style={{ textShadow: disabled ? 'none' : '0 1px 1px rgba(255,255,255,0.35)' }}
      >
        {children}
      </span>
    </motion.button>
  )
}
