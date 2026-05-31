// DinoAbilityService - Manages ability instances on dinosaurs
// Bridges AbilityDefinition library to Dino storage

import { Dino, DinoAbility, ValidationResult } from '../../game/types'
import { abilityDefinitionService } from './abilityDefinitionService'
import { validationService } from './validationService'
import { slotService } from './slotService'

class DinoAbilityService {
  /**
   * Create empty ability slots for a new dinosaur
   * Slots 0-4 are regular abilities, slot 5 is ultimate
   */
  createAbilitySlots(dino: Dino): DinoAbility[] {
    const abilities: DinoAbility[] = []

    // Create 6 empty slots
    for (let i = 0; i < 6; i++) {
      abilities.push({
        name: '', // Empty
        cd: 0,
        kind: 'attack',
        effect: 'none',
      })
    }

    return abilities
  }

  /**
   * Assign an ability to a dino's slot
   */
  assignAbility(dino: Dino, slot: number, abilityId: string): ValidationResult {
    // Validate assignment
    const validation = validationService.validateAbilityAssignment(dino, slot, abilityId)
    if (!validation.valid) {
      return validation
    }

    // Get ability definition
    const abilityDef = abilityDefinitionService.getAbility(abilityId)
    if (!abilityDef) {
      return {
        valid: false,
        reason: 'Ability definition not found',
        code: 'ABILITY_NOT_FOUND',
      }
    }

    // Create or update the dino ability instance
    const dinoAbility: DinoAbility = {
      name: abilityDef.name,
      cd: 0,
      kind: abilityDef.kind,
      effect: abilityDef.effect,
      multiplier: abilityDef.damageMultiplier,
      icon: abilityDef.icon,
      description: abilityDef.description,
      isVampiric: abilityDef.isVampiric,
    }

    // Ensure dino.abilities array is large enough
    while (dino.abilities.length <= slot) {
      dino.abilities.push({
        name: '',
        cd: 0,
        kind: 'attack',
        effect: 'none',
      })
    }

    // Assign to slot
    dino.abilities[slot] = dinoAbility

    return { valid: true }
  }

  /**
   * Unassign an ability from a slot
   */
  unassignAbility(dino: Dino, slot: number): ValidationResult {
    if (slot < 0 || slot > 5) {
      return {
        valid: false,
        reason: `Invalid slot: ${slot}`,
        code: 'INVALID_SLOT',
      }
    }

    // Ensure dino.abilities array is large enough
    while (dino.abilities.length <= slot) {
      dino.abilities.push({
        name: '',
        cd: 0,
        kind: 'attack',
        effect: 'none',
      })
    }

    // Clear the slot
    dino.abilities[slot] = {
      name: '',
      cd: 0,
      kind: 'attack',
      effect: 'none',
    }

    return { valid: true }
  }

  /**
   * Get ability in a specific slot
   */
  getAbilityInSlot(dino: Dino, slot: number): DinoAbility | null {
    if (slot < 0 || slot > 5 || !dino.abilities[slot]) {
      return null
    }

    const ability = dino.abilities[slot]
    return ability.name ? ability : null
  }

  /**
   * Get all assigned abilities (excluding empty slots)
   */
  getAssignedAbilities(dino: Dino): DinoAbility[] {
    return dino.abilities.filter(a => !!a.name)
  }

  /**
   * Check if a slot can be modified (unlocked)
   */
  canModifySlot(dino: Dino, slot: number): boolean {
    return slotService.canClickSlot(dino, slot)
  }

  /**
   * Validate all abilities are correct
   */
  validateAllAbilities(dino: Dino): ValidationResult[] {
    return validationService.validateDinoAbilities(dino)
  }

  /**
   * Get ability by name (for lookup)
   */
  findAbilityByName(dino: Dino, name: string): DinoAbility | null {
    return dino.abilities.find(a => a.name === name) || null
  }

  /**
   * Count assigned abilities vs total slots
   */
  countAssignedAbilities(dino: Dino): { assigned: number; available: number } {
    let assigned = 0
    let available = 0

    for (let slot = 0; slot <= 5; slot++) {
      if (!slotService.isSlotLocked(dino, slot)) {
        available++
        if (slotService.isSlotFilled(dino, slot)) {
          assigned++
        }
      }
    }

    return { assigned, available }
  }

  /**
   * Lock abilities for a given level (remove high-slot abilities if appropriate)
   * This is called when a dino's level is set
   */
  lockAbilitiesForLevel(dino: Dino): void {
    for (let slot = 0; slot <= 5; slot++) {
      if (slotService.isSlotLocked(dino, slot)) {
        // Clear abilities in locked slots
        if (dino.abilities[slot]) {
          dino.abilities[slot] = {
            name: '',
            cd: 0,
            kind: 'attack',
            effect: 'none',
          }
        }
      }
    }
  }

  /**
   * Get recommended abilities for a dino's class/spec
   */
  getRecommendedAbilities(dino: Dino): any[] {
    if (!dino.class) return []

    let spec = dino.spec || 'starter'
    return abilityDefinitionService.getAbilitiesBySpec(dino.class, spec) || []
  }

  /**
   * Import ability from definition (used during leveling)
   */
  importFromDefinition(definitionId: string): DinoAbility | null {
    const def = abilityDefinitionService.getAbility(definitionId)
    if (!def) return null

    return {
      name: def.name,
      cd: 0,
      kind: def.kind,
      effect: def.effect,
      multiplier: def.damageMultiplier,
      icon: def.icon,
      description: def.description,
      isVampiric: def.isVampiric,
    }
  }
}

// Export singleton instance
export const dinoAbilityService = new DinoAbilityService()
