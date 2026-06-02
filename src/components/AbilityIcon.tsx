import { useState } from 'react'
import { getAttackIcon } from '../lib/attack-icons'
import { getAbilityArtUrl } from '../lib/abilityIconNameMapping'

interface AbilityIconProps {
  iconId?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  /** When true the icon fills its parent box (use for scalable inset placement). */
  fill?: boolean
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
}

export default function AbilityIcon({ iconId, size = 'md', className = '', fill = false }: AbilityIconProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const boxClass = fill ? 'w-full h-full [&>svg]:w-full [&>svg]:h-full' : sizeClasses[size]

  if (!iconId) {
    return <div className={`flex-shrink-0 ${boxClass} ${className}`} />
  }

  // Prefer the premium PNG illustration mapped from the ability's icon key.
  const artUrl = imgFailed ? null : getAbilityArtUrl(iconId)
  if (artUrl) {
    return (
      <img
        src={artUrl}
        alt={iconId}
        onError={() => setImgFailed(true)}
        className={`flex-shrink-0 object-contain ${boxClass} ${className}`}
        draggable={false}
      />
    )
  }

  // Fallback: legacy inline SVG art keyed by attack id.
  const icon = getAttackIcon(iconId)
  if (!icon) return <div className={`flex-shrink-0 ${boxClass} ${className}`} />

  return (
    <div
      className={`flex-shrink-0 ${boxClass} ${className}`}
      dangerouslySetInnerHTML={{ __html: icon.svg }}
    />
  )
}
