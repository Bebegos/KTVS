import { motion } from 'framer-motion'
import { AbilityDefinition } from '../lib/services/abilityDefinitionService'
import AbilityIcon from './AbilityIcon'
import AbilityTypeIcon from './AbilityTypeIcon'
import EffectIcon from './EffectIcon'
import {
  abilityButtonAssets,
  ultimateButtonAssets,
  badgeAssets,
} from '../lib/gameAssets'

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
 * All content is positioned with PERCENTAGE insets that line up with the
 * painted regions of the frame art (icon square, name "belt", and the two
 * value boxes at the bottom), and font sizes use container-query units (cqw)
 * so everything scales perfectly with the button at any rendered size.
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

  // ---- Empty slot ----
  if (!ability) {
    return (
      <div className="relative aspect-square" style={rootStyle}>
        {/* Slot label (sits high, on the parchment top) */}
        <div className="absolute top-[11%] inset-x-0 text-center text-amber-900/55 font-black text-[8cqw]">
          {isUltimate ? 'ULTIMATE' : `Slot ${slotIndex + 1}`}
        </div>
        {/* Big empty icon box */}
        <div className="absolute left-[34%] top-[24%] w-[32%] h-[30%] flex items-center justify-center text-amber-900/30 font-black text-[26cqw]">
          +
        </div>
      </div>
    )
  }

  const baseValue = Math.floor((ability.damageMultiplier || 1) * atk)
  const isPower = ability.kind === 'buff' || ability.kind === 'debuff'
  const displayValue = isPower ? ability.damageMultiplier || 1 : baseValue
  const firstEffect = ability.effects?.[0]

  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative aspect-square bg-transparent border-0 p-0 cursor-pointer"
      style={rootStyle}
    >
      {/* Slot label / ULT badge — sits high on the parchment */}
      <div className="absolute top-[10%] inset-x-0 flex items-center justify-center">
        {isUltimate ? (
          <img src={badgeAssets.ultimate} alt="ULT" className="h-[9cqw] object-contain" />
        ) : (
          <span className="text-amber-900/55 font-black text-[8cqw] leading-none">
            Slot {slotIndex + 1}
          </span>
        )}
      </div>

      {/* Ability icon — fills the painted square inset (~3x previous size) */}
      <div className="absolute left-[34%] top-[23%] w-[32%] h-[30%]">
        <AbilityIcon iconId={ability.icon} fill />
      </div>

      {/* Ability name — vertically centered on the middle "belt" inset, larger & lower */}
      <div className="absolute left-[11%] right-[11%] top-[61%] -translate-y-1/2 text-center">
        <span className="block text-amber-950 font-black text-[9.5cqw] leading-[1.05] line-clamp-2">
          {ability.name}
        </span>
      </div>

      {/* Left value box — the direct damage / heal / power value */}
      <div className="absolute left-[33.5%] top-[71%] w-[15%] h-[15%] flex items-center justify-center">
        <span className="text-amber-950 font-black text-[11cqw] leading-none">{displayValue}</span>
      </div>

      {/* Right value box — first effect icon (filled, ~3x previous size) */}
      <div className="absolute left-[51.5%] top-[71%] w-[15%] h-[15%] flex items-center justify-center">
        {firstEffect ? (
          <EffectIcon effect={firstEffect} fill />
        ) : (
          <AbilityTypeIcon kind={ability.kind} fill />
        )}
      </div>
    </motion.button>
  )
}
