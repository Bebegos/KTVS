import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ActiveEffect, EffectKind } from '../../game/types'
import SvgIcon from '../SvgIcon'
import { getEffectNameTR } from '../../lib/effect-translations'

interface StatusEffectVisualizerProps {
  effects: ActiveEffect[]
  maxHp?: number
}

export default function StatusEffectVisualizer({ effects, maxHp }: StatusEffectVisualizerProps) {
  const [selectedEffect, setSelectedEffect] = useState<EffectKind | null>(null)

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
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedEffect(effectType)}
                className="w-12 h-12 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all"
                style={{
                  borderColor: color,
                  boxShadow: `0 0 15px ${color}40`,
                  background: `${color}15`,
                }}
              >
                <SvgIcon id={effectType} type="effect" size="sm" fallback={getEffectEmoji(effectType)} />
              </motion.button>

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

      {/* Effect detail modal */}
      <AnimatePresence>
        {selectedEffect && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEffect(null)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
            >
              <div className="bg-slate-900/95 backdrop-blur border-t-2 rounded-t-2xl p-4 space-y-3">
                {(() => {
                  const effect = effects.find((e) => e.type === selectedEffect)
                  if (!effect) return null

                  const color = getEffectColor(selectedEffect)
                  const durationType = getEffectDurationType(selectedEffect)

                  return (
                    <>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                          style={{
                            borderColor: color,
                            background: `${color}15`,
                          }}
                        >
                          <SvgIcon
                            id={selectedEffect}
                            type="effect"
                            size="sm"
                            fallback={getEffectEmoji(selectedEffect)}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-black text-sm" style={{ color }}>
                            {getEffectNameTR(selectedEffect)}
                          </h3>
                          <p className="text-xs opacity-70">
                            {durationType}: {effect.duration} {durationType === 'Turn' ? 'turn' : 'duration'}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedEffect(null)}
                          className="text-xl opacity-60 hover:opacity-100 transition"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="space-y-2 text-xs">
                        <p className="text-neon-cyan/80 italic leading-relaxed">
                          {getEffectDescription(selectedEffect)}
                        </p>

                        <div
                          className="p-2 rounded border"
                          style={{
                            borderColor: `${color}40`,
                            background: `${color}10`,
                            color: color,
                          }}
                        >
                          <p className="text-xs opacity-70">
                            {getEffectImpactDescription(selectedEffect)}
                          </p>
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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

function getEffectDescription(effectType: EffectKind): string {
  const descriptions: Record<EffectKind, string> = {
    poison: 'Causes damage over time. Reduces HP each turn.',
    stun: 'Prevents action next turn. Cannot attack or use abilities.',
    stop: 'Freezes the character. Unable to move or act.',
    power: 'Increases attack power. Deals more damage with abilities.',
    speed: 'Increases movement and action speed. Acts sooner in turn order.',
    shield: 'Reduces damage taken. Absorbs incoming harm.',
    heal: 'Restores HP. Recovers lost health.',
    regen: 'Regenerates HP over time. Heals each turn.',
    defense_down: 'Reduces defense. Takes increased damage.',
    paralyze: 'Paralyzed state. Reduces action effectiveness.',
    none: 'No effect.',
  }
  return descriptions[effectType]
}

function getEffectImpactDescription(effectType: EffectKind): string {
  const impacts: Record<EffectKind, string> = {
    poison: '1-2 damage per turn',
    stun: 'Skips next action',
    stop: 'Complete inability to act',
    power: '+15-20% damage boost',
    speed: '+20% faster actions',
    shield: '20-30% damage reduction',
    heal: 'Recovers health immediately',
    regen: '1-2 HP per turn',
    defense_down: '+10-15% damage taken',
    paralyze: '-30% action accuracy',
    none: 'No effect',
  }
  return impacts[effectType]
}
