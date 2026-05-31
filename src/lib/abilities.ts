// Complete abilities library - Single source of truth for all abilities
// Organized by class and specialization

export type AbilityKind = 'attack' | 'buff' | 'debuff' | 'utility' | 'ultimate' | 'passive'
export type AbilityCategory = 'class' | 'spec' | 'base' | 'ultimate'

export interface AbilityDefinition {
  id: string
  name: string
  icon: string // SVG icon name from our library
  emoji: string
  kind: AbilityKind
  category: AbilityCategory

  // Mechanics
  cooldown: number // Turns between uses
  damageMultiplier: number // 0 for no damage abilities
  effect: string // 'none' | effect id from effects library

  // Description
  description: string
  fullDescription: string

  // Passive ability flag
  isPassive?: boolean
}

export interface ClassAbilities {
  id: string
  name: string
  emoji: string
  description: string
  abilities: AbilityDefinition[]
}

export interface SpecAbilities {
  id: string
  name: string
  emoji: string
  description: string
  classId: string
  abilities: AbilityDefinition[]
}

// ============= CLASS ABILITIES =============

export const CLASS_ABILITIES: Record<string, ClassAbilities> = {
  big_carnivore: {
    id: 'big_carnivore',
    name: 'Büyük Yırtıcı',
    emoji: '🦖',
    description: 'Güçlü ve tehlikeli, ağır saldırılara sahip.',
    abilities: [
      {
        id: 'claw',
        name: 'Pençe',
        icon: 'claw',
        emoji: '🐾',
        kind: 'attack',
        category: 'class',
        cooldown: 0,
        damageMultiplier: 1,
        effect: 'none',
        description: 'Her tur atılabilen standart hasar',
        fullDescription: 'Temel saldırı. Her turda kullanılabilir, standart hasar verir.',
      },
      {
        id: 'bite',
        name: 'Isırma',
        icon: 'bite',
        emoji: '😈',
        kind: 'attack',
        category: 'class',
        cooldown: 3,
        damageMultiplier: 1.2,
        effect: 'bleeding',
        description: '3 turda bir, hasar + kanama efektli',
        fullDescription: 'Güçlü bir ısırma. Hasar verir ve kanama efekti uygular.',
      },
      {
        id: 'pounce',
        name: 'Üstüne Çıkma',
        icon: 'pounce',
        emoji: '⚡',
        kind: 'attack',
        category: 'class',
        cooldown: 3,
        damageMultiplier: 0.8,
        effect: 'stun',
        description: '3 turda bir, alt hasar ama sersemletme efektli',
        fullDescription: 'Hızlı bir hamle. Daha az hasar verir ama sersem efekti uygular.',
      },
      {
        id: 'roar',
        name: 'Korkunç Bağırma',
        icon: 'roar',
        emoji: '📢',
        kind: 'debuff',
        category: 'class',
        cooldown: 2,
        damageMultiplier: 0,
        effect: 'defense_down',
        description: '2 turda bir, 0 hasar ama -savunma efektli',
        fullDescription: 'Korkutucu bir bağırış. Rakibin savunmasını düşürür.',
      },
      {
        id: 'tail_whip',
        name: 'Kuyruk Vurma',
        icon: 'tail',
        emoji: '💫',
        kind: 'attack',
        category: 'class',
        cooldown: 0,
        damageMultiplier: 0.9,
        effect: 'none',
        description: 'Her tur atılabilen standart hasar',
        fullDescription: 'Kuyrakla hızlı bir vurma. Her turda kullanılabilir.',
      },
    ],
  },

  raptor: {
    id: 'raptor',
    name: 'Raptor',
    emoji: '🦅',
    description: 'Hızlı ve çevik, sık saldırılara sahip.',
    abilities: [
      {
        id: 'slash',
        name: 'Kesici Pençe',
        icon: 'slash',
        emoji: '✂️',
        kind: 'attack',
        category: 'class',
        cooldown: 0,
        damageMultiplier: 0.8,
        effect: 'none',
        description: 'Her tur atılabilen hafif hasar',
        fullDescription: 'Hızlı ve keskin bir saldırı. Her turda kullanılabilir.',
      },
      {
        id: 'toxic_spit',
        name: 'Zehirli Tükürme',
        icon: 'spit',
        emoji: '☠️',
        kind: 'attack',
        category: 'class',
        cooldown: 2,
        damageMultiplier: 0.6,
        effect: 'poison',
        description: '2 turda bir, hafif hasar + zehir efektli',
        fullDescription: 'Zehirli tükürük saçar. Azda olsa hasar verir ve zehir efekti uygular.',
      },
      {
        id: 'dodge',
        name: 'Kaçış',
        icon: 'dodge',
        emoji: '💨',
        kind: 'utility',
        category: 'class',
        cooldown: 2,
        damageMultiplier: 0,
        effect: 'none',
        description: '2 turda bir, hasar almaz',
        fullDescription: 'Hızlı bir kaçış hareketi. Bir saldırıdan kurtulmaya yardımcı olur.',
      },
      {
        id: 'leap_attack',
        name: 'Sıçrama Saldırısı',
        icon: 'leap',
        emoji: '🚀',
        kind: 'attack',
        category: 'class',
        cooldown: 2,
        damageMultiplier: 1.1,
        effect: 'none',
        description: '2 turda bir, orta hasar',
        fullDescription: 'Yüksek sıçrama yaparak saldırır. Orta derecede hasar verir.',
      },
      {
        id: 'scratch',
        name: 'Tırmaklama',
        icon: 'scratch',
        emoji: '🪓',
        kind: 'attack',
        category: 'class',
        cooldown: 1,
        damageMultiplier: 0.7,
        effect: 'none',
        description: '1 turda bir, hafif hasar',
        fullDescription: 'Hızlı tırmalama hareketi. Sık kullanılabilir.',
      },
    ],
  },

  giant_herbivore: {
    id: 'giant_herbivore',
    name: 'Dev Otçul',
    emoji: '🦣',
    description: 'Devasa ve dayanıklı, savunma odaklı.',
    abilities: [
      {
        id: 'stomp',
        name: 'Ayak Basma',
        icon: 'stomp',
        emoji: '👣',
        kind: 'attack',
        category: 'class',
        cooldown: 0,
        damageMultiplier: 1.3,
        effect: 'none',
        description: 'Her tur atılabilen güçlü hasar',
        fullDescription: 'Ağır bir ayak basması. Her turda kullanılabilir, yüksek hasar verir.',
      },
      {
        id: 'charge',
        name: 'Hücum',
        icon: 'charge',
        emoji: '🏃',
        kind: 'attack',
        category: 'class',
        cooldown: 4,
        damageMultiplier: 1.8,
        effect: 'none',
        description: '4 turda bir, çok yüksek hasar',
        fullDescription: 'Hızla koşarak hücum eder. Çok yüksek hasar verir.',
      },
      {
        id: 'brace',
        name: 'Hazırlanma',
        icon: 'brace',
        emoji: '🛡️',
        kind: 'buff',
        category: 'class',
        cooldown: 2,
        damageMultiplier: 0,
        effect: 'shield',
        description: '2 turda bir, +savunma efektli',
        fullDescription: 'Vücudunu hazırlar. Savunması artar.',
      },
      {
        id: 'shake',
        name: 'Çalkalanma',
        icon: 'shake',
        emoji: '🌊',
        kind: 'debuff',
        category: 'class',
        cooldown: 3,
        damageMultiplier: 0.5,
        effect: 'none',
        description: '3 turda bir, hafif hasar',
        fullDescription: 'Güçlü bir sallanma ile çevre yer sarsar.',
      },
      {
        id: 'head_butt',
        name: 'Kafa Bufesi',
        icon: 'headbutt',
        emoji: '🤕',
        kind: 'attack',
        category: 'class',
        cooldown: 2,
        damageMultiplier: 1.4,
        effect: 'none',
        description: '2 turda bir, yüksek hasar',
        fullDescription: 'Başıyla sert bir darbe iner.',
      },
    ],
  },

  flying_carnivore: {
    id: 'flying_carnivore',
    name: 'Uçan Yırtıcı',
    emoji: '🦅',
    description: 'Hızlı ve çevik, hava üstünlüğü sağlayan.',
    abilities: [
      {
        id: 'aerial_strike',
        name: 'Hava Saldırısı',
        icon: 'aerial',
        emoji: '⚔️',
        kind: 'attack',
        category: 'class',
        cooldown: 0,
        damageMultiplier: 1.0,
        effect: 'none',
        description: 'Her tur atılabilen standart hasar',
        fullDescription: 'Havadan yapılan hızlı saldırı. Her turda kullanılabilir.',
      },
      {
        id: 'dive_bomb',
        name: 'Dalış Saldırısı',
        icon: 'dive',
        emoji: '💣',
        kind: 'attack',
        category: 'class',
        cooldown: 3,
        damageMultiplier: 1.5,
        effect: 'none',
        description: '3 turda bir, yüksek hasar',
        fullDescription: 'Yüksekten dibe dalarak saldırır. Çok hasar verir.',
      },
      {
        id: 'wind_gust',
        name: 'Rüzgar Akını',
        icon: 'wind',
        emoji: '💨',
        kind: 'debuff',
        category: 'class',
        cooldown: 2,
        damageMultiplier: 0.3,
        effect: 'none',
        description: '2 turda bir, az hasar',
        fullDescription: 'Güçlü bir rüzgar akını yaratır.',
      },
      {
        id: 'swoop',
        name: 'Hava Kahraman',
        icon: 'swoop',
        emoji: '🌪️',
        kind: 'attack',
        category: 'class',
        cooldown: 1,
        damageMultiplier: 0.85,
        effect: 'none',
        description: '1 turda bir, hafif hasar',
        fullDescription: 'Hızlı bir dönüş hareketi ile saldırır.',
      },
      {
        id: 'peck',
        name: 'Gagalama',
        icon: 'peck',
        emoji: '🐦',
        kind: 'attack',
        category: 'class',
        cooldown: 0,
        damageMultiplier: 0.6,
        effect: 'none',
        description: 'Her tur atılabilen hafif hasar',
        fullDescription: 'Gagası ile hızlı bir saldırı. Her turda kullanılabilir.',
      },
    ],
  },
}

// ============= SPEC ABILITIES =============

export const SPEC_ABILITIES: Record<string, SpecAbilities> = {
  // Big Carnivore specs
  armored: {
    id: 'armored',
    name: 'Kalkanlı',
    emoji: '🛡️',
    description: 'Zırhlı vücut, savunma odaklı.',
    classId: 'big_carnivore',
    abilities: [
      {
        id: 'armor_up',
        name: 'Zırhlan',
        icon: 'armor',
        emoji: '⚙️',
        kind: 'buff',
        category: 'spec',
        cooldown: 4,
        damageMultiplier: 0,
        effect: 'shield',
        description: '4 turda bir, +savunma 3 tur boyunca',
        fullDescription: 'Zırh aktivasyonu. 3 tur boyunca savunması artar.',
      },
      {
        id: 'protect',
        name: 'Korunma',
        icon: 'protect',
        emoji: '🔒',
        kind: 'utility',
        category: 'spec',
        cooldown: 5,
        damageMultiplier: 0,
        effect: 'none',
        description: '5 turda bir, sonraki saldırıdan tamamen korur',
        fullDescription: 'Savunma pozisyonu. Bir sonraki saldırıyı tamamen engeller.',
      },
      {
        id: 'spiky_armor',
        name: 'Dikenli Zırh',
        icon: 'spiky',
        emoji: '🔱',
        kind: 'passive',
        category: 'spec',
        cooldown: 0,
        damageMultiplier: 0,
        effect: 'none',
        isPassive: true,
        description: 'Pasif, her hasar aldığında %2 sini geri yansıtır',
        fullDescription: 'Zırh üzerinde dikenleri vardır. Aldığı direkt hasarın %2 sini yansıtır.',
      },
    ],
  },

  fire_spec: {
    id: 'fire_spec',
    name: 'Ateşli',
    emoji: '🔥',
    description: 'Ateş yetenekleri, agresif saldırılar.',
    classId: 'big_carnivore',
    abilities: [
      {
        id: 'fire_breath',
        name: 'Ateş Nefesi',
        icon: 'fire',
        emoji: '🔥',
        kind: 'attack',
        category: 'spec',
        cooldown: 3,
        damageMultiplier: 1.3,
        effect: 'none',
        description: '3 turda bir, yüksek hasar',
        fullDescription: 'Ateş soluması. Yüksek hasar verir.',
      },
      {
        id: 'flame_burst',
        name: 'Alev Patlaması',
        icon: 'burst',
        emoji: '💥',
        kind: 'attack',
        category: 'spec',
        cooldown: 4,
        damageMultiplier: 1.6,
        effect: 'none',
        description: '4 turda bir, çok yüksek hasar',
        fullDescription: 'Kontrollü bir patlama. Büyük hasar verir.',
      },
      {
        id: 'heat_aura',
        name: 'Isı Auraşı',
        icon: 'aura',
        emoji: '♨️',
        kind: 'buff',
        category: 'spec',
        cooldown: 2,
        damageMultiplier: 0,
        effect: 'power',
        description: '2 turda bir, +hasar efektli',
        fullDescription: 'Isı enerjisi artışı. Saldırı gücü artar.',
      },
    ],
  },

  ultra_carnivore: {
    id: 'ultra_carnivore',
    name: 'Ultra Yırtıcı',
    emoji: '👹',
    description: 'Agresif ve vahşi, saldırı odaklı.',
    classId: 'big_carnivore',
    abilities: [
      {
        id: 'frenzy',
        name: 'Çılgınlık',
        icon: 'frenzy',
        emoji: '😡',
        kind: 'buff',
        category: 'spec',
        cooldown: 3,
        damageMultiplier: 0,
        effect: 'power',
        description: '3 turda bir, +hasar efektli',
        fullDescription: 'Vahşi bir çılgınlık modu. Saldırı gücü artar.',
      },
      {
        id: 'savage_strike',
        name: 'Vahşi Darbe',
        icon: 'savage',
        emoji: '🩸',
        kind: 'attack',
        category: 'spec',
        cooldown: 2,
        damageMultiplier: 1.7,
        effect: 'bleeding',
        description: '2 turda bir, yüksek hasar + kanama',
        fullDescription: 'Vahşice bir saldırı. Yüksek hasar ve kanama efekti verir.',
      },
      {
        id: 'bloodlust',
        name: 'Kan Hortumu',
        icon: 'bloodlust',
        emoji: '🧛',
        kind: 'utility',
        category: 'spec',
        cooldown: 4,
        damageMultiplier: 0.9,
        effect: 'none',
        description: '4 turda bir, hasar verir + HP kazanır',
        fullDescription: 'Rakibinin kanını içerek HP kazanır.',
      },
    ],
  },
}

// ============= ULTIMATE ABILITIES =============

export const ULTIMATE_ABILITIES: Record<string, AbilityDefinition> = {
  meteor_strike: {
    id: 'meteor_strike',
    name: 'Meteor Düşüşü',
    icon: 'meteor',
    emoji: '☄️',
    kind: 'ultimate',
    category: 'ultimate',
    cooldown: 6,
    damageMultiplier: 2.5,
    effect: 'none',
    description: 'Devasa bir meteor saldırısı',
    fullDescription: 'Gökyüzünden dev meteoru indirerek muazzam hasar verir.',
  },

  extinction_event: {
    id: 'extinction_event',
    name: 'Soyu Tükenme Olayı',
    icon: 'extinction',
    emoji: '⚰️',
    kind: 'ultimate',
    category: 'ultimate',
    cooldown: 6,
    damageMultiplier: 2.0,
    effect: 'stop',
    description: 'Devasa bir saldırı + durdurma efekti',
    fullDescription: 'Rakibi tamamen donduran bir enerji dalgası saldırısı.',
  },

  primal_rage: {
    id: 'primal_rage',
    name: 'İlkel Öfke',
    icon: 'rage',
    emoji: '🌋',
    kind: 'ultimate',
    category: 'ultimate',
    cooldown: 6,
    damageMultiplier: 2.3,
    effect: 'power',
    description: 'Muazzam hasar + +hasar efekti',
    fullDescription: 'Tüm gücü açığa çıkarak muazzam hasar verir ve kendisini güçlendirir.',
  },

  dimensional_tear: {
    id: 'dimensional_tear',
    name: 'Boyutsal Kopuş',
    icon: 'tear',
    emoji: '🌀',
    kind: 'ultimate',
    category: 'ultimate',
    cooldown: 6,
    damageMultiplier: 1.8,
    effect: 'stun',
    description: 'Yüksek hasar + sersemletme efekti',
    fullDescription: 'Boyutlar arası bir kopuş açarak yüksek hasar ve sersemlik verir.',
  },
}

// ============= HELPER FUNCTIONS =============

export function getClassAbilities(classId: string): ClassAbilities | undefined {
  return CLASS_ABILITIES[classId]
}

export function getSpecAbilities(specId: string): SpecAbilities | undefined {
  return SPEC_ABILITIES[specId]
}

export function getUltimateAbility(ultimateId: string): AbilityDefinition | undefined {
  return ULTIMATE_ABILITIES[ultimateId]
}

export function getAbilityDefinition(abilityId: string): AbilityDefinition | undefined {
  // Search in class abilities
  for (const classAbs of Object.values(CLASS_ABILITIES)) {
    const found = classAbs.abilities.find(a => a.id === abilityId)
    if (found) return found
  }

  // Search in spec abilities
  for (const specAbs of Object.values(SPEC_ABILITIES)) {
    const found = specAbs.abilities.find(a => a.id === abilityId)
    if (found) return found
  }

  // Search in ultimate abilities
  return ULTIMATE_ABILITIES[abilityId]
}

export function getAllClasses(): ClassAbilities[] {
  return Object.values(CLASS_ABILITIES)
}

export function getSpecsByClass(classId: string): SpecAbilities[] {
  return Object.values(SPEC_ABILITIES).filter(spec => spec.classId === classId)
}

export function getRandomAbilityFromList(abilities: AbilityDefinition[]): AbilityDefinition {
  return abilities[Math.floor(Math.random() * abilities.length)]
}
