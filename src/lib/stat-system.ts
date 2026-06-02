// Premium Stat System with Icons and Descriptions
// All stats are displayed with consistent premium icons everywhere

export type StatKey = 'sta' | 'atk' | 'def' | 'spd'

export interface StatDefinition {
  key: StatKey
  label: string // Display name
  labelTr: string // Turkish name
  description: string // What the stat does
  descriptionTr: string
  emoji: string // Backup emoji
  icon: string // Icon ID for SvgIcon component
  color: string // Tailwind color class
  gradient: string // Gradient for display
  gradientBg: string // Gradient background
  borderColor: string // Border color
  textColor: string // Text color
}

export const STAT_DEFINITIONS: Record<StatKey, StatDefinition> = {
  sta: {
    key: 'sta',
    label: 'Stamina',
    labelTr: 'Dayanıklılık',
    description: 'Determines maximum health points (HP). A higher stamina grants more survivability.',
    descriptionTr: 'Maksimum can puanlarını (HP) belirler. Yüksek dayanıklılık daha fazla hayatta kalma şansı verir.',
    emoji: '💨',
    icon: 'stamina',
    color: 'emerald',
    gradient: 'from-emerald-400 to-emerald-600',
    gradientBg: 'from-emerald-500/20 to-emerald-500/10',
    borderColor: 'border-emerald-500/40',
    textColor: 'text-emerald-300',
  },
  atk: {
    key: 'atk',
    label: 'Attack',
    labelTr: 'Saldırı',
    description: 'Physical damage output. Higher attack deals more damage to enemies.',
    descriptionTr: 'Fiziksel hasar çıkışı. Yüksek saldırı düşmanlara daha fazla hasar verir.',
    emoji: '⚔️',
    icon: 'attack',
    color: 'orange',
    gradient: 'from-orange-400 to-orange-600',
    gradientBg: 'from-orange-500/20 to-orange-500/10',
    borderColor: 'border-orange-500/40',
    textColor: 'text-orange-300',
  },
  def: {
    key: 'def',
    label: 'Defense',
    labelTr: 'Savunma',
    description: 'Damage mitigation. Higher defense reduces incoming damage.',
    descriptionTr: 'Hasar engelleme. Yüksek savunma gelen hasarı azaltır.',
    emoji: '🛡️',
    icon: 'defense',
    color: 'blue',
    gradient: 'from-blue-400 to-blue-600',
    gradientBg: 'from-blue-500/20 to-blue-500/10',
    borderColor: 'border-blue-500/40',
    textColor: 'text-blue-300',
  },
  spd: {
    key: 'spd',
    label: 'Speed',
    labelTr: 'Hız',
    description: 'Action order in battle. Higher speed grants more turns.',
    descriptionTr: 'Savaşta hareket sırası. Yüksek hız daha fazla tur verir.',
    emoji: '⚡',
    icon: 'speed',
    color: 'yellow',
    gradient: 'from-yellow-400 to-yellow-600',
    gradientBg: 'from-yellow-500/20 to-yellow-500/10',
    borderColor: 'border-yellow-500/40',
    textColor: 'text-yellow-300',
  },
}

/**
 * Get stat definition by key
 */
export function getStatDef(key: StatKey): StatDefinition {
  return STAT_DEFINITIONS[key]
}

/** Default stamina→HP multiplier when a dino has none recorded. */
export const DEFAULT_HP_MULTIPLIER = 1.5

/**
 * Calculate maxHp from stamina and its HP multiplier.
 * HP = floor(stamina × multiplier).
 */
export function calculateMaxHp(stamina: number, multiplier: number): number {
  return Math.floor(stamina * multiplier)
}

/**
 * Centralized HP delivery: the single source of truth for a dino's max HP.
 * Always derive max HP from stamina here — never read a stored max_hp column.
 */
export function getDinoMaxHp(dino: { sta?: number | null; staminaToHpMultiplier?: number | null }): number {
  return calculateMaxHp(dino.sta ?? 0, dino.staminaToHpMultiplier ?? DEFAULT_HP_MULTIPLIER)
}

/**
 * Get all stat keys in order for display
 */
export function getStatOrder(): StatKey[] {
  return ['sta', 'atk', 'def', 'spd']
}

/**
 * Format stat value for display
 */
export function formatStatValue(key: StatKey, value: number): string {
  if (key === 'sta') {
    // Stamina shows HP range
    const minHp = calculateMaxHp(value, 1)
    const maxHp = calculateMaxHp(value, 2)
    return `${value} (${minHp}-${maxHp} HP)`
  }
  return String(value)
}
