import { AbilityType, EffectKind } from '../game/types'
import AbilityIcon from './AbilityIcon'
import AbilityTypeIcon from './AbilityTypeIcon'
import EffectIcon from './EffectIcon'

interface AbilityButtonInsetContentProps {
  icon?: string
  name: string
  kind: AbilityType
  /** The number shown in the left painted indent (damage / heal / power). */
  displayValue: number | string
  /** First effect shown in the right painted indent (falls back to the type icon). */
  firstEffect?: EffectKind
}

/**
 * The shared content layer for a premium ability/ultimate button.
 *
 * It positions the icon, name, value and effect onto the frame PNG's painted
 * zones using percentage insets (coordinates measured from the frame art) and
 * container-query (cqw) units so everything scales with the button at any size.
 *
 * Render this inside a positioned parent that has `containerType: inline-size`
 * and the frame art as its background. Used by both the Dino Detail slots and
 * the in-battle ability buttons so they stay pixel-aligned.
 */
export default function AbilityButtonInsetContent({
  icon,
  name,
  kind,
  displayValue,
  firstEffect,
}: AbilityButtonInsetContentProps) {
  // Single-line name: shrink font as the name gets longer (cqw), ellipsis if needed.
  const nameSize = Math.max(5, Math.min(9.5, 120 / Math.max(1, name.length)))

  return (
    <>
      {/* Ability icon — seated in the painted square indent (slightly inset + lowered) */}
      <div className="absolute left-[36%] top-[25%] w-[28%] h-[20%]">
        <AbilityIcon iconId={icon} fill />
      </div>

      {/* Ability name — single line, centered on the belt, auto-shrink + ellipsis */}
      <div className="absolute left-[17.5%] right-[17.5%] top-[57%] -translate-y-1/2 text-center">
        <span
          className="block truncate text-amber-950 font-black leading-none"
          style={{ fontSize: `${nameSize}cqw` }}
        >
          {name}
        </span>
      </div>

      {/* Left value box — direct damage / heal / power, centered on the painted indent */}
      <div className="absolute left-[37.5%] top-[63%] w-[11%] h-[14%] flex items-center justify-center">
        <span className="text-amber-950 font-black leading-none text-[9cqw]">{displayValue}</span>
      </div>

      {/* Right value box — first effect icon (or ability-type icon as fallback) */}
      <div className="absolute left-[51.5%] top-[63%] w-[11%] h-[14%] flex items-center justify-center overflow-hidden">
        {firstEffect ? (
          <EffectIcon effect={firstEffect} fill />
        ) : (
          <AbilityTypeIcon kind={kind} fill />
        )}
      </div>
    </>
  )
}
