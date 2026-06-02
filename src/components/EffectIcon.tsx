import { useState } from 'react'
import { EffectKind } from '../game/types'
import { getEffectIconUrl } from '../lib/gameAssets'
import { getEffectEmoji } from '../lib/effect-translations'

interface EffectIconProps {
  effect: EffectKind
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Use the larger 64px source art (recommended for md and up). */
  large?: boolean
  /** When true the icon fills its parent box (use for scalable inset placement). */
  fill?: boolean
  className?: string
}

const sizeMap = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
}

const emojiTextSize = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-4xl',
}

/**
 * Renders a status-effect icon from the premium PNG art set.
 * Falls back to the emoji glyph if the image is missing or fails to load.
 */
export default function EffectIcon({
  effect,
  size = 'sm',
  large,
  fill = false,
  className = '',
}: EffectIconProps) {
  const [failed, setFailed] = useState(false)
  const useLarge = large ?? (fill || size === 'md' || size === 'lg' || size === 'xl')
  const url = getEffectIconUrl(effect, useLarge ? 'lg' : 'sm')
  const boxClass = fill ? 'w-full h-full' : sizeMap[size]

  if (!url || failed) {
    return (
      <span
        className={`${boxClass} ${fill ? 'text-base sm:text-lg' : emojiTextSize[size]} flex items-center justify-center flex-shrink-0 ${className}`}
      >
        {getEffectEmoji(effect)}
      </span>
    )
  }

  return (
    <img
      src={url}
      alt={effect}
      onError={() => setFailed(true)}
      className={`${boxClass} object-contain flex-shrink-0 ${className}`}
      draggable={false}
    />
  )
}
