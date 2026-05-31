// SlotService - CRITICAL: Enforces ability slot locking
// Single source of truth for slot validation and lock enforcement
// This prevents locked slots from being clickable or executable

import { Dino, SlotState, SlotStatus, ValidationResult } from '../../game/types'

// Slot unlock levels - when each slot becomes available
const SLOT_UNLOCK_LEVELS = {
  0: 0, // Slot 0: Always available
  1: 3, // Slot 1: Level 3
  2: 6, // Slot 2: Level 6
  3: 9, // Slot 3: Level 9
  4: 12, // Slot 4: Level 12
  5: 15, // Slot 5: Ultimate - Level 15
}

class SlotService {
  /**
   * Get the required level to unlock a specific slot
   */
  getSlotRequiredLevel(slot: number): number {
    if (slot < 0 || slot > 5) {
      console.warn(`Invalid slot number: ${slot}`)
      return Infinity
    }
    return SLOT_UNLOCK_LEVELS[slot as keyof typeof SLOT_UNLOCK_LEVELS] || Infinity
  }

  /**
   * Check if a slot is locked for a given dino's current level
   */
  isSlotLocked(dino: Dino, slot: number): boolean {
    if (slot < 0 || slot > 5) {
      console.warn(`Invalid slot number: ${slot}`)
      return true
    }

    const requiredLevel = this.getSlotRequiredLevel(slot)
    return dino.level < requiredLevel
  }

  /**
   * Check if a slot is unlocked and empty
   */
  isSlotUnlockedAndEmpty(dino: Dino, slot: number): boolean {
    if (this.isSlotLocked(dino, slot)) return false

    const ability = dino.abilities[slot]
    return !ability || !ability.name
  }

  /**
   * Check if a slot is filled with an ability
   */
  isSlotFilled(dino: Dino, slot: number): boolean {
    const ability = dino.abilities[slot]
    return !!ability && !!ability.name
  }

  /**
   * Compute the status of a slot
   */
  private computeSlotStatus(dino: Dino, slot: number): SlotStatus {
    if (this.isSlotLocked(dino, slot)) {
      return 'locked'
    }

    if (this.isSlotFilled(dino, slot)) {
      return 'filled'
    }

    return 'unlocked_empty'
  }

  /**
   * Check if a slot is clickable in the UI
   * CRITICAL: This is used to prevent interaction with locked slots
   */
  canClickSlot(dino: Dino, slot: number): boolean {
    // Cannot click if slot is locked
    if (this.isSlotLocked(dino, slot)) {
      return false
    }

    // Can click unlocked slots (empty or filled)
    return true
  }

  /**
   * Check if an ability can be executed from a slot during battle
   * CRITICAL: This is the battle-time validation
   */
  canExecuteAbilityFromSlot(dino: Dino, slot: number): boolean {
    // Cannot execute from locked slots
    if (this.isSlotLocked(dino, slot)) {
      return false
    }

    // Slot must have an ability
    if (!this.isSlotFilled(dino, slot)) {
      return false
    }

    return true
  }

  /**
   * Get the state of all slots for a dino
   */
  getSlotStates(dino: Dino): SlotState[] {
    const states: SlotState[] = []

    for (let slot = 0; slot <= 5; slot++) {
      const requiredLevel = this.getSlotRequiredLevel(slot)
      const status = this.computeSlotStatus(dino, slot)
      const ability = dino.abilities[slot]

      states.push({
        slot,
        status,
        abilityId: ability?.name, // Use name as ID for now
        requiredLevel,
        isClickable: this.canClickSlot(dino, slot),
      })
    }

    return states
  }

  /**
   * Validate a slot click (returns detailed validation result)
   */
  validateSlotClick(dino: Dino, slot: number): ValidationResult {
    if (slot < 0 || slot > 5) {
      return {
        valid: false,
        reason: `Invalid slot: ${slot}`,
        code: 'INVALID_SLOT',
      }
    }

    if (!this.canClickSlot(dino, slot)) {
      const requiredLevel = this.getSlotRequiredLevel(slot)
      return {
        valid: false,
        reason: `Slot opens at level ${requiredLevel}. Current level: ${dino.level}`,
        code: 'SLOT_LOCKED',
      }
    }

    return { valid: true }
  }

  /**
   * Validate ability execution from a slot in battle
   */
  validateBattleSlotExecution(dino: Dino, slot: number): ValidationResult {
    if (slot < 0 || slot > 5) {
      return {
        valid: false,
        reason: `Invalid slot: ${slot}`,
        code: 'INVALID_SLOT',
      }
    }

    if (!this.canExecuteAbilityFromSlot(dino, slot)) {
      if (this.isSlotLocked(dino, slot)) {
        const requiredLevel = this.getSlotRequiredLevel(slot)
        return {
          valid: false,
          reason: `Slot locked. Opens at level ${requiredLevel}`,
          code: 'SLOT_LOCKED',
        }
      }

      if (!this.isSlotFilled(dino, slot)) {
        return {
          valid: false,
          reason: 'Slot is empty',
          code: 'SLOT_EMPTY',
        }
      }

      return {
        valid: false,
        reason: 'Cannot execute from this slot',
        code: 'CANNOT_EXECUTE',
      }
    }

    return { valid: true }
  }

  /**
   * Get unlock progress for all slots
   */
  getUnlockProgress(dino: Dino): { unlocked: number; total: number } {
    let unlocked = 0
    for (let slot = 0; slot <= 5; slot++) {
      if (!this.isSlotLocked(dino, slot)) {
        unlocked++
      }
    }
    return { unlocked, total: 6 }
  }

  /**
   * Get human-readable unlock status for a slot
   */
  getSlotUnlockText(dino: Dino, slot: number): string {
    if (!this.isSlotLocked(dino, slot)) {
      return 'Açık'
    }

    const requiredLevel = this.getSlotRequiredLevel(slot)
    return `Seviye ${requiredLevel} açılır`
  }
}

// Export singleton instance
export const slotService = new SlotService()
