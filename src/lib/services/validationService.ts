// ValidationService - Cross-service validation for ability operations
// Ensures all validations happen consistently across the app

import { Dino, ValidationResult } from '../../game/types'
import { abilityDefinitionService } from './abilityDefinitionService'
import { slotService } from './slotService'

class ValidationService {
  /**
   * Validate an ability ID exists in the library
   */
  validateAbilityExists(abilityId: string): ValidationResult {
    if (!abilityId) {
      return {
        valid: false,
        reason: 'Ability ID is required',
        code: 'MISSING_ABILITY_ID',
      }
    }

    if (!abilityDefinitionService.validateAbilityId(abilityId)) {
      return {
        valid: false,
        reason: `Ability not found in library: ${abilityId}`,
        code: 'ABILITY_NOT_FOUND',
      }
    }

    return { valid: true }
  }

  /**
   * Validate an ability can be assigned to a dino's slot
   */
  validateAbilityAssignment(dino: Dino, slot: number, abilityId: string): ValidationResult {
    // Check ability exists
    const abilityCheck = this.validateAbilityExists(abilityId)
    if (!abilityCheck.valid) {
      return abilityCheck
    }

    // Check slot is valid
    if (slot < 0 || slot > 5) {
      return {
        valid: false,
        reason: `Invalid slot number: ${slot}`,
        code: 'INVALID_SLOT',
      }
    }

    // Check ability can be assigned to this slot
    const ability = abilityDefinitionService.getAbility(abilityId)
    if (!ability) {
      return {
        valid: false,
        reason: 'Ability definition not found',
        code: 'ABILITY_NOT_FOUND',
      }
    }

    // Ultimate slot must have ultimate ability
    if (slot === 5 && ability.kind !== 'ultimate') {
      return {
        valid: false,
        reason: 'Ultimate slot can only contain ultimate abilities',
        code: 'WRONG_ABILITY_TYPE',
      }
    }

    // Regular slots cannot have ultimate
    if (slot < 5 && ability.kind === 'ultimate') {
      return {
        valid: false,
        reason: 'Ultimate abilities can only go in ultimate slot',
        code: 'WRONG_ABILITY_TYPE',
      }
    }

    return { valid: true }
  }

  /**
   * Validate a slot can be clicked/modified
   */
  validateSlotAccess(dino: Dino, slot: number): ValidationResult {
    // Delegate to slot service
    return slotService.validateSlotClick(dino, slot)
  }

  /**
   * Validate an ability can be executed in battle
   */
  validateBattleAbilityExecution(
    dino: Dino,
    slot: number,
    isCooledDown: boolean,
    isStunned: boolean
  ): ValidationResult {
    // Check slot can execute
    const slotCheck = slotService.validateBattleSlotExecution(dino, slot)
    if (!slotCheck.valid) {
      return slotCheck
    }

    // Check cooldown
    if (!isCooledDown) {
      return {
        valid: false,
        reason: 'Ability is still on cooldown',
        code: 'ON_COOLDOWN',
      }
    }

    // Check stun/stop
    if (isStunned) {
      return {
        valid: false,
        reason: 'Cannot act while stunned or stopped',
        code: 'UNABLE_TO_ACT',
      }
    }

    return { valid: true }
  }

  /**
   * Validate an entire dino's ability configuration
   */
  validateDinoAbilities(dino: Dino): ValidationResult[] {
    const results: ValidationResult[] = []

    for (let slot = 0; slot <= 5; slot++) {
      const abilityId = dino.abilityIds[slot]

      if (!abilityId) {
        // Empty slot is okay if unlocked
        if (!slotService.isSlotLocked(dino, slot)) {
          results.push({
            valid: true,
            reason: `Slot ${slot} is empty but available`,
          })
        }
        continue
      }

      // Validate ability exists in library
      const abilityCheck = this.validateAbilityExists(abilityId)
      if (!abilityCheck.valid) {
        results.push({
          valid: false,
          reason: `Slot ${slot}: ${abilityCheck.reason}`,
          code: abilityCheck.code,
        })
      }

      // Validate it can be in this slot
      const assignmentCheck = this.validateAbilityAssignment(dino, slot, ability.name)
      if (!assignmentCheck.valid) {
        results.push({
          valid: false,
          reason: `Slot ${slot}: ${assignmentCheck.reason}`,
          code: assignmentCheck.code,
        })
      }
    }

    // Return overall result
    const hasErrors = results.some(r => !r.valid)
    return hasErrors ? results : [{ valid: true }]
  }
}

// Export singleton instance
export const validationService = new ValidationService()
