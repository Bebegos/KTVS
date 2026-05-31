// Turkish translations for effect types
export const effectNamesTR: Record<string, string> = {
  poison: 'Zehir',
  stun: 'Sersem',
  stop: 'Dur',
  bleeding: 'Kanama',
  power: 'Güç+',
  speed: 'Hız+',
  shield: 'Kalkan+',
  heal: 'İyileşme',
  regen: 'Yeniden Doğuş',
  defense_down: 'Savunma↓',
  paralyze: 'Felç',
  none: 'Saldırı',
}

export function getEffectNameTR(type: string): string {
  return effectNamesTR[type] || type
}

// Emoji representations
export const effectEmojis: Record<string, string> = {
  poison: '☠️',
  stun: '🌀',
  stop: '🛑',
  bleeding: '🩸',
  power: '⚔️',
  speed: '⚡',
  shield: '🛡️',
  heal: '💚',
  regen: '🌿',
  defense_down: '📉',
  paralyze: '⚡',
}

export function getEffectEmoji(type: string): string {
  return effectEmojis[type] || '❓'
}

// Check if buff (healing and positive effects)
export function isBuffEffect(type: string): boolean {
  return ['power', 'speed', 'shield', 'heal', 'regen'].includes(type)
}
