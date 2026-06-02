import { useState } from 'react'
import { AbilityType } from '../game/types'
import { getAbilityTypeIconUrl } from '../lib/gameAssets'

interface AbilityTypeIconProps {
  kind: AbilityType
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /** When true the icon fills its parent box. */
  fill?: boolean
  className?: string
}

const sizeMap = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-10 h-10',
}

const emojiFallback: Record<AbilityType, string> = {
  attack: '⚔️',
  heal: '💚',
  buff: '✨',
  debuff: '⚫',
  utility: '🔧',
  passive: '🛡️',
  ultimate: '👑',
}

/**
 * Renders an ability-type indicator from the premium PNG icon set,
 * falling back to an emoji glyph if the image cannot load.
 */
export default function AbilityTypeIcon({ kind, size = 'sm', fill = false, className = '' }: AbilityTypeIconProps) {
  const [failed, setFailed] = useState(false)
  const url = getAbilityTypeIconUrl(kind)
  const boxClass = fill ? 'w-full h-full' : sizeMap[size]

  if (failed) {
    return (
      <span className={`${boxClass} flex items-center justify-center flex-shrink-0 ${className}`}>
        {emojiFallback[kind]}
      </span>
    )
  }

  return (
    <img
      src={url}
      alt={kind}
      onError={() => setFailed(true)}
      className={`${boxClass} object-contain flex-shrink-0 ${className}`}
      draggable={false}
    />
  )
}
