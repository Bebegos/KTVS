import { getAttackIcon } from '../lib/attack-icons'

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
  const boxClass = fill ? 'w-full h-full [&>svg]:w-full [&>svg]:h-full' : sizeClasses[size]

  if (!iconId) {
    return <div className={`flex-shrink-0 ${boxClass} ${className}`} />
  }

  const icon = getAttackIcon(iconId)
  if (!icon) return null

  return (
    <div
      className={`flex-shrink-0 ${boxClass} ${className}`}
      dangerouslySetInnerHTML={{ __html: icon.svg }}
    />
  )
}
