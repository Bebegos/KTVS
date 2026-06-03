import { ReactNode } from 'react'
import { modalAssets, borderGlowAssets, cornerAssets } from '../lib/gameAssets'

type GlowColor = 'gold' | 'cyan' | 'purple'

interface PremiumCardProps {
  children: ReactNode
  /**
   * 'frame'  → ornate wooden modal-card art (9-slice border-image, built-in corners)
   * 'panel'  → lighter parchment panel framed with the 4 ornate corner decorations
   */
  variant?: 'frame' | 'panel'
  /** Optional neon border-glow accent overlaid on the card edges. */
  glow?: GlowColor
  className?: string
  bodyClassName?: string
}

/**
 * Hearthstone-style content card.
 *
 * Frame art is applied with CSS border-image (9-slice) so the ornate corners
 * keep their native proportions while the card stretches to any height — the
 * PNG is never squashed out of ratio. The 'panel' variant instead lays the
 * four 48x48 corner-decoration PNGs at their native size over a parchment fill.
 */
export default function PremiumCard({
  children,
  variant = 'frame',
  glow,
  className = '',
  bodyClassName = '',
}: PremiumCardProps) {
  if (variant === 'frame') {
    return (
      <div className={`relative ${className}`}>
        <div
          className="h-full"
          style={{
            borderStyle: 'solid',
            borderWidth: '26px',
            borderImageSource: `url('${modalAssets.frame}')`,
            // No 'fill': keep only the ornate border; the interior is a uniform
            // parchment so components sit on a consistent background.
            borderImageSlice: '58',
            borderImageRepeat: 'stretch',
          }}
        >
          <div
            className={`relative h-full ${bodyClassName}`}
            style={{
              background: 'linear-gradient(180deg, #efe1c2 0%, #ddc89e 100%)',
              // Subtle inner gold hairline + warm inset depth to dress the parchment.
              boxShadow: 'inset 0 0 0 1.5px rgba(176,138,58,0.5), inset 0 1px 12px rgba(90,60,20,0.12)',
            }}
          >
            {children}
          </div>
        </div>
        {glow && <GlowOverlay color={glow} />}
      </div>
    )
  }

  // panel variant
  return (
    <div className={`relative ${className}`}>
      <div
        className={`relative rounded-2xl border-2 border-amber-900/50 ${bodyClassName}`}
        style={{
          background:
            'linear-gradient(180deg, rgba(232,220,192,0.97) 0%, rgba(214,196,158,0.97) 100%)',
          boxShadow: 'inset 0 0 24px rgba(120,80,30,0.25), 0 4px 14px rgba(0,0,0,0.4)',
        }}
      >
        {children}
      </div>

      {/* Native-size ornate corner decorations (48x48, never scaled). */}
      <img src={cornerAssets.tl} alt="" aria-hidden className="absolute -top-1 -left-1 w-7 h-7 sm:w-9 sm:h-9 pointer-events-none" />
      <img src={cornerAssets.tr} alt="" aria-hidden className="absolute -top-1 -right-1 w-7 h-7 sm:w-9 sm:h-9 pointer-events-none" />
      <img src={cornerAssets.bl} alt="" aria-hidden className="absolute -bottom-1 -left-1 w-7 h-7 sm:w-9 sm:h-9 pointer-events-none" />
      <img src={cornerAssets.br} alt="" aria-hidden className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-9 sm:h-9 pointer-events-none" />

      {glow && <GlowOverlay color={glow} />}
    </div>
  )
}

function GlowOverlay({ color }: { color: GlowColor }) {
  return (
    <div
      aria-hidden
      className="absolute -inset-1 pointer-events-none animate-pulse"
      style={{
        borderStyle: 'solid',
        borderWidth: '16px',
        borderImageSource: `url('${borderGlowAssets[color]}')`,
        borderImageSlice: '40',
        borderImageRepeat: 'stretch',
      }}
    />
  )
}
