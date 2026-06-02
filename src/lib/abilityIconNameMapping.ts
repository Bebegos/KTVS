// Maps each ability's `icon` field (from the abilities library) to a premium
// attack PNG illustration under /assests/attacks. Matches were chosen by the
// meaning of the ability names that use each icon key (see comments below).
//
// A few keys have no purpose-built attack art (healing/regeneration); those are
// routed to the dedicated effect PNGs instead, which read clearly as healing.

import { getAttackArtUrl, getEffectIconUrl } from './gameAssets'

/**
 * ability.icon  ->  attack art id (file is attack-<id>.png), OR a sentinel of
 * the form `effect:<kind>` to reuse a status-effect illustration.
 */
export const ABILITY_ICON_NAME_MAPPING: Record<string, string> = {
  // ---- Literal / very strong matches ----
  bite: 'bite', // 8 bite attacks
  claw: 'claw', // Büyük Yırtıcı
  scratch: 'claw', // Tırmaklama
  pounce: 'claw', // Üstüne Çıkma (claws first)
  slash: 'slash', // Raptor / Pack Hunter / Wind Dancer
  savage: 'slash', // Vahşi Darbe
  roar: 'roar', // roars & screeches
  headbutt: 'headbutt', // Kafa Bufesi
  stomp: 'stomp', // Dev Otçul / Yer Sarsıcısı
  shake: 'earthquake', // Çalkalanma / Deprem
  speed: 'speed', // speed abilities
  dodge: 'speed', // evasion = agility
  wind: 'wind', // wind gust / storm surge / current
  aura: 'aura', // heat aura / static field / daylight
  shield: 'shield', // turtle shell / scorpion armor
  armor: 'shield', // Kalkanlı
  barrier: 'shield', // symbiotic bond / earth blessing / solar shield
  brace: 'shield', // Hazırlanma / Tank
  protect: 'shield', // Korunma / Son Direniş
  spiky: 'shield', // Dikenli Zırh / Demir Vücut
  poison: 'poison', // poison master / death venom / scorpion sting
  spit: 'venom', // toxic spit / fire camel spit
  paralyze: 'stun', // neurotoxin / storm bringer (incapacitate)
  fire: 'inferno', // fire spec / sun strike / dragon flame
  inferno: 'inferno', // Cehennem Ateşi
  burst: 'explosion', // Alev Patlaması
  meteor: 'meteor', // Meteor Düşüşü
  extinction: 'meteor', // Soyu Tükenme (meteor extinction)
  tidal_wave: 'water', // Tsunami

  // ---- Strong-but-interpretive matches ----
  charge: 'headbutt', // Hücum / Geyik Çarptırması (rams headfirst)
  tail: 'spin', // Kuyruk Vurma (whipping spin)
  attack: 'spin', // Timsah Çalkantısı (death-roll thrash)
  peck: 'bite', // Gagalama (beak strike)
  dive: 'slash', // Dive Bomb / Eagle Swoop (talon slash)
  swoop: 'wind', // Dönüş Hareketi (aerial maneuver)
  aerial: 'wind', // Uçan Yırtıcı (airborne)
  leap: 'smash', // Sıçrama Saldırısı (leaping slam)
  jump: 'speed', // Çekirge Sıçrayışı / Geyik Sıçrayışı (agility)
  bloodlust: 'bite', // Kan Hortumu (vampiric bite)
  frenzy: 'power', // Ultra Yırtıcı (power surge)
  rage: 'power', // İlkel Öfke
  apocalypse: 'nova', // Kıyamet (cataclysmic burst)
  genesis: 'nova', // Yaratılış (creation burst)
  tear: 'nova', // Boyutsal Kopuş (dimensional rift)

  // ---- Healing family -> effect art (no attack illustration applies) ----
  heal: 'effect:heal', // Healer / Antidote Mastery
  regenerate: 'effect:regen', // Doğal İyileşme

  // Fallback for anything unmapped.
  default: 'claw',
}

/**
 * Resolve an ability's `icon` key to a ready-to-use PNG URL, or null if there
 * is no art (caller can then fall back to legacy SVG).
 */
export function getAbilityArtUrl(iconName?: string): string | null {
  if (!iconName) return null
  const art = ABILITY_ICON_NAME_MAPPING[iconName.toLowerCase()]
  if (!art) return null
  if (art.startsWith('effect:')) {
    return getEffectIconUrl(art.slice('effect:'.length) as any, 'lg')
  }
  return getAttackArtUrl(art)
}

/** Legacy helper kept for backwards compatibility. */
export function getAbilityIconNameId(iconName: string): string {
  return ABILITY_ICON_NAME_MAPPING[iconName.toLowerCase()] || ABILITY_ICON_NAME_MAPPING.default
}
