// Leveling system - generates ability rewards based on level
import {
  getClassAbilities,
  getSpecAbilities,
  getUltimateAbility,
  getRandomAbilityFromList,
  CLASS_ABILITIES,
  SPEC_ABILITIES,
  ULTIMATE_ABILITIES,
} from './abilities'
import { Dino, DinoAbility } from '../game/types'
import { getAbilityIcon } from './icons'

export interface LevelUpReward {
  type: 'class_ability' | 'spec_ability' | 'ultimate'
  ability: any
  message: string
}

/**
 * Determines if a dinosaur gets an ability reward on level up
 * Every level: class ability
 * Every 5 levels: spec ability
 * Every 10 levels: ultimate
 */
export function getLevelUpReward(newLevel: number, classId: string, specId: string): LevelUpReward | null {
  // Every 10 levels: ultimate ability
  if (newLevel % 10 === 0) {
    return getUltimateReward(classId, specId, newLevel)
  }

  // Every 5 levels: spec ability
  if (newLevel % 5 === 0) {
    return getSpecAbilityReward(classId, specId, newLevel)
  }

  // Every level: class ability
  return getClassAbilityReward(classId, newLevel)
}

function getClassAbilityReward(classId: string, level: number): LevelUpReward | null {
  const classAbilities = getClassAbilities(classId)
  if (!classAbilities) return null

  const randomAbility = getRandomAbilityFromList(classAbilities.abilities)
  const icon = getAbilityIcon(randomAbility.icon)

  return {
    type: 'class_ability',
    ability: randomAbility,
    message: `🆕 Seviye ${level}: ${icon?.emoji || '⚔️'} ${randomAbility.name} yeteneği açıldı!`,
  }
}

function getSpecAbilityReward(classId: string, specId: string, level: number): LevelUpReward | null {
  const specAbilities = getSpecAbilities(specId)
  if (!specAbilities) return null

  const randomAbility = getRandomAbilityFromList(specAbilities.abilities)
  const icon = getAbilityIcon(randomAbility.icon)

  return {
    type: 'spec_ability',
    ability: randomAbility,
    message: `⭐ Seviye ${level}: ${icon?.emoji || '✨'} ${randomAbility.name} özel yeteneği açıldı!`,
  }
}

function getUltimateReward(classId: string, specId: string, level: number): LevelUpReward | null {
  // Get random ultimate for this class
  const allUltimates = Object.values(ULTIMATE_ABILITIES)
  // In future, could filter by class/spec compatibility
  const randomUltimate = allUltimates[Math.floor(Math.random() * allUltimates.length)]

  if (!randomUltimate) return null

  const icon = getAbilityIcon(randomUltimate.icon)

  return {
    type: 'ultimate',
    ability: randomUltimate,
    message: `🔥 SEVİYE ${level}: ${icon?.emoji || '⚡'} ${randomUltimate.name} Ultimate yeteneği açıldı!`,
  }
}

/**
 * Converts an ability from library to DinoAbility for storage
 */
export function abilityToDinoAbility(ability: any): DinoAbility {
  const dinoAbility: DinoAbility = {
    name: ability.name,
    cd: ability.cooldown || 0,
    kind: ability.kind,
    effect: ability.effect,
    multiplier: ability.damageMultiplier || 0,
    icon: ability.icon,
  }

  // Preserve vampiric flag for life steal abilities (Bloodlust, etc.)
  if (ability.isVampiric) {
    (dinoAbility as any).isVampiric = true
  }

  return dinoAbility
}

/**
 * Add ability reward to dinozor's ability slots
 * Replaces placeholder slots or overwrites older abilities if needed
 */
export function addAbilityReward(dino: Dino, reward: LevelUpReward): Dino {
  const newAbilities = [...dino.abilities]
  const newAbility = abilityToDinoAbility(reward.ability)

  // Look for placeholder slots
  const placeholderIdx = newAbilities.findIndex(a => a.name.includes('[') && a.name.includes(']'))

  if (placeholderIdx !== -1) {
    // Replace placeholder
    newAbilities[placeholderIdx] = newAbility
  } else if (newAbilities.length < 5) {
    // Add to empty slot if available
    newAbilities.push(newAbility)
  } else {
    // Replace oldest non-essential ability (last one usually)
    newAbilities[newAbilities.length - 1] = newAbility
  }

  return {
    ...dino,
    abilities: newAbilities,
  }
}

/**
 * Helper to calculate XP needed for next level
 * Scales quadratically: 100 * level^1.5
 */
export function xpForNextLevel(currentLevel: number): number {
  return Math.floor(100 * Math.pow(currentLevel, 1.5))
}

/**
 * Check if dinozor should level up
 */
export function checkLevelUp(dino: Dino): { newLevel: number; reward: LevelUpReward | null } | null {
  const xpNeeded = xpForNextLevel(dino.level)

  if (dino.xp >= xpNeeded) {
    const newLevel = dino.level + 1
    const reward = getLevelUpReward(newLevel, dino.class || 'big_carnivore', dino.spec || 'armored')

    return { newLevel, reward }
  }

  return null
}
