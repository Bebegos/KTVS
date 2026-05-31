// BattleService - Enhanced orchestrator for complete battle lifecycle
// Uses all services for validated, professional battle execution
// Replaces legacy BattleEngine with proper service layer

import { Dino, ValidationResult, BattleCharacter, ServiceBattleState } from '../../game/types'
import { battleAbilityService, AbilityExecutionResult } from './battleAbilityService'
import { effectService, EffectTickResult } from './effectService'
import { slotService } from './slotService'
import { validationService } from './validationService'

export interface RoundResult {
  playerAction: AbilityExecutionResult
  opponentAction: AbilityExecutionResult
  effectResults: { player: EffectTickResult; opponent: EffectTickResult }
  battleEnded: boolean
  winner: 'player' | 'opponent' | null
}

class BattleService {
  /**
   * Initialize a new battle with proper service layer
   */
  initializeBattle(playerDino: Dino, opponentDino: Dino): ServiceBattleState {
    const playerChar: BattleCharacter = {
      dinoId: playerDino.id,
      name: playerDino.name,
      maxHp: playerDino.maxHp,
      currentHp: playerDino.maxHp,
      atk: playerDino.atk,
      def: playerDino.def,
      spd: playerDino.spd,
      abilities: [],
      effects: [],
      cooldowns: [],
      round: 0,
    }

    const opponentChar: BattleCharacter = {
      dinoId: opponentDino.id,
      name: opponentDino.name,
      maxHp: opponentDino.maxHp,
      currentHp: opponentDino.maxHp,
      atk: opponentDino.atk,
      def: opponentDino.def,
      spd: opponentDino.spd,
      abilities: [],
      effects: [],
      cooldowns: [],
      round: 0,
    }

    // Initialize battle abilities (this respects slot locking!)
    battleAbilityService.initializeBattleAbilities(playerChar, playerDino)
    battleAbilityService.initializeBattleAbilities(opponentChar, opponentDino)

    const state: ServiceBattleState = {
      player: playerChar,
      opponent: opponentChar,
      round: 1,
      battleLog: [
        playerDino.spd >= opponentDino.spd
          ? '🚀 Player starts!'
          : '🚀 Opponent starts!',
      ],
      battleEnded: false,
      winner: undefined,
    }

    return state
  }

  /**
   * Validate the current battle state
   */
  validateBattleState(state: ServiceBattleState): ValidationResult {
    if (!state) {
      return { valid: false, reason: 'Invalid battle state' }
    }

    if (state.player.currentHp <= 0 && state.opponent.currentHp <= 0) {
      return {
        valid: false,
        reason: 'Both players are dead',
        code: 'INVALID_STATE',
      }
    }

    return { valid: true }
  }

  /**
   * Execute an entire round of battle
   */
  executeRound(
    state: ServiceBattleState,
    playerAbilityIdx: number,
    opponentAbilityIdx: number,
    playerDino: Dino,
    opponentDino: Dino
  ): RoundResult {
    if (state.battleEnded) {
      throw new Error('Battle already ended')
    }

    let playerAction: AbilityExecutionResult
    let opponentAction: AbilityExecutionResult

    // Execute abilities in order of speed
    const playerFirst = state.player.spd >= state.opponent.spd

    if (playerFirst) {
      playerAction = battleAbilityService.executeAbility(
        state.player,
        state.opponent,
        playerDino,
        playerAbilityIdx
      )
      this.addLog(state, playerAction.message)

      if (!playerAction.targetDied) {
        opponentAction = battleAbilityService.executeAbility(
          state.opponent,
          state.player,
          opponentDino,
          opponentAbilityIdx
        )
        this.addLog(state, opponentAction.message)
      } else {
        opponentAction = {
          damage: 0,
          healAmount: 0,
          effectApplied: null,
          message: `${state.opponent.name} был повержен!`,
          targetDied: false,
        }
      }
    } else {
      opponentAction = battleAbilityService.executeAbility(
        state.opponent,
        state.player,
        opponentDino,
        opponentAbilityIdx
      )
      this.addLog(state, opponentAction.message)

      if (!opponentAction.targetDied) {
        playerAction = battleAbilityService.executeAbility(
          state.player,
          state.opponent,
          playerDino,
          playerAbilityIdx
        )
        this.addLog(state, playerAction.message)
      } else {
        playerAction = {
          damage: 0,
          healAmount: 0,
          effectApplied: null,
          message: `${state.player.name} был повержен!`,
          targetDied: false,
        }
      }
    }

    // Check immediate win
    if (playerAction.targetDied) {
      state.battleEnded = true
      state.winner = 'player'
      this.addLog(state, '🎉 ПОБЕДА!')
      return {
        playerAction,
        opponentAction,
        effectResults: { player: { totalDamage: 0, healed: 0, damaged: 0 },
opponent: { totalDamage: 0, healed: 0, damaged: 0 } },
        battleEnded: true,
        winner: 'player',
      }
    }

    if (opponentAction.targetDied) {
      state.battleEnded = true
      state.winner = 'opponent'
      this.addLog(state, '💀 ПОРАЖЕНИЕ!')
      return {
        playerAction,
        opponentAction,
        effectResults: { player: { totalDamage: 0, healed: 0, damaged: 0 },
opponent: { totalDamage: 0, healed: 0, damaged: 0 } },
        battleEnded: true,
        winner: 'opponent',
      }
    }

    // Apply effect damage and healing for both characters
    const playerEffectResult = effectService.tickEffects(state.player)
    const opponentEffectResult = effectService.tickEffects(state.opponent)

    if (playerEffectResult.healed > 0) {
      this.addLog(state, `💚 Player healed: +${playerEffectResult.healed} HP`)
    }
    if (playerEffectResult.damaged > 0) {
      this.addLog(state, `💀 Player took effect damage: ${playerEffectResult.damaged} HP`)
    }

    if (opponentEffectResult.healed > 0) {
      this.addLog(state, `💚 Opponent healed: +${opponentEffectResult.healed} HP`)
    }
    if (opponentEffectResult.damaged > 0) {
      this.addLog(state, `💀 Opponent took effect damage: ${opponentEffectResult.damaged} HP`)
    }

    // Decrement cooldowns
    battleAbilityService.decrementCooldowns(state.player)
    battleAbilityService.decrementCooldowns(state.opponent)

    // Check win from effect damage
    if (state.player.currentHp <= 0) {
      state.battleEnded = true
      state.winner = 'opponent'
      this.addLog(state, '💀 ПОРАЖЕНИЕ! (Effect damage)')
      return {
        playerAction,
        opponentAction,
        effectResults: { player: playerEffectResult, opponent: opponentEffectResult },
        battleEnded: true,
        winner: 'opponent',
      }
    }

    if (state.opponent.currentHp <= 0) {
      state.battleEnded = true
      state.winner = 'player'
      this.addLog(state, '🎉 ПОБЕДА! (Effect damage)')
      return {
        playerAction,
        opponentAction,
        effectResults: { player: playerEffectResult, opponent: opponentEffectResult },
        battleEnded: true,
        winner: 'player',
      }
    }

    // Continue battle
    state.round += 1
    this.addLog(state, `🔄 Round ${state.round}`)

    return {
      playerAction,
      opponentAction,
      effectResults: { player: playerEffectResult, opponent: opponentEffectResult },
      battleEnded: false,
      winner: null,
    }
  }

  /**
   * Check if an ability can be used
   */
  canUseAbility(
    state: ServiceBattleState,
    character: 'player' | 'opponent',
    abilityIdx: number
  ): ValidationResult {
    const char = character === 'player' ? state.player : state.opponent
    return battleAbilityService.canUseAbility(char, {} as any, abilityIdx)
  }

  /**
   * Get current state
   */
  getState(state: ServiceBattleState): ServiceBattleState {
    return state
  }

  /**
   * Get HP percentages
   */
  getHpPercent(currentHp: number, maxHp: number): number {
    return (currentHp / maxHp) * 100
  }

  /**
   * Get battle log
   */
  getBattleLog(state: ServiceBattleState): string[] {
    return state.battleLog
  }

  /**
   * Add a log message
   */
  private addLog(state: ServiceBattleState, message: string): void {
    state.battleLog.unshift(message)
    state.battleLog = state.battleLog.slice(0, 20)
  }

  /**
   * End battle early (abandon)
   */
  abandonBattle(state: ServiceBattleState, isPlayer: boolean): void {
    state.battleEnded = true
    state.winner = isPlayer ? 'opponent' : 'player'
    this.addLog(state, isPlayer ? '⚠️ Battle abandoned' : '⚠️ Opponent abandoned')
  }

  /**
   * Get winner
   */
  getWinner(state: ServiceBattleState): 'player' | 'opponent' | null {
    return state.winner || null
  }
}

// Export singleton instance
export const battleService = new BattleService()
