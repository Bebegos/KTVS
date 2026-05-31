interface SiteLogoProps {
  size?: number
  className?: string
}

/**
 * Dino-RP site logo — rustic Hearthstone-style emblem.
 * Two T-Rex heads clashing inside an ornate gold-ringed wooden medallion,
 * with a stone banner. Fully self-contained SVG (no external assets).
 */
export default function SiteLogo({ size = 220, className = '' }: SiteLogoProps) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <radialGradient id="logoWood" cx="50%" cy="42%" r="62%">
            <stop offset="0%" stopColor="#6b4a2b" />
            <stop offset="60%" stopColor="#3a2614" />
            <stop offset="100%" stopColor="#1c1208" />
          </radialGradient>
          <linearGradient id="logoGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f7e7a8" />
            <stop offset="45%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#8f6e16" />
          </linearGradient>
          <linearGradient id="logoGoldV" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f7e7a8" />
            <stop offset="100%" stopColor="#9c7a1e" />
          </linearGradient>
          <radialGradient id="clash" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff6d5" />
            <stop offset="40%" stopColor="#ffd24a" />
            <stop offset="100%" stopColor="#e8821b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="dinoBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3f7d4a" />
            <stop offset="100%" stopColor="#1f4a28" />
          </linearGradient>
          <linearGradient id="dinoBody2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#b5532c" />
            <stop offset="100%" stopColor="#6e2912" />
          </linearGradient>
          <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.55" />
          </filter>
        </defs>

        {/* ===== Ornate gold ring ===== */}
        <circle cx="120" cy="112" r="98" fill="url(#logoGold)" filter="url(#logoShadow)" />
        <circle cx="120" cy="112" r="98" fill="none" stroke="#6b4a2b" strokeWidth="3" />
        <circle cx="120" cy="112" r="86" fill="none" stroke="#7a5e15" strokeWidth="2" />
        {/* rivets around the ring */}
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2
          const x = 120 + Math.cos(a) * 92
          const y = 112 + Math.sin(a) * 92
          return <circle key={i} cx={x} cy={y} r="2.4" fill="#5a3d23" />
        })}

        {/* ===== Wooden inner field ===== */}
        <circle cx="120" cy="112" r="84" fill="url(#logoWood)" />
        {/* wood grain streaks */}
        <g stroke="#000" strokeOpacity="0.18" strokeWidth="1.5" fill="none">
          <path d="M44 95 Q120 88 196 95" />
          <path d="M40 118 Q120 110 200 118" />
          <path d="M46 142 Q120 134 194 142" />
          <path d="M54 165 Q120 158 186 165" />
        </g>

        {/* central clash flash */}
        <circle cx="120" cy="116" r="40" fill="url(#clash)" />

        {/* ===== Left dino (green) facing right ===== */}
        <g filter="url(#logoShadow)">
          <path
            d="M58 150
               Q56 120 78 104
               Q70 96 60 96
               Q72 88 86 92
               Q96 78 116 86
               L108 100
               Q116 104 116 116
               L100 116
               L104 124
               L92 124
               Q86 140 70 146
               Q66 150 58 150 Z"
            fill="url(#dinoBody)"
            stroke="#143018"
            strokeWidth="2"
          />
          {/* eye */}
          <circle cx="86" cy="100" r="3.4" fill="#ffe24a" />
          <circle cx="86" cy="100" r="1.5" fill="#1c1208" />
          {/* teeth */}
          <path d="M100 116 l4 6 l4 -6 l4 6 l4 -6" fill="#fff" stroke="#143018" strokeWidth="0.6" />
        </g>

        {/* ===== Right dino (red) facing left ===== */}
        <g filter="url(#logoShadow)">
          <path
            d="M182 150
               Q184 120 162 104
               Q170 96 180 96
               Q168 88 154 92
               Q144 78 124 86
               L132 100
               Q124 104 124 116
               L140 116
               L136 124
               L148 124
               Q154 140 170 146
               Q174 150 182 150 Z"
            fill="url(#dinoBody2)"
            stroke="#3a1208"
            strokeWidth="2"
          />
          <circle cx="154" cy="100" r="3.4" fill="#ffe24a" />
          <circle cx="154" cy="100" r="1.5" fill="#1c1208" />
          <path d="M140 116 l-4 6 l-4 -6 l-4 6 l-4 -6" fill="#fff" stroke="#3a1208" strokeWidth="0.6" />
        </g>

        {/* clash spark lines */}
        <g stroke="#fff6d5" strokeWidth="3" strokeLinecap="round" opacity="0.95">
          <path d="M120 92 l0 -10" />
          <path d="M112 98 l-7 -7" />
          <path d="M128 98 l7 -7" />
        </g>

        {/* ===== Banner ribbon ===== */}
        <g filter="url(#logoShadow)">
          <path
            d="M30 188 L210 188 L198 214 L42 214 Z"
            fill="url(#logoGoldV)"
            stroke="#6b4a2b"
            strokeWidth="2"
          />
          {/* ribbon tails */}
          <path d="M30 188 L16 200 L30 200 Z" fill="#9c7a1e" />
          <path d="M210 188 L224 200 L210 200 Z" fill="#9c7a1e" />
          <text
            x="120"
            y="207"
            textAnchor="middle"
            fontFamily="Cinzel, Georgia, serif"
            fontWeight="900"
            fontSize="22"
            fill="#3a2614"
            letterSpacing="3"
          >
            DINO-RP
          </text>
        </g>
      </svg>
    </div>
  )
}
