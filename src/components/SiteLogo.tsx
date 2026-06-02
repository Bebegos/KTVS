import { homeAssets } from '../lib/gameAssets'

interface SiteLogoProps {
  size?: number
  className?: string
}

/**
 * Dino-RP site logo — the premium PNG emblem (roaring dino skull over crossed
 * primal weapons in an ornate gold crest).
 */
export default function SiteLogo({ size = 220, className = '' }: SiteLogoProps) {
  return (
    <img
      src={homeAssets.logo}
      alt="Dinozor Savaş"
      className={`object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] ${className}`}
      style={{ width: size, height: size }}
      draggable={false}
    />
  )
}
