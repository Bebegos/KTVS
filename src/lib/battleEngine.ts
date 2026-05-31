// Battle Engine - Single source of truth for ALL battle mechanics
// Used by: PvE, PvP (Düello), Offline battles
// Manages: Turn order, damage, effects, abilities, cooldowns, win/lose
//
// HEALING MECHANICS (3 types):
// 1. Direct Healing (kind: 'heal'):
//    - Pure healing: Heal attacker based on ATK * multiplier (e.g., Nurture, Antidote Mastery)
//    - Vampiric/Lifesteal: Deal damage to opponent + heal attacker for 50% of damage dealt (e.g., Bloodlust/Kan Hortumu)
// 2. Passive Healing from Effects:
//    - 'heal' effect: Applies healing each turn for duration (e.g., Nurture passive)
//    - 'regen' effect: Applies regeneration each turn (e.g., Natural Recovery passive)
//    - Healing applied via applyEffectDamageAndDecrement() which uses negative damage values
// 3. Stat-based Buff Healing:
//    - Effects like 'shield' increase DEF reducing damage taken (indirect healing via damage reduction)

import { Dino, ActiveEffect } from '../game/types'
import { getEffectDamage, getEffect } from './effects'
import { abilityDefinitionService } from './services/abilityDefinitionService'

// Use AbilityDefinition from the service which is the new canonical form
export type AbilityForBattle = ReturnType<typeof abilityDefinitionService.getAbility> & { cd?: number; multiplier?: number }

// ============= TYPES =============

export interface BattleCharacter {
  dino: Dino
  currentHp: number
  effects: ActiveEffect[]
  abilities: any[] // Ability definitions loaded from library
  abilityIds: string[] // Corresponding ability IDs for each ability
  cooldowns: number[] // Cooldown for each ability by index
}

export interface BattleState {
  player: BattleCharacter
  opponent: BattleCharacter
  round: number
  isPlayerTurn: boolean
  battleLog: string[]
  battleEnded: boolean
  winner: 'player' | 'opponent' | null
}

export interface AbilityExecutionResult {
  damage: number
  effectApplied: string | null
  message: string
  targetDied: boolean
}

export interface RoundResult {
  playerAction: AbilityExecutionResult
  opponentAction: AbilityExecutionResult
  effectDamage: { playerDamage: number; opponentDamage: number }
  battleEnded: boolean
  winner: 'player' | 'opponent' | null
}

// ============= BATTLE ENGINE =============

export class BattleEngine {
  private state: BattleState

  constructor(playerDino: Dino, opponentDino: Dino) {
    this.state = {
      player: this.initializeBattleCharacter(playerDino),
      opponent: this.initializeBattleCharacter(opponentDino),
      round: 1,
      isPlayerTurn: playerDino.spd >= opponentDino.spd,
      battleLog: [
        playerDino.spd >= opponentDino.spd ? '🚀 Oyuncu başlıyor!' : '🚀 Rakip başlıyor!',
      ],
      battleEnded: false,
      winner: null,
    }
  }

  // ===== INITIALIZATION =====

  private initializeBattleCharacter(dino: Dino): BattleCharacter {
    // Load ability definitions from library using abilityIds
    const abilityIds: string[] = []
    const abilities: any[] = []

    for (const id of dino.abilityIds) {
      if (id) {
        const ability = abilityDefinitionService.getAbility(id)
        if (ability) {
          abilityIds.push(id)
          abilities.push(ability)
        }
      }
    }

    return {
      dino,
      currentHp: dino.maxHp,
      effects: [],
      abilities,
      abilityIds,
      cooldowns: new Array(abilities.length).fill(0),
    }
  }

  // ===== GETTERS =====

  getState(): BattleState {
    return this.state
  }

  getCurrentRound(): number {
    return this.state.round
  }

  getPlayerHpPercent(): number {
    return (this.state.player.currentHp / this.state.player.dino.maxHp) * 100
  }

  getOpponentHpPercent(): number {
    return (this.state.opponent.currentHp / this.state.opponent.dino.maxHp) * 100
  }

  getBattleLog(): string[] {
    return this.state.battleLog
  }

  isBattleEnded(): boolean {
    return this.state.battleEnded
  }

  getWinner(): 'player' | 'opponent' | null {
    return this.state.winner
  }

  canUseAbility(character: 'player' | 'opponent', abilityIdx: number): boolean {
    const char = character === 'player' ? this.state.player : this.state.opponent

    // Check if ability exists
    if (!char.abilities[abilityIdx]) return false

    // Check cooldown
    if (char.cooldowns[abilityIdx] > 0) return false

    // Check if stunned or stopped
    if (char.effects.some(e => e.type === 'stun' || e.type === 'stop')) return false

    return true
  }

  // ===== ABILITY EXECUTION =====

  executeAbility(character: 'player' | 'opponent', abilityIdx: number): AbilityExecutionResult {
    const attacker = character === 'player' ? this.state.player : this.state.opponent
    const defender = character === 'player' ? this.state.opponent : this.state.player
    const ability = attacker.abilities[abilityIdx]

    if (!ability) {
      throw new Error(`Ability ${abilityIdx} not found for ${character}`)
    }

    // Validate ability structure
    if (!ability.kind || !ability.name) {
      throw new Error(`Invalid ability structure at index ${abilityIdx}`)
    }

    let finalDamage = 0
    let healAmount = 0
    let message = ''
    let targetDied = false

    // Handle different ability kinds
    if (ability.kind === 'heal') {
      // Pure healing or vampiric healing
      // Vampiric abilities (like Bloodlust) deal damage AND heal
      const isVampiric = (ability as any).isVampiric === true

      if (isVampiric) {
        // Vampiric: deal damage to opponent, heal attacker for portion of damage
        const baseDamage = this.calculateDamage(attacker, defender, ability)
        finalDamage = Math.round(baseDamage)
        defender.currentHp = Math.max(0, defender.currentHp - finalDamage)

        // Heal attacker for 50% of damage dealt (standard lifesteal)
        healAmount = Math.round(finalDamage * 0.5)
        attacker.currentHp = Math.min(attacker.dino.maxHp, attacker.currentHp + healAmount)
        message = `${character === 'player' ? '👤' : '👹'} ${ability.name} [${finalDamage} DMG] 🩸 +${healAmount} HP`
        targetDied = defender.currentHp <= 0
      } else {
        // Pure healing: heal attacker only
        const baseHeal = attacker.dino.atk * (ability.damageMultiplier || ability.multiplier || 1)
        healAmount = Math.round(baseHeal)
        attacker.currentHp = Math.min(attacker.dino.maxHp, attacker.currentHp + healAmount)
        message = `${character === 'player' ? '👤' : '👹'} ${ability.name} [+${healAmount} HP]`
      }
    } else {
      // Damage abilities (attack, debuff, buff)
      const baseDamage = this.calculateDamage(attacker, defender, ability)
      finalDamage = Math.round(baseDamage)

      // Apply damage to defender
      defender.currentHp = Math.max(0, defender.currentHp - finalDamage)
      message = `${character === 'player' ? '👤' : '👹'} ${ability.name} [${finalDamage} DMG]`
      targetDied = defender.currentHp <= 0
    }

    // Apply effects - buff goes to attacker, debuff goes to defender, heal goes to attacker
    const appliedEffects: string[] = []
    if (ability.effects && ability.effects.length > 0) {
      // Determine target: buffs and heal effects go to attacker, debuffs go to defender
      const effectTarget = (ability.kind === 'buff' || ability.kind === 'heal') ? attacker : defender
      for (const effectId of ability.effects) {
        const appliedName = this.applyEffect(effectTarget, effectId)
        if (appliedName) {
          appliedEffects.push(appliedName)
        }
      }
    }
    const effectApplied = appliedEffects.length > 0 ? appliedEffects.join(' + ') : null

    // Set cooldown (ensure cooldown array is properly sized)
    if (!attacker.cooldowns || attacker.cooldowns.length <= abilityIdx) {
      attacker.cooldowns = new Array(attacker.abilities.length).fill(0)
    }
    attacker.cooldowns[abilityIdx] = ability.cooldown || ability.cd || 0

    return {
      damage: finalDamage,
      effectApplied,
      message,
      targetDied,
    }
  }

  // ===== DAMAGE CALCULATION =====

  private calculateDamage(attacker: BattleCharacter, defender: BattleCharacter, ability: any): number {
    const baseDamage = attacker.dino.atk * (ability.damageMultiplier || ability.multiplier || 1)
    const variance = 0.8 + Math.random() * 0.4 // 0.8x to 1.2x

    // Apply defense reduction
    const defenseMultiplier = 100 / (100 + defender.dino.def)

    // Apply damage from abilities/buffs
    let attackBonus = 0
    let defenseBonus = 0
    for (const effect of attacker.effects) {
      const bonus = this.getStatBonus(effect.type, 'atk')
      attackBonus += bonus
    }
    for (const effect of defender.effects) {
      const bonus = this.getStatBonus(effect.type, 'def')
      defenseBonus += bonus
    }

    // Defense reduction: negative defense bonus (from defense_down debuff) increases damage
    // Positive defense bonus (from shield buff) decreases damage
    const defenseMultiplierFromEffects = 1 - (defenseBonus / 100)

    const finalDamage =
      baseDamage * variance * defenseMultiplier * (1 + attackBonus / 100) * Math.max(0.1, defenseMultiplierFromEffects)

    return Math.max(1, finalDamage)
  }

  // ===== EFFECT MANAGEMENT =====

  private applyEffect(character: BattleCharacter, effectId: string): string {
    const effect = getEffect(effectId)
    if (!effect) {
      console.warn(`Effect not found: ${effectId}`)
      return ''
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
    } else if (character.effects.length < 4) {
      // Add if slot available (max 4 effects to allow multiple effects per ability)
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

    return effect.name
  }

  applyEffectDamageAndDecrement(character: 'player' | 'opponent'): number {
    const char = character === 'player' ? this.state.player : this.state.opponent
    let totalEffectChange = 0

    const newEffects: ActiveEffect[] = []

    for (const effect of char.effects) {
      // Effects cast THIS round don't tick or decrement yet — they get
      // their full duration starting next round. Just clear the flag.
      if (effect.justApplied) {
        newEffects.push({ ...effect, justApplied: false })
        continue
      }

      const damage = getEffectDamage(effect.type, 1, char.dino.maxHp)
      totalEffectChange += damage

      // Decrement duration
      const newDuration = effect.duration - 1
      if (newDuration > 0) {
        newEffects.push({ ...effect, duration: newDuration })
      } else {
        const effectDef = getEffect(effect.type)
        if (effectDef) {
          this.addLog(
            `${character === 'player' ? '👤' : '👹'} ${effectDef.name} efekti sona erdi`
          )
        }
      }
    }

    char.effects = newEffects
    // Apply damage/healing: negative totalEffectChange means healing (restores HP)
    char.currentHp = Math.min(char.dino.maxHp, Math.max(0, char.currentHp - totalEffectChange))

    return totalEffectChange
  }

  // ===== COOLDOWN MANAGEMENT =====

  decrementCooldowns(character: 'player' | 'opponent'): void {
    const char = character === 'player' ? this.state.player : this.state.opponent
    for (let i = 0; i < char.cooldowns.length; i++) {
      char.cooldowns[i] = Math.max(0, char.cooldowns[i] - 1)
    }
  }

  // ===== STAT BONUS CALCULATION =====

  private getStatBonus(effectId: string, stat: 'atk' | 'def' | 'spd'): number {
    const effect = getEffect(effectId)
    if (!effect || effect.type !== 'buff') return 0

    // Use effect's default level for stat bonus
    const defaultLevel = effect.defaultLevel || 1
    const bonus = effect.levels[defaultLevel]?.statBonus || effect.levels[1]?.statBonus
    if (!bonus) return 0

    return bonus[stat] || 0
  }

  // ===== ROUND EXECUTION =====

  executeRound(
    playerAbilityIdx: number,
    opponentAbilityIdx: number
  ): RoundResult {
    if (this.state.battleEnded) {
      throw new Error('Battle already ended')
    }

    // Execute abilities in order of speed
    const playerFirst = this.state.player.dino.spd >= this.state.opponent.dino.spd
    let playerAction: AbilityExecutionResult
    let opponentAction: AbilityExecutionResult

    if (playerFirst) {
      playerAction = this.executeAbility('player', playerAbilityIdx)

      if (!playerAction.targetDied) {
        opponentAction = this.executeAbility('opponent', opponentAbilityIdx)
      } else {
        opponentAction = {
          damage: 0,
          effectApplied: null,
          message: 'Rakip yok oldu!',
          targetDied: false,
        }
      }
    } else {
      opponentAction = this.executeAbility('opponent', opponentAbilityIdx)

      if (!opponentAction.targetDied) {
        playerAction = this.executeAbility('player', playerAbilityIdx)
      } else {
        playerAction = {
          damage: 0,
          effectApplied: null,
          message: 'Oyuncu yok oldu!',
          targetDied: false,
        }
      }
    }

    // Check win conditions
    if (playerAction.targetDied) {
      this.state.battleEnded = true
      this.state.winner = 'player'
      this.addLog('🎉 KAZANDINIZ!')
      return {
        playerAction,
        opponentAction,
        effectDamage: { playerDamage: 0, opponentDamage: 0 },
        battleEnded: true,
        winner: 'player',
      }
    }

    if (opponentAction.targetDied) {
      this.state.battleEnded = true
      this.state.winner = 'opponent'
      this.addLog('💀 YENİLDİNİZ!')
      return {
        playerAction,
        opponentAction,
        effectDamage: { playerDamage: 0, opponentDamage: 0 },
        battleEnded: true,
        winner: 'opponent',
      }
    }

    // Apply effect damage
    const playerEffectDamage = this.applyEffectDamageAndDecrement('player')
    const opponentEffectDamage = this.applyEffectDamageAndDecrement('opponent')

    // Decrement cooldowns
    this.decrementCooldowns('player')
    this.decrementCooldowns('opponent')

    // Check win from effect damage
    if (this.state.player.currentHp <= 0) {
      this.state.battleEnded = true
      this.state.winner = 'opponent'
      this.addLog('💀 YENİLDİNİZ! (Efekt hasarı)')
      return {
        playerAction,
        opponentAction,
        effectDamage: { playerDamage: playerEffectDamage, opponentDamage: opponentEffectDamage },
        battleEnded: true,
        winner: 'opponent',
      }
    }

    if (this.state.opponent.currentHp <= 0) {
      this.state.battleEnded = true
      this.state.winner = 'player'
      this.addLog('🎉 KAZANDINIZ! (Efekt hasarı)')
      return {
        playerAction,
        opponentAction,
        effectDamage: { playerDamage: playerEffectDamage, opponentDamage: opponentEffectDamage },
        battleEnded: true,
        winner: 'player',
      }
    }

    // Increment round
    this.state.round += 1
    this.addLog(`🔄 Tur ${this.state.round}`)

    return {
      playerAction,
      opponentAction,
      effectDamage: { playerDamage: playerEffectDamage, opponentDamage: opponentEffectDamage },
      battleEnded: false,
      winner: null,
    }
  }

  // ===== LOGGING =====

  private addLog(message: string): void {
    this.state.battleLog.unshift(message)
    this.state.battleLog = this.state.battleLog.slice(0, 20)
  }

  // ===== UTILITIES =====

  canPlayerWin(): boolean {
    return !this.state.battleEnded && this.state.winner === null
  }

  getXpReward(): number {
    return this.state.winner === 'player' ? 20 : 0
  }

  abandon(isPlayer: boolean): void {
    this.state.battleEnded = true
    this.state.winner = isPlayer ? 'opponent' : 'player'
    this.addLog(isPlayer ? '⚠️ Düello terk edildi' : '⚠️ Rakip terk etti')
  }
}
