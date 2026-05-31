// Complete effects library - Single source of truth
// Contains: visuals, mechanics, level scaling, all gameplay effects

export interface EffectLevel {
  // Gameplay mechanics
  damage?: number // Absolute damage per turn
  damagePercent?: number // Damage as % of max HP
  statBonus?: {
    // Stat bonuses (power/speed/shield effects)
    atk?: number // +% attack
    def?: number // +% defense
    spd?: number // +% speed
  }
  duration: number // How many turns this level lasts

  // Visual effects
  particles?: {
    type: 'smoke' | 'spark' | 'leaf' | 'blood' | 'glow' | 'wave'
    count: number
    color: string
    duration: number // ms
  }
  screenEffect?: {
    type: 'flash' | 'tint' | 'shake' | 'crack'
    intensity: number // 0-1
    duration: number // ms
  }
  sound?: string // Sound effect name
}

export interface EffectDefinition {
  id: string
  name: string
  icon: string
  emoji: string
  color: 'purple' | 'blue' | 'red' | 'orange' | 'yellow' | 'green'
  description: string
  fullDescription: string
  type: 'debuff' | 'buff'
  isBuffEffect: boolean

  // Level-based mechanics
  levels: Record<number, EffectLevel>

  // Default level (if not specified)
  defaultLevel: number
}

export const EFFECTS: Record<string, EffectDefinition> = {
  poison: {
    id: 'poison',
    name: 'Zehir',
    icon: '☠️',
    emoji: '☠️',
    color: 'purple',
    description: 'Her tur hasar alıyor',
    fullDescription:
      'Zehir sayesinde her tur sonu ek hasar alır. Maksimum 2 tur devam eder. Yeni zehir uygulanırsa süresi sıfırlanır.',
    type: 'debuff',
    isBuffEffect: false,
    defaultLevel: 1,
    levels: {
      1: {
        damagePercent: 2, // 2% of max HP per turn
        duration: 2,
        particles: {
          type: 'smoke',
          count: 8,
          color: '#9333ea',
          duration: 1500,
        },
        screenEffect: {
          type: 'tint',
          intensity: 0.3,
          duration: 500,
        },
        sound: 'poison',
      },
      2: {
        damagePercent: 3, // 3% of max HP per turn
        duration: 3,
        particles: {
          type: 'smoke',
          count: 12,
          color: '#a855f7',
          duration: 1500,
        },
        screenEffect: {
          type: 'tint',
          intensity: 0.4,
          duration: 500,
        },
        sound: 'poison-strong',
      },
      3: {
        damagePercent: 4, // 4% of max HP per turn
        duration: 3,
        particles: {
          type: 'smoke',
          count: 16,
          color: '#c084fc',
          duration: 1500,
        },
        screenEffect: {
          type: 'tint',
          intensity: 0.5,
          duration: 500,
        },
        sound: 'poison-critical',
      },
    },
  },

  stun: {
    id: 'stun',
    name: 'Sersemlik',
    icon: '🌀',
    emoji: '🌀',
    color: 'blue',
    description: 'Harekete geçemez',
    fullDescription:
      'Sersem edilen oyuncu sırasında hiçbir eylem yapamaz. İşleme alınmadan geçer. 1 tur sürer.',
    type: 'debuff',
    isBuffEffect: false,
    defaultLevel: 1,
    levels: {
      1: {
        duration: 1,
        particles: {
          type: 'spark',
          count: 10,
          color: '#3b82f6',
          duration: 1000,
        },
        screenEffect: {
          type: 'shake',
          intensity: 0.4,
          duration: 500,
        },
        sound: 'stun',
      },
      2: {
        duration: 2, // Level 2 sersemlik 2 tur sürer
        particles: {
          type: 'spark',
          count: 15,
          color: '#60a5fa',
          duration: 1200,
        },
        screenEffect: {
          type: 'shake',
          intensity: 0.6,
          duration: 600,
        },
        sound: 'stun-strong',
      },
    },
  },

  stop: {
    id: 'stop',
    name: 'Donma',
    icon: '🛑',
    emoji: '🛑',
    color: 'red',
    description: 'Tamamen donduruldu',
    fullDescription:
      'Donmuş oyuncu tamamen hareketsiz hale gelir. Sıfır hasar alır. 1 tur sürer.',
    type: 'debuff',
    isBuffEffect: false,
    defaultLevel: 1,
    levels: {
      1: {
        duration: 1,
        particles: {
          type: 'glow',
          count: 12,
          color: '#06b6d4',
          duration: 1500,
        },
        screenEffect: {
          type: 'flash',
          intensity: 0.5,
          duration: 600,
        },
        sound: 'freeze',
      },
      2: {
        duration: 2,
        particles: {
          type: 'glow',
          count: 16,
          color: '#22d3ee',
          duration: 1500,
        },
        screenEffect: {
          type: 'flash',
          intensity: 0.7,
          duration: 600,
        },
        sound: 'freeze-deep',
      },
    },
  },

  bleeding: {
    id: 'bleeding',
    name: 'Kanama',
    icon: '🩸',
    emoji: '🩸',
    color: 'red',
    description: 'Tur başında hasar',
    fullDescription:
      'Kesilerden kan kaybeder. Her tur başında extra hasar alır (maks HP %10). 3 tur devam eder. Çoklu kanamalar toplanır.',
    type: 'debuff',
    isBuffEffect: false,
    defaultLevel: 1,
    levels: {
      1: {
        damagePercent: 5, // 5% of max HP per turn
        duration: 3,
        particles: {
          type: 'blood',
          count: 6,
          color: '#dc2626',
          duration: 2000,
        },
        screenEffect: {
          type: 'tint',
          intensity: 0.2,
          duration: 300,
        },
        sound: 'bleed',
      },
      2: {
        damagePercent: 8, // 8% of max HP per turn
        duration: 3,
        particles: {
          type: 'blood',
          count: 10,
          color: '#ef4444',
          duration: 2000,
        },
        screenEffect: {
          type: 'tint',
          intensity: 0.3,
          duration: 400,
        },
        sound: 'bleed-heavy',
      },
      3: {
        damagePercent: 12, // 12% of max HP per turn
        duration: 4,
        particles: {
          type: 'blood',
          count: 15,
          color: '#f87171',
          duration: 2000,
        },
        screenEffect: {
          type: 'crack',
          intensity: 0.5,
          duration: 500,
        },
        sound: 'bleed-critical',
      },
    },
  },

  power: {
    id: 'power',
    name: 'Güçlenme',
    icon: '⚔️',
    emoji: '⚔️',
    color: 'orange',
    description: 'Saldırı +50%',
    fullDescription:
      'Tüm saldırıların gücü artar. Buff slotunda maksimum 2 tur kalıcı.',
    type: 'buff',
    isBuffEffect: true,
    defaultLevel: 1,
    levels: {
      1: {
        statBonus: { atk: 50 }, // +50% attack
        duration: 2,
        particles: {
          type: 'glow',
          count: 8,
          color: '#ea580c',
          duration: 1500,
        },
        screenEffect: {
          type: 'flash',
          intensity: 0.3,
          duration: 400,
        },
        sound: 'buff-power',
      },
      2: {
        statBonus: { atk: 75 }, // +75% attack
        duration: 2,
        particles: {
          type: 'glow',
          count: 12,
          color: '#f97316',
          duration: 1500,
        },
        screenEffect: {
          type: 'flash',
          intensity: 0.5,
          duration: 500,
        },
        sound: 'buff-power-strong',
      },
      3: {
        statBonus: { atk: 100 }, // +100% attack
        duration: 3,
        particles: {
          type: 'glow',
          count: 16,
          color: '#fb923c',
          duration: 2000,
        },
        screenEffect: {
          type: 'flash',
          intensity: 0.7,
          duration: 600,
        },
        sound: 'buff-power-ultimate',
      },
    },
  },

  speed: {
    id: 'speed',
    name: 'Hız Patlaması',
    icon: '⚡',
    emoji: '⚡',
    color: 'yellow',
    description: 'Hız +50%',
    fullDescription: 'Hareket hızı artar. Sırada öncelik kazanır. 2 tur sürer.',
    type: 'buff',
    isBuffEffect: true,
    defaultLevel: 1,
    levels: {
      1: {
        statBonus: { spd: 50 }, // +50% speed
        duration: 2,
        particles: {
          type: 'wave',
          count: 10,
          color: '#eab308',
          duration: 1200,
        },
        screenEffect: {
          type: 'flash',
          intensity: 0.25,
          duration: 300,
        },
        sound: 'buff-speed',
      },
      2: {
        statBonus: { spd: 75 }, // +75% speed
        duration: 2,
        particles: {
          type: 'wave',
          count: 14,
          color: '#facc15',
          duration: 1200,
        },
        screenEffect: {
          type: 'flash',
          intensity: 0.4,
          duration: 400,
        },
        sound: 'buff-speed-strong',
      },
      3: {
        statBonus: { spd: 100 }, // +100% speed
        duration: 3,
        particles: {
          type: 'wave',
          count: 18,
          color: '#fde047',
          duration: 1500,
        },
        screenEffect: {
          type: 'flash',
          intensity: 0.6,
          duration: 500,
        },
        sound: 'buff-speed-ultimate',
      },
    },
  },

  shield: {
    id: 'shield',
    name: 'Kalkan',
    icon: '🛡️',
    emoji: '🛡️',
    color: 'green',
    description: 'Hasar -50%',
    fullDescription:
      'Aldığı tüm hasar azalır. Koruma sağlar. 2 tur sürer.',
    type: 'buff',
    isBuffEffect: true,
    defaultLevel: 1,
    levels: {
      1: {
        statBonus: { def: 50 }, // +50% defense (reduces damage by 33%)
        duration: 2,
        particles: {
          type: 'glow',
          count: 8,
          color: '#22c55e',
          duration: 1500,
        },
        screenEffect: {
          type: 'flash',
          intensity: 0.25,
          duration: 400,
        },
        sound: 'buff-shield',
      },
      2: {
        statBonus: { def: 75 }, // +75% defense
        duration: 2,
        particles: {
          type: 'glow',
          count: 12,
          color: '#4ade80',
          duration: 1500,
        },
        screenEffect: {
          type: 'flash',
          intensity: 0.4,
          duration: 500,
        },
        sound: 'buff-shield-strong',
      },
      3: {
        statBonus: { def: 100 }, // +100% defense
        duration: 3,
        particles: {
          type: 'glow',
          count: 16,
          color: '#86efac',
          duration: 2000,
        },
        screenEffect: {
          type: 'flash',
          intensity: 0.6,
          duration: 600,
        },
        sound: 'buff-shield-ultimate',
      },
    },
  },

  heal: {
    id: 'heal',
    name: 'İyileştirme',
    icon: '💚',
    emoji: '💚',
    color: 'green',
    description: 'HP\'yi geri getirir',
    fullDescription: 'Dinozor her tur bazı HP\'sini geri kazanır.',
    type: 'buff',
    isBuffEffect: true,
    defaultLevel: 1,
    levels: {
      1: {
        damage: -5,
        duration: 3,
        particles: {
          type: 'leaf',
          count: 8,
          color: '#4ade80',
          duration: 1500,
        },
        screenEffect: {
          type: 'flash',
          intensity: 0.3,
          duration: 400,
        },
        sound: 'heal',
      },
      2: {
        damage: -10,
        duration: 3,
        particles: {
          type: 'leaf',
          count: 12,
          color: '#86efac',
          duration: 1500,
        },
        screenEffect: {
          type: 'flash',
          intensity: 0.4,
          duration: 500,
        },
        sound: 'heal-strong',
      },
      3: {
        damage: -15,
        duration: 4,
        particles: {
          type: 'leaf',
          count: 16,
          color: '#dcfce7',
          duration: 2000,
        },
        screenEffect: {
          type: 'flash',
          intensity: 0.5,
          duration: 600,
        },
        sound: 'heal-ultimate',
      },
    },
  },

  regen: {
    id: 'regen',
    name: 'Yeniden Doğuş',
    icon: '🌿',
    emoji: '🌿',
    color: 'green',
    description: 'Hızlı HP iyileştirmesi',
    fullDescription: 'Doğal güçler dinozoru hızlı bir şekilde iyileştirir. Her tur daha çok HP kazanır.',
    type: 'buff',
    isBuffEffect: true,
    defaultLevel: 1,
    levels: {
      1: {
        damage: -8,
        duration: 2,
        particles: {
          type: 'leaf',
          count: 10,
          color: '#22c55e',
          duration: 1500,
        },
        screenEffect: {
          type: 'flash',
          intensity: 0.35,
          duration: 450,
        },
        sound: 'regen',
      },
      2: {
        damage: -12,
        duration: 3,
        particles: {
          type: 'leaf',
          count: 15,
          color: '#16a34a',
          duration: 1500,
        },
        screenEffect: {
          type: 'flash',
          intensity: 0.45,
          duration: 550,
        },
        sound: 'regen-strong',
      },
      3: {
        damage: -18,
        duration: 3,
        particles: {
          type: 'leaf',
          count: 20,
          color: '#15803d',
          duration: 2000,
        },
        screenEffect: {
          type: 'flash',
          intensity: 0.55,
          duration: 650,
        },
        sound: 'regen-ultimate',
      },
    },
  },

  defense_down: {
    id: 'defense_down',
    name: 'Savunma Düşüşü',
    icon: '📉',
    emoji: '📉',
    color: 'red',
    description: 'Savunma azalması',
    fullDescription: 'Rakibin savunması zayıflar ve daha çok hasar alır.',
    type: 'debuff',
    isBuffEffect: false,
    defaultLevel: 1,
    levels: {
      1: {
        statBonus: { def: -30 },
        duration: 2,
        particles: {
          type: 'spark',
          count: 8,
          color: '#ef4444',
          duration: 1500,
        },
        screenEffect: {
          type: 'tint',
          intensity: 0.3,
          duration: 400,
        },
        sound: 'debuff-def',
      },
      2: {
        statBonus: { def: -50 },
        duration: 2,
        particles: {
          type: 'spark',
          count: 12,
          color: '#dc2626',
          duration: 1500,
        },
        screenEffect: {
          type: 'tint',
          intensity: 0.4,
          duration: 500,
        },
        sound: 'debuff-def-strong',
      },
      3: {
        statBonus: { def: -70 },
        duration: 3,
        particles: {
          type: 'spark',
          count: 16,
          color: '#991b1b',
          duration: 2000,
        },
        screenEffect: {
          type: 'tint',
          intensity: 0.5,
          duration: 600,
        },
        sound: 'debuff-def-critical',
      },
    },
  },

  paralyze: {
    id: 'paralyze',
    name: 'Felç',
    icon: '⚡',
    emoji: '⚡',
    color: 'yellow',
    description: 'Hareket edilemiyor ve hasar azalıyor',
    fullDescription: 'Elektrik şokundan dolayı hareket edemez ve saldırı gücü azalır.',
    type: 'debuff',
    isBuffEffect: false,
    defaultLevel: 1,
    levels: {
      1: {
        statBonus: { atk: -20, spd: -30 },
        duration: 2,
        particles: {
          type: 'spark',
          count: 10,
          color: '#facc15',
          duration: 1200,
        },
        screenEffect: {
          type: 'flash',
          intensity: 0.4,
          duration: 450,
        },
        sound: 'paralyze',
      },
      2: {
        statBonus: { atk: -35, spd: -50 },
        duration: 2,
        particles: {
          type: 'spark',
          count: 15,
          color: '#eab308',
          duration: 1400,
        },
        screenEffect: {
          type: 'flash',
          intensity: 0.5,
          duration: 550,
        },
        sound: 'paralyze-strong',
      },
      3: {
        statBonus: { atk: -50, spd: -70 },
        duration: 3,
        particles: {
          type: 'spark',
          count: 20,
          color: '#ca8a04',
          duration: 1600,
        },
        screenEffect: {
          type: 'flash',
          intensity: 0.6,
          duration: 650,
        },
        sound: 'paralyze-critical',
      },
    },
  },

  none: {
    id: 'none',
    name: 'Efekt Yok',
    icon: '⭕',
    emoji: '⭕',
    color: 'blue',
    description: 'Hiç efekt',
    fullDescription: 'Bu yeteneğin hiç efekti yoktur, sadece hasar veya koruma sağlar.',
    type: 'buff',
    isBuffEffect: false,
    defaultLevel: 1,
    levels: {
      1: {
        duration: 0,
      },
    },
  },
}

// Helper functions

export function getEffect(effectId: string): EffectDefinition | undefined {
  return EFFECTS[effectId]
}

export function getEffectName(effectId: string): string {
  return EFFECTS[effectId]?.name || effectId
}

export function getEffectEmoji(effectId: string): string {
  return EFFECTS[effectId]?.emoji || '❓'
}

export function isBuffEffect(effectId: string): boolean {
  return EFFECTS[effectId]?.isBuffEffect ?? false
}

export function getEffectColor(effectId: string): string {
  const effect = EFFECTS[effectId]
  if (!effect) return 'gray'

  const colorMap: Record<string, string> = {
    purple: 'text-purple-400 border-purple-500/30',
    blue: 'text-blue-400 border-blue-500/30',
    red: 'text-red-400 border-red-500/30',
    orange: 'text-orange-400 border-orange-500/30',
    yellow: 'text-yellow-400 border-yellow-500/30',
    green: 'text-green-400 border-green-500/30',
  }

  return colorMap[effect.color]
}

// Get effect damage (debuffs)
export function getEffectDamage(
  effectId: string,
  level: number = 1,
  targetMaxHp: number = 100
): number {
  const effect = EFFECTS[effectId]
  if (!effect || effect.type !== 'debuff') return 0

  const levelData = effect.levels[level] || effect.levels[effect.defaultLevel]
  if (!levelData) return 0

  if (levelData.damagePercent) {
    return Math.round((targetMaxHp * levelData.damagePercent) / 100)
  }

  return levelData.damage || 0
}

// Get stat bonus (buffs)
export function getEffectBonus(
  effectId: string,
  level: number = 1
): { atk?: number; def?: number; spd?: number } {
  const effect = EFFECTS[effectId]
  if (!effect || effect.type !== 'buff') return {}

  const levelData = effect.levels[level] || effect.levels[effect.defaultLevel]
  return levelData.statBonus || {}
}

// Get effect duration
export function getEffectDuration(
  effectId: string,
  level: number = 1
): number {
  const effect = EFFECTS[effectId]
  if (!effect) return 0

  const levelData = effect.levels[level] || effect.levels[effect.defaultLevel]
  return levelData.duration || 0
}

// Get visual effects
export function getEffectVisuals(
  effectId: string,
  level: number = 1
) {
  const effect = EFFECTS[effectId]
  if (!effect) return null

  const levelData = effect.levels[level] || effect.levels[effect.defaultLevel]
  return {
    particles: levelData.particles,
    screenEffect: levelData.screenEffect,
    sound: levelData.sound,
  }
}

export function getDebuffEffects(): EffectDefinition[] {
  return Object.values(EFFECTS).filter(e => e.type === 'debuff')
}

export function getBuffEffects(): EffectDefinition[] {
  return Object.values(EFFECTS).filter(e => e.type === 'buff')
}

// Get all levels for an effect
export function getEffectLevels(effectId: string): number[] {
  const effect = EFFECTS[effectId]
  if (!effect) return []
  return Object.keys(effect.levels)
    .map(Number)
    .sort((a, b) => a - b)
}
