// Ability icon name to SVG icon ID mapping
// Maps ability.icon names (from abilities library) to SVG icon IDs

export const ABILITY_ICON_NAME_MAPPING: Record<string, string> = {
  // Attack/Damage abilities
  claw: 'penca',
  bite: 'isirma',
  pounce: 'penca',
  roar: 'penca',
  tail: 'penca',
  scratch: 'penca',
  slash: 'penca',
  charge: 'penca',
  leap: 'penca',
  swoop: 'penca',
  dive: 'penca',
  peck: 'penca',
  headbutt: 'penca',

  // Defense/Armor abilities
  armor: 'dikenli_zirh',
  protect: 'dikenli_zirh',
  shield: 'dikenli_zirh',
  barrier: 'dikenli_zirh',
  brace: 'dikenli_zirh',
  spiky: 'dikenli_zirh',

  // Speed abilities
  speed: 'hiz',
  dodge: 'hiz',

  // Healing abilities
  heal: 'heal',
  regenerate: 'regen',

  // Poison/Status abilities
  poison: 'poison',
  paralyze: 'paralyze',

  // Element abilities
  fire: 'penca',
  inferno: 'penca',
  burst: 'penca',
  spit: 'penca',
  wind: 'hiz',
  tidal_wave: 'penca',

  // Special/Ultimate abilities
  apocalypse: 'ultimate',
  extinction: 'ultimate',
  meteor: 'ultimate',
  genesis: 'ultimate',
  aura: 'heal',
  bloodlust: 'penca',
  frenzy: 'penca',
  rage: 'penca',
  savage: 'penca',
  shake: 'penca',
  stomp: 'penca',
  tear: 'penca',

  // Default fallback
  default: 'penca',
}

export function getAbilityIconNameId(iconName: string): string {
  return ABILITY_ICON_NAME_MAPPING[iconName.toLowerCase()] || ABILITY_ICON_NAME_MAPPING.default
}
