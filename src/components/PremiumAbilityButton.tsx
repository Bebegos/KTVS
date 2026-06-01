import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ability } from '../game/types'
import AbilityIcon from './AbilityIcon'
import AbilityPreview from './battle-effects/AbilityPreview'
import AbilityTypeIcon from './AbilityTypeIcon'
import EffectIcon from './EffectIcon'
import {
  abilityButtonAssets,
  ultimateButtonAssets,
  badgeAssets,
  borderGlowAssets,
} from '../lib/gameAssets'

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

  const heightClass = isUltimate ? 'h-16' : 'h-24'

  const frameStyle = {
    backgroundImage: `url('${getFrameImage()}')`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
  }

  // ----- Locked slot -----
  if (isLocked) {
    return (
      <div className={`relative ${heightClass}`}>
        <div
          className="relative w-full h-full flex flex-col items-center justify-center gap-1 opacity-80"
          style={frameStyle}
        >
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
    return (
      <div className={`relative ${heightClass}`}>
        <div
          className="relative w-full h-full flex flex-col items-center justify-center gap-1 opacity-90"
          style={frameStyle}
        >
          <span className="text-xl sm:text-2xl text-amber-900/50 font-black">+</span>
          <p className="text-[9px] sm:text-[10px] font-bold text-amber-900/50">Boş</p>
        </div>
      </div>
    )
  }

  const hasCooldown = cooldown > 0

  return (
    <div
      className={`relative ${heightClass}`}
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
        className={`relative w-full h-full flex flex-col items-start justify-between overflow-hidden bg-transparent border-0 ${
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

        {/* Content padded inside the ornate frame */}
        <div className="relative z-20 w-full h-full flex flex-col items-start justify-between px-2.5 py-2 sm:px-3">
          {/* Top row: slot index / ult badge + info */}
          <div className="flex items-center justify-between w-full">
            {isUltimate ? (
              <img src={badgeAssets.ultimate} alt="ULT" className="h-4 sm:h-5 object-contain" />
            ) : (
              <span className="text-[10px] sm:text-xs font-black text-amber-950/70">{index + 1}</span>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation()
                onInfo?.()
              }}
              className="text-xs sm:text-sm font-bold text-amber-900/60 hover:text-amber-900 transition leading-none"
            >
              ⓘ
            </button>
          </div>

          {/* Middle: ability icon + name */}
          <div className="flex items-center gap-1.5 w-full min-w-0 flex-1 py-0.5">
            <AbilityIcon iconId={ability.icon} size={isUltimate ? 'md' : 'sm'} />
            <p className="font-black text-[9px] sm:text-xs line-clamp-2 flex-1 text-amber-950 leading-tight">
              {ability.name}
            </p>
          </div>

          {/* Bottom: type icon + cooldown + effect icons */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1">
              <AbilityTypeIcon kind={ability.kind} size="xs" />
              {ability.cd > 0 && (
                <span className="text-[7px] sm:text-[9px] font-bold text-amber-900/70">
                  CD{ability.cd}
                </span>
              )}
            </div>

            {ability.effects && ability.effects.length > 0 && (
              <div className="flex gap-0.5">
                {ability.effects.slice(0, 3).map((effectKind, idx) => (
                  <EffectIcon key={idx} effect={effectKind} size="xs" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cooldown overlay with badge art */}
        {hasCooldown && (
          <div className="absolute inset-0 bg-slate-900/55 z-30 flex items-center justify-center">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center"
              style={{
                backgroundImage: `url('${badgeAssets.cooldown}')`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }}
            >
              <p className="text-lg sm:text-2xl font-black text-white drop-shadow-lg">{cooldown}</p>
            </div>
          </div>
        )}
      </motion.button>

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
