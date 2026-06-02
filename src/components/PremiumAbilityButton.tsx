import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ability, EffectKind } from '../game/types'
import AbilityButtonInsetContent from './AbilityButtonInsetContent'
import AbilityPreview from './battle-effects/AbilityPreview'
import {
  abilityButtonAssets,
  ultimateButtonAssets,
  badgeAssets,
  borderGlowAssets,
} from '../lib/gameAssets'

interface PremiumAbilityButtonProps {
  ability: Ability | null
  index: number
  /** Player attack stat, used to show the damage value in the left indent. */
  atk?: number
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
  atk = 0,
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

  // Resolve which frame PNG to show for the current state.
  const getFrameImage = () => {
    if (isUltimate) {
      if (isLocked || disabled || !canUse) return ultimateButtonAssets.disabled
      if (isSelected) return ultimateButtonAssets.selected
      return ultimateButtonAssets.base
    }
    if (isLocked) return abilityButtonAssets.disabled
    if (!ability) return abilityButtonAssets.empty
    if (disabled || !canUse) return abilityButtonAssets.disabled
    if (isSelected) return abilityButtonAssets.selected
    if (isHovering) return abilityButtonAssets.hover
    return abilityButtonAssets.base
  }

  // Square button that matches the Dino Detail slots; capped so it stays compact
  // in the battle action bar. Container query enables the cqw-scaled content.
  const rootClass = 'relative w-full aspect-square max-w-[132px] mx-auto'
  const frameStyle = {
    backgroundImage: `url('${getFrameImage()}')`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
    containerType: 'inline-size' as const,
  }

  // ----- Locked slot -----
  if (isLocked) {
    return (
      <div className={rootClass} style={frameStyle}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-80">
          <img src={badgeAssets.locked} alt="locked" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
          {lockedLevel && (
            <p className="text-[9px] sm:text-[10px] font-black text-amber-950/80">Lvl {lockedLevel}</p>
          )}
        </div>
      </div>
    )
  }

  // ----- Empty slot -----
  if (!ability) {
    return <div className={rootClass} style={frameStyle} aria-hidden />
  }

  const hasCooldown = cooldown > 0
  const baseValue = Math.floor((ability.multiplier || 1) * atk)
  const isPower = ability.kind === 'buff' || ability.kind === 'debuff'
  const displayValue = isPower ? ability.multiplier || 1 : baseValue
  const firstEffect = ability.effects?.[0] as EffectKind | undefined

  return (
    <div
      className={rootClass}
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
        className={`relative w-full h-full bg-transparent border-0 p-0 ${
          !canUse ? 'cursor-not-allowed' : ''
        }`}
        style={frameStyle}
      >
        {/* Neon glow overlay when selected */}
        {isSelected && (
          <img
            src={isUltimate ? borderGlowAssets.gold : borderGlowAssets.cyan}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-fill pointer-events-none animate-pulse z-10"
          />
        )}

        {/* Frame-aligned content (identical to the Dino Detail slots) */}
        <AbilityButtonInsetContent
          icon={ability.icon}
          name={ability.name}
          kind={ability.kind}
          displayValue={displayValue}
          firstEffect={firstEffect}
        />

        {/* Slot index — small, on the top-left of the ornate border (regular only) */}
        {!isUltimate && (
          <span className="absolute left-[9%] top-[6%] z-20 text-[9cqw] font-black text-amber-950/70 leading-none">
            {index + 1}
          </span>
        )}

        {/* Cooldown overlay with badge art */}
        {hasCooldown && (
          <div className="absolute inset-0 bg-slate-900/55 z-30 flex items-center justify-center">
            <div
              className="w-1/2 aspect-square flex items-center justify-center"
              style={{
                backgroundImage: `url('${badgeAssets.cooldown}')`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }}
            >
              <p className="text-[22cqw] font-black text-white drop-shadow-lg leading-none">{cooldown}</p>
            </div>
          </div>
        )}
      </motion.button>

      {/* Info button — small, on the top-right of the ornate border */}
      {onInfo && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onInfo()
          }}
          className="absolute right-[6%] top-[5%] z-40 text-[10cqw] font-bold text-amber-900/60 hover:text-amber-900 transition leading-none"
          aria-label="Yetenek bilgisi"
        >
          ⓘ
        </button>
      )}

      {/* Ability preview on hover (desktop) or 2s long-press (mobile) */}
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
