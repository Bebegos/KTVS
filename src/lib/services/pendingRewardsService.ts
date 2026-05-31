// Pending Rewards Service - Manage level-up rewards that haven't been spent yet

import { Dino, PendingRewards } from '../../game/types'
import { supabase } from '../supabase'

class PendingRewardsService {
  /**
   * Add pending stat points to a dino (from level-up)
   */
  addPendingStatPoints(dino: Dino, points: number): void {
    if (!dino.pendingRewards) {
      dino.pendingRewards = {
        unspentStatPoints: points,
        pendingAbilityIds: [],
      }
    } else {
      dino.pendingRewards.unspentStatPoints += points
    }
  }

  /**
   * Add pending ability to a dino (from level-up)
   */
  addPendingAbility(dino: Dino, abilityId: string): void {
    if (!dino.pendingRewards) {
      dino.pendingRewards = {
        unspentStatPoints: 0,
        pendingAbilityIds: [abilityId],
      }
    } else {
      if (!dino.pendingRewards.pendingAbilityIds.includes(abilityId)) {
        dino.pendingRewards.pendingAbilityIds.push(abilityId)
      }
    }
  }

  /**
   * Check if dino has pending rewards
   */
  hasPendingRewards(dino: Dino | undefined): boolean {
    if (!dino || !dino.pendingRewards) return false
    return dino.pendingRewards.unspentStatPoints > 0 || dino.pendingRewards.pendingAbilityIds.length > 0
  }

  /**
   * Spend stat points on a dino (supports stamina too)
   */
  spendStatPoints(dino: Dino, atk: number, def: number, spd: number, sta: number = 0): boolean {
    if (!dino.pendingRewards) return false

    const totalSpent = atk + def + spd + sta
    if (totalSpent > dino.pendingRewards.unspentStatPoints) {
      console.warn(`Cannot spend ${totalSpent} points, only ${dino.pendingRewards.unspentStatPoints} available`)
      return false
    }

    dino.atk += atk
    dino.def += def
    dino.spd += spd
    if (sta) dino.sta = (dino.sta || 0) + sta
    dino.pendingRewards.unspentStatPoints -= totalSpent

    return true
  }

  /**
   * Assign a pending ability to a slot
   */
  assignPendingAbility(dino: Dino, abilityId: string, slot: number): boolean {
    if (!dino.pendingRewards || !dino.pendingRewards.pendingAbilityIds.includes(abilityId)) {
      console.warn(`Ability ${abilityId} is not in pending abilities`)
      return false
    }

    if (slot < 0 || slot > 5) {
      console.warn(`Invalid slot: ${slot}`)
      return false
    }

    if (dino.abilityIds[slot]) {
      console.warn(`Slot ${slot} is already filled with ${dino.abilityIds[slot]}`)
      return false
    }

    // Assign ability to slot
    dino.abilityIds[slot] = abilityId

    // Remove from pending
    dino.pendingRewards.pendingAbilityIds = dino.pendingRewards.pendingAbilityIds.filter(id => id !== abilityId)

    return true
  }

  /**
   * Clear pending rewards after they're all spent
   */
  clearPendingRewards(dino: Dino): void {
    if (!dino.pendingRewards) return

    if (dino.pendingRewards.unspentStatPoints === 0 && dino.pendingRewards.pendingAbilityIds.length === 0) {
      dino.pendingRewards = undefined
    }
  }

  /**
   * Save pending rewards to database
   */
  async savePendingRewards(dinoId: string, pending: PendingRewards): Promise<void> {
    const { error } = await supabase
      .from('dinos')
      .update({
        pending_rewards: {
          unspent_stat_points: pending.unspentStatPoints,
          pending_ability_ids: pending.pendingAbilityIds,
          pending_ability_slot: pending.pendingAbilitySlot,
        },
      })
      .eq('id', dinoId)

    if (error) {
      console.error('Error saving pending rewards:', error)
      throw error
    }
  }

  /**
   * Clear pending rewards in database
   */
  async clearPendingRewardsDb(dinoId: string): Promise<void> {
    const { error } = await supabase
      .from('dinos')
      .update({
        pending_rewards: null,
      })
      .eq('id', dinoId)

    if (error) {
      console.error('Error clearing pending rewards:', error)
      throw error
    }
  }
}

export const pendingRewardsService = new PendingRewardsService()
