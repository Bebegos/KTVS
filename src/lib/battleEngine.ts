// Battle Engine - Single source of truth for ALL battle mechanics
// Used by: PvE, PvP (Düello), Offline battles
// Manages: Turn order, damage, effects, abilities, cooldowns, win/lose

import { Dino, DinoAbility, ActiveEffect } from '../game/types'
import { getEffectDamage, getEffect } from './effects'

// ============= TYPES =============

export interface BattleCharacter {
  dino: Dino
  currentHp: number
  effects: ActiveEffect[]
  abilities: DinoAbility[]
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
    return {
      dino,
      currentHp: dino.maxHp,
      effects: [],
      abilities: [...dino.abilities],
      cooldowns: new Array(dino.abilities.length).fill(0),
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
      throw new Error(`Ability ${abilityIdx} not found`)
    }

    // Calculate damage
    const baseDamage = this.calculateDamage(attacker, defender, ability)
    const finalDamage = Math.round(baseDamage)

    // Apply damage
    defender.currentHp = Math.max(0, defender.currentHp - finalDamage)

    const message = `${character === 'player' ? '👤' : '👹'} ${ability.name} [${finalDamage} DMG]`

    // Apply effect
    let effectApplied: string | null = null
    if (ability.effect !== 'none') {
      effectApplied = this.applyEffect(defender, ability.effect)
    }

    // Set cooldown
    attacker.cooldowns[abilityIdx] = ability.cd || 0

    // Check if target died
    const targetDied = defender.currentHp <= 0

    return {
      damage: finalDamage,
      effectApplied,
      message,
      targetDied,
    }
  }

  // ===== DAMAGE CALCULATION =====

  private calculateDamage(attacker: BattleCharacter, defender: BattleCharacter, ability: DinoAbility): number {
    const baseDamage = attacker.dino.atk * (ability.multiplier || 1)
    const variance = 0.8 + Math.random() * 0.4 // 0.8x to 1.2x

    // Apply defense reduction
    const defenseMultiplier = 100 / (100 + defender.dino.def)

    // Apply damage from abilities/buffs
    let attackBonus = 0
    for (const effect of attacker.effects) {
      const bonus = this.getStatBonus(effect.type, 'atk')
      attackBonus += bonus
    }

    let defenseReduction = 1
    for (const effect of defender.effects) {
      const bonus = this.getStatBonus(effect.type, 'def')
      defenseReduction += bonus / 100
    }

    const finalDamage =
      baseDamage * variance * defenseMultiplier * (1 + attackBonus / 100) * defenseReduction

    return Math.max(1, finalDamage)
  }

  // ===== EFFECT MANAGEMENT =====

  private applyEffect(character: BattleCharacter, effectId: string): string {
    const effect = getEffect(effectId)
    if (!effect) return ''

    // Check if effect already exists
    const existingIdx = character.effects.findIndex(e => e.type === effectId)

    if (existingIdx !== -1) {
      // Reset duration if effect exists
      character.effects[existingIdx].duration = effect.levels[1]?.duration || 2
    } else if (character.effects.length < 2) {
      // Add if slot available (max 2 effects)
      character.effects.push({
        type: effectId as any,
        duration: effect.levels[1]?.duration || 2,
      })
    } else {
      // FIFO: remove oldest, add new
      character.effects.shift()
      character.effects.push({
        type: effectId as any,
        duration: effect.levels[1]?.duration || 2,
      })
    }

    return effect.name
  }

  applyEffectDamageAndDecrement(character: 'player' | 'opponent'): number {
    const char = character === 'player' ? this.state.player : this.state.opponent
    let totalDamage = 0

    const newEffects: ActiveEffect[] = []

    for (const effect of char.effects) {
      const damage = getEffectDamage(effect.type, 1, char.dino.maxHp)
      totalDamage += damage

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
    char.currentHp = Math.max(0, char.currentHp - totalDamage)

    return totalDamage
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

    const bonus = effect.levels[1]?.statBonus
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
        effectDamage: { playerDamage, opponentDamage: opponentEffectDamage },
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
        effectDamage: { playerDamage, opponentDamage: opponentEffectDamage },
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
      effectDamage: { playerDamage, opponentDamage: opponentEffectDamage },
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
