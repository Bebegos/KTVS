// Complete icon library for classes, specs, and abilities
// Single source of truth for all visual icons

export interface IconSet {
  id: string
  emoji: string
  label: string
  color: string
}

// ============= CLASS ICONS =============
export const CLASS_ICONS: Record<string, IconSet> = {
  big_carnivore: {
    id: 'big_carnivore',
    emoji: '🦖',
    label: 'Büyük Yırtıcı',
    color: 'text-red-500',
  },
  raptor: {
    id: 'raptor',
    emoji: '🦅',
    label: 'Raptor',
    color: 'text-orange-500',
  },
  giant_herbivore: {
    id: 'giant_herbivore',
    emoji: '🦣',
    label: 'Dev Otçul',
    color: 'text-green-500',
  },
  flying_carnivore: {
    id: 'flying_carnivore',
    emoji: '🪶',
    label: 'Uçan Yırtıcı',
    color: 'text-purple-500',
  },
}

// ============= SPEC ICONS =============
export const SPEC_ICONS: Record<string, IconSet> = {
  // Big Carnivore Specs
  armored: {
    id: 'armored',
    emoji: '🛡️',
    label: 'Kalkanlı',
    color: 'text-blue-500',
  },
  fire_spec: {
    id: 'fire_spec',
    emoji: '🔥',
    label: 'Ateşli',
    color: 'text-red-600',
  },
  ultra_carnivore: {
    id: 'ultra_carnivore',
    emoji: '👹',
    label: 'Ultra Yırtıcı',
    color: 'text-red-700',
  },

  // Raptor Specs
  speed_demon: {
    id: 'speed_demon',
    emoji: '⚡',
    label: 'Hız Şeytanı',
    color: 'text-yellow-500',
  },
  poison_master: {
    id: 'poison_master',
    emoji: '☠️',
    label: 'Zehir Ustası',
    color: 'text-purple-600',
  },
  pack_hunter: {
    id: 'pack_hunter',
    emoji: '👥',
    label: 'Sürü Avcısı',
    color: 'text-orange-600',
  },

  // Giant Herbivore Specs
  tank: {
    id: 'tank',
    emoji: '🏰',
    label: 'Tank',
    color: 'text-blue-600',
  },
  healer: {
    id: 'healer',
    emoji: '💚',
    label: 'İyileştirici',
    color: 'text-green-600',
  },
  earth_shaker: {
    id: 'earth_shaker',
    emoji: '⛏️',
    label: 'Yer Sarsıcısı',
    color: 'text-amber-700',
  },

  // Flying Carnivore Specs
  storm_bringer: {
    id: 'storm_bringer',
    emoji: '⛈️',
    label: 'Fırtına Getirici',
    color: 'text-slate-600',
  },
  wind_dancer: {
    id: 'wind_dancer',
    emoji: '🌪️',
    label: 'Rüzgar Dansçısı',
    color: 'text-cyan-500',
  },
  sun_striker: {
    id: 'sun_striker',
    emoji: '☀️',
    label: 'Güneş Darbesi',
    color: 'text-yellow-600',
  },
}

// ============= ABILITY ICONS =============
export const ABILITY_ICONS: Record<string, IconSet> = {
  // General Attack Icons
  claw: { id: 'claw', emoji: '🐾', label: 'Pençe', color: 'text-red-400' },
  bite: { id: 'bite', emoji: '😈', label: 'Isırma', color: 'text-red-500' },
  pounce: { id: 'pounce', emoji: '⚡', label: 'Sıçrama', color: 'text-yellow-400' },
  roar: { id: 'roar', emoji: '📢', label: 'Bağırma', color: 'text-orange-500' },
  tail: { id: 'tail', emoji: '💫', label: 'Kuyruk', color: 'text-purple-400' },

  // Slash/Cutting
  slash: { id: 'slash', emoji: '✂️', label: 'Kesme', color: 'text-red-400' },
  spit: { id: 'spit', emoji: '☠️', label: 'Tükürme', color: 'text-purple-500' },
  dodge: { id: 'dodge', emoji: '💨', label: 'Kaçış', color: 'text-cyan-400' },
  leap: { id: 'leap', emoji: '🚀', label: 'Sıçrama Saldırısı', color: 'text-yellow-500' },
  scratch: { id: 'scratch', emoji: '🪓', label: 'Tırmaklama', color: 'text-red-300' },

  // Herbivore Attacks
  stomp: { id: 'stomp', emoji: '👣', label: 'Ayak Basma', color: 'text-green-600' },
  charge: { id: 'charge', emoji: '🏃', label: 'Hücum', color: 'text-red-600' },
  brace: { id: 'brace', emoji: '🛡️', label: 'Hazırlanma', color: 'text-blue-500' },
  shake: { id: 'shake', emoji: '🌊', label: 'Çalkalanma', color: 'text-cyan-500' },
  headbutt: { id: 'headbutt', emoji: '🤕', label: 'Kafa Bufesi', color: 'text-orange-600' },

  // Flying Attacks
  aerial: { id: 'aerial', emoji: '⚔️', label: 'Hava Saldırısı', color: 'text-cyan-600' },
  dive: { id: 'dive', emoji: '💣', label: 'Dalış', color: 'text-red-600' },
  wind: { id: 'wind', emoji: '💨', label: 'Rüzgar', color: 'text-cyan-400' },
  swoop: { id: 'swoop', emoji: '🌪️', label: 'Dönüş', color: 'text-purple-400' },
  peck: { id: 'peck', emoji: '🐦', label: 'Gagalama', color: 'text-orange-400' },

  // Buffs
  armor: { id: 'armor', emoji: '⚙️', label: 'Zırh', color: 'text-blue-600' },
  protect: { id: 'protect', emoji: '🔒', label: 'Koruma', color: 'text-blue-500' },
  spiky: { id: 'spiky', emoji: '🔱', label: 'Dikenli', color: 'text-purple-500' },
  fire: { id: 'fire', emoji: '🔥', label: 'Ateş', color: 'text-red-600' },
  burst: { id: 'burst', emoji: '💥', label: 'Patlama', color: 'text-orange-600' },
  aura: { id: 'aura', emoji: '♨️', label: 'Aura', color: 'text-red-500' },
  frenzy: { id: 'frenzy', emoji: '😡', label: 'Çılgınlık', color: 'text-red-700' },
  savage: { id: 'savage', emoji: '🩸', label: 'Vahşi', color: 'text-red-600' },
  bloodlust: { id: 'bloodlust', emoji: '🧛', label: 'Kan Hortumu', color: 'text-red-500' },

  // Speed/Agility
  speed: { id: 'speed', emoji: '⚡', label: 'Hız', color: 'text-yellow-500' },
  sprint: { id: 'sprint', emoji: '🏃', label: 'Koşu', color: 'text-cyan-500' },

  // Healing
  heal: { id: 'heal', emoji: '💚', label: 'İyileştirme', color: 'text-green-500' },
  regenerate: { id: 'regenerate', emoji: '🌿', label: 'Yeniden Doğuş', color: 'text-green-600' },
  barrier: { id: 'barrier', emoji: '🌳', label: 'Bariyer', color: 'text-green-500' },

  // Control
  stun: { id: 'stun', emoji: '🌀', label: 'Sersemletme', color: 'text-blue-600' },
  paralyze: { id: 'paralyze', emoji: '⚡', label: 'Felç', color: 'text-yellow-600' },
  freeze: { id: 'freeze', emoji: '❄️', label: 'Dondurma', color: 'text-cyan-600' },

  // Debuffs
  poison: { id: 'poison', emoji: '☠️', label: 'Zehir', color: 'text-purple-500' },
  bleed: { id: 'bleed', emoji: '🩸', label: 'Kanama', color: 'text-red-600' },
  weaken: { id: 'weaken', emoji: '📉', label: 'Zayıflama', color: 'text-gray-500' },

  // Ultis
  meteor: { id: 'meteor', emoji: '☄️', label: 'Meteor', color: 'text-orange-700' },
  extinction: { id: 'extinction', emoji: '⚰️', label: 'Soyu Tükenme', color: 'text-slate-700' },
  rage: { id: 'rage', emoji: '🌋', label: 'Öfke', color: 'text-red-700' },
  tear: { id: 'tear', emoji: '🌀', label: 'Kopuş', color: 'text-purple-700' },
  apocalypse: { id: 'apocalypse', emoji: '💀', label: 'Kıyamet', color: 'text-slate-800' },
  tidal_wave: { id: 'tidal_wave', emoji: '🌊', label: 'Tsunami', color: 'text-blue-700' },
  inferno: { id: 'inferno', emoji: '🔥', label: 'Cehennem Ateşi', color: 'text-red-800' },
  genesis: { id: 'genesis', emoji: '🌱', label: 'Yaratılış', color: 'text-green-700' },
}

// ============= HELPER FUNCTIONS =============

export function getClassIcon(classId: string): IconSet | undefined {
  return CLASS_ICONS[classId]
}

export function getSpecIcon(specId: string): IconSet | undefined {
  return SPEC_ICONS[specId]
}

export function getAbilityIcon(abilityId: string): IconSet | undefined {
  return ABILITY_ICONS[abilityId]
}

export function getClassIconEmoji(classId: string): string {
  return CLASS_ICONS[classId]?.emoji || '❓'
}

export function getSpecIconEmoji(specId: string): string {
  return SPEC_ICONS[specId]?.emoji || '❓'
}

export function getAbilityIconEmoji(abilityId: string): string {
  return ABILITY_ICONS[abilityId]?.emoji || '❓'
}

export function getRandomClassIcon(): IconSet {
  const icons = Object.values(CLASS_ICONS)
  return icons[Math.floor(Math.random() * icons.length)]
}

export function getRandomSpecIcon(specs: IconSet[]): IconSet {
  return specs[Math.floor(Math.random() * specs.length)]
}
