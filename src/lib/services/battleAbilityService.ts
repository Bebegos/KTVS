// BattleAbilityService - Manages ability execution during battles
// Uses other services for validation and effect application

import { BattleCharacter, BattleAbility, ValidationResult } from '../../game/types'
import { slotService } from './slotService'
import { abilityDefinitionService } from './abilityDefinitionService'
import { effectService } from './effectService'
import { validationService } from './validationService'

export interface AbilityExecutionResult {
  damage: number
  healAmount: number
  effectApplied: string | null
  message: string
  targetDied: boolean
}

class BattleAbilityService {
  /**
   * Initialize battle abilities from a dino's stored abilities
   * CRITICAL: Only includes non-locked abilities
   */
  initializeBattleAbilities(character: BattleCharacter, dino: any): BattleAbility[] {
    const battleAbilities: BattleAbility[] = []

    // Go through each stored ability
    for (let slot = 0; slot <= 5; slot++) {
      const storedAbility = dino.abilities?.[slot]

      // Skip empty slots
      if (!storedAbility || !storedAbility.name) {
        continue
      }

      // CRITICAL: Skip locked slots
      if (slotService.isSlotLocked(dino, slot)) {
        continue
      }

      // Get ability definition for full details
      const def = abilityDefinitionService.getAbility(storedAbility.name)
      if (!def) {
        console.warn(`Ability definition not found: ${storedAbility.name}`)
        continue
      }

      // Create battle ability with initial cooldown
      const battleAbility: BattleAbility = {
        abilityId: storedAbility.name,
        name: def.name,
        kind: def.kind as any,
        effects: def.effects || [],
        multiplier: def.damageMultiplier || 1,
        icon: def.icon,
        description: def.description,
        isVampiric: def.isVampiric || false,
        cd: 0, // Initial cooldown is 0
        maxCd: def.cooldown || 0,
        isAvailable: true,
      }

      battleAbilities.push(battleAbility)
    }

    // Store cooldowns
    character.cooldowns = new Array(battleAbilities.length).fill(0)

    return battleAbilities
  }

  /**
   * Check if an ability can be used (validation)
   */
  canUseAbility(
    character: BattleCharacter,
    dino: any,
    abilityIdx: number
  ): ValidationResult {
    // Check ability exists
    if (abilityIdx < 0 || !character.abilities[abilityIdx]) {
      return {
        valid: false,
        reason: 'Ability not found',
        code: 'ABILITY_NOT_FOUND',
      }
    }

    const ability = character.abilities[abilityIdx]

    // Check cooldown
    const cooldown = character.cooldowns[abilityIdx] || 0
    if (cooldown > 0) {
      return {
        valid: false,
        reason: `Cooldown: ${cooldown} turns`,
        code: 'ON_COOLDOWN',
      }
    }

    // Check stun/stop effects
    const isStunned = character.effects.some(
      e => e.type === 'stun' || e.type === 'stop'
    )
    if (isStunned) {
      return {
        valid: false,
        reason: 'Cannot act (stunned/stopped)',
        code: 'UNABLE_TO_ACT',
      }
    }

    return { valid: true }
  }

  /**
   * Execute an ability from a character against a target
   */
  executeAbility(
    attacker: BattleCharacter,
    defender: BattleCharacter,
    attackerDino: any,
    abilityIdx: number
  ): AbilityExecutionResult {
    const ability = attacker.abilities[abilityIdx] as any as BattleAbility
    if (!ability) {
      throw new Error(`Ability ${abilityIdx} not found`)
    }

    let finalDamage = 0
    let healAmount = 0
    let message = ''
    let targetDied = false

    // Handle healing abilities
    if (ability.kind === 'heal') {
      const isVampiric = (ability as any).isVampiric === true

      if (isVampiric) {
        // Vampiric: deal damage to opponent, heal attacker for 50%
        const baseDamage = this.calculateDamage(attacker, defender, ability)
        finalDamage = Math.round(baseDamage)
        defender.currentHp = Math.max(0, defender.currentHp - finalDamage)

        // Heal attacker for 50% of damage dealt
        healAmount = Math.round(finalDamage * 0.5)
        attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + healAmount)
        message = `${ability.name} [${finalDamage} DMG] 🩸 +${healAmount} HP`
        targetDied = defender.currentHp <= 0
      } else {
        // Pure healing: heal attacker only
        const baseHeal = attacker.atk * (ability.multiplier || 1)
        healAmount = Math.round(baseHeal)
        attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + healAmount)
        message = `${ability.name} [+${healAmount} HP]`
      }
    } else {
      // Damage abilities (attack, debuff, buff)
      const baseDamage = this.calculateDamage(attacker, defender, ability)
      finalDamage = Math.round(baseDamage)

      // Apply damage to defender
      defender.currentHp = Math.max(0, defender.currentHp - finalDamage)
      message = `${ability.name} [${finalDamage} DMG]`
      targetDied = defender.currentHp <= 0
    }

    // Apply effects - buffs/heals go to attacker, debuffs go to defender
    let effectApplied: string | null = null
    if (ability.effects && ability.effects.length > 0) {
      const effectTarget =
        ability.kind === 'buff' || ability.kind === 'heal' ? attacker : defender
      const appliedEffects: string[] = []
      for (const effectId of ability.effects) {
        const applied = effectService.applyEffect(effectTarget, effectId as any)
        if (applied) {
          // Get effect name from library
          const effectDef = abilityDefinitionService.getAbility(ability.abilityId)
          const effect = effectDef ? `${effectDef.name}` : String(effectId)
          appliedEffects.push(effect)
        }
      }
      if (appliedEffects.length > 0) {
        effectApplied = appliedEffects.join(' + ')
      }
    }

    // Set cooldown
    attacker.cooldowns[abilityIdx] = ability.maxCd

    return {
      damage: finalDamage,
      healAmount,
      effectApplied,
      message,
      targetDied,
    }
  }

  /**
   * Calculate damage with all modifiers
   */
  private calculateDamage(
    attacker: BattleCharacter,
    defender: BattleCharacter,
    ability: BattleAbility
  ): number {
    const baseDamage = attacker.atk * (ability.multiplier || 1)
    const variance = 0.8 + Math.random() * 0.4 // 0.8x to 1.2x

    // Apply defense reduction
    const defenseMultiplier = 100 / (100 + defender.def)

    // Apply attack bonuses from effects
    const attackBonus = effectService.calculateAttackBonus(attacker)

    // Apply defense bonuses/reductions
    const defenseBonus = effectService.calculateDefenseBonus(defender)
    const defenseMultiplierFromEffects = 1 - defenseBonus / 100

    const finalDamage =
      baseDamage *
      variance *
      defenseMultiplier *
      (1 + attackBonus / 100) *
      Math.max(0.1, defenseMultiplierFromEffects)

    return Math.max(1, finalDamage)
  }

  /**
   * Decrement cooldowns
   */
  decrementCooldowns(character: BattleCharacter): void {
    for (let i = 0; i < character.cooldowns.length; i++) {
      character.cooldowns[i] = Math.max(0, character.cooldowns[i] - 1)
    }
  }

  /**
   * Get current cooldown for an ability
   */
  getCooldown(character: BattleCharacter, abilityIdx: number): number {
    return character.cooldowns[abilityIdx] || 0
  }

  /**
   * Get ability description with status
   */
  getAbilityStatus(character: BattleCharacter, abilityIdx: number): string {
    const ability = character.abilities[abilityIdx]
    if (!ability) return 'N/A'

    const cooldown = this.getCooldown(character, abilityIdx)
    if (cooldown > 0) {
      return `CD: ${cooldown}`
    }

    return 'Ready'
  }
}

// Export singleton instance
export const battleAbilityService = new BattleAbilityService()
