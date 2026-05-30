import { getAttackIcon } from '../lib/attack-icons'

interface AbilityIconProps {
  iconId?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function AbilityIcon({ iconId, size = 'md', className = '' }: AbilityIconProps) {
  if (!iconId) {
    return <div className={`flex-shrink-0 ${size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-16 h-16' : 'w-10 h-10'} ${className}`} />
  }

  const icon = getAttackIcon(iconId)
  if (!icon) return null

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  }

  return (
    <div
      className={`flex-shrink-0 ${sizeClasses[size]} ${className}`}
      dangerouslySetInnerHTML={{ __html: icon.svg }}
    />
  )
}
