// DinoAbilityService - Manages ability IDs on dinosaurs
// Bridges AbilityDefinition library to Dino storage

import { Dino, ValidationResult } from '../../game/types'
import { abilityDefinitionService } from './abilityDefinitionService'
import { validationService } from './validationService'
import { slotService } from './slotService'

class DinoAbilityService {
  /**
   * Create empty ability slots for a new dinosaur
   * Slots 0-4 are regular abilities, slot 5 is ultimate
   */
  createAbilitySlots(): string[] {
    return Array(6).fill('')
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

    // Ensure abilityIds array is large enough
    while (dino.abilityIds.length <= slot) {
      dino.abilityIds.push('')
    }

    // Assign to slot
    dino.abilityIds[slot] = abilityId

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

    // Ensure abilityIds array is large enough
    while (dino.abilityIds.length <= slot) {
      dino.abilityIds.push('')
    }

    // Clear the slot
    dino.abilityIds[slot] = ''

    return { valid: true }
  }

  /**
   * Get ability ID in a specific slot
   */
  getAbilityIdInSlot(dino: Dino, slot: number): string | null {
    if (slot < 0 || slot > 5 || !dino.abilityIds[slot]) {
      return null
    }

    return dino.abilityIds[slot] || null
  }

  /**
   * Get ability definition in a specific slot
   */
  getAbilityInSlot(dino: Dino, slot: number): any {
    const abilityId = this.getAbilityIdInSlot(dino, slot)
    if (!abilityId) return null

    return abilityDefinitionService.getAbility(abilityId)
  }

  /**
   * Get all assigned ability IDs (excluding empty slots)
   */
  getAssignedAbilityIds(dino: Dino): string[] {
    return dino.abilityIds.filter(id => !!id)
  }

  /**
   * Get all assigned ability definitions
   */
  getAssignedAbilities(dino: Dino): any[] {
    return this.getAssignedAbilityIds(dino)
      .map(id => abilityDefinitionService.getAbility(id))
      .filter(ability => ability !== null)
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
   * Find ability ID by name (for lookup)
   */
  findAbilityIdByName(dino: Dino, name: string): string | null {
    for (const abilityId of dino.abilityIds) {
      if (abilityId) {
        const ability = abilityDefinitionService.getAbility(abilityId)
        if (ability?.name === name) {
          return abilityId
        }
      }
    }
    return null
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
   * Lock abilities for a given level (clear high-slot abilities if locked)
   */
  lockAbilitiesForLevel(dino: Dino): void {
    for (let slot = 0; slot <= 5; slot++) {
      if (slotService.isSlotLocked(dino, slot)) {
        dino.abilityIds[slot] = ''
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
}

// Export singleton instance
export const dinoAbilityService = new DinoAbilityService()
