// Turkish translations for effect types
export const effectNamesTR: Record<string, string> = {
  poison: 'Zehir',
  stun: 'Sersem',
  stop: 'Dur',
  power: 'Güç+',
  speed: 'Hız+',
  shield: 'Kalkan+',
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
  power: '⚔️',
  speed: '⚡',
  shield: '🛡️',
}

export function getEffectEmoji(type: string): string {
  return effectEmojis[type] || '❓'
}

// Check if buff
export function isBuffEffect(type: string): boolean {
  return ['power', 'speed', 'shield'].includes(type)
}
