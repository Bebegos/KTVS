import { motion } from 'framer-motion'
import { AbilityDefinition } from '../lib/services/abilityDefinitionService'
import AbilityIcon from './AbilityIcon'
import AbilityTypeIcon from './AbilityTypeIcon'
import EffectIcon from './EffectIcon'
import { abilityButtonAssets, ultimateButtonAssets } from '../lib/gameAssets'

interface AbilitySlotDisplayProps {
  ability: AbilityDefinition | null
  slotIndex: number
  atk: number
  isUltimate?: boolean
  onClick?: () => void
}

/**
 * Display-only ability slot rendered on the premium PNG button frame.
 *
 * Content is positioned with percentage insets onto the frame's painted zones
 * (icon square, name belt, two value boxes) and uses container-query (cqw)
 * units so it scales with the button at any size. The ability name is forced
 * to a single line, auto-shrinking its font with length and ellipsis-truncating
 * if still too long.
 */
export default function AbilitySlotDisplay({
  ability,
  slotIndex,
  atk,
  isUltimate = false,
  onClick,
}: AbilitySlotDisplayProps) {
  const frame = ability
    ? isUltimate
      ? ultimateButtonAssets.base
      : abilityButtonAssets.base
    : isUltimate
    ? ultimateButtonAssets.disabled
    : abilityButtonAssets.empty

  const rootStyle = {
    backgroundImage: `url('${frame}')`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
    containerType: 'inline-size' as const,
  }

  // Empty slot — just the frame art, no labels or plus signs.
  if (!ability) {
    return <div className="relative aspect-square" style={rootStyle} aria-hidden />
  }

  const baseValue = Math.floor((ability.damageMultiplier || 1) * atk)
  const isPower = ability.kind === 'buff' || ability.kind === 'debuff'
  const displayValue = isPower ? ability.damageMultiplier || 1 : baseValue
  const firstEffect = ability.effects?.[0]

  // Single-line name: shrink font as the name gets longer (cqw), ellipsis if needed.
  const nameSize = Math.max(5.5, Math.min(11, 142 / Math.max(1, ability.name.length)))

  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative aspect-square bg-transparent border-0 p-0 cursor-pointer"
      style={rootStyle}
    >
      {/* Ability icon — fills the painted square inset */}
      <div className="absolute left-[32%] top-[20%] w-[36%] h-[26%]">
        <AbilityIcon iconId={ability.icon} fill />
      </div>

      {/* Ability name — single line, centered on the belt, auto-shrink + ellipsis */}
      <div className="absolute left-[10%] right-[10%] top-[57%] -translate-y-1/2 text-center">
        <span
          className="block truncate text-amber-950 font-black leading-none"
          style={{ fontSize: `${nameSize}cqw` }}
        >
          {ability.name}
        </span>
      </div>

      {/* Left value box — the direct damage / heal / power value */}
      <div className="absolute left-[30%] top-[69%] w-[19%] h-[15%] flex items-center justify-center">
        <span className="text-amber-950 font-black leading-none text-[11cqw]">{displayValue}</span>
      </div>

      {/* Right value box — first effect icon (or ability-type icon as fallback) */}
      <div className="absolute left-[51%] top-[69%] w-[19%] h-[15%] flex items-center justify-center">
        {firstEffect ? (
          <EffectIcon effect={firstEffect} fill />
        ) : (
          <AbilityTypeIcon kind={ability.kind} fill />
        )}
      </div>
    </motion.button>
  )
}
