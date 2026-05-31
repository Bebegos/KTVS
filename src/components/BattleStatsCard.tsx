import { Dino, ActiveEffect } from '../game/types'
import { getEffectBonus } from '../lib/effects'
import SvgIcon from './SvgIcon'

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

  if (isPlayer) {
    return (
      <div className="glass-dark neon-border-cyan rounded-lg p-4 text-sm">
        <p className="text-xs font-bold text-neon-cyan mb-3">STAT BONUSLARI</p>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-neon-cyan/70 flex items-center gap-1"><SvgIcon id="atk" type="stat" size="xs" /> ATK</span>
            <div className="flex items-center gap-2">
              <span className="font-black text-neon-cyan">{dino.atk}</span>
              {statBonuses.atk > 0 && (
                <span className="text-green-400 font-black text-xs">+{statBonuses.atk}</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-neon-cyan/70 flex items-center gap-1"><SvgIcon id="def" type="stat" size="xs" /> DEF</span>
            <div className="flex items-center gap-2">
              <span className="font-black text-neon-cyan">{dino.def}</span>
              {statBonuses.def > 0 && (
                <span className="text-green-400 font-black text-xs">+{statBonuses.def}</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-neon-cyan/70 flex items-center gap-1"><SvgIcon id="spd" type="stat" size="xs" /> SPD</span>
            <div className="flex items-center gap-2">
              <span className="font-black text-neon-cyan">{dino.spd}</span>
              {statBonuses.spd > 0 && (
                <span className="text-green-400 font-black text-xs">+{statBonuses.spd}</span>
              )}
            </div>
          </div>
        </div>

        {hasBuffs && (
          <div className="mt-3 pt-3 border-t border-neon-cyan/20">
            <p className="text-xs text-neon-cyan/60 font-bold">Efekt Bonusları Aktif</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="glass-dark neon-border-purple rounded-lg p-4 text-sm">
      <p className="text-xs font-bold text-neon-purple mb-3">RAKİP STAT</p>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-neon-purple/70 flex items-center gap-1"><SvgIcon id="atk" type="stat" size="xs" /> ATK</span>
          <div className="flex items-center gap-2">
            <span className="font-black text-neon-purple">{dino.atk}</span>
            {statBonuses.atk > 0 && (
              <span className="text-green-400 font-black text-xs">+{statBonuses.atk}</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-neon-purple/70 flex items-center gap-1"><SvgIcon id="def" type="stat" size="xs" /> DEF</span>
          <div className="flex items-center gap-2">
            <span className="font-black text-neon-purple">{dino.def}</span>
            {statBonuses.def > 0 && (
              <span className="text-green-400 font-black text-xs">+{statBonuses.def}</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-neon-purple/70 flex items-center gap-1"><SvgIcon id="spd" type="stat" size="xs" /> SPD</span>
          <div className="flex items-center gap-2">
            <span className="font-black text-neon-purple">{dino.spd}</span>
            {statBonuses.spd > 0 && (
              <span className="text-green-400 font-black text-xs">+{statBonuses.spd}</span>
            )}
          </div>
        </div>
      </div>

      {hasBuffs && (
        <div className="mt-3 pt-3 border-t border-neon-purple/20">
          <p className="text-xs text-neon-purple/60 font-bold">Efekt Bonusları Aktif</p>
        </div>
      )}
    </div>
  )
}
