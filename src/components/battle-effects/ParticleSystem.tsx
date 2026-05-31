import { motion } from 'framer-motion'
import { BattleParticleType } from '../../game/types'

interface ParticleSystemProps {
  particleType: BattleParticleType
  count: number
  duration: number
  color: string
}

export default function ParticleSystem({ particleType, count, duration, color }: ParticleSystemProps) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (360 / count) * i + Math.random() * 20,
    distance: 100 + Math.random() * 100,
    delay: Math.random() * (duration / 1000) * 0.3,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => {
        const rad = (particle.angle * Math.PI) / 180
        const endX = window.innerWidth / 2 + particle.distance * Math.cos(rad)
        const endY = window.innerHeight / 2 + particle.distance * Math.sin(rad)

        return (
          <motion.div
            key={particle.id}
            initial={{
              x: window.innerWidth / 2,
              y: window.innerHeight / 2,
              opacity: 1,
            }}
            animate={{
              x: endX,
              y: endY,
              opacity: 0,
            }}
            transition={{
              duration: duration / 1000,
              delay: particle.delay,
              ease: 'easeOut',
            }}
            className="absolute w-2 h-2"
          >
            {renderParticle(particleType, color)}
          </motion.div>
        )
      })}
    </div>
  )
}

function renderParticle(type: BattleParticleType, color: string) {
  const size = 8 + Math.random() * 8

  switch (type) {
    case 'blood_splatter':
      return (
        <svg width={size} height={size} viewBox="0 0 10 10" className="absolute">
          <circle cx="5" cy="5" r="4" fill={color} opacity="0.8" />
          <circle cx="2" cy="2" r="2" fill={color} opacity="0.6" />
          <circle cx="8" cy="7" r="2" fill={color} opacity="0.6" />
        </svg>
      )

    case 'fire_sparks':
      return (
        <svg width={size} height={size} viewBox="0 0 10 10" className="absolute">
          <polygon points="5,1 8,9 5,7 2,9" fill={color} opacity="0.9" />
        </svg>
      )

    case 'ice_crystals':
      return (
        <svg width={size} height={size} viewBox="0 0 10 10" className="absolute">
          <polygon points="5,0 6,5 10,5 7,8 8,10 5,7 2,10 3,8 0,5 4,5" fill={color} opacity="0.8" />
        </svg>
      )

    case 'poison_gas':
      return (
        <svg width={size} height={size} viewBox="0 0 10 10" className="absolute">
          <circle cx="5" cy="5" r="3" fill={color} opacity="0.6" />
          <circle cx="3" cy="3" r="2" fill={color} opacity="0.4" />
          <circle cx="7" cy="7" r="2" fill={color} opacity="0.4" />
        </svg>
      )

    case 'electricity':
      return (
        <svg width={size} height={size} viewBox="0 0 10 10" className="absolute">
          <polyline points="2,8 5,1 4,5 8,2" fill="none" stroke={color} strokeWidth="1" opacity="0.9" />
        </svg>
      )

    case 'healing_light':
      return (
        <svg width={size} height={size} viewBox="0 0 10 10" className="absolute">
          <circle cx="5" cy="5" r="2" fill={color} opacity="0.8" />
          <circle cx="5" cy="5" r="4" fill="none" stroke={color} strokeWidth="0.5" opacity="0.4" />
        </svg>
      )

    case 'leaves':
      return (
        <svg width={size} height={size} viewBox="0 0 10 10" className="absolute">
          <ellipse cx="5" cy="5" rx="3" ry="5" fill={color} opacity="0.7" transform="rotate(45 5 5)" />
        </svg>
      )

    case 'wind':
      return (
        <svg width={size} height={size} viewBox="0 0 10 10" className="absolute">
          <line x1="1" y1="5" x2="9" y2="5" stroke={color} strokeWidth="1" opacity="0.6" />
          <line x1="2" y1="3" x2="8" y2="3" stroke={color} strokeWidth="0.5" opacity="0.4" />
        </svg>
      )

    case 'none':
    default:
      return null
  }
}
