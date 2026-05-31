export type EffectKind = 'poison' | 'stun' | 'stop' | 'power' | 'speed' | 'shield' | 'heal' | 'regen' | 'defense_down' | 'paralyze' | 'none'
export type AbilityType = 'attack' | 'buff' | 'debuff' | 'heal' | 'utility' | 'ultimate' | 'passive'

// Battle effect visualization types
export type BattleVisualAnimation =
  | 'claw_slash_3hit'
  | 'claw_slash_single'
  | 'bite_crunch'
  | 'fire_burst'
  | 'ice_spikes'
  | 'poison_cloud'
  | 'electricity_crackle'
  | 'healing_glow'
  | 'leaf_spread'
  | 'shield_barrier'
  | 'wind_gust'
  | 'stone_crumble'
  | 'generic_impact'

export type BattleParticleType =
  | 'blood_splatter'
  | 'fire_sparks'
  | 'ice_crystals'
  | 'poison_gas'
  | 'electricity'
  | 'healing_light'
  | 'leaves'
  | 'wind'
  | 'none'

export interface BattleScreenShake {
  intensity: number // 0-1 (0 = no shake, 1 = max)
  duration: number // milliseconds
}

export interface BattleVisualEffects {
  // Border and overlay
  borderColor: string // hex or CSS color
  borderGlow: boolean // if true, add glow effect
  glowIntensity?: number // 0-1

  // Center animation
  centerAnimation: BattleVisualAnimation

  // Particles
  particleType: BattleParticleType
  particleCount?: number

  // Screen impact
  screenShake?: BattleScreenShake
  screenFlash?: boolean // white flash on impact

  // Timing
  animationDuration: number // milliseconds

  // Optional audio
  soundEffect?: string // file path or effect name
}

// Default visual effects for ability types
export const DEFAULT_BATTLE_VISUALS: Record<EffectKind | 'attack', BattleVisualEffects> = {
  'none': {
    borderColor: '#ffffff',
    borderGlow: false,
    centerAnimation: 'generic_impact',
    particleType: 'none',
    animationDuration: 1200,
  },
  'attack': {
    borderColor: '#ef4444',
    borderGlow: true,
    centerAnimation: 'claw_slash_3hit',
    particleType: 'blood_splatter',
    particleCount: 12,
    screenShake: { intensity: 0.4, duration: 300 },
    screenFlash: true,
    animationDuration: 1500,
    soundEffect: 'slash_attack',
  },
  'regen': {
    borderColor: '#22c55e',
    borderGlow: true,
    glowIntensity: 0.8,
    centerAnimation: 'healing_glow',
    particleType: 'healing_light',
    particleCount: 20,
    animationDuration: 1800,
    soundEffect: 'healing',
  },
  'heal': {
    borderColor: '#06b6d4',
    borderGlow: true,
    glowIntensity: 0.7,
    centerAnimation: 'healing_glow',
    particleType: 'healing_light',
    particleCount: 15,
    animationDuration: 1600,
    soundEffect: 'heal_spell',
  },
  'poison': {
    borderColor: '#a855f7',
    borderGlow: true,
    centerAnimation: 'poison_cloud',
    particleType: 'poison_gas',
    particleCount: 25,
    screenShake: { intensity: 0.2, duration: 200 },
    animationDuration: 2000,
    soundEffect: 'poison_cloud',
  },
  'stun': {
    borderColor: '#fbbf24',
    borderGlow: true,
    glowIntensity: 0.9,
    centerAnimation: 'electricity_crackle',
    particleType: 'electricity',
    particleCount: 18,
    screenShake: { intensity: 0.3, duration: 250 },
    screenFlash: true,
    animationDuration: 1400,
    soundEffect: 'electric_shock',
  },
  'shield': {
    borderColor: '#3b82f6',
    borderGlow: true,
    centerAnimation: 'shield_barrier',
    particleType: 'ice_crystals',
    particleCount: 10,
    animationDuration: 1200,
    soundEffect: 'shield_up',
  },
  'speed': {
    borderColor: '#06b6d4',
    borderGlow: true,
    centerAnimation: 'wind_gust',
    particleType: 'wind',
    particleCount: 15,
    screenShake: { intensity: 0.2, duration: 150 },
    animationDuration: 1300,
    soundEffect: 'speed_boost',
  },
  'power': {
    borderColor: '#ef4444',
    borderGlow: true,
    glowIntensity: 0.8,
    centerAnimation: 'fire_burst',
    particleType: 'fire_sparks',
    particleCount: 20,
    screenShake: { intensity: 0.35, duration: 280 },
    animationDuration: 1400,
    soundEffect: 'power_up',
  },
  'defense_down': {
    borderColor: '#f97316',
    borderGlow: true,
    centerAnimation: 'stone_crumble',
    particleType: 'fire_sparks',
    particleCount: 12,
    screenShake: { intensity: 0.15, duration: 200 },
    animationDuration: 1200,
    soundEffect: 'debuff',
  },
  'stop': {
    borderColor: '#fbbf24',
    borderGlow: true,
    centerAnimation: 'ice_spikes',
    particleType: 'ice_crystals',
    particleCount: 16,
    screenShake: { intensity: 0.25, duration: 200 },
    animationDuration: 1300,
    soundEffect: 'freeze',
  },
  'paralyze': {
    borderColor: '#fbbf24',
    borderGlow: true,
    centerAnimation: 'electricity_crackle',
    particleType: 'electricity',
    particleCount: 16,
    screenShake: { intensity: 0.2, duration: 200 },
    animationDuration: 1200,
    soundEffect: 'paralyze',
  },
}

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
  visualEffects?: BattleVisualEffects // New: visual effects for this ability
}

export interface PendingRewards {
  unspentStatPoints: number // Points earned from level-ups, not yet spent
  pendingAbilityIds: string[] // LEGACY: Ability IDs earned but not yet assigned to slots
  pendingAbilitySlot?: number // Which slot is being filled (0-5)
  pendingDiscoveries?: PendingDiscovery[] // NEW: ability discovery events (chest openings)
}

// Category of an ability discovery, decided at level-up time
export type DiscoveryCategory = 'class' | 'spec' | 'ultimate'

// A single ability-discovery "chest". Earned on level-up.
// optionIds is EMPTY until the player first opens the discovery modal,
// at which point the 3 options are generated and persisted so re-opening
// shows the exact same cards.
export interface PendingDiscovery {
  id: string // unique id for this discovery event
  category: DiscoveryCategory
  level: number // the level at which this discovery was earned
  optionIds: string[] // generated ability options (empty until first revealed)
}

export interface Dino {
  id: string
  name: string
  element?: string
  passive?: string
  sta?: number // Stamina - determines maxHp based on class/spec (NEW)
  maxHp: number // Current implementation - can be stamina-based or direct
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
  staminaToHpMultiplier?: number // How many HP per stamina point (1.0, 1.5, 2.0)

  // Pending rewards (earned but not yet spent)
  pendingRewards?: PendingRewards
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
