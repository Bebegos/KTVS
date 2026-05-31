// EffectService - Enhanced with healing support
// Manages effect lifecycle including passive healing (heal, regen effects)

import { getEffect, getEffectDamage } from '../effects'
import { BattleCharacter } from '../../game/types'

export interface EffectTickResult {
  totalDamage: number // Positive for damage, negative for healing
  healed: number // Just the healing amount (positive)
  damaged: number // Just the damage amount (positive)
}

class EffectService {
  /**
   * Apply an effect to a character during battle
   */
  applyEffect(character: BattleCharacter, effectId: string): boolean {
    const effect = getEffect(effectId)
    if (!effect) {
      console.warn(`Effect not found: ${effectId}`)
      return false
    }

    // Use effect's default level, fallback to level 1
    const defaultLevel = effect.defaultLevel || 1
    const duration = effect.levels[defaultLevel]?.duration || effect.levels[1]?.duration || 2

    if (!effect.levels[defaultLevel] && !effect.levels[1]) {
      console.warn(`No duration found for effect ${effectId} at levels ${defaultLevel} or 1`)
    }

    // Check if effect already exists
    const existingIdx = character.effects.findIndex(e => e.type === effectId)

    if (existingIdx !== -1) {
      // Reset duration if effect exists, mark as fresh
      character.effects[existingIdx].duration = duration
      character.effects[existingIdx].justApplied = true
    } else if (character.effects.length < 2) {
      // Add if slot available (max 2 effects)
      character.effects.push({
        type: effectId as any,
        duration,
        justApplied: true,
      })
    } else {
      // FIFO: remove oldest, add new
      character.effects.shift()
      character.effects.push({
        type: effectId as any,
        duration,
        justApplied: true,
      })
    }

    return true
  }

  /**
   * Tick all effects on a character - handles both damage and healing
   * CRITICAL FOR HEALING: This is where passive heal/regen effects happen
   */
  tickEffects(character: BattleCharacter): EffectTickResult {
    let totalDamage = 0
    let totalHealed = 0
    let totalDamaged = 0

    const newEffects = character.effects.filter(effect => {
      // Effects cast THIS round don't tick or decrement yet
      if (effect.justApplied) {
        return true // Keep it, just clear the flag
      }

      // Get effect definition to check what kind it is
      const effectDef = getEffect(effect.type)
      if (!effectDef) {
        return false // Remove invalid effects
      }

      // Get the damage/healing for this effect
      const effectDamage = getEffectDamage(effect.type, 1, character.maxHp)
      totalDamage += effectDamage

      // Track healing vs damage separately
      if (effectDamage < 0) {
        totalHealed += Math.abs(effectDamage) // Negative = healing
      } else if (effectDamage > 0) {
        totalDamaged += effectDamage
      }

      // Decrement duration
      const newDuration = effect.duration - 1
      if (newDuration > 0) {
        return true // Keep effect, duration will be updated below
      } else {
        // Log effect ending
        console.log(`Effect ${effectDef.name} ended`)
        return false // Remove expired effect
      }
    })

    // Update durations for remaining effects
    for (let i = 0; i < newEffects.length; i++) {
      if (!newEffects[i].justApplied) {
        newEffects[i].duration = Math.max(0, newEffects[i].duration - 1)
      } else {
        newEffects[i].justApplied = false
      }
    }

    character.effects = newEffects

    // Apply net damage/healing to HP
    // Negative totalDamage means healing (net positive HP)
    character.currentHp = Math.min(
      character.maxHp,
      Math.max(0, character.currentHp - totalDamage)
    )

    return {
      totalDamage,
      healed: totalHealed,
      damaged: totalDamaged,
    }
  }

  /**
   * Get all active effects on a character
   */
  getActiveEffects(character: BattleCharacter) {
    return character.effects
  }

  /**
   * Check if a character has a specific effect
   */
  hasEffect(character: BattleCharacter, effectId: string): boolean {
    return character.effects.some(e => e.type === effectId)
  }

  /**
   * Get remaining duration of an effect
   */
  getEffectDuration(character: BattleCharacter, effectId: string): number {
    const effect = character.effects.find(e => e.type === effectId)
    return effect?.duration || 0
  }

  /**
   * Remove a specific effect
   */
  removeEffect(character: BattleCharacter, effectId: string): boolean {
    const idx = character.effects.findIndex(e => e.type === effectId)
    if (idx !== -1) {
      character.effects.splice(idx, 1)
      return true
    }
    return false
  }

  /**
   * Clear all effects
   */
  clearAllEffects(character: BattleCharacter): void {
    character.effects = []
  }

  /**
   * Calculate total damage reduction from shield/defense effects
   */
  calculateDefenseBonus(character: BattleCharacter): number {
    let defenseBonus = 0

    for (const effect of character.effects) {
      const effectDef = getEffect(effect.type)
      if (!effectDef) continue

      // Only buff effects provide stat bonuses
      if (effectDef.type !== 'buff') continue

      // Get the def bonus from this effect
      const defaultLevel = effectDef.defaultLevel || 1
      const levelData = effectDef.levels[defaultLevel] || effectDef.levels[1]
      if (!levelData || !levelData.statBonus) continue

      defenseBonus += levelData.statBonus.def || 0
    }

    return defenseBonus
  }

  /**
   * Calculate total attack bonus from power effects
   */
  calculateAttackBonus(character: BattleCharacter): number {
    let attackBonus = 0

    for (const effect of character.effects) {
      const effectDef = getEffect(effect.type)
      if (!effectDef) continue

      // Only buff effects provide stat bonuses
      if (effectDef.type !== 'buff') continue

      // Get the atk bonus from this effect
      const defaultLevel = effectDef.defaultLevel || 1
      const levelData = effectDef.levels[defaultLevel] || effectDef.levels[1]
      if (!levelData || !levelData.statBonus) continue

      attackBonus += levelData.statBonus.atk || 0
    }

    return attackBonus
  }
}

// Export singleton instance
export const effectService = new EffectService()
