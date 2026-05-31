export type EffectKind = 'poison' | 'stun' | 'stop' | 'power' | 'speed' | 'shield' | 'none'
export type AbilityType = 'buff' | 'debuff'

export interface Ability {
  id: string
  name: string
  cd: number
  maxCd: number
  kind: AbilityType
  effect: EffectKind
  multiplier?: number // Hasar çarpanı (varsayılan 1x)
  description?: string
  icon?: string // Saldırı ikonu ID'si
}

export interface DinoAbility {
  name: string
  cd: number
  kind: AbilityType
  effect: EffectKind
  multiplier?: number // Hasar çarpanı (varsayılan 1x)
  icon?: string // Saldırı ikonu ID'si
}

export interface Dino {
  id: string
  name: string
  element?: string
  passive?: string
  maxHp: number
  atk: number
  def: number
  spd: number
  level: number
  xp: number
  abilities: DinoAbility[]
  familyCode: string
  createdAt?: string

  // New class and spec system
  class?: string // 'big_carnivore', 'raptor', 'giant_herbivore', 'flying_carnivore'
  spec?: string // Specialization within the class
  selectedAbilityIds?: string[] // IDs of selected abilities from library
  ultimateId?: string // ID of the selected ultimate ability
}

export interface ActiveEffect {
  type: EffectKind
  duration: number
}

export interface BattleCharacter {
  dinoId: string
  name: string
  maxHp: number
  currentHp: number
  atk: number
  def: number
  spd: number
  abilities: Ability[]
  effects: ActiveEffect[]
  round: number
}

export interface BattleState {
  p1: BattleCharacter
  p2: BattleCharacter
  currentTurn: 'p1' | 'p2'
  round: number
  log: BattleLogEntry[]
  finished: boolean
  winner?: 'p1' | 'p2'
}

export interface BattleLogEntry {
  round: number
  turn: 'p1' | 'p2'
  action: string
  diceRoll?: number
  damage?: number
  isCrit?: boolean
  isHit?: boolean
}

export interface DiceResult {
  value: number
  isCrit: boolean
  isMiss: boolean
}
