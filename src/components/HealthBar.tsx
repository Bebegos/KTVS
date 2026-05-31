import { motion } from 'framer-motion'

interface HealthBarProps {
  current: number
  max: number
  /** 'player' = ruby/red (default), 'enemy' = darker ruby */
  variant?: 'player' | 'enemy'
  size?: 'sm' | 'md'
}

/**
 * Hearthstone-style health bar:
 *  - ornate gold-framed track
 *  - glossy ruby-blood fill
 *  - a faceted health gem on the right showing the number (HS health gem)
 */
export default function HealthBar({
  current,
  max,
  variant = 'player',
  size = 'md',
}: HealthBarProps) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100))
  const shown = Math.max(0, Math.round(current))

  const trackH = size === 'sm' ? 'h-4' : 'h-6'
  const gemSize = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-11 h-11 text-base'

  return (
    <div className="flex items-center gap-2 w-full">
      {/* Track */}
      <div
        className={`relative flex-1 ${trackH} rounded-full overflow-hidden`}
        style={{
          background: 'linear-gradient(180deg, #2a0c0c 0%, #471212 100%)',
          border: '2px solid #6b4a2b',
          boxShadow:
            'inset 0 2px 5px rgba(0,0,0,0.7), 0 0 0 1px #d4af37, 0 1px 3px rgba(0,0,0,0.5)',
        }}
      >
        <motion.div
          className="h-full rounded-full"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            background:
              variant === 'enemy'
                ? 'linear-gradient(180deg, #e0584a 0%, #b5392c 45%, #7a1d16 100%)'
                : 'linear-gradient(180deg, #ff6f5e 0%, #d63b2c 45%, #8b1a14 100%)',
            boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.45), inset 0 -3px 5px rgba(0,0,0,0.4)',
          }}
        />
        {/* glossy top highlight */}
        <div
          className="absolute inset-x-0 top-0 h-1/2 rounded-t-full pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.30), transparent)' }}
        />
      </div>

      {/* Health gem */}
      <div
        className={`relative flex-shrink-0 ${gemSize} flex items-center justify-center rounded-full font-black text-white`}
        style={{
          background: 'radial-gradient(circle at 35% 30%, #ff7a6a 0%, #c0392b 45%, #6e1812 100%)',
          border: '2px solid #d4af37',
          boxShadow:
            'inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -3px 6px rgba(0,0,0,0.5), 0 2px 5px rgba(0,0,0,0.6)',
          textShadow: '0 1px 2px rgba(0,0,0,0.9)',
        }}
      >
        {shown}
        {/* sparkle */}
        <span
          className="absolute rounded-full"
          style={{
            top: size === 'sm' ? '4px' : '6px',
            left: size === 'sm' ? '6px' : '8px',
            width: size === 'sm' ? '3px' : '4px',
            height: size === 'sm' ? '3px' : '4px',
            background: 'rgba(255,255,255,0.85)',
            filter: 'blur(0.5px)',
          }}
        />
      </div>
    </div>
  )
}
