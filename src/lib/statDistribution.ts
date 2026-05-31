// Stat Distribution System - Automatic allocation based on class & spec themes
// Base stats: ATK 5, DEF 5, SPD 5
// HP: 25-50 range based on class/spec (defense specs get bonus HP)
// Class distribution: 8 points
// Spec distribution: 2 points

export interface StatDistribution {
  atk: number
  def: number
  spd: number
  hp?: number // Optional: HP multiplier for level-ups
}

export interface ClassStatTheme {
  name: string
  baseHp: number // Starting HP for this class (25-40 range)
  classDistribution: StatDistribution // 8 points to distribute
  hpPerLevelStat: number // How many HP gained per stat point spent on HP (1.0, 1.5, 2.0, etc)
}

export interface SpecStatTheme {
  name: string
  specDistribution: StatDistribution // 2 points to distribute
  hpBonus?: number // Additional HP granted by this spec
}

// ============= CLASS STAT DISTRIBUTIONS (8 points each) =============

export const CLASS_STAT_THEMES: Record<string, ClassStatTheme> = {
  big_carnivore: {
    name: 'Büyük Yırtıcı',
    baseHp: 35,
    hpPerLevelStat: 1, // 1 HP per stat point
    classDistribution: {
      atk: 4,  // Heavy attacker
      def: 3,  // Moderate defense
      spd: 1,  // Slow
    },
  },
  raptor: {
    name: 'Raptor',
    baseHp: 28,
    hpPerLevelStat: 2, // 2 HP per stat point (fast, fragile)
    classDistribution: {
      atk: 3,  // Good attack
      def: 2,  // Low defense
      spd: 3,  // Fast
    },
  },
  giant_herbivore: {
    name: 'Dev Otçul',
    baseHp: 45,
    hpPerLevelStat: 1.5, // 1.5 HP per stat point (defensive)
    classDistribution: {
      atk: 1,  // Weak attack
      def: 5,  // Very defensive
      spd: 2,  // Slow
    },
  },
  flying_carnivore: {
    name: 'Uçan Yırtıcı',
    baseHp: 25,
    hpPerLevelStat: 2, // 2 HP per stat point (very fragile, very fast)
    classDistribution: {
      atk: 3,  // Good attack
      def: 1,  // Very low defense
      spd: 4,  // Very fast
    },
  },
}

// ============= SPEC STAT DISTRIBUTIONS (2 points each) =============

export const SPEC_STAT_THEMES: Record<string, SpecStatTheme> = {
  // big_carnivore specs
  armored: {
    name: 'Zırhlı',
    hpBonus: 8, // +8 HP (tank specialization)
    specDistribution: {
      atk: 0,
      def: 2,  // +2 DEF (tank specialization)
      spd: 0,
    },
  },
  fire_spec: {
    name: 'Ateş Ustası',
    specDistribution: {
      atk: 2,  // +2 ATK (offensive specialization)
      def: 0,
      spd: 0,
    },
  },
  ultra_carnivore: {
    name: 'Ultra Yırtıcı',
    specDistribution: {
      atk: 1,
      def: 0,
      spd: 1,  // +1 ATK +1 SPD (balanced offensive)
    },
  },

  // raptor specs
  speed_demon: {
    name: 'Hız Canavarı',
    specDistribution: {
      atk: 0,
      def: 0,
      spd: 2,  // +2 SPD (pure speed)
    },
  },
  poison_master: {
    name: 'Zehir Ustası',
    specDistribution: {
      atk: 1,
      def: 1,  // +1 ATK +1 DEF (balanced with utility)
      spd: 0,
    },
  },
  pack_hunter: {
    name: 'Sürü Avcısı',
    specDistribution: {
      atk: 2,  // +2 ATK (offensive)
      def: 0,
      spd: 0,
    },
  },

  // giant_herbivore specs
  tank: {
    name: 'Tank',
    hpBonus: 12, // +12 HP (pure tank spec - herbivore)
    specDistribution: {
      atk: 0,
      def: 2,  // +2 DEF (pure tank)
      spd: 0,
    },
  },
  healer: {
    name: 'İyileştirici',
    hpBonus: 6, // +6 HP (support role)
    specDistribution: {
      atk: 0,
      def: 1,
      spd: 1,  // +1 DEF +1 SPD (mobile healer)
    },
  },
  earth_shaker: {
    name: 'Yer Sarsıcı',
    hpBonus: 4, // +4 HP (balanced tank)
    specDistribution: {
      atk: 1,
      def: 1,  // +1 ATK +1 DEF (control spec)
      spd: 0,
    },
  },

  // flying_carnivore specs
  storm_bringer: {
    name: 'Fırtına Getiricisi',
    specDistribution: {
      atk: 1,
      def: 0,
      spd: 1,  // +1 ATK +1 SPD (aggressive)
    },
  },
  wind_dancer: {
    name: 'Rüzgar Dansçısı',
    specDistribution: {
      atk: 0,
      def: 0,
      spd: 2,  // +2 SPD (pure mobility)
    },
  },
  sun_striker: {
    name: 'Güneş Vuruşçusu',
    specDistribution: {
      atk: 2,  // +2 ATK (pure offense)
      def: 0,
      spd: 0,
    },
  },
}

/**
 * Calculate starting stats for a new dino based on class and spec
 */
export function calculateStartingStats(
  classId: string,
  specId: string
): { maxHp: number; atk: number; def: number; spd: number; hpPerLevelStat: number } {
  // Base combat stats
  const baseStats = {
    atk: 5,
    def: 5,
    spd: 5,
  }

  // Get class theme
  const classTheme = CLASS_STAT_THEMES[classId]
  if (!classTheme) {
    console.warn(`Class theme not found: ${classId}, using defaults`)
    return {
      maxHp: 30,
      ...baseStats,
      hpPerLevelStat: 1,
    }
  }

  // Get spec theme
  const specTheme = SPEC_STAT_THEMES[specId]
  let maxHp = classTheme.baseHp
  if (specTheme?.hpBonus) {
    maxHp += specTheme.hpBonus
  }

  if (!specTheme) {
    console.warn(`Spec theme not found: ${specId}, using class distribution only`)
    return {
      maxHp,
      atk: baseStats.atk + classTheme.classDistribution.atk,
      def: baseStats.def + classTheme.classDistribution.def,
      spd: baseStats.spd + classTheme.classDistribution.spd,
      hpPerLevelStat: classTheme.hpPerLevelStat,
    }
  }

  // Combine class and spec distributions
  return {
    maxHp,
    atk: baseStats.atk + classTheme.classDistribution.atk + specTheme.specDistribution.atk,
    def: baseStats.def + classTheme.classDistribution.def + specTheme.specDistribution.def,
    spd: baseStats.spd + classTheme.classDistribution.spd + specTheme.specDistribution.spd,
    hpPerLevelStat: classTheme.hpPerLevelStat,
  }
}

/**
 * Get stat distribution breakdown for display
 */
export function getStatDistributionBreakdown(classId: string, specId: string) {
  const classTheme = CLASS_STAT_THEMES[classId]
  const specTheme = SPEC_STAT_THEMES[specId]

  return {
    classTheme,
    specTheme,
    final: calculateStartingStats(classId, specId),
  }
}
