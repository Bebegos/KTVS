import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ability } from '../game/types'
import AbilityIcon from './AbilityIcon'
import AbilityPreview from './battle-effects/AbilityPreview'
import SvgIcon from './SvgIcon'
import { getEffectEmoji } from '../lib/effect-translations'

interface PremiumAbilityButtonProps {
  ability: Ability | null
  index: number
  isUltimate?: boolean
  isSelected?: boolean
  isLocked?: boolean
  canUse?: boolean
  cooldown?: number
  maxCooldown?: number
  disabled?: boolean
  onClick?: () => void
  onInfo?: () => void
  lockedLevel?: number
}

export default function PremiumAbilityButton({
  ability,
  index,
  isUltimate = false,
  isSelected = false,
  isLocked = false,
  canUse = true,
  cooldown = 0,
  maxCooldown = 0,
  disabled = false,
  onClick,
  onInfo,
  lockedLevel,
}: PremiumAbilityButtonProps) {
  const [isHovering, setIsHovering] = useState(false)
  if (isLocked) {
    return (
      <motion.button
        disabled
        className={`relative p-3 rounded-xl font-bold transition flex flex-col items-center justify-center gap-2 ${
          isUltimate ? 'col-span-2 min-h-20' : 'min-h-24'
        } bg-gradient-to-b from-slate-700/20 to-slate-800/40 border-2 border-dashed border-slate-500/30 text-slate-400 opacity-40 cursor-not-allowed`}
      >
        <span className="text-2xl">🔒</span>
        <p className="text-xs font-bold">Kilitli</p>
        {lockedLevel && <p className="text-xs text-slate-400">Lvl {lockedLevel}</p>}
      </motion.button>
    )
  }

  if (!ability) {
    return (
      <motion.button
        disabled
        className={`relative p-3 rounded-xl font-bold transition flex flex-col items-center justify-center gap-2 ${
          isUltimate ? 'col-span-2 min-h-20' : 'min-h-24'
        } bg-gradient-to-b from-slate-800/30 to-slate-900/40 border-2 border-dashed border-neon-purple/20 text-neon-purple/40 opacity-60 cursor-not-allowed`}
      >
        <span className="text-2xl">➕</span>
        <p className="text-xs font-bold">Boş</p>
      </motion.button>
    )
  }

  const hasCooldown = cooldown > 0
  const cooldownPercent = maxCooldown > 0 ? (cooldown / maxCooldown) * 100 : 0
  const damage = Math.floor((ability.multiplier || 1) * 5) // Assuming base damage of 5

  return (
    <div
      className="relative"
      onMouseEnter={() => !disabled && setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <motion.button
        whileHover={{ scale: !disabled && !isSelected && canUse ? 1.03 : 1 }}
        whileTap={{ scale: !disabled && !isSelected && canUse ? 0.97 : 1 }}
        onClick={() => !disabled && canUse && onClick?.()}
        disabled={disabled || !canUse}
        className={`relative p-3 rounded-xl font-bold transition flex flex-col items-start gap-2 overflow-hidden ${
        isUltimate ? 'col-span-2 min-h-20' : 'min-h-24'
      } ${
        isSelected
          ? `bg-gradient-to-b ${
              isUltimate ? 'from-yellow-500/40 to-orange-600/40' : 'from-neon-cyan/40 to-neon-purple/40'
            } border-2 ${
              isUltimate ? 'border-yellow-400' : 'border-neon-cyan'
            } shadow-lg scale-105`
          : !canUse
          ? 'bg-gradient-to-b from-slate-700/20 to-slate-800/30 border-2 border-slate-500/30 text-slate-400 opacity-50 cursor-not-allowed'
          : `bg-gradient-to-b ${
              isUltimate
                ? 'from-yellow-600/30 to-orange-700/30'
                : 'from-neon-cyan/20 to-neon-purple/20'
            } border-2 ${
              isUltimate ? 'border-yellow-500/60' : 'border-neon-cyan/60'
            } hover:shadow-lg`
      }`}
    >
      {/* Background pattern */}
      <div
        className={`absolute inset-0 ${
          isUltimate ? 'bg-yellow-500/5' : 'bg-neon-cyan/5'
        } pointer-events-none`}
      />

      {/* Info button */}
      <motion.button
        whileHover={{ scale: 1.2 }}
        onClick={(e) => {
          e.stopPropagation()
          onInfo?.()
        }}
        className={`absolute top-2 right-2 text-lg transition font-bold text-sm z-10 ${
          isUltimate ? 'text-yellow-400 hover:text-yellow-300' : 'text-neon-cyan hover:text-neon-cyan/80'
        }`}
      >
        ⓘ
      </motion.button>

      {/* Slot label for non-ultimates */}
      {!isUltimate && (
        <div className={`absolute top-2 left-2 text-xs font-black ${
          isUltimate ? 'text-yellow-400' : 'text-neon-cyan'
        }`}>
          {index + 1}
        </div>
      )}

      {/* Ultimate label */}
      {isUltimate && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-black text-yellow-400 px-2 py-1 bg-yellow-600/30 rounded">
          👑 ULTIMATE
        </div>
      )}

      {/* Icon and name */}
      <div className="flex items-center gap-2 w-full mt-1 z-20">
        <AbilityIcon iconId={ability.icon} size={isUltimate ? 'md' : 'sm'} />
        <p className={`font-black text-xs line-clamp-2 ${
          isUltimate ? 'text-yellow-300' : 'text-neon-cyan'
        }`}>
          {ability.name}
        </p>
      </div>

      {/* Damage and cooldown info */}
      <div className={`text-xs space-y-1 w-full z-20 ${
        isUltimate ? 'text-yellow-200' : 'text-neon-cyan/80'
      }`}>
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold">⚔️ {damage} DMG</span>
          {ability.cd && ability.cd > 0 && (
            <span className="text-right text-xs">CD: {ability.cd}t</span>
          )}
        </div>

        {/* Effect icons */}
        {ability.effects && ability.effects.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-xs">Efekti:</span>
            <div className="flex gap-0.5">
              {ability.effects.slice(0, 3).map((effectKind, idx) => (
                <SvgIcon
                  key={idx}
                  id={effectKind}
                  type="effect"
                  size="xs"
                  fallback={getEffectEmoji(effectKind)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cooldown overlay */}
      {hasCooldown && (
        <div className="absolute inset-0 bg-slate-900/60 z-30 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-black text-white drop-shadow-lg">{cooldown}</p>
            <p className="text-xs font-bold text-slate-300">CD</p>
          </div>
        </div>
      )}

      {/* Cooldown progress bar (subtle) */}
      {maxCooldown > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700/50 z-20">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: `${100 - cooldownPercent}%` }}
            className={`h-full ${
              isUltimate ? 'bg-yellow-500' : 'bg-neon-cyan'
            }`}
          />
        </div>
      )}
      </motion.button>

      {/* Ability preview on hover */}
      <AnimatePresence>
        {isHovering && ability && (
          <AbilityPreview
            ability={ability}
            cooldown={cooldown}
            maxCooldown={maxCooldown}
            isAvailable={canUse}
            isLocked={isLocked}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
