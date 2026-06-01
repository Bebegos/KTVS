import { motion } from 'framer-motion'
import { Ability } from '../../game/types'
import { battleVisualService } from '../../lib/services/battleVisualService'
import AbilityIcon from '../AbilityIcon'
import SvgIcon from '../SvgIcon'
import { getEffectNameTR } from '../../lib/effect-translations'

interface AbilityPreviewProps {
  ability: Ability
  cooldown?: number
  maxCooldown?: number
  damage?: number
  isAvailable?: boolean
  isLocked?: boolean
}

export default function AbilityPreview({
  ability,
  cooldown = 0,
  maxCooldown = 0,
  damage = 10,
  isAvailable = true,
  isLocked = false,
}: AbilityPreviewProps) {
  const visuals = battleVisualService.getVisualEffects(ability)
  const hasCooldown = cooldown > 0
  const hasEffects = ability.effects && ability.effects.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ type: 'spring', bounce: 0.3, duration: 0.3 }}
      className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-72 pointer-events-none z-50"
    >
      <div
        className="rounded-xl border-2 p-4 space-y-3 shadow-2xl"
        style={{
          borderColor: visuals.borderColor,
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: `0 0 30px ${visuals.borderColor}40, inset 0 0 20px ${visuals.borderColor}20`,
        }}
      >
        {/* Header with icon and name */}
        <div className="flex items-center gap-3">
          <AbilityIcon iconId={ability.icon} size="md" />
          <div className="flex-1">
            <h4 className="font-black text-sm" style={{ color: visuals.borderColor }}>
              {ability.name}
            </h4>
            <p className="text-xs text-neon-cyan/70 capitalize">{ability.kind}</p>
          </div>
        </div>

        {/* Description */}
        {ability.description && (
          <p className="text-xs text-neon-cyan/80 italic leading-relaxed">{ability.description}</p>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Damage/Heal/Effect Power */}
          {ability.kind === 'heal' ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded p-2">
              <p className="text-green-400/70">Healing</p>
              <p className="font-black text-green-300">
                {Math.floor((ability.multiplier || 1) * 5)} - {Math.floor((ability.multiplier || 1) * 6)}
              </p>
            </div>
          ) : ability.kind === 'buff' ? (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
              <p className="text-blue-400/70">Buff Power</p>
              <p className="font-black text-blue-300">
                {Math.floor((ability.multiplier || 1) * 5)} - {Math.floor((ability.multiplier || 1) * 6)}
              </p>
            </div>
          ) : ability.kind === 'debuff' ? (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded p-2">
              <p className="text-purple-400/70">Debuff Power</p>
              <p className="font-black text-purple-300">
                {Math.floor((ability.multiplier || 1) * 5)} - {Math.floor((ability.multiplier || 1) * 6)}
              </p>
            </div>
          ) : (
            <div className="bg-red-500/10 border border-red-500/30 rounded p-2">
              <p className="text-red-400/70">Damage</p>
              <p className="font-black text-red-300">
                {Math.floor((ability.multiplier || 1) * 5)} - {Math.floor((ability.multiplier || 1) * 6)}
              </p>
            </div>
          )}

          {/* Cooldown */}
          <div
            className="rounded p-2"
            style={{
              backgroundColor: `${visuals.borderColor}15`,
              border: `1px solid ${visuals.borderColor}40`,
            }}
          >
            <p style={{ color: `${visuals.borderColor}80` }}>Cooldown</p>
            <p className="font-black" style={{ color: visuals.borderColor }}>
              {ability.cd || 0} turns
            </p>
          </div>
        </div>

        {/* Effects */}
        {hasEffects && (
          <div className="space-y-1">
            <p className="text-xs font-bold text-purple-300">✨ Effects</p>
            <div className="flex flex-wrap gap-1">
              {ability.effects.map((effect) => (
                <div
                  key={effect}
                  className="flex items-center gap-1 bg-purple-500/10 border border-purple-500/30 rounded px-2 py-1"
                >
                  <SvgIcon id={effect} type="effect" size="xs" fallback="•" />
                  <span className="text-xs text-purple-300">{getEffectNameTR(effect)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Animation type */}
        <div
          className="text-xs p-2 rounded border"
          style={{
            backgroundColor: `${visuals.borderColor}15`,
            borderColor: `${visuals.borderColor}40`,
            color: visuals.borderColor,
          }}
        >
          <p className="font-bold">
            {battleVisualService.getAnimationDisplayName(visuals.centerAnimation)}
          </p>
        </div>

        {/* Status */}
        {hasCooldown && (
          <div className="bg-red-500/20 border border-red-500/50 rounded p-2">
            <p className="text-xs font-bold text-red-300">⏱️ On Cooldown</p>
            <p className="text-xs text-red-300/70">{cooldown} turns remaining</p>
          </div>
        )}

        {isLocked && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded p-2">
            <p className="text-xs font-bold text-yellow-300">🔒 Locked</p>
            <p className="text-xs text-yellow-300/70">Unlock with higher level</p>
          </div>
        )}

        {!isAvailable && (
          <div className="bg-slate-500/20 border border-slate-500/50 rounded p-2">
            <p className="text-xs font-bold text-slate-300">⛔ Not Available</p>
          </div>
        )}

        {/* Arrow pointer */}
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1 w-0 h-0"
          style={{
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: `10px solid rgba(15, 23, 42, 0.95)`,
          }}
        />
      </div>
    </motion.div>
  )
}
