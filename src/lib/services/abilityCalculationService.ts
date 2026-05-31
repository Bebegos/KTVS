// AbilityCalculationService - Calculates ability values at battle time
// Abilities scale from dino stats + bonuses, not pre-calculated values
// This is the single source of truth for ability mechanics

import { Dino, BattleCharacter } from '../../game/types'
import { abilityDefinitionService } from './abilityDefinitionService'
import { effectService } from './effectService'
import { getEffect } from '../effects'

export interface AbilityCalculationResult {
  baseDamage: number
  finalDamage: number
  healAmount?: number
  effectIds: string[]
  effectTexts: string[]
  description: string // Dynamic description with calculated values
}

class AbilityCalculationService {
  /**
   * Calculate ability's base damage before applying defense/variance
   */
  calculateAbilityBaseDamage(
    abilityId: string,
    attacker: Dino,
    attacker_bonuses: { atk?: number; def?: number; spd?: number } = {}
  ): number {
    const ability = abilityDefinitionService.getAbility(abilityId)
    if (!ability) {
      console.warn(`Ability not found: ${abilityId}`)
      return 0
    }

    // Attack abilities scale from ATK
    if (ability.statScaling === 'atk') {
      const baseStat = attacker.atk || 5
      const atkBonus = attacker_bonuses.atk || 0
      return baseStat * (1 + atkBonus / 100) * (ability.damageMultiplier || 1)
    }

    // Defensive/protect abilities scale from DEF
    if (ability.statScaling === 'def') {
      const baseStat = attacker.def || 5
      const defBonus = attacker_bonuses.def || 0
      return baseStat * (1 + defBonus / 100) * (ability.damageMultiplier || 1)
    }

    // Speed-based abilities scale from SPD
    if (ability.statScaling === 'spd') {
      const baseStat = attacker.spd || 5
      const spdBonus = attacker_bonuses.spd || 0
      return baseStat * (1 + spdBonus / 100) * (ability.damageMultiplier || 1)
    }

    // HP-based abilities scale from HP
    if (ability.statScaling === 'hp') {
      return attacker.maxHp * (ability.damageMultiplier || 1)
    }

    return 0
  }

  /**
   * Calculate ability's healing amount
   */
  calculateAbilityHealing(
    abilityId: string,
    healer: Dino,
    healer_bonuses: { atk?: number; def?: number; spd?: number } = {}
  ): number {
    const ability = abilityDefinitionService.getAbility(abilityId)
    if (!ability) return 0

    // Healing abilities typically scale from DEF or ATK
    if (ability.statScaling === 'def') {
      const baseStat = healer.def || 5
      const defBonus = healer_bonuses.def || 0
      return baseStat * (1 + defBonus / 100) * (ability.damageMultiplier || 1)
    }

    if (ability.statScaling === 'atk') {
      const baseStat = healer.atk || 5
      const atkBonus = healer_bonuses.atk || 0
      return baseStat * (1 + atkBonus / 100) * (ability.damageMultiplier || 1)
    }

    return 0
  }

  /**
   * Get effect's display name and icon
   */
  getEffectDisplay(effectId: string): { name: string; emoji: string } {
    const effect = getEffect(effectId)
    return {
      name: effect?.name || effectId,
      emoji: effect?.emoji || '❓',
    }
  }

  /**
   * Calculate and format ability description with actual values
   */
  getAbilityDescription(
    abilityId: string,
    dino: Dino,
    bonuses: { atk?: number; def?: number; spd?: number } = {}
  ): string {
    const ability = abilityDefinitionService.getAbility(abilityId)
    if (!ability) return 'Bilinmiyor'

    // Get base values
    let baseValue = 0
    let valueType = ''

    if (ability.kind === 'heal') {
      baseValue = this.calculateAbilityHealing(abilityId, dino, bonuses)
      valueType = 'heal'
    } else if (ability.kind === 'attack' || ability.kind === 'debuff') {
      baseValue = this.calculateAbilityBaseDamage(abilityId, dino, bonuses)
      valueType = 'dmg'
    }

    // Format with color based on type
    const valueColor = valueType === 'heal' ? 'text-green-400' : 'text-red-400'
    const valueBg = valueType === 'heal' ? 'bg-green-500/20' : 'bg-red-500/20'

    // Build description
    let description = ability.description

    // Replace placeholders or append if needed
    if (!description.includes('<') && baseValue > 0) {
      description += ` <span class="${valueBg} ${valueColor} px-2 py-1 rounded font-bold">${Math.round(baseValue)}</span>`
    }

    return description
  }

  /**
   * Get all effect IDs and their display info for an ability
   */
  getAbilityEffects(abilityId: string): Array<{ id: string; name: string; emoji: string }> {
    const ability = abilityDefinitionService.getAbility(abilityId)
    if (!ability || !ability.effects || ability.effects.length === 0) {
      return []
    }

    return ability.effects.map(effectId => ({
      id: effectId,
      ...this.getEffectDisplay(effectId),
    }))
  }
}

export const abilityCalculationService = new AbilityCalculationService()
