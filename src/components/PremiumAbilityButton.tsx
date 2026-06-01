import { useState, useRef } from 'react'
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
  const [isTouching, setIsTouching] = useState(false)
  const touchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTouchingRef = useRef(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!disabled && ability) {
      e.preventDefault()
      isTouchingRef.current = true

      // Show preview after 2 seconds of holding
      touchTimeoutRef.current = setTimeout(() => {
        if (isTouchingRef.current) {
          setIsTouching(true)
        }
      }, 2000)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    isTouchingRef.current = false

    // Clear timeout if finger released before 2 seconds
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current)
      touchTimeoutRef.current = null
    }

    // Hide preview when finger releases
    setIsTouching(false)
  }

  if (isLocked) {
    return (
      <div className={`relative ${isUltimate ? 'h-16' : 'h-24'}`}>
        <motion.button
          disabled
          className={`relative w-full h-full p-2 rounded-xl font-bold transition flex flex-col items-center justify-center gap-1 overflow-hidden ${
            isUltimate ? 'col-span-2' : ''
          } bg-gradient-to-b from-slate-700/20 to-slate-800/40 border-2 border-dashed border-slate-500/30 text-slate-400 opacity-40 cursor-not-allowed`}
        >
          <span className="text-xl sm:text-2xl">🔒</span>
          <p className="text-[10px] sm:text-xs font-bold line-clamp-1">Kilitli</p>
          {lockedLevel && <p className="text-[9px] text-slate-400">Lvl {lockedLevel}</p>}
        </motion.button>
      </div>
    )
  }

  if (!ability) {
    return (
      <div className={`relative ${isUltimate ? 'h-16' : 'h-24'}`}>
        <motion.button
          disabled
          className={`relative w-full h-full p-2 rounded-xl font-bold transition flex flex-col items-center justify-center gap-1 overflow-hidden ${
            isUltimate ? 'col-span-2' : ''
          } bg-gradient-to-b from-slate-800/30 to-slate-900/40 border-2 border-dashed border-neon-purple/20 text-neon-purple/40 opacity-60 cursor-not-allowed`}
        >
          <span className="text-xl sm:text-2xl">➕</span>
          <p className="text-[10px] sm:text-xs font-bold">Boş</p>
        </motion.button>
      </div>
    )
  }

  const hasCooldown = cooldown > 0
  const cooldownPercent = maxCooldown > 0 ? (cooldown / maxCooldown) * 100 : 0

  // Get ability type emoji
  const getAbilityEmoji = () => {
    switch (ability.kind) {
      case 'heal':
        return '💚'
      case 'buff':
        return '✨'
      case 'debuff':
        return '⚫'
      case 'utility':
        return '🔧'
      case 'ultimate':
        return '👑'
      case 'passive':
        return '🛡️'
      case 'attack':
      default:
        return '⚔️'
    }
  }

  return (
    <div
      className={`relative ${isUltimate ? 'h-16' : 'h-24'}`}
      onMouseEnter={() => !disabled && setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <motion.button
        whileHover={{ scale: !disabled && !isSelected && canUse ? 1.03 : 1 }}
        whileTap={{ scale: !disabled && !isSelected && canUse ? 0.97 : 1 }}
        onClick={() => !disabled && canUse && onClick?.()}
        disabled={disabled || !canUse}
        className={`relative w-full h-full p-2 sm:p-3 rounded-xl font-bold transition flex flex-col items-start gap-1 overflow-hidden justify-between ${
          isUltimate ? 'col-span-2' : ''
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
          className={`absolute top-1 right-1 sm:top-2 sm:right-2 text-xs sm:text-lg transition font-bold z-10 ${
            isUltimate ? 'text-yellow-400 hover:text-yellow-300' : 'text-neon-cyan hover:text-neon-cyan/80'
          }`}
        >
          ⓘ
        </motion.button>

        {/* Slot label for non-ultimates */}
        {!isUltimate && (
          <div className={`absolute top-1 left-1 sm:top-2 sm:left-2 text-[10px] sm:text-xs font-black ${
            isUltimate ? 'text-yellow-400' : 'text-neon-cyan'
          }`}>
            {index + 1}
          </div>
        )}

        {/* Ultimate label */}
        {isUltimate && (
          <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] sm:text-xs font-black text-yellow-400 px-1 py-0.5 bg-yellow-600/30 rounded">
            👑 ULT
          </div>
        )}

        {/* Icon and name */}
        <div className="flex items-center gap-1 w-full mt-0.5 z-20 flex-1 min-w-0">
          <AbilityIcon iconId={ability.icon} size={isUltimate ? 'md' : 'sm'} />
          <p className={`font-black text-[9px] sm:text-xs line-clamp-2 flex-1 ${
            isUltimate ? 'text-yellow-300' : 'text-neon-cyan'
          }`}>
            {ability.name}
          </p>
        </div>

        {/* Bottom info section */}
        <div className={`text-[8px] sm:text-xs w-full z-20 flex items-center gap-1 justify-between ${
          isUltimate ? 'text-yellow-200' : 'text-neon-cyan/80'
        }`}>
          <div className="flex items-center gap-0.5">
            <span className="text-sm">{getAbilityEmoji()}</span>
            {ability.cd && ability.cd > 0 && (
              <span className="text-[7px] sm:text-xs">CD:{ability.cd}</span>
            )}
          </div>

          {/* Effect icons */}
          {ability.effects && ability.effects.length > 0 && (
            <div className="flex gap-0.5">
              {ability.effects.slice(0, 2).map((effectKind, idx) => (
                <SvgIcon
                  key={idx}
                  id={effectKind}
                  type="effect"
                  size="xs"
                  fallback={getEffectEmoji(effectKind)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Cooldown overlay */}
        {hasCooldown && (
          <div className="absolute inset-0 bg-slate-900/60 z-30 flex items-center justify-center rounded-xl">
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-black text-white drop-shadow-lg">{cooldown}</p>
              <p className="text-[9px] sm:text-xs font-bold text-slate-300">CD</p>
            </div>
          </div>
        )}

        {/* Cooldown progress bar */}
        {maxCooldown > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-slate-700/50 z-20 rounded-b-xl overflow-hidden">
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

      {/* Ability preview on hover (desktop) or touch (mobile) */}
      <AnimatePresence>
        {(isHovering || isTouching) && ability && (
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
