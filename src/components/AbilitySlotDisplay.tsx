import { motion } from 'framer-motion'
import { AbilityDefinition } from '../lib/services/abilityDefinitionService'
import AbilityButtonInsetContent from './AbilityButtonInsetContent'
import { abilityButtonAssets, ultimateButtonAssets } from '../lib/gameAssets'
import { EffectKind } from '../game/types'

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
 * Content placement is delegated to the shared AbilityButtonInsetContent so the
 * Dino Detail slots and the in-battle ability buttons stay pixel-aligned.
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
  const firstEffect = ability.effects?.[0] as EffectKind | undefined

  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative aspect-square bg-transparent border-0 p-0 cursor-pointer"
      style={rootStyle}
    >
      <AbilityButtonInsetContent
        icon={ability.icon}
        name={ability.name}
        kind={ability.kind}
        displayValue={displayValue}
        firstEffect={firstEffect}
      />
    </motion.button>
  )
}
