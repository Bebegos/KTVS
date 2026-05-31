import { ReactNode } from 'react'

type StatType = 'sta' | 'hp' | 'atk' | 'def' | 'spd'
type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface StatIconProps {
  stat: StatType
  size?: IconSize
  className?: string
  title?: string
  inline?: boolean
}

const statLabels: Record<StatType, string> = {
  sta: 'Stamina',
  hp: 'Health',
  atk: 'Attack',
  def: 'Defense',
  spd: 'Speed',
}

const statColors: Record<StatType, string> = {
  sta: '#ff6b6b',
  hp: '#ff6b6b',
  atk: '#ffd700',
  def: '#6b9bd1',
  spd: '#ffdd00',
}

export default function StatIcon({ stat, size = 'md', className = '', title, inline = false }: StatIconProps) {
  const iconClass = `hs-icon hs-icon-${stat} hs-icon-${size} ${inline ? 'hs-icon-inline' : ''} ${className}`.trim()
  const label = title || statLabels[stat]

  return (
    <div
      className={iconClass}
      title={label}
      role="img"
      aria-label={label}
    />
  )
}

// Stat display component combining icon + value
interface StatDisplayProps {
  stat: StatType
  value: number
  size?: IconSize
  showLabel?: boolean
  className?: string
  onClick?: () => void
}

export function StatDisplay({ stat, value, size = 'sm', showLabel = false, className = '', onClick }: StatDisplayProps) {
  return (
    <div
      className={`hs-stat-label ${className}`.trim()}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <StatIcon stat={stat} size={size} />
      {showLabel && <span>{statLabels[stat]}</span>}
      <span className={`hs-stat-value hs-${stat}-value`}>{value}</span>
    </div>
  )
}

// Batch stat display for showing multiple stats
interface StatRowProps {
  stats: {
    sta?: number
    hp?: number
    atk?: number
    def?: number
    spd?: number
  }
  size?: IconSize
  showLabels?: boolean
  className?: string
  onStatClick?: (stat: StatType) => void
}

export function StatRow({ stats, size = 'sm', showLabels = false, className = '', onStatClick }: StatRowProps) {
  const statKeys: StatType[] = ['sta', 'atk', 'def', 'spd']

  return (
    <div className={`flex gap-4 ${className}`.trim()}>
      {statKeys.map(key => {
        const value = stats[key]
        if (value === undefined || value === null) return null

        return (
          <StatDisplay
            key={key}
            stat={key}
            value={value}
            size={size}
            showLabel={showLabels}
            onClick={() => onStatClick?.(key)}
          />
        )
      })}
    </div>
  )
}
