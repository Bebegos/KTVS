// AbilityDefinitionService - Single read-only access point to ability library
// This is the source of truth for all ability definitions

import {
  CLASS_ABILITIES,
  SPEC_ABILITIES,
  ULTIMATE_ABILITIES,
  getAbilityDefinition,
  AbilityDefinition as AbilityDef,
} from '../abilities'
import { AbilityType, EffectKind } from '../../game/types'

export interface AbilityDefinition {
  id: string
  name: string
  icon?: string
  emoji?: string
  kind: AbilityType
  category?: string
  cooldown: number
  damageMultiplier?: number
  effect: EffectKind
  description?: string
  fullDescription?: string
  isVampiric?: boolean
  isPassive?: boolean
  classId?: string
  specId?: string
}

class AbilityDefinitionService {
  /**
   * Get a single ability definition by ID
   */
  getAbility(id: string): AbilityDefinition | null {
    const abilityDef = getAbilityDefinition(id)
    if (!abilityDef) return null

    return {
      id: abilityDef.id,
      name: abilityDef.name,
      icon: abilityDef.icon,
      emoji: abilityDef.emoji,
      kind: abilityDef.kind as AbilityType,
      category: abilityDef.category,
      cooldown: abilityDef.cooldown || 0,
      damageMultiplier: abilityDef.damageMultiplier,
      effect: abilityDef.effect as EffectKind,
      description: abilityDef.description,
      fullDescription: abilityDef.fullDescription,
      isPassive: abilityDef.isPassive,
    }
  }

  /**
   * Get all abilities for a class
   */
  getAbilitiesByClass(classId: string): AbilityDefinition[] {
    const classAbilities = CLASS_ABILITIES[classId]
    if (!classAbilities) return []

    const abilities: AbilityDefinition[] = []

    // Get class base abilities
    if (Array.isArray(classAbilities.abilities)) {
      for (const ability of classAbilities.abilities) {
        abilities.push({
          id: ability.id,
          name: ability.name,
          icon: ability.icon,
          emoji: ability.emoji,
          kind: ability.kind as AbilityType,
          category: ability.category,
          cooldown: ability.cooldown || 0,
          damageMultiplier: ability.damageMultiplier,
          effect: ability.effect as EffectKind,
          description: ability.description,
          fullDescription: ability.fullDescription,
          isPassive: ability.isPassive,
          classId,
        })
      }
    }

    return abilities
  }

  /**
   * Get all abilities for a spec
   */
  getAbilitiesBySpec(classId: string, specId: string): AbilityDefinition[] {
    const specAbilities = SPEC_ABILITIES[specId]
    if (!specAbilities || specAbilities.classId !== classId) return []

    const abilities: AbilityDefinition[] = []

    if (Array.isArray(specAbilities.abilities)) {
      for (const ability of specAbilities.abilities) {
        abilities.push({
          id: ability.id,
          name: ability.name,
          icon: ability.icon,
          emoji: ability.emoji,
          kind: ability.kind as AbilityType,
          category: ability.category,
          cooldown: ability.cooldown || 0,
          damageMultiplier: ability.damageMultiplier,
          effect: ability.effect as EffectKind,
          description: ability.description,
          fullDescription: ability.fullDescription,
          isPassive: ability.isPassive,
          classId,
          specId,
        })
      }
    }

    return abilities
  }

  /**
   * Get all ultimate abilities
   */
  getUltimateAbilities(): AbilityDefinition[] {
    const ultimates: AbilityDefinition[] = []

    for (const ultimateId in ULTIMATE_ABILITIES) {
      const ability = ULTIMATE_ABILITIES[ultimateId]
      if (ability) {
        ultimates.push({
          id: ability.id,
          name: ability.name,
          icon: ability.icon,
          emoji: ability.emoji,
          kind: 'ultimate' as AbilityType,
          category: ability.category,
          cooldown: ability.cooldown || 0,
          damageMultiplier: ability.damageMultiplier,
          effect: ability.effect as EffectKind,
          description: ability.description,
          fullDescription: ability.fullDescription,
          isPassive: ability.isPassive,
        })
      }
    }

    return ultimates
  }

  /**
   * Validate if an ability ID exists in the library
   */
  validateAbilityId(id: string): boolean {
    return this.getAbility(id) !== null
  }

  /**
   * Get ability name by ID
   */
  getAbilityName(id: string): string {
    const ability = this.getAbility(id)
    return ability?.name || 'Unknown Ability'
  }

  /**
   * Check if ability is vampiric (deals damage + heals)
   * Note: isVampiric is stored on DinoAbility, not on definition
   */
  isVampiric(id: string): boolean {
    // This property is set per-instance in DinoAbility, not in the definition
    return false
  }

  /**
   * Check if ability is a healing type
   */
  isHealAbility(id: string): boolean {
    const ability = this.getAbility(id)
    return ability?.kind === 'heal'
  }

  /**
   * Get ability cooldown
   */
  getAbilityCooldown(id: string): number {
    const ability = this.getAbility(id)
    return ability?.cooldown || 0
  }

  /**
   * Get ability damage multiplier
   */
  getAbilityMultiplier(id: string): number {
    const ability = this.getAbility(id)
    return ability?.damageMultiplier || 1
  }
}

// Export singleton instance
export const abilityDefinitionService = new AbilityDefinitionService()
