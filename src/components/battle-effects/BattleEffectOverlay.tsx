import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { BattleVisualEffects } from '../../game/types'
import { applyScreenShake } from '../../lib/battleAnimations'
import CenterAnimation from './CenterAnimation'
import ParticleSystem from './ParticleSystem'

interface BattleEffectOverlayProps {
  isActive: boolean
  visualEffects: BattleVisualEffects
  onComplete?: () => void
  targetDamage?: number
  isCritical?: boolean
}

export default function BattleEffectOverlay({
  isActive,
  visualEffects,
  onComplete,
  targetDamage,
  isCritical = false,
}: BattleEffectOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [borderGlowIntensity, setBorderGlowIntensity] = useState(1)

  // Apply screen shake
  useEffect(() => {
    if (!isActive || !containerRef.current) return

    if (visualEffects.screenShake) {
      const cleanup = applyScreenShake(containerRef.current, visualEffects.screenShake)
      return cleanup
    }
  }, [isActive, visualEffects])

  // Handle border glow animation
  useEffect(() => {
    if (!isActive) return

    const startTime = Date.now()
    let animationFrameId: number

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = elapsed / visualEffects.animationDuration

      // Pulsing glow effect
      const glow = 0.5 + 0.5 * Math.sin(progress * Math.PI * 4)
      setBorderGlowIntensity(glow)

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrameId)
      setBorderGlowIntensity(1)
    }
  }, [isActive, visualEffects.animationDuration])

  // Handle completion
  useEffect(() => {
    if (!isActive) return

    const timer = setTimeout(() => {
      onComplete?.()
    }, visualEffects.animationDuration)

    return () => clearTimeout(timer)
  }, [isActive, visualEffects.animationDuration, onComplete])

  if (!isActive) return null

  const glowOpacity = (visualEffects.glowIntensity || 1) * borderGlowIntensity

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] pointer-events-none overflow-hidden"
    >
      {/* Animated border */}
      {visualEffects.borderGlow && (
        <div
          className="absolute inset-0 border-4 rounded-lg pointer-events-none"
          style={{
            borderColor: visualEffects.borderColor,
            boxShadow: `
              inset 0 0 20px ${visualEffects.borderColor}40,
              0 0 40px ${visualEffects.borderColor}${Math.floor(glowOpacity * 255).toString(16).padStart(2, '0')},
              0 0 80px ${visualEffects.borderColor}${Math.floor(glowOpacity * 180).toString(16).padStart(2, '0')}
            `,
            opacity: glowOpacity,
          }}
        />
      )}

      {/* Flash overlay */}
      {visualEffects.screenFlash && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-white pointer-events-none"
        />
      )}

      {/* Center animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <CenterAnimation
          animationType={visualEffects.centerAnimation}
          duration={visualEffects.animationDuration}
          color={visualEffects.borderColor}
          damage={targetDamage}
          isCritical={isCritical}
        />
      </div>

      {/* Particles */}
      {visualEffects.particleType !== 'none' && (
        <ParticleSystem
          particleType={visualEffects.particleType}
          count={visualEffects.particleCount || 15}
          duration={visualEffects.animationDuration}
          color={visualEffects.borderColor}
        />
      )}

      {/* Semi-transparent overlay darken */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black pointer-events-none"
      />
    </motion.div>
  )
}
