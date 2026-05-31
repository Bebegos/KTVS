// Hearthstone-style class & spec medallion SVG icons
// Circular gold-ringed crests with symbolic glyphs (2014-era Hearthstone aesthetic)

export interface MedallionIcon {
  id: string
  name: string
  svg: string
}

// Shared gold medallion frame. Pass an inner glyph and a base color.
function medallion(innerGlyph: string, baseColor: string, baseDark: string, gradId: string): string {
  return `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="${gradId}_bg" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="${baseColor}"/>
        <stop offset="100%" stop-color="${baseDark}"/>
      </radialGradient>
      <linearGradient id="${gradId}_ring" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f5e1a4"/>
        <stop offset="45%" stop-color="#d4af37"/>
        <stop offset="100%" stop-color="#9c7a1e"/>
      </linearGradient>
    </defs>
    <!-- outer gold ring -->
    <circle cx="40" cy="40" r="37" fill="url(#${gradId}_ring)"/>
    <circle cx="40" cy="40" r="37" fill="none" stroke="#6b4a2b" stroke-width="1.5"/>
    <circle cx="40" cy="40" r="31" fill="none" stroke="#7a5e15" stroke-width="1"/>
    <!-- inner field -->
    <circle cx="40" cy="40" r="30" fill="url(#${gradId}_bg)"/>
    <!-- top sheen -->
    <ellipse cx="40" cy="26" rx="22" ry="10" fill="#ffffff" opacity="0.12"/>
    <!-- glyph -->
    ${innerGlyph}
  </svg>`
}

// ============= CLASS MEDALLIONS =============

export const CLASS_MEDALLIONS: Record<string, MedallionIcon> = {
  big_carnivore: {
    id: 'big_carnivore',
    name: 'Büyük Yırtıcı',
    svg: medallion(
      `<path d="M26 34 Q40 20 54 34 L50 40 Q40 30 30 40 Z" fill="#fff" opacity="0.92"/>
       <path d="M30 42 L34 54 L38 44 L40 56 L42 44 L46 54 L50 42 Q40 50 30 42 Z" fill="#fff" opacity="0.92"/>`,
      '#b5392c', '#6e1812', 'bigcarn'
    ),
  },
  raptor: {
    id: 'raptor',
    name: 'Raptor',
    svg: medallion(
      `<path d="M24 30 Q40 26 56 30 L48 40 L56 44 Q40 50 24 44 L32 40 Z" fill="#fff" opacity="0.92"/>
       <path d="M40 44 L37 58 L43 58 Z" fill="#fff" opacity="0.85"/>`,
      '#d97726', '#8a4410', 'raptor'
    ),
  },
  giant_herbivore: {
    id: 'giant_herbivore',
    name: 'Dev Otçul',
    svg: medallion(
      `<path d="M40 22 C30 30 30 44 40 58 C50 44 50 30 40 22 Z" fill="#fff" opacity="0.9"/>
       <path d="M40 28 L40 54" stroke="#1f6b3a" stroke-width="2" opacity="0.6"/>
       <path d="M40 38 L33 32 M40 44 L47 38" stroke="#1f6b3a" stroke-width="2" opacity="0.5"/>`,
      '#2f9e52', '#155f2e', 'herb'
    ),
  },
  flying_carnivore: {
    id: 'flying_carnivore',
    name: 'Uçan Yırtıcı',
    svg: medallion(
      `<path d="M40 30 L22 26 Q30 38 22 50 Q40 42 40 30 Z" fill="#fff" opacity="0.9"/>
       <path d="M40 30 L58 26 Q50 38 58 50 Q40 42 40 30 Z" fill="#fff" opacity="0.9"/>`,
      '#8e5cc4', '#4d2a78', 'fly'
    ),
  },
}

// ============= SPEC MEDALLIONS =============

export const SPEC_MEDALLIONS: Record<string, MedallionIcon> = {
  // Big Carnivore specs
  armored: {
    id: 'armored',
    name: 'Kalkanlı',
    svg: medallion(
      `<path d="M40 22 L56 28 L56 42 Q40 56 40 56 Q24 56 24 42 L24 28 Z" fill="#fff" opacity="0.92"/>
       <path d="M40 30 L40 48 M32 36 L48 36" stroke="#1b4f8c" stroke-width="3" stroke-linecap="round"/>`,
      '#3a78bb', '#1b4f8c', 'armored'
    ),
  },
  fire_spec: {
    id: 'fire_spec',
    name: 'Ateşli',
    svg: medallion(
      `<path d="M40 22 C34 32 46 34 40 44 C36 38 30 42 34 52 C28 46 30 36 36 30 C38 34 42 30 40 22 Z" fill="#fff" opacity="0.92"/>`,
      '#e0552b', '#8a2a10', 'firespec'
    ),
  },
  ultra_carnivore: {
    id: 'ultra_carnivore',
    name: 'Ultra Yırtıcı',
    svg: medallion(
      `<path d="M28 30 L34 52 L38 36 L40 54 L42 36 L46 52 L52 30 Q40 40 28 30 Z" fill="#fff" opacity="0.95"/>
       <circle cx="32" cy="30" r="2.5" fill="#fff"/><circle cx="48" cy="30" r="2.5" fill="#fff"/>`,
      '#9e1f1f', '#5a0e0e', 'ultracarn'
    ),
  },

  // Raptor specs
  speed_demon: {
    id: 'speed_demon',
    name: 'Hız Şeytanı',
    svg: medallion(
      `<path d="M44 20 L28 42 L38 42 L34 60 L52 36 L42 36 Z" fill="#fff" opacity="0.95"/>`,
      '#e8b620', '#9c7a1e', 'speeddemon'
    ),
  },
  poison_master: {
    id: 'poison_master',
    name: 'Zehir Ustası',
    svg: medallion(
      `<path d="M40 22 C30 34 28 44 40 56 C52 44 50 34 40 22 Z" fill="#fff" opacity="0.9"/>
       <circle cx="36" cy="42" r="2.5" fill="#5a1f7a"/><circle cx="44" cy="40" r="2" fill="#5a1f7a"/><circle cx="40" cy="48" r="2" fill="#5a1f7a"/>`,
      '#8e44ad', '#4a1f6e', 'poisonmaster'
    ),
  },
  pack_hunter: {
    id: 'pack_hunter',
    name: 'Sürü Avcısı',
    svg: medallion(
      `<circle cx="31" cy="36" r="7" fill="#fff" opacity="0.9"/>
       <circle cx="49" cy="36" r="7" fill="#fff" opacity="0.9"/>
       <circle cx="40" cy="50" r="7" fill="#fff" opacity="0.9"/>`,
      '#d97726', '#8a4410', 'packhunter'
    ),
  },

  // Giant Herbivore specs
  tank: {
    id: 'tank',
    name: 'Tank',
    svg: medallion(
      `<rect x="26" y="26" width="28" height="28" rx="4" fill="#fff" opacity="0.9"/>
       <rect x="32" y="32" width="16" height="16" rx="2" fill="none" stroke="#1b4f8c" stroke-width="3"/>`,
      '#3a78bb', '#1b4f8c', 'tank'
    ),
  },
  healer: {
    id: 'healer',
    name: 'İyileştirici',
    svg: medallion(
      `<path d="M40 24 L46 24 L46 36 L58 36 L58 44 L46 44 L46 56 L40 56 L40 44 L28 44 L28 36 L40 36 Z" fill="#fff" opacity="0.95"/>`,
      '#2f9e52', '#155f2e', 'healer'
    ),
  },
  earth_shaker: {
    id: 'earth_shaker',
    name: 'Yer Sarsıcısı',
    svg: medallion(
      `<path d="M22 48 L34 30 L40 40 L48 26 L58 48 Z" fill="#fff" opacity="0.9"/>
       <path d="M22 52 L58 52" stroke="#fff" stroke-width="3" opacity="0.6"/>`,
      '#a8742f', '#6b4423', 'earthshaker'
    ),
  },

  // Flying Carnivore specs
  storm_bringer: {
    id: 'storm_bringer',
    name: 'Fırtına Getirici',
    svg: medallion(
      `<path d="M30 24 Q22 32 28 38 Q20 40 24 48 L40 48 Q50 48 50 40 Q56 40 54 32 Q56 24 46 24 Q40 18 30 24 Z" fill="#fff" opacity="0.85"/>
       <path d="M42 44 L34 56 L40 52 L36 62" stroke="#e8b620" stroke-width="3" fill="none"/>`,
      '#5a6b8c', '#2e3a52', 'stormbringer'
    ),
  },
  wind_dancer: {
    id: 'wind_dancer',
    name: 'Rüzgar Dansçısı',
    svg: medallion(
      `<path d="M24 34 Q44 28 48 34 Q50 40 42 40 L24 40 Z" fill="#fff" opacity="0.85"/>
       <path d="M24 46 Q48 40 54 46 Q56 52 46 52 L24 52 Z" fill="#fff" opacity="0.85"/>`,
      '#3aa9c4', '#1b6478', 'winddancer'
    ),
  },
  sun_striker: {
    id: 'sun_striker',
    name: 'Güneş Darbesi',
    svg: medallion(
      `<circle cx="40" cy="40" r="10" fill="#fff" opacity="0.95"/>
       <g stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.9">
         <path d="M40 18 L40 26"/><path d="M40 54 L40 62"/><path d="M18 40 L26 40"/><path d="M54 40 L62 40"/>
         <path d="M25 25 L30 30"/><path d="M55 25 L50 30"/><path d="M25 55 L30 50"/><path d="M55 55 L50 50"/>
       </g>`,
      '#e8b620', '#b8860b', 'sunstriker'
    ),
  },
}

// ============= ACCESSORS =============

export function getClassMedallion(classId?: string): MedallionIcon | undefined {
  if (!classId) return undefined
  return CLASS_MEDALLIONS[classId]
}

export function getSpecMedallion(specId?: string): MedallionIcon | undefined {
  if (!specId) return undefined
  return SPEC_MEDALLIONS[specId]
}
