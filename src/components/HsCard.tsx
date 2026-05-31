import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface HsCardProps {
  title?: string
  subtitle?: string
  children: ReactNode
  onClick?: () => void
  selected?: boolean
  disabled?: boolean
  className?: string
  header?: boolean
}

export default function HsCard({
  title,
  subtitle,
  children,
  onClick,
  selected = false,
  disabled = false,
  className = '',
  header = true,
}: HsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!disabled ? { y: -4 } : {}}
      className={`hs-card ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''} ${className}`.trim()}
      onClick={onClick}
      style={{ cursor: onClick && !disabled ? 'pointer' : 'default' }}
    >
      {header && (title || subtitle) && (
        <div className="hs-card-header">
          {title && <h2 className="hs-card-title">{title}</h2>}
          {subtitle && <p className="hs-card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="hs-card-content">
        {children}
      </div>
    </motion.div>
  )
}

// Grid container for cards
interface HsCardGridProps {
  children: ReactNode
  className?: string
}

export function HsCardGrid({ children, className = '' }: HsCardGridProps) {
  return (
    <div className={`hs-card-grid ${className}`.trim()}>
      {children}
    </div>
  )
}
