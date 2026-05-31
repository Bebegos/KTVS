import { GAME_CONFIG } from './config'
import {
  BattleState,
  BattleCharacter,
  BattleLogEntry,
  DiceResult,
  Dino,
  Ability,
  ActiveEffect,
} from './types'

export function rollDice(): DiceResult {
  const value = Math.floor(Math.random() * GAME_CONFIG.DICE_SIDES) + 1
  return {
    value,
    isCrit: value === GAME_CONFIG.CRIT_VALUE,
    isMiss: value === GAME_CONFIG.MISS_VALUE,
  }
}

export function calculateDamage(
  attacker: BattleCharacter,
  defender: BattleCharacter,
  diceValue: number,
  abilityMultiplier?: number
): number {
  const isCrit = diceValue === GAME_CONFIG.CRIT_VALUE
  const isMiss = diceValue === GAME_CONFIG.MISS_VALUE

  if (isMiss) {
    return 0
  }

  // Formül: (zar + STR) × yetenek_çarpanı × efekt_çarpanı - DEF
  let modifier = abilityMultiplier || 1 // Yetenek çarpanı (varsayılan 1x)

  // Güç+ efekti (modifikatörü arttır)
  if (hasEffect(attacker, 'power')) {
    modifier *= 1.5 // %50 hasar artışı
  }

  let totalDamage = (diceValue + attacker.atk) * modifier
  let defense = defender.def

  // Kalkan+ efekti (savunma arttır)
  if (hasEffect(defender, 'shield')) {
    defense += GAME_CONFIG.EFFECT_BONUS.shield
  }

  // Kritik hasar
  let finalDamage = totalDamage - defense
  if (isCrit) {
    finalDamage *= GAME_CONFIG.CRIT_MULTIPLIER
  }

  return Math.max(finalDamage, GAME_CONFIG.MIN_DAMAGE)
}

export function hasEffect(character: BattleCharacter, effectType: string): boolean {
  return character.effects.some(e => e.type === effectType)
}

export function applyAbility(
  state: BattleState,
  attacker: 'p1' | 'p2',
  abilityIndex: number,
  diceRoll: DiceResult
): BattleState {
  const newState = JSON.parse(JSON.stringify(state)) as BattleState
  const attackerChar = newState[attacker]
  const defenderChar = newState[attacker === 'p1' ? 'p2' : 'p1']
  const ability = attackerChar.abilities[abilityIndex]

  if (!ability || ability.cd > 0) {
    return newState
  }

  const damage = calculateDamage(attackerChar, defenderChar, diceRoll.value, ability.multiplier)
  const isHit = damage > 0 && !diceRoll.isMiss
  const isCrit = diceRoll.isCrit && isHit

  // Hasar uygula
  if (isHit) {
    defenderChar.currentHp = Math.max(0, defenderChar.currentHp - damage)
  }

  // Yetenek efektini uygula
  if (ability.effect !== 'none' && isHit) {
    applyEffect(defenderChar, ability.effect, 2)
  }

  // CD başlat
  ability.cd = ability.maxCd

  // Log kaydı
  const logEntry: BattleLogEntry = {
    round: newState.round,
    turn: attacker,
    action: `${attackerChar.name} ${ability.name} kullandı`,
    diceRoll: diceRoll.value,
    damage: isHit ? damage : 0,
    isCrit: isCrit,
    isHit: isHit,
  }
  newState.log.push(logEntry)

  return newState
}

export function applyEffect(
  character: BattleCharacter,
  effectType: string,
  duration: number
): void {
  // Zaten var mı kontrol et
  const existing = character.effects.find(e => e.type === effectType)
  if (existing) {
    existing.duration = Math.max(existing.duration, duration)
  } else {
    character.effects.push({
      type: effectType as any,
      duration,
    })
  }
}

export function endTurn(state: BattleState): BattleState {
  const newState = JSON.parse(JSON.stringify(state)) as BattleState
  const currentChar = newState[newState.currentTurn]

  // CD'leri azalt
  currentChar.abilities.forEach(ability => {
    if (ability.cd > 0) {
      ability.cd -= 1
    }
  })

  // Zehir hasarı uygula
  if (hasEffect(currentChar, 'poison')) {
    currentChar.currentHp = Math.max(0, currentChar.currentHp - GAME_CONFIG.EFFECT_DAMAGE.poison)
  }

  // Efektlerin sürelerini azalt ve kaldır (yalnizca sirasi biten oyuncu icin)
  currentChar.effects = currentChar.effects
    .map(e => ({ ...e, duration: e.duration - 1 }))
    .filter(e => e.duration > 0)

  // Sirayi degistir
  newState.currentTurn = newState.currentTurn === 'p1' ? 'p2' : 'p1'
  newState.round += 1

  return newState
}

export function initializeBattle(p1Dino: Dino, p2Dino: Dino): BattleState {
  const p1Char = dinoToCharacter(p1Dino)
  const p2Char = dinoToCharacter(p2Dino)

  // SPD'ye göre sıra belirle
  let currentTurn: 'p1' | 'p2' = 'p1'
  if (p2Char.spd > p1Char.spd) {
    currentTurn = 'p2'
  } else if (p1Char.spd === p2Char.spd) {
    // Eşit ise zar atsın — şimdilik p1 başlasın
    currentTurn = 'p1'
  }

  return {
    p1: p1Char,
    p2: p2Char,
    currentTurn,
    round: 1,
    log: [],
    finished: false,
  }
}

function dinoToCharacter(dino: Dino): BattleCharacter {
  const abilities: Ability[] = dino.abilities.map((a, idx) => ({
    id: `${dino.id}-${idx}`,
    name: a.name,
    cd: 0,
    maxCd: a.cd,
    kind: a.kind,
    effect: a.effect,
    multiplier: a.multiplier,
    icon: a.icon,
  }))

  return {
    dinoId: dino.id,
    name: dino.name,
    maxHp: dino.maxHp,
    currentHp: dino.maxHp,
    atk: dino.atk,
    def: dino.def,
    spd: dino.spd,
    abilities,
    effects: [],
    cooldowns: new Array(abilities.length).fill(0),
    round: 0,
  }
}

export function checkBattleEnd(state: BattleState): BattleState {
  const newState = { ...state }

  if (newState.p1.currentHp <= 0) {
    newState.finished = true
    newState.winner = 'p2'
  } else if (newState.p2.currentHp <= 0) {
    newState.finished = true
    newState.winner = 'p1'
  }

  return newState
}

export function calculateXpReward(difficulty: 'easy' | 'normal' | 'hard'): number {
  return GAME_CONFIG.XP_REWARDS[difficulty]
}

export function addXpToDino(dino: Dino, xp: number): Dino {
  const updated = { ...dino }
  updated.xp += xp

  while (updated.xp >= GAME_CONFIG.XP_TO_LEVEL_UP) {
    updated.xp -= GAME_CONFIG.XP_TO_LEVEL_UP
    updated.level += 1
    // Oyuncu puanları dağıtacak, şimdi sadece level arttır
  }

  return updated
}
