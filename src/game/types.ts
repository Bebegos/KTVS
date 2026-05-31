export type EffectKind = 'poison' | 'stun' | 'stop' | 'power' | 'speed' | 'shield' | 'heal' | 'regen' | 'defense_down' | 'paralyze' | 'none'
export type AbilityType = 'attack' | 'buff' | 'debuff' | 'heal' | 'utility' | 'ultimate' | 'passive'

export interface Ability {
  id: string
  name: string
  cd: number
  maxCd: number
  kind: AbilityType
  effects: EffectKind[]
  multiplier?: number // Hasar çarpanı (varsayılan 1x)
  description?: string
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
  abilityIds: string[] // IDs of selected abilities from library (6 slots: 0-4 regular, 5 ultimate)
  familyCode: string
  createdAt?: string

  // Class and spec system
  class?: string // 'big_carnivore', 'raptor', 'giant_herbivore', 'flying_carnivore'
  spec?: string // Specialization within the class
}

export interface ActiveEffect {
  type: EffectKind
  duration: number
  justApplied?: boolean // true on the round it was cast; skips decrement/DoT that round
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
  cooldowns: number[] // Current cooldown for each ability
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

// New service layer battle state (replaces BattleState in future)
export interface ServiceBattleState {
  player: BattleCharacter
  opponent: BattleCharacter
  round: number
  battleLog: string[]
  battleEnded: boolean
  winner?: 'player' | 'opponent' | null
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

// ============= NEW TYPES FOR SERVICE LAYER =============

export type SlotStatus = 'locked' | 'unlocked_empty' | 'filled'

export interface SlotState {
  slot: number // 0-5 (0-4 regular, 5 ultimate)
  status: SlotStatus
  abilityId?: string // If 'filled', the ability in this slot
  requiredLevel: number // Level needed to unlock
  isClickable: boolean // Computed from dino level + status
}

export interface BattleAbility {
  abilityId: string
  name: string
  kind: AbilityType
  effects: EffectKind[]
  multiplier?: number
  icon?: string
  description?: string
  isVampiric?: boolean
  cd: number // Current cooldown (decrements)
  maxCd: number // Max cooldown from definition
  isAvailable: boolean // Computed: cooldown === 0 && not stunned
}

export interface ValidationResult {
  valid: boolean
  reason?: string
  code?: string
}

export interface AbilityExecutionContext {
  damageMultiplier: number
  effect: EffectKind
  isVampiric: boolean
  isHealAbility: boolean
}
