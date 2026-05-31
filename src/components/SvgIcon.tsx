import React from 'react'
import {
  getAbilityIcon,
  getEffectIcon,
  getStatIcon,
  type SvgIcon,
} from '../lib/svgIcons'
import { getAbilityIconId } from '../lib/abilityIconMapping'

interface SvgIconProps {
  id?: string
  icon?: SvgIcon
  type?: 'ability' | 'effect' | 'stat'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fallback?: string
}

const sizeMap = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
}

export default function SvgIcon({
  id,
  icon,
  type = 'ability',
  size = 'md',
  className = '',
  fallback = '❓',
}: SvgIconProps) {
  let resolvedIcon = icon

  if (!resolvedIcon && id) {
    if (type === 'ability') {
      resolvedIcon = getAbilityIcon(id)
      // If direct lookup fails, try mapping
      if (!resolvedIcon) {
        const mappedId = getAbilityIconId(id)
        resolvedIcon = getAbilityIcon(mappedId)
      }
    } else if (type === 'effect') {
      resolvedIcon = getEffectIcon(id)
    } else if (type === 'stat') {
      resolvedIcon = getStatIcon(id)
    }
  }

  if (!resolvedIcon) {
    return (
      <span className={`${sizeMap[size]} flex items-center justify-center text-sm ${className}`}>
        {fallback}
      </span>
    )
  }

  return (
    <div
      className={`${sizeMap[size]} flex-shrink-0 ${className}`}
      title={resolvedIcon.name}
      dangerouslySetInnerHTML={{ __html: resolvedIcon.svg }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  )
}
