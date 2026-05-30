export const GAME_CONFIG = {
  // Zar sistemi
  DICE_TYPE: 'd6',
  DICE_SIDES: 6,
  MIN_DICE: 1,
  MAX_DICE: 6,

  // İsabet sistemi
  MISS_VALUE: 1,
  HIT_VALUES: [2, 3, 4, 5],
  CRIT_VALUE: 6,
  CRIT_MULTIPLIER: 2,

  // Hasar
  MIN_DAMAGE: 1,

  // XP & Level
  XP_TO_LEVEL_UP: 100,
  STAT_POINTS_PER_LEVEL: 5,
  XP_REWARDS: {
    easy: 10,
    normal: 20,
    hard: 50,
  },

  // Efektler
  EFFECT_DAMAGE: {
    poison: 3,
  },
  EFFECT_BONUS: {
    power: 3,
    shield: 3,
  },
  STUN_MISS_RANGE: [1, 2],

  // Kaçış
  DODGE_THRESHOLD: [5, 6],

  // UI
  ANIMATION_DURATION: 500,
  DICE_ANIMATION_DURATION: 600,
}
