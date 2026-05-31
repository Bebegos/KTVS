import { ReactNode, useState } from 'react'
import { motion } from 'framer-motion'

export type CardMode = 'display' | 'summary' | 'selection'

interface HearthstoneCardProps {
  title?: string
  subtitle?: string
  mode?: CardMode
  selected?: boolean
  onClick?: () => void
  children: ReactNode
  actions?: {
    label: string
    onClick: () => void
    variant?: 'parchment' | 'green' | 'red' | 'blue' | 'purple'
  }[]
  className?: string
}

export default function HearthstoneCard({
  title,
  subtitle,
  mode = 'display',
  selected = false,
  onClick,
  children,
  actions,
  className = '',
}: HearthstoneCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`hs-card-wrapper ${className}`}
    >
      {/* Outer metal frame */}
      <div className="hs-card-outer-frame">
        {/* Top metal bar with title */}
        {title && (
          <div className="hs-card-title-bar">
            <div className="hs-card-title-bar-inner">
              <h2 className="hs-card-title-text">{title}</h2>
            </div>
          </div>
        )}

        {/* Main parchment panel */}
        <div className={`hs-card-main ${selected ? 'selected' : ''}`}>
          {/* Subtitle if provided */}
          {subtitle && <div className="hs-card-subtitle">{subtitle}</div>}

          {/* Card content */}
          <div className="hs-card-content-area">{children}</div>

          {/* Action buttons area */}
          {actions && actions.length > 0 && (
            <div className="hs-card-actions">
              {actions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    action.onClick()
                  }}
                  className={`hs-btn ${
                    action.variant ? `hs-btn-${action.variant}` : ''
                  } ${actions.length === 1 ? 'flex-1' : 'flex-1'}`}
                >
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom metal accent */}
        <div className="hs-card-bottom-accent" />
      </div>
    </motion.div>
  )
}
