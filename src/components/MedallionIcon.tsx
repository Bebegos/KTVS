import { useState } from 'react'
import { getClassMedallion, getSpecMedallion } from '../lib/classSpecIcons'
import { getClassMedallionUrl, getSpecMedallionUrl } from '../lib/gameAssets'

interface MedallionIconProps {
  id?: string
  type: 'class' | 'spec'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** When true, fills the parent box instead of using a fixed size. */
  fill?: boolean
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
  fill = false,
  className = '',
}: MedallionIconProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const medallion = type === 'class' ? getClassMedallion(id) : getSpecMedallion(id)
  const boxClass = fill ? 'w-full h-full' : sizeMap[size]

  if (!id || !medallion) {
    return (
      <div className={`${boxClass} flex items-center justify-center ${className}`}>
        <span className="text-gold">❓</span>
      </div>
    )
  }

  // Premium PNG medallion, falling back to the inline SVG if the file is absent.
  const url = type === 'class' ? getClassMedallionUrl(id) : getSpecMedallionUrl(id)
  if (!imgFailed) {
    return (
      <img
        src={url}
        alt={medallion.name}
        title={medallion.name}
        onError={() => setImgFailed(true)}
        className={`${boxClass} flex-shrink-0 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${className}`}
        draggable={false}
      />
    )
  }

  return (
    <div
      className={`${boxClass} flex-shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${fill ? '[&>svg]:w-full [&>svg]:h-full' : ''} ${className}`}
      title={medallion.name}
      dangerouslySetInnerHTML={{ __html: medallion.svg }}
    />
  )
}
