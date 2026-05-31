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
   * Get the base stat for an ability based on scaling type
   */
  private getBaseStat(
    attacker: Dino,
    statScaling: string,
    bonuses: { atk?: number; def?: number; spd?: number } = {}
  ): number {
    const atk = attacker.atk || 5
    const def = attacker.def || 5
    const spd = attacker.spd || 5
    const hp = attacker.maxHp || 10

    const atkBonus = 1 + (bonuses.atk || 0) / 100
    const defBonus = 1 + (bonuses.def || 0) / 100
    const spdBonus = 1 + (bonuses.spd || 0) / 100

    const atkWithBonus = atk * atkBonus
    const defWithBonus = def * defBonus
    const spdWithBonus = spd * spdBonus

    switch (statScaling) {
      case 'atk':
        return atkWithBonus
      case 'def':
        return defWithBonus
      case 'spd':
        return spdWithBonus
      case 'hp':
        return hp
      case 'max_atk_def':
        return Math.max(atkWithBonus, defWithBonus)
      case 'max_atk_spd':
        return Math.max(atkWithBonus, spdWithBonus)
      case 'max_def_spd':
        return Math.max(defWithBonus, spdWithBonus)
      case 'avg_atk_def':
        return (atkWithBonus + defWithBonus) / 2
      case 'avg_atk_spd':
        return (atkWithBonus + spdWithBonus) / 2
      case 'avg_def_spd':
        return (defWithBonus + spdWithBonus) / 2
      case 'fixed':
        return 1
      default:
        return atkWithBonus
    }
  }

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

    const baseStat = this.getBaseStat(attacker, ability.statScaling, attacker_bonuses)
    return baseStat * (ability.damageMultiplier || 1)
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

    const baseStat = this.getBaseStat(healer, ability.statScaling, healer_bonuses)
    return baseStat * (ability.damageMultiplier || 1)
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
    let description = ability.description || ''

    // Replace placeholders or append if needed
    if (baseValue > 0 && !description.includes('<')) {
      description += ` <span class="${valueBg} ${valueColor} px-2 py-1 rounded font-bold">${Math.round(baseValue)}</span>`
    }

    return description || 'Bilinmiyor'
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
