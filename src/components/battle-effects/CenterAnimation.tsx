import { motion } from 'framer-motion'
import { BattleVisualAnimation } from '../../game/types'

interface CenterAnimationProps {
  animationType: BattleVisualAnimation
  duration: number
  color: string
  damage?: number
  isCritical?: boolean
}

export default function CenterAnimation({
  animationType,
  duration,
  color,
  damage,
  isCritical = false,
}: CenterAnimationProps) {
  return (
    <div className="relative w-80 h-80 flex items-center justify-center">
      {/* Damage Number Display */}
      {damage !== undefined && (
        <motion.div
          initial={{ opacity: 1, y: 0, scale: 1 }}
          animate={{ opacity: 0, y: -100, scale: 1.5 }}
          transition={{ duration: duration / 1000, ease: 'easeOut' }}
          className={`absolute text-center pointer-events-none ${
            isCritical
              ? 'text-5xl font-black text-yellow-300 drop-shadow-lg'
              : 'text-4xl font-black text-red-400 drop-shadow-lg'
          }`}
          style={{
            textShadow: `0 0 20px ${isCritical ? '#fbbf24' : '#ef4444'}`,
          }}
        >
          {damage}
          {isCritical && <span className="text-6xl ml-2">!</span>}
        </motion.div>
      )}

      {/* Animation Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        {renderAnimation(animationType, duration, color)}
      </div>
    </div>
  )
}

function renderAnimation(type: BattleVisualAnimation, duration: number, color: string) {
  const durationSeconds = duration / 1000

  switch (type) {
    case 'claw_slash_3hit':
      return <ClawSlash3HitAnimation duration={durationSeconds} color={color} />

    case 'claw_slash_single':
      return <ClawSlashSingleAnimation duration={durationSeconds} color={color} />

    case 'fire_burst':
      return <FireBurstAnimation duration={durationSeconds} color={color} />

    case 'healing_glow':
      return <HealingGlowAnimation duration={durationSeconds} color={color} />

    case 'poison_cloud':
      return <PoisonCloudAnimation duration={durationSeconds} color={color} />

    case 'electricity_crackle':
      return <ElectricityCrackleAnimation duration={durationSeconds} color={color} />

    case 'shield_barrier':
      return <ShieldBarrierAnimation duration={durationSeconds} color={color} />

    case 'wind_gust':
      return <WindGustAnimation duration={durationSeconds} color={color} />

    case 'ice_spikes':
      return <IceSpikesAnimation duration={durationSeconds} color={color} />

    case 'stone_crumble':
      return <StoneCrumbleAnimation duration={durationSeconds} color={color} />

    case 'generic_impact':
    default:
      return <GenericImpactAnimation duration={durationSeconds} color={color} />
  }
}

// ============ ANIMATION COMPONENTS ============

function ClawSlash3HitAnimation({ duration, color }: { duration: number; color: string }) {
  return (
    <svg width="300" height="300" viewBox="0 0 300 300" className="absolute">
      {/* Slash 1 */}
      <motion.line
        x1="50"
        y1="100"
        x2="250"
        y2="200"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: duration * 0.25, delay: 0 }}
      />

      {/* Slash 2 */}
      <motion.line
        x1="250"
        y1="100"
        x2="50"
        y2="200"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: duration * 0.25, delay: duration * 0.25 }}
      />

      {/* Slash 3 - vertical */}
      <motion.line
        x1="150"
        y1="50"
        x2="150"
        y2="250"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: duration * 0.25, delay: duration * 0.5 }}
      />

      {/* Impact burst */}
      <motion.circle
        cx="150"
        cy="150"
        r="20"
        fill="none"
        stroke={color}
        strokeWidth="3"
        initial={{ r: 20, opacity: 1 }}
        animate={{ r: 100, opacity: 0 }}
        transition={{ duration: duration * 0.3, delay: duration * 0.65 }}
      />
    </svg>
  )
}

function ClawSlashSingleAnimation({ duration, color }: { duration: number; color: string }) {
  return (
    <svg width="300" height="300" viewBox="0 0 300 300" className="absolute">
      <motion.line
        x1="50"
        y1="100"
        x2="250"
        y2="200"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: duration * 0.4 }}
      />

      <motion.circle
        cx="150"
        cy="150"
        r="30"
        fill="none"
        stroke={color}
        strokeWidth="4"
        initial={{ r: 30, opacity: 1 }}
        animate={{ r: 120, opacity: 0 }}
        transition={{ duration: duration * 0.4, delay: duration * 0.3 }}
      />
    </svg>
  )
}

function FireBurstAnimation({ duration, color }: { duration: number; color: string }) {
  return (
    <svg width="300" height="300" viewBox="0 0 300 300" className="absolute">
      {/* Central flames */}
      {[0, 120, 240].map((angle) => (
        <motion.g key={angle} transform={`rotate(${angle} 150 150)`}>
          <motion.polygon
            points="150,80 170,150 150,200 130,150"
            fill={color}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: duration * 0.3 }}
          />
        </motion.g>
      ))}

      {/* Expanding waves */}
      {[0, 0.15, 0.3].map((delay) => (
        <motion.circle
          key={delay}
          cx="150"
          cy="150"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth="4"
          initial={{ r: 40, opacity: 1 }}
          animate={{ r: 160, opacity: 0 }}
          transition={{ duration: duration * 0.5, delay: delay * duration }}
        />
      ))}
    </svg>
  )
}

function HealingGlowAnimation({ duration, color }: { duration: number; color: string }) {
  return (
    <svg width="300" height="300" viewBox="0 0 300 300" className="absolute">
      {/* Central glow circles */}
      <motion.circle
        cx="150"
        cy="150"
        r="20"
        fill={color}
        initial={{ r: 20, opacity: 0.8 }}
        animate={{ r: 60, opacity: 0 }}
        transition={{ duration, ease: 'easeOut' }}
      />

      {/* Healing plus sign */}
      <motion.line
        x1="150"
        y1="100"
        x2="150"
        y2="200"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: duration * 0.2 }}
      />
      <motion.line
        x1="100"
        y1="150"
        x2="200"
        y2="150"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: duration * 0.2 }}
      />

      {/* Radiating lights */}
      {[0, 90, 180, 270].map((angle) => (
        <motion.circle
          key={angle}
          cx={150 + 80 * Math.cos((angle * Math.PI) / 180)}
          cy={150 + 80 * Math.sin((angle * Math.PI) / 180)}
          r="8"
          fill={color}
          initial={{ opacity: 0, r: 8 }}
          animate={{ opacity: 0, r: 2 }}
          transition={{ duration: duration * 0.6, delay: duration * 0.2 }}
        />
      ))}
    </svg>
  )
}

function PoisonCloudAnimation({ duration, color }: { duration: number; color: string }) {
  return (
    <svg width="300" height="300" viewBox="0 0 300 300" className="absolute">
      {/* Cloud shapes */}
      {[
        { cx: 150, cy: 150 },
        { cx: 100, cy: 120 },
        { cx: 200, cy: 140 },
      ].map((pos, i) => (
        <motion.circle
          key={i}
          cx={pos.cx}
          cy={pos.cy}
          r="50"
          fill={color}
          initial={{ opacity: 0, r: 30 }}
          animate={{ opacity: 0.5, r: 80 }}
          transition={{ duration: duration * 0.6, delay: i * duration * 0.15 }}
        />
      ))}

      {/* Poison drops */}
      {[0, 90, 180, 270].map((angle) => (
        <motion.circle
          key={`drop-${angle}`}
          cx={150 + 70 * Math.cos((angle * Math.PI) / 180)}
          cy={150 + 70 * Math.sin((angle * Math.PI) / 180)}
          r="6"
          fill={color}
          initial={{ opacity: 1, cy: 150 }}
          animate={{ opacity: 0, cy: 250 }}
          transition={{ duration: duration * 0.5, delay: duration * 0.2 }}
        />
      ))}
    </svg>
  )
}

function ElectricityCrackleAnimation({ duration, color }: { duration: number; color: string }) {
  return (
    <svg width="300" height="300" viewBox="0 0 300 300" className="absolute">
      {/* Lightning bolts */}
      <motion.polyline
        points="150,80 140,130 160,150 135,200 150,250"
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0, 1, 0] }}
        transition={{ duration: duration * 0.4, times: [0, 0.2, 0.4, 0.6, 1] }}
      />

      {/* Electric rings */}
      {[0, 0.2, 0.4].map((delay) => (
        <motion.circle
          key={delay}
          cx="150"
          cy="150"
          r="30"
          fill="none"
          stroke={color}
          strokeWidth="4"
          initial={{ r: 30, opacity: 1 }}
          animate={{ r: 140, opacity: 0 }}
          transition={{ duration: duration * 0.5, delay: delay * duration }}
        />
      ))}
    </svg>
  )
}

function ShieldBarrierAnimation({ duration, color }: { duration: number; color: string }) {
  return (
    <svg width="300" height="300" viewBox="0 0 300 300" className="absolute">
      {/* Shield hexagon */}
      <motion.polygon
        points="150,60 220,100 220,180 150,220 80,180 80,100"
        fill={color}
        fillOpacity="0.2"
        stroke={color}
        strokeWidth="4"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: duration * 0.3 }}
      />

      {/* Shield pulse */}
      <motion.polygon
        points="150,60 220,100 220,180 150,220 80,180 80,100"
        fill="none"
        stroke={color}
        strokeWidth="3"
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0, scale: 1.3 }}
        transition={{ duration: duration * 0.4, delay: duration * 0.2 }}
      />
    </svg>
  )
}

function WindGustAnimation({ duration, color }: { duration: number; color: string }) {
  return (
    <svg width="300" height="300" viewBox="0 0 300 300" className="absolute">
      {/* Wind waves */}
      {[0, 60, 120, 180, 240].map((yStart) => (
        <motion.path
          key={yStart}
          d={`M 50,${yStart} Q 100,${yStart - 20} 150,${yStart} T 250,${yStart}`}
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 100, opacity: 0 }}
          transition={{ duration: duration * 0.6, delay: (yStart / 240) * duration * 0.3 }}
        />
      ))}

      {/* Speed lines */}
      {[0, 1, 2, 3].map((i) => (
        <motion.line
          key={`line-${i}`}
          x1="80"
          y1={80 + i * 40}
          x2="220"
          y2={80 + i * 40}
          stroke={color}
          strokeWidth="3"
          initial={{ opacity: 0, x1: 50, x2: 150 }}
          animate={{ opacity: [0, 0.6, 0], x1: 150, x2: 250 }}
          transition={{
            duration: duration * 0.5,
            delay: i * (duration * 0.12),
          }}
        />
      ))}
    </svg>
  )
}

function IceSpikesAnimation({ duration, color }: { duration: number; color: string }) {
  return (
    <svg width="300" height="300" viewBox="0 0 300 300" className="absolute">
      {/* Ice spikes */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180
        const startX = 150 + 40 * Math.cos(rad)
        const startY = 150 + 40 * Math.sin(rad)
        const endX = 150 + 120 * Math.cos(rad)
        const endY = 150 + 120 * Math.sin(rad)

        return (
          <motion.line
            key={angle}
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ opacity: 0, x1: startX, y1: startY }}
            animate={{ opacity: 1, x1: startX, y1: startY }}
            transition={{ duration: duration * 0.3, delay: (angle / 360) * duration * 0.2 }}
          />
        )
      })}

      {/* Freeze effect circle */}
      <motion.circle
        cx="150"
        cy="150"
        r="100"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="10,5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: duration * 0.4, delay: duration * 0.3 }}
      />
    </svg>
  )
}

function StoneCrumbleAnimation({ duration, color }: { duration: number; color: string }) {
  return (
    <svg width="300" height="300" viewBox="0 0 300 300" className="absolute">
      {/* Rock pieces */}
      {[
        { x: 150, y: 150, angle: 0 },
        { x: 150, y: 150, angle: 90 },
        { x: 150, y: 150, angle: 180 },
        { x: 150, y: 150, angle: 270 },
      ].map(({ x, y, angle }, i) => {
        const rad = (angle * Math.PI) / 180
        return (
          <motion.rect
            key={i}
            x={x - 20}
            y={y - 20}
            width="40"
            height="40"
            fill={color}
            fillOpacity="0.6"
            initial={{ x, y, opacity: 1, rotate: 0 }}
            animate={{
              x: x + 80 * Math.cos(rad),
              y: y + 80 * Math.sin(rad),
              opacity: 0,
              rotate: 360,
            }}
            transition={{ duration: duration * 0.6, delay: i * (duration * 0.1) }}
          />
        )
      })}

      {/* Crumble effect */}
      <motion.circle
        cx="150"
        cy="150"
        r="60"
        fill={color}
        fillOpacity="0"
        stroke={color}
        strokeWidth="4"
        initial={{ opacity: 1, r: 60 }}
        animate={{ opacity: 0, r: 100 }}
        transition={{ duration: duration * 0.5 }}
      />
    </svg>
  )
}

function GenericImpactAnimation({ duration, color }: { duration: number; color: string }) {
  return (
    <svg width="300" height="300" viewBox="0 0 300 300" className="absolute">
      {/* Expanding rings */}
      {[0, 0.25, 0.5].map((delay) => (
        <motion.circle
          key={delay}
          cx="150"
          cy="150"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth="4"
          initial={{ r: 40, opacity: 1 }}
          animate={{ r: 150, opacity: 0 }}
          transition={{ duration: duration * 0.6, delay: delay * duration }}
        />
      ))}

      {/* Central flash */}
      <motion.circle
        cx="150"
        cy="150"
        r="30"
        fill={color}
        initial={{ r: 30, opacity: 0.8 }}
        animate={{ r: 80, opacity: 0 }}
        transition={{ duration: duration * 0.4 }}
      />
    </svg>
  )
}
