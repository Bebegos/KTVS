// SVG Icon Library - Ability and Effect Icons
// Hearthstone-inspired professional icons

export interface SvgIcon {
  id: string
  name: string
  svg: string
  category: 'ability' | 'effect' | 'stat' | 'resource'
}

// ========== ABILITY ICONS ==========

export const ABILITY_ICONS: Record<string, SvgIcon> = {
  // Attack/Damage Abilities
  penca: {
    id: 'penca',
    name: 'Pençe',
    category: 'ability',
    svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="clawGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#d63031;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#clawGradient)" opacity="0.1"/>
      <path d="M32 8 L42 28 L35 35 L32 18 L29 35 L22 28 Z" fill="url(#clawGradient)" stroke="#d63031" stroke-width="1.5"/>
      <path d="M20 26 L12 32 L18 40" fill="none" stroke="#d63031" stroke-width="2" stroke-linecap="round"/>
      <path d="M44 26 L52 32 L46 40" fill="none" stroke="#d63031" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },

  isirma: {
    id: 'isirma',
    name: 'Isırma',
    category: 'ability',
    svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="biteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ff8c42;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e67e22;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#biteGradient)" opacity="0.1"/>
      <path d="M16 32 Q32 16 48 32 Q32 48 16 32" fill="url(#biteGradient)" stroke="#e67e22" stroke-width="1.5"/>
      <path d="M24 26 L28 32 L24 38" fill="#fff" opacity="0.6"/>
      <path d="M40 26 L44 32 L40 38" fill="#fff" opacity="0.6"/>
    </svg>`,
  },

  // Defense Abilities
  dikenli_zirh: {
    id: 'dikenli_zirh',
    name: 'Dikenli Zırh',
    category: 'ability',
    svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="armorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3498db;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2980b9;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#armorGradient)" opacity="0.1"/>
      <path d="M32 12 L48 20 L48 36 Q32 48 32 48 Q16 48 16 36 L16 20 Z" fill="url(#armorGradient)" stroke="#2980b9" stroke-width="1.5"/>
      <polygon points="32,16 36,22 32,26 28,22" fill="#fff" opacity="0.4"/>
      <line x1="24" y1="24" x2="20" y2="20" stroke="#fff" stroke-width="1.5" opacity="0.6"/>
      <line x1="40" y1="24" x2="44" y2="20" stroke="#fff" stroke-width="1.5" opacity="0.6"/>
    </svg>`,
  },

  // Healing
  heal: {
    id: 'heal',
    name: 'İyileştirme',
    category: 'ability',
    svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="healGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#2ecc71;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#27ae60;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#healGradient)" opacity="0.1"/>
      <circle cx="32" cy="32" r="18" fill="url(#healGradient)" stroke="#27ae60" stroke-width="1.5"/>
      <path d="M32 22 L32 42 M22 32 L42 32" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
  },

  regen: {
    id: 'regen',
    name: 'Yenileme',
    category: 'ability',
    svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="regenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#9b59b6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8e44ad;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#regenGradient)" opacity="0.1"/>
      <path d="M32 14 Q40 22 40 32 Q40 42 32 50 Q24 42 24 32 Q24 22 32 14" fill="url(#regenGradient)" stroke="#8e44ad" stroke-width="1.5"/>
      <circle cx="32" cy="32" r="6" fill="#fff" opacity="0.5"/>
    </svg>`,
  },

  // Speed/Status
  hiz: {
    id: 'hiz',
    name: 'Hız',
    category: 'ability',
    svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f1c40f;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f39c12;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#speedGradient)" opacity="0.1"/>
      <path d="M16 32 L28 24 L28 28 L48 28 L48 36 L28 36 L28 40 Z" fill="url(#speedGradient)" stroke="#f39c12" stroke-width="1.5"/>
      <circle cx="52" cy="32" r="4" fill="#f39c12"/>
    </svg>`,
  },

  // Crowd Control
  stun: {
    id: 'stun',
    name: 'Sersem',
    category: 'effect',
    svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="stunGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ecf0f1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#bdc3c7;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#stunGradient)" opacity="0.1"/>
      <circle cx="32" cy="32" r="20" fill="url(#stunGradient)" stroke="#7f8c8d" stroke-width="1.5"/>
      <path d="M32 16 L36 28 L32 32 Z" fill="#7f8c8d"/>
      <path d="M32 48 L36 36 L32 32 Z" fill="#7f8c8d"/>
      <path d="M16 32 L28 36 L32 32 Z" fill="#7f8c8d"/>
      <path d="M48 32 L36 36 L32 32 Z" fill="#7f8c8d"/>
    </svg>`,
  },

  poison: {
    id: 'poison',
    name: 'Zehir',
    category: 'effect',
    svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="poisonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#16a085;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#117a65;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#poisonGradient)" opacity="0.1"/>
      <path d="M32 14 Q40 18 40 28 Q40 38 32 44 Q24 38 24 28 Q24 18 32 14" fill="url(#poisonGradient)" stroke="#117a65" stroke-width="1.5"/>
      <path d="M28 24 Q32 20 36 24" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.7"/>
      <circle cx="32" cy="34" r="2" fill="#fff" opacity="0.7"/>
    </svg>`,
  },

  // Ultimate
  ultimate: {
    id: 'ultimate',
    name: 'Ultimate',
    category: 'ability',
    svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ultimateGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e74c3c;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#c0392b;stop-opacity:1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#ultimateGradient)" opacity="0.15" filter="url(#glow)"/>
      <path d="M32 10 L42 25 L50 32 L42 39 L32 54 L22 39 L14 32 L22 25 Z" fill="url(#ultimateGradient)" stroke="#c0392b" stroke-width="2" filter="url(#glow)"/>
      <circle cx="32" cy="32" r="6" fill="#fff" opacity="0.6"/>
    </svg>`,
  },
}

// ========== EFFECT ICONS ==========

export const EFFECT_ICONS: Record<string, SvgIcon> = {
  poison: ABILITY_ICONS.poison,
  stun: ABILITY_ICONS.stun,

  stop: {
    id: 'stop',
    name: 'Dur',
    category: 'effect',
    svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="stopGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e74c3c;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#c0392b;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#stopGradient)" opacity="0.1"/>
      <rect x="18" y="18" width="28" height="28" fill="url(#stopGradient)" stroke="#c0392b" stroke-width="2" rx="2"/>
    </svg>`,
  },

  heal: ABILITY_ICONS.heal,
  regen: ABILITY_ICONS.regen,

  defense_down: {
    id: 'defense_down',
    name: 'Zırh Zayıflatma',
    category: 'effect',
    svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="defdownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e67e22;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#d35400;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#defdownGradient)" opacity="0.1"/>
      <path d="M32 14 L44 22 L44 36 Q32 46 32 46 Q20 46 20 36 L20 22 Z" fill="url(#defdownGradient)" stroke="#d35400" stroke-width="1.5" opacity="0.5"/>
      <line x1="16" y1="48" x2="48" y2="16" stroke="#d35400" stroke-width="2"/>
    </svg>`,
  },

  paralyze: {
    id: 'paralyze',
    name: 'Felç',
    category: 'effect',
    svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="paralyzeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3498db;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2980b9;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#paralyzeGradient)" opacity="0.1"/>
      <circle cx="32" cy="32" r="18" fill="none" stroke="url(#paralyzeGradient)" stroke-width="2"/>
      <path d="M22 22 L42 42" stroke="url(#paralyzeGradient)" stroke-width="2"/>
      <path d="M42 22 L22 42" stroke="url(#paralyzeGradient)" stroke-width="2"/>
    </svg>`,
  },
}

// ========== STAT ICONS ==========

export const STAT_ICONS: Record<string, SvgIcon> = {
  hp: {
    id: 'hp',
    name: 'Can',
    category: 'stat',
    svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e74c3c;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#c0392b;stop-opacity:1" />
        </linearGradient>
      </defs>
      <path d="M32 12 L42 22 L42 42 Q32 52 32 52 Q22 52 22 42 L22 22 Z" fill="url(#hpGradient)" stroke="#c0392b" stroke-width="1.5"/>
      <path d="M26 28 L32 34 L38 28" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
    </svg>`,
  },

  atk: {
    id: 'atk',
    name: 'Saldırı',
    category: 'stat',
    svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="atkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f39c12;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e67e22;stop-opacity:1" />
        </linearGradient>
      </defs>
      <path d="M32 10 L42 28 L35 35 L32 18 L29 35 L22 28 Z" fill="url(#atkGradient)" stroke="#e67e22" stroke-width="1.5"/>
      <circle cx="32" cy="42" r="12" fill="none" stroke="url(#atkGradient)" stroke-width="2"/>
    </svg>`,
  },

  def: {
    id: 'def',
    name: 'Savunma',
    category: 'stat',
    svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="defGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3498db;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2980b9;stop-opacity:1" />
        </linearGradient>
      </defs>
      <path d="M32 10 L46 18 L46 34 Q32 44 32 44 Q18 44 18 34 L18 18 Z" fill="url(#defGradient)" stroke="#2980b9" stroke-width="1.5"/>
      <circle cx="32" cy="26" r="6" fill="#fff" opacity="0.5"/>
    </svg>`,
  },

  spd: {
    id: 'spd',
    name: 'Hız',
    category: 'stat',
    svg: ABILITY_ICONS.hiz,
  },

  xp: {
    id: 'xp',
    name: 'Deneyim',
    category: 'stat',
    svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#9b59b6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8e44ad;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="22" fill="url(#xpGradient)" stroke="#8e44ad" stroke-width="1.5"/>
      <path d="M32 20 L36 28 L44 28 L38 34 L40 42 L32 37 L24 42 L26 34 L20 28 L28 28 Z" fill="#fff" opacity="0.7"/>
    </svg>`,
  },

  coin: {
    id: 'coin',
    name: 'DinoCoin',
    category: 'stat',
    svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="coinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f1c40f;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f39c12;stop-opacity:1" />
        </linearGradient>
        <filter id="coinShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
      <circle cx="32" cy="32" r="24" fill="url(#coinGradient)" filter="url(#coinShadow)"/>
      <circle cx="32" cy="32" r="22" fill="url(#coinGradient)" stroke="#d4af37" stroke-width="1"/>
      <circle cx="28" cy="28" r="3" fill="#fff" opacity="0.6"/>
      <text x="32" y="38" font-size="16" font-weight="bold" text-anchor="middle" fill="#b8860b">$</text>
    </svg>`,
  },
}

// ========== UTILITY FUNCTIONS ==========

export function getAbilityIcon(abilityId: string): SvgIcon | undefined {
  return ABILITY_ICONS[abilityId.toLowerCase()]
}

export function getEffectIcon(effectId: string): SvgIcon | undefined {
  return EFFECT_ICONS[effectId.toLowerCase()] || ABILITY_ICONS[effectId.toLowerCase()]
}

export function getStatIcon(statId: string): SvgIcon | undefined {
  return STAT_ICONS[statId.toLowerCase()]
}

export function getSvgIconComponent(icon: SvgIcon | undefined, className: string = 'w-6 h-6') {
  if (!icon) return null
  return `<div class="${className}" dangerously-set-inner-html={{ __html: icon.svg }} />`
}
