import { motion } from 'framer-motion'
import { ActiveEffect, EffectKind } from '../../game/types'
import SvgIcon from '../SvgIcon'
import { getEffectNameTR } from '../../lib/effect-translations'

interface StatusEffectVisualizerProps {
  effects: ActiveEffect[]
  maxHp?: number
}

export default function StatusEffectVisualizer({ effects, maxHp }: StatusEffectVisualizerProps) {
  if (!effects || effects.length === 0) {
    return null
  }

  // Group effects by type
  const effectCounts: Record<EffectKind, number> = {} as Record<EffectKind, number>
  effects.forEach((effect) => {
    effectCounts[effect.type] = (effectCounts[effect.type] || 0) + 1
  })

  const uniqueEffects = Object.entries(effectCounts)
  const maxEffectsShown = 3

  return (
    <div className="flex flex-col gap-2 mt-3">
      {/* Effect aura rings */}
      <div className="relative h-16 flex items-center justify-center">
        {uniqueEffects.slice(0, maxEffectsShown).map((entry, idx) => {
          const [effectType] = entry as [EffectKind, number]
          const color = getEffectColor(effectType)
          const offset = idx * 35

          return (
            <motion.div
              key={effectType}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="absolute"
              style={{ left: `${offset}px` }}
            >
              <div
                className="w-12 h-12 rounded-full border-2 flex items-center justify-center"
                style={{
                  borderColor: color,
                  boxShadow: `0 0 15px ${color}40`,
                  background: `${color}15`,
                }}
              >
                <SvgIcon id={effectType} type="effect" size="sm" fallback={getEffectEmoji(effectType)} />
              </div>

              {/* Pulsing ring animation */}
              <motion.div
                className="absolute inset-0 rounded-full border-2"
                style={{ borderColor: color }}
                initial={{ r: 0, opacity: 0.8 }}
                animate={{ r: 30, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          )
        })}

        {/* More indicator */}
        {uniqueEffects.length > maxEffectsShown && (
          <motion.div
            className="absolute text-xs font-black text-neon-cyan"
            style={{ left: `${maxEffectsShown * 35}px` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            +{uniqueEffects.length - maxEffectsShown}
          </motion.div>
        )}
      </div>

      {/* Effect details */}
      <div className="space-y-1 text-xs">
        {uniqueEffects.slice(0, maxEffectsShown).map(([effectType, count]) => {
          const typedEffectType = effectType as EffectKind
          const effect = effects.find((e) => e.type === typedEffectType)
          if (!effect) return null

          const color = getEffectColor(typedEffectType)
          const durationType = getEffectDurationType(typedEffectType)

          return (
            <motion.div
              key={effectType}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between px-2 py-1 rounded border"
              style={{
                borderColor: `${color}60`,
                background: `${color}10`,
                color: color,
              }}
            >
              <span className="font-bold">{getEffectNameTR(typedEffectType)}</span>
              <div className="flex gap-2">
                {count > 1 && <span className="text-xs opacity-70">×{count}</span>}
                <span className="text-xs opacity-70">
                  {durationType}: {effect.duration}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function getEffectColor(effectType: EffectKind): string {
  const colors: Record<EffectKind, string> = {
    poison: '#a855f7',
    stun: '#fbbf24',
    stop: '#06b6d4',
    power: '#ef4444',
    speed: '#06b6d4',
    shield: '#3b82f6',
    heal: '#22c55e',
    regen: '#22c55e',
    defense_down: '#f97316',
    paralyze: '#fbbf24',
    none: '#9ca3af',
  }
  return colors[effectType]
}

function getEffectDurationType(effectType: EffectKind): string {
  if (['poison', 'regen', 'defense_down'].includes(effectType)) {
    return 'Turn'
  }
  return 'Duration'
}

function getEffectEmoji(effectType: EffectKind): string {
  const emojis: Record<EffectKind, string> = {
    poison: '☠️',
    stun: '⚡',
    stop: '❄️',
    power: '💪',
    speed: '🏃',
    shield: '🛡️',
    heal: '💚',
    regen: '🌿',
    defense_down: '📉',
    paralyze: '⚡',
    none: '•',
  }
  return emojis[effectType]
}
