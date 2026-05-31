import { getClassMedallion, getSpecMedallion } from '../lib/classSpecIcons'

interface MedallionIconProps {
  id?: string
  type: 'class' | 'spec'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
}

export default function MedallionIcon({
  id,
  type,
  size = 'md',
  className = '',
}: MedallionIconProps) {
  const medallion = type === 'class' ? getClassMedallion(id) : getSpecMedallion(id)

  if (!medallion) {
    return (
      <div className={`${sizeMap[size]} flex items-center justify-center ${className}`}>
        <span className="text-gold">❓</span>
      </div>
    )
  }

  return (
    <div
      className={`${sizeMap[size]} flex-shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${className}`}
      title={medallion.name}
      dangerouslySetInnerHTML={{ __html: medallion.svg }}
    />
  )
}
