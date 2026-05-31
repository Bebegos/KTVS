import { motion } from 'framer-motion'

interface TreasureChestProps {
  open: boolean
  category?: 'class' | 'spec' | 'ultimate'
  onClick?: () => void
}

// Palette per discovery category
const PALETTES = {
  class: { metal: '#c9a227', metalDark: '#8b6914', wood: '#7a4a1e', woodDark: '#4a2c12', glow: '#f5e1a4' },
  spec: { metal: '#a855f7', metalDark: '#7e22ce', wood: '#3b2a52', woodDark: '#241634', glow: '#e9d5ff' },
  ultimate: { metal: '#f59e0b', metalDark: '#b45309', wood: '#5a2a12', woodDark: '#3a1808', glow: '#fde68a' },
}

/**
 * Animated Hearthstone-style treasure chest rendered fully in SVG.
 * The lid rotates open and light bursts out when `open` is true.
 */
export default function TreasureChest({ open, category = 'class', onClick }: TreasureChestProps) {
  const p = PALETTES[category]

  return (
    <motion.div
      onClick={onClick}
      className={onClick ? 'cursor-pointer select-none' : 'select-none'}
      initial={{ scale: 0.6, opacity: 0, y: 30 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 140, damping: 14 }}
      style={{ width: 220, height: 200, position: 'relative' }}
    >
      {/* Radiant light burst behind the chest when open */}
      <motion.div
        initial={false}
        animate={open ? { opacity: 1, scale: 1.15 } : { opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute',
          inset: -40,
          background: `radial-gradient(circle at 50% 45%, ${p.glow}cc 0%, ${p.glow}55 25%, transparent 60%)`,
          filter: 'blur(6px)',
          pointerEvents: 'none',
        }}
      />

      {/* God-ray beams */}
      {open && (
        <svg viewBox="0 0 220 200" width="220" height="200" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {[...Array(7)].map((_, i) => (
            <motion.polygon
              key={i}
              points="110,95 100,-60 120,-60"
              fill={p.glow}
              opacity={0.18}
              style={{ transformOrigin: '110px 95px' }}
              initial={{ rotate: i * 51, scaleY: 0 }}
              animate={{ rotate: i * 51 + 360, scaleY: 1 }}
              transition={{ rotate: { duration: 18, repeat: Infinity, ease: 'linear' }, scaleY: { duration: 0.6 } }}
            />
          ))}
        </svg>
      )}

      <svg viewBox="0 0 220 200" width="220" height="200" style={{ position: 'absolute', inset: 0, filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.55))' }}>
        <defs>
          <linearGradient id={`wood-${category}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.wood} />
            <stop offset="100%" stopColor={p.woodDark} />
          </linearGradient>
          <linearGradient id={`metal-${category}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.glow} />
            <stop offset="45%" stopColor={p.metal} />
            <stop offset="100%" stopColor={p.metalDark} />
          </linearGradient>
        </defs>

        {/* Chest body */}
        <rect x="34" y="96" width="152" height="78" rx="10" fill={`url(#wood-${category})`} stroke={p.metalDark} strokeWidth="3" />
        {/* Vertical wood planks */}
        <line x1="74" y1="100" x2="74" y2="170" stroke={p.woodDark} strokeWidth="2" opacity="0.5" />
        <line x1="146" y1="100" x2="146" y2="170" stroke={p.woodDark} strokeWidth="2" opacity="0.5" />
        {/* Metal bands */}
        <rect x="34" y="96" width="152" height="78" rx="10" fill="none" stroke={`url(#metal-${category})`} strokeWidth="4" opacity="0.9" />
        <rect x="98" y="96" width="24" height="78" fill={`url(#metal-${category})`} opacity="0.95" />
        {/* Lock plate */}
        <rect x="100" y="120" width="20" height="22" rx="3" fill={`url(#metal-${category})`} stroke={p.metalDark} strokeWidth="1.5" />
        <circle cx="110" cy="131" r="4" fill={p.woodDark} />

        {/* Lid - rotates open from its back hinge */}
        <motion.g
          style={{ transformOrigin: '110px 96px', transformBox: 'view-box' as any }}
          initial={false}
          animate={open ? { rotateX: -118 } : { rotateX: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 12, delay: open ? 0.05 : 0 }}
        >
          <path d="M30 96 Q30 56 110 56 Q190 56 190 96 Z" fill={`url(#wood-${category})`} stroke={p.metalDark} strokeWidth="3" />
          <path d="M30 96 Q30 56 110 56 Q190 56 190 96" fill="none" stroke={`url(#metal-${category})`} strokeWidth="4" opacity="0.9" />
          <rect x="98" y="56" width="24" height="40" fill={`url(#metal-${category})`} opacity="0.95" />
        </motion.g>
      </svg>

      {/* Sparkles bursting when opened */}
      {open &&
        [...Array(10)].map((_, i) => {
          const angle = (i / 10) * Math.PI * 2
          return (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                left: 106,
                top: 92,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: p.glow,
                boxShadow: `0 0 8px 2px ${p.glow}`,
                pointerEvents: 'none',
              }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
              animate={{
                x: Math.cos(angle) * (70 + Math.random() * 40),
                y: Math.sin(angle) * (60 + Math.random() * 40) - 30,
                opacity: [0, 1, 0],
                scale: [0.4, 1.1, 0.2],
              }}
              transition={{ duration: 1.1, delay: 0.1 + i * 0.03, ease: 'easeOut' }}
            />
          )
        })}
    </motion.div>
  )
}
