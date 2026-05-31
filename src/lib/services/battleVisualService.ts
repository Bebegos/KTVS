import { Ability, BattleVisualEffects, DEFAULT_BATTLE_VISUALS, EffectKind } from '../../game/types'

/**
 * Service for managing battle visual effects
 * Determines which animations and visual effects to play based on ability type
 */

export const battleVisualService = {
  /**
   * Get visual effects for an ability
   * Uses ability's custom visualEffects if defined, otherwise derives from effect types
   */
  getVisualEffects(ability: Ability | null): BattleVisualEffects {
    if (!ability) {
      return DEFAULT_BATTLE_VISUALS['none']
    }

    // If ability has custom visual effects, use those
    if (ability.visualEffects) {
      return ability.visualEffects
    }

    // Otherwise, derive from effect types
    // Priority: first non-none effect type
    if (ability.effects && ability.effects.length > 0) {
      const primaryEffect = ability.effects[0]
      return DEFAULT_BATTLE_VISUALS[primaryEffect] || DEFAULT_BATTLE_VISUALS['none']
    }

    // Default to attack if no effects
    if (ability.kind === 'attack' || ability.kind === 'ultimate') {
      return DEFAULT_BATTLE_VISUALS['attack']
    }

    return DEFAULT_BATTLE_VISUALS['none']
  },

  /**
   * Get visual effects for a damage action
   * Used when displaying pure damage without ability effects
   */
  getDamageVisuals(): BattleVisualEffects {
    return DEFAULT_BATTLE_VISUALS['attack']
  },

  /**
   * Get visual effects for a specific effect type
   */
  getEffectVisuals(effectKind: EffectKind): BattleVisualEffects {
    return DEFAULT_BATTLE_VISUALS[effectKind] || DEFAULT_BATTLE_VISUALS['none']
  },

  /**
   * Check if an ability has any impactful visual effects
   */
  hasVisualImpact(ability: Ability | null): boolean {
    if (!ability) return false
    const visuals = this.getVisualEffects(ability)
    return visuals.centerAnimation !== 'generic_impact'
  },

  /**
   * Get display name for an animation type
   */
  getAnimationDisplayName(animation: string): string {
    const names: Record<string, string> = {
      'claw_slash_3hit': '3-Hit Slash',
      'claw_slash_single': 'Single Slash',
      'bite_crunch': 'Bite',
      'fire_burst': 'Fire Burst',
      'ice_spikes': 'Ice Spikes',
      'poison_cloud': 'Poison Cloud',
      'electricity_crackle': 'Electric Crackle',
      'healing_glow': 'Healing Glow',
      'leaf_spread': 'Leaf Spread',
      'shield_barrier': 'Shield Barrier',
      'wind_gust': 'Wind Gust',
      'stone_crumble': 'Stone Crumble',
      'generic_impact': 'Impact',
    }
    return names[animation] || animation
  },
}
