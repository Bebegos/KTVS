// Centralized registry for all Hearthstone-style PNG UI assets.
// Files live under /public/assests (note: folder spelling matches uploaded assets).

import { EffectKind, AbilityType } from '../game/types'

const BASE = '/assests'

// ---------- Ability slot button frames ----------
export const abilityButtonAssets = {
  base: `${BASE}/buttons/ability/ability-button-base.png`,
  hover: `${BASE}/buttons/ability/ability-button-hover.png`,
  selected: `${BASE}/buttons/ability/ability-button-selected.png`,
  disabled: `${BASE}/buttons/ability/ability-button-disabled.png`,
  empty: `${BASE}/buttons/ability/empty-slot-button.png`,
}

export const ultimateButtonAssets = {
  base: `${BASE}/buttons/ultimate/ultimate-button-base.png`,
  selected: `${BASE}/buttons/ultimate/ultimate-button-selected.png`,
  disabled: `${BASE}/buttons/ultimate/ultimate-button-disabled.png`,
}

// ---------- Menu buttons (wide + square) ----------
export const menuButtonAssets = {
  base: `${BASE}/buttons/menu/menu-button-base.png`,
  hover: `${BASE}/buttons/menu/menu-button-hover.png`,
  pressed: `${BASE}/buttons/menu/menu-button-pressed.png`,
  disabled: `${BASE}/buttons/menu/menu-button-disabled.png`,
}

export const squareMenuButtonAssets = {
  base: `${BASE}/buttons/menu/menu-button-square-base.png`,
  hover: `${BASE}/buttons/menu/menu-button-square-hover.png`,
  pressed: `${BASE}/buttons/menu/menu-button-square-pressed.png`,
  disabled: `${BASE}/buttons/menu/menu-button-square-disabled.png`,
}

// ---------- HP bar ----------
export const hpBarAssets = {
  background: `${BASE}/hp-bars/hp-bar-background.png`,
  healthy: `${BASE}/hp-bars/hp-fill-healthy.png`,
  wounded: `${BASE}/hp-bars/hp-fill-wounded.png`,
  danger: `${BASE}/hp-bars/hp-fill-danger.png`,
}

// ---------- Attack / ability art (premium PNG illustrations) ----------
/** Full URL for an attack illustration, e.g. 'bite' -> /assests/attacks/attack-bite.png */
export function getAttackArtUrl(name: string): string {
  return `${BASE}/attacks/attack-${name}.png`
}

// ---------- Stat icons (premium PNG) ----------
type StatArtKey = 'sta' | 'hp' | 'atk' | 'def' | 'spd'
export function getStatIconUrl(stat: StatArtKey): string {
  return `${BASE}/stats/stat-${stat}.png`
}

// ---------- Class & spec medallions (premium PNG) ----------
const dash = (id: string) => id.replace(/_/g, '-')
export function getClassMedallionUrl(classId: string): string {
  return `${BASE}/medallions/class/class-${dash(classId)}.png`
}
export function getSpecMedallionUrl(specId: string): string {
  return `${BASE}/medallions/spec/spec-${dash(specId)}.png`
}

// ---------- Progression / UI illustrations ----------
export const uiAssets = {
  experience: `${BASE}/ui/ui-experience.png`,
  levelUp: `${BASE}/ui/ui-level-up.png`,
  statPoints: `${BASE}/ui/ui-stat-points.png`,
  abilityChest: `${BASE}/ui/ui-ability-chest.png`,
}

// ---------- Status effect icons (small 48px / large 64px) ----------
// Filename overrides where the art slug differs from the effect kind.
const effectFileSlug: Record<string, string> = {
  bleeding: 'bleed',
}

export function getEffectIconUrl(effect: EffectKind, size: 'sm' | 'lg' = 'sm'): string | null {
  if (effect === 'none') return null
  const folder = size === 'lg' ? 'large' : 'small'
  const slug = effectFileSlug[effect] ?? effect.replace('_', '-')
  return `${BASE}/effects/${folder}/effect-${slug}-${size}.png`
}

// ---------- Ability type icons (replace emoji) ----------
const abilityTypeIconMap: Record<AbilityType, string> = {
  attack: `${BASE}/icons/icon-attack.png`,
  heal: `${BASE}/icons/icon-heal.png`,
  buff: `${BASE}/icons/icon-buff.png`,
  debuff: `${BASE}/icons/icon-debuff.png`,
  utility: `${BASE}/icons/icon-utility.png`,
  passive: `${BASE}/icons/icon-passive.png`,
  ultimate: `${BASE}/icons/icon-ultimate.png`,
}

export function getAbilityTypeIconUrl(kind: AbilityType): string {
  return abilityTypeIconMap[kind] ?? abilityTypeIconMap.attack
}

// ---------- Badges & labels ----------
export const badgeAssets = {
  ultimate: `${BASE}/badges-labels/badge-ultimate.png`,
  cooldown: `${BASE}/badges-labels/badge-cooldown.png`,
  locked: `${BASE}/badges-labels/locked-icon.png`,
}

// ---------- Decorations ----------
export const borderGlowAssets = {
  cyan: `${BASE}/decorations/borders/border-glow-cyan.png`,
  purple: `${BASE}/decorations/borders/border-glow-purple.png`,
  gold: `${BASE}/decorations/borders/border-glow-gold.png`,
}

export const cornerAssets = {
  tl: `${BASE}/decorations/corners/corner-tl.png`,
  tr: `${BASE}/decorations/corners/corner-tr.png`,
  bl: `${BASE}/decorations/corners/corner-bl.png`,
  br: `${BASE}/decorations/corners/corner-br.png`,
}

// ---------- Modal ----------
export const modalAssets = {
  background: `${BASE}/modal/modal-background.png`,
  frame: `${BASE}/modal/modal-frame.png`,
  close: `${BASE}/modal/modal-close-button.png`,
}

// ---------- Battle arena (WoW-style unified battle screen) ----------
// New art lives under /assests/battle. Components fall back to existing
// parchment/stone assets when a file is not present yet.
export const battleAssets = {
  background: `${BASE}/battle/battle-background.png`,
  actionBar: {
    center: `${BASE}/battle/actionbar/actionbar-center.png`,
    ornamentLeft: `${BASE}/battle/actionbar/actionbar-ornament-left.png`,
    ornamentRight: `${BASE}/battle/actionbar/actionbar-ornament-right.png`,
  },
  unitFramePlayer: `${BASE}/battle/unitframe/unitframe-player.png`,
  // Optional dedicated enemy frame; if absent the player frame is mirrored.
  unitFrameEnemy: `${BASE}/battle/unitframe/unitframe-enemy.png`,
}

// ---------- Home / main menu ----------
export const homeAssets = {
  background: `${BASE}/home/home-background.png`,
  logo: `${BASE}/home/logo.png`,
  dinoCoin: `${BASE}/ui/dinocoin.png`,
  menu: {
    duel: `${BASE}/home/icons/menu-duel.png`,
    offline: `${BASE}/home/icons/menu-offline.png`,
    adventure: `${BASE}/home/icons/menu-adventure.png`,
    mydinos: `${BASE}/home/icons/menu-mydinos.png`,
    matchlog: `${BASE}/home/icons/menu-matchlog.png`,
    newdino: `${BASE}/home/icons/menu-newdino.png`,
    settings: `${BASE}/home/icons/top-settings.png`,
    logout: `${BASE}/home/icons/top-logout.png`,
  },
}

