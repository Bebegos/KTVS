import { Dino, ActiveEffect } from '../game/types'
import { getEffectBonus } from '../lib/effects'

interface BattleStatsCardProps {
  dino: Dino
  effects: ActiveEffect[]
  isPlayer?: boolean
}

export default function BattleStatsCard({
  dino,
  effects,
  isPlayer = true,
}: BattleStatsCardProps) {
  // Calculate total stat bonuses from active buff effects
  const statBonuses = effects.reduce(
    (acc, effect) => {
      const bonus = getEffectBonus(effect.type, 1) // Assuming level 1 for now
      return {
        atk: (acc.atk || 0) + (bonus.atk || 0),
        def: (acc.def || 0) + (bonus.def || 0),
        spd: (acc.spd || 0) + (bonus.spd || 0),
      }
    },
    { atk: 0, def: 0, spd: 0 }
  )

  const hasBuffs = Object.values(statBonuses).some(v => v > 0)

  const baseColor = isPlayer ? 'neon-cyan' : 'neon-purple'
  const borderClass = isPlayer ? 'neon-border-cyan' : 'neon-border-purple'

  return (
    <div className={`glass-dark ${borderClass} rounded-lg p-4 text-sm`}>
      <p className={`text-xs font-bold text-${baseColor} mb-3`}>
        {isPlayer ? '📊 STAT BONUSLARI' : '📊 RAKİP STAT'}
      </p>

      <div className="space-y-2">
        {/* ATK */}
        <div className="flex items-center justify-between">
          <span className={`text-${baseColor}/70`}>⚔️ ATK</span>
          <div className="flex items-center gap-2">
            <span className={`font-black text-${baseColor}`}>{dino.atk}</span>
            {statBonuses.atk > 0 && (
              <span className="text-green-400 font-black text-xs">+{statBonuses.atk}</span>
            )}
          </div>
        </div>

        {/* DEF */}
        <div className="flex items-center justify-between">
          <span className={`text-${baseColor}/70`}>🛡️ DEF</span>
          <div className="flex items-center gap-2">
            <span className={`font-black text-${baseColor}`}>{dino.def}</span>
            {statBonuses.def > 0 && (
              <span className="text-green-400 font-black text-xs">+{statBonuses.def}</span>
            )}
          </div>
        </div>

        {/* SPD */}
        <div className="flex items-center justify-between">
          <span className={`text-${baseColor}/70`}>💨 SPD</span>
          <div className="flex items-center gap-2">
            <span className={`font-black text-${baseColor}`}>{dino.spd}</span>
            {statBonuses.spd > 0 && (
              <span className="text-green-400 font-black text-xs">+{statBonuses.spd}</span>
            )}
          </div>
        </div>
      </div>

      {hasBuffs && (
        <div className={`mt-3 pt-3 border-t border-${baseColor}/20`}>
          <p className={`text-xs text-${baseColor}/60 font-bold`}>✨ Efekt Bonusları Aktif</p>
        </div>
      )}
    </div>
  )
}
