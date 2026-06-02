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
 * The frame art is square (256x256) and shown with a locked 1:1 aspect ratio
 * so it is never distorted. Filled slots use the base frame, empty slots use
 * the empty-slot art (ability) or disabled frame (ultimate).
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

  const frameStyle = {
    backgroundImage: `url('${frame}')`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
  }

  // Empty slot
  if (!ability) {
    return (
      <div className="relative aspect-square" style={frameStyle}>
        <div className="absolute inset-[16%] flex flex-col items-center justify-center text-center">
          {isUltimate ? (
            <img src={badgeAssets.ultimate} alt="ULT" className="h-4 sm:h-5 object-contain opacity-50" />
          ) : (
            <span className="text-2xl sm:text-3xl text-amber-900/40 font-black">+</span>
          )}
          <p className="text-[9px] sm:text-[10px] font-bold text-amber-900/40 mt-1">
            {isUltimate ? 'Ultimate Slot' : `Slot ${slotIndex + 1}`}
          </p>
        </div>
      </div>
    )
  }

  const baseValue = Math.floor((ability.damageMultiplier || 1) * atk)
  const isPower = ability.kind === 'buff' || ability.kind === 'debuff'
  const displayValue = isPower ? ability.damageMultiplier || 1 : baseValue

  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative aspect-square bg-transparent border-0 p-0 cursor-pointer"
      style={frameStyle}
    >
      {/* Content inset onto the parchment center */}
      <div className="absolute inset-[14%] flex flex-col items-center justify-between">
        {/* Top: slot label / ult badge */}
        <div className="w-full flex items-center justify-center">
          {isUltimate ? (
            <img src={badgeAssets.ultimate} alt="ULT" className="h-3.5 sm:h-4 object-contain" />
          ) : (
            <span className="text-[9px] sm:text-[10px] font-black text-amber-950/60">
              Slot {slotIndex + 1}
            </span>
          )}
        </div>

        {/* Middle: ability icon + name */}
        <div className="flex flex-col items-center gap-0.5 min-w-0">
          <AbilityIcon iconId={ability.icon} size={isUltimate ? 'lg' : 'md'} />
          <p className="text-[8px] sm:text-[10px] font-black text-amber-950 text-center line-clamp-2 leading-tight">
            {ability.name}
          </p>
        </div>

        {/* Bottom: type icon + value, effect icons */}
        <div className="w-full flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-1">
            <AbilityTypeIcon kind={ability.kind} size="xs" />
            <span className="text-[10px] sm:text-xs font-black text-amber-950">{displayValue}</span>
          </div>
          {ability.effects && ability.effects.length > 0 && (
            <div className="flex gap-0.5">
              {ability.effects.slice(0, 3).map((effect, idx) => (
                <EffectIcon key={idx} effect={effect} size="xs" />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.button>
  )
}
