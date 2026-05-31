// Complete effects library with icons, descriptions, and stats
export interface EffectDefinition {
  id: string
  name: string
  icon: string
  emoji: string
  color: 'purple' | 'blue' | 'red' | 'orange' | 'yellow' | 'green'
  description: string
  fullDescription: string
  duration: number
  type: 'debuff' | 'buff'
  isBuffEffect: boolean
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
    duration: 2,
    type: 'debuff',
    isBuffEffect: false,
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
    duration: 1,
    type: 'debuff',
    isBuffEffect: false,
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
    duration: 1,
    type: 'debuff',
    isBuffEffect: false,
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
    duration: 3,
    type: 'debuff',
    isBuffEffect: false,
  },
  power: {
    id: 'power',
    name: 'Güçlenme',
    icon: '⚔️',
    emoji: '⚔️',
    color: 'orange',
    description: 'Saldırı +50%',
    fullDescription:
      'Tüm saldırıların gücü %50 oranında artar. Buff slotunda maksimum 1 tur kalıcı. 2 tur sürer.',
    duration: 2,
    type: 'buff',
    isBuffEffect: true,
  },
  speed: {
    id: 'speed',
    name: 'Hız Patlaması',
    icon: '⚡',
    emoji: '⚡',
    color: 'yellow',
    description: 'Hız +50%',
    fullDescription:
      'Hareket hızı %50 artar. Sırada öncelik kazanır. 2 tur sürer.',
    duration: 2,
    type: 'buff',
    isBuffEffect: true,
  },
  shield: {
    id: 'shield',
    name: 'Kalkan',
    icon: '🛡️',
    emoji: '🛡️',
    color: 'green',
    description: 'Hasar -50%',
    fullDescription:
      'Aldığı tüm hasar %50 oranında azalır. Koruma sağlar. 2 tur sürer.',
    duration: 2,
    type: 'buff',
    isBuffEffect: true,
  },
}

// Get effect definition by ID
export function getEffect(effectId: string): EffectDefinition | undefined {
  return EFFECTS[effectId]
}

// Get Turkish name
export function getEffectName(effectId: string): string {
  return EFFECTS[effectId]?.name || effectId
}

// Get emoji
export function getEffectEmoji(effectId: string): string {
  return EFFECTS[effectId]?.emoji || '❓'
}

// Check if buff
export function isBuffEffect(effectId: string): boolean {
  return EFFECTS[effectId]?.isBuffEffect ?? false
}

// Get color for UI
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

// Get all debuff effects
export function getDebuffEffects(): EffectDefinition[] {
  return Object.values(EFFECTS).filter(e => e.type === 'debuff')
}

// Get all buff effects
export function getBuffEffects(): EffectDefinition[] {
  return Object.values(EFFECTS).filter(e => e.type === 'buff')
}
