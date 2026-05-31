// Discovery Service - Single source of truth for ability-discovery (chest) logic.
//
// Flow:
//  - On level-up (supabase.addXpToDino) PendingDiscovery events are created with
//    EMPTY optionIds (only category + level are known).
//  - The first time the discovery modal opens, we generate 3 options per pending
//    discovery and PERSIST them, so closing and re-opening shows the same cards.
//  - When the player learns an ability, it is assigned to a slot and the
//    discovery is removed from the pending list.

import { Dino, PendingDiscovery, PendingRewards, DiscoveryCategory } from '../../game/types'
import {
  getClassAbilities,
  getSpecAbilities,
  ULTIMATE_ABILITIES,
  AbilityDefinition,
} from '../abilities'

const OPTIONS_PER_DISCOVERY = 3

class DiscoveryService {
  /**
   * Returns the pool of candidate abilities for a discovery category.
   */
  private getPool(dino: Dino, category: DiscoveryCategory): AbilityDefinition[] {
    if (category === 'ultimate') {
      return Object.values(ULTIMATE_ABILITIES)
    }
    if (category === 'spec') {
      const specId = dino.spec
      if (!specId) return []
      return getSpecAbilities(specId)?.abilities || []
    }
    // class
    const classId = dino.class
    if (!classId) return []
    return getClassAbilities(classId)?.abilities || []
  }

  /**
   * Generate up to 3 option ability ids for a discovery, preferring abilities
   * the dino does not already own. Falls back to allowing duplicates only if
   * the pool is too small.
   */
  generateOptions(dino: Dino, category: DiscoveryCategory): string[] {
    const pool = this.getPool(dino, category)
    if (pool.length === 0) return []

    const owned = new Set((dino.abilityIds || []).filter(Boolean))
    const fresh = pool.filter(a => !owned.has(a.id))
    const primary = fresh.length >= OPTIONS_PER_DISCOVERY ? fresh : pool

    const shuffled = [...primary].sort(() => Math.random() - 0.5)
    const picked = shuffled.slice(0, OPTIONS_PER_DISCOVERY).map(a => a.id)

    // Top up from the full pool if a category has fewer than 3 unique abilities.
    if (picked.length < OPTIONS_PER_DISCOVERY) {
      for (const a of pool) {
        if (picked.length >= OPTIONS_PER_DISCOVERY) break
        if (!picked.includes(a.id)) picked.push(a.id)
      }
    }
    return picked
  }

  /**
   * Returns the list of pending discoveries for a dino, migrating legacy
   * `pendingAbilityIds` placeholders (`__level_up_ability_N__`) into class
   * discoveries so older dinos keep working.
   */
  getDiscoveries(dino: Dino): PendingDiscovery[] {
    const pr = dino.pendingRewards
    if (!pr) return []

    if (pr.pendingDiscoveries && pr.pendingDiscoveries.length > 0) {
      return pr.pendingDiscoveries
    }

    // Legacy migration: convert placeholder ability ids into class discoveries.
    const placeholders = (pr.pendingAbilityIds || []).filter(id => id && id.startsWith('__'))
    return placeholders.map((_, i) => ({
      id: `legacy_${dino.id}_${i}`,
      category: 'class' as DiscoveryCategory,
      level: dino.level,
      optionIds: [],
    }))
  }

  /**
   * Ensure every pending discovery has its options generated. Returns a new
   * discoveries array (does not mutate the dino). Caller decides whether any
   * change occurred via `changed`.
   */
  ensureOptions(dino: Dino, discoveries: PendingDiscovery[]): { discoveries: PendingDiscovery[]; changed: boolean } {
    let changed = false
    const next = discoveries.map(d => {
      if (d.optionIds && d.optionIds.length > 0) return d
      const optionIds = this.generateOptions(dino, d.category)
      changed = true
      return { ...d, optionIds }
    })
    return { discoveries: next, changed }
  }

  /**
   * Which slots are valid targets for an ability of a given category.
   *  - class / spec -> slots 0-4
   *  - ultimate     -> slot 5 only
   */
  getValidSlots(category: DiscoveryCategory): number[] {
    return category === 'ultimate' ? [5] : [0, 1, 2, 3, 4]
  }

  /**
   * Serialize a PendingRewards object into the DB (snake_case JSON) shape.
   */
  serialize(pending: PendingRewards | undefined): any {
    if (!pending) return null
    const hasAny =
      pending.unspentStatPoints > 0 ||
      (pending.pendingAbilityIds && pending.pendingAbilityIds.length > 0) ||
      (pending.pendingDiscoveries && pending.pendingDiscoveries.length > 0)
    if (!hasAny) return null

    return {
      unspent_stat_points: pending.unspentStatPoints,
      pending_ability_ids: pending.pendingAbilityIds || [],
      pending_ability_slot: pending.pendingAbilitySlot,
      pending_discoveries: (pending.pendingDiscoveries || []).map(d => ({
        id: d.id,
        category: d.category,
        level: d.level,
        option_ids: d.optionIds,
      })),
    }
  }
}

export const discoveryService = new DiscoveryService()
