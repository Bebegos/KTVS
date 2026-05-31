// Ability ID to SVG Icon ID Mapping
// Maps ability IDs from the abilities library to SVG icon IDs

export const ABILITY_ICON_MAPPING: Record<string, string> = {
  // Big Carnivore abilities
  claw: 'penca',
  bite: 'isirma',
  pounce: 'penca',
  roar: 'penca',
  tail_swipe: 'penca',

  // Raptor abilities
  quick_slash: 'penca',
  dash: 'hiz',
  triple_strike: 'penca',
  venom_fang: 'poison',
  pack_formation: 'hiz',

  // Giant Herbivore abilities
  stomp: 'penca',
  horn_charge: 'penca',
  thick_skin: 'dikenli_zirh',
  earth_shake: 'penca',
  herd_protection: 'dikenli_zirh',

  // Flying Carnivore abilities
  aerial_strike: 'penca',
  wing_buffet: 'hiz',
  dive_bomb: 'penca',
  lightning_strike: 'hiz',
  wind_blade: 'hiz',

  // Armored Spec
  shield_bash: 'dikenli_zirh',
  reflect_damage: 'dikenli_zirh',
  fortified_scales: 'dikenli_zirh',

  // Fire Spec
  flame_burst: 'penca',
  heat_wave: 'penca',
  magma_armor: 'dikenli_zirh',

  // Ultra Carnivore Spec
  primal_roar: 'penca',
  savage_strike: 'penca',
  berserker_mode: 'penca',

  // Speed Demon Spec
  swift_strike: 'hiz',
  evasion: 'hiz',
  lightning_reflexes: 'hiz',

  // Poison Master Spec
  toxin_cloud: 'poison',
  venom_strike: 'poison',
  poison_resistance: 'poison',

  // Pack Hunter Spec
  coordinated_attack: 'penca',
  pack_tactics: 'hiz',
  hunt_together: 'penca',

  // Tank Spec
  fortify: 'dikenli_zirh',
  take_blow: 'dikenli_zirh',
  protective_stance: 'dikenli_zirh',

  // Healer Spec
  healing_touch: 'heal',
  regenerate: 'regen',
  vitality_aura: 'regen',
  restore: 'heal',
  renewal: 'regen',

  // Earth Shaker Spec
  earthquake: 'penca',
  ground_slam: 'penca',
  bedrock_defense: 'dikenli_zirh',

  // Storm Bringer Spec
  thunderbolt: 'hiz',
  storm_surge: 'hiz',
  lightning_armor: 'dikenli_zirh',

  // Wind Dancer Spec
  wind_slash: 'hiz',
  tornado_spin: 'hiz',
  air_barrier: 'dikenli_zirh',

  // Sun Striker Spec
  solar_flare: 'penca',
  sun_beam: 'penca',
  solar_shield: 'dikenli_zirh',

  // Ultimates
  ultimate_roar: 'ultimate',
  primal_fury: 'ultimate',
  meteor_strike: 'ultimate',
  temporal_distortion: 'ultimate',
  void_crush: 'ultimate',
  earth_titan: 'ultimate',
  storm_god: 'ultimate',
  wind_spirit: 'ultimate',
  sun_god: 'ultimate',
  chaos_unleashed: 'ultimate',

  // Default fallback
  default: 'penca',
}

export function getAbilityIconId(abilityId: string): string {
  return ABILITY_ICON_MAPPING[abilityId.toLowerCase()] || ABILITY_ICON_MAPPING.default
}
