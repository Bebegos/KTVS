import { ActiveEffect } from '../../game/types'
import HealthBar from '../HealthBar'
import EffectIcon from '../EffectIcon'
import { getEffectNameTR } from '../../lib/effect-translations'

interface BattleUnitFrameProps {
  side: 'player' | 'enemy'
  name: string
  level?: number
  currentHp: number
  maxHp: number
  effects: ActiveEffect[]
  onEffectClick: (effect: ActiveEffect) => void
}

/**
 * WoW-style unit frame for the battle arena: an ornate gold-framed portrait with
 * the dino's name and a Hearthstone health bar, plus a row of clickable status
 * effects below it. The player frame faces right; the enemy frame is mirrored.
 *
 * Built in CSS so it looks themed even before the unit-frame PNG art lands; the
 * art will later overlay this as ornamentation.
 */
export default function BattleUnitFrame({
  side,
  name,
  level,
  currentHp,
  maxHp,
  effects,
  onEffectClick,
}: BattleUnitFrameProps) {
  const isPlayer = side === 'player'
  const accent = isPlayer ? '#d4af37' : '#b06a3a'

  const portrait = (
    <div
      className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center"
      style={{
        background: 'radial-gradient(circle at 35% 30%, #f0e0c0 0%, #cbb487 55%, #8a6d3f 100%)',
        border: `3px solid ${accent}`,
        boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.4), inset 0 -4px 8px rgba(0,0,0,0.4), 0 3px 8px rgba(0,0,0,0.6)',
      }}
    >
      <span className="text-3xl sm:text-4xl drop-shadow">🦖</span>
      {level != null && (
        <span
          className="absolute -bottom-1 -right-1 min-w-[20px] h-5 px-1 rounded-full text-[10px] font-black text-amber-50 flex items-center justify-center"
          style={{ background: '#3a2a14', border: `1.5px solid ${accent}` }}
        >
          {level}
        </span>
      )}
    </div>
  )

  const bars = (
    <div className={`flex-1 min-w-0 space-y-1 ${isPlayer ? '' : 'text-right'}`}>
      <p className="font-black text-amber-100 text-sm sm:text-base truncate drop-shadow"
         style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
        {name}
      </p>
      <HealthBar current={currentHp} max={maxHp} variant={isPlayer ? 'player' : 'enemy'} />
    </div>
  )

  return (
    <div className="w-64 sm:w-80 max-w-[80vw]">
      {/* Frame plate */}
      <div
        className="rounded-xl p-2.5 sm:p-3"
        style={{
          background: 'linear-gradient(180deg, rgba(40,28,14,0.92) 0%, rgba(24,16,8,0.92) 100%)',
          border: `2px solid ${accent}`,
          boxShadow: 'inset 0 0 16px rgba(0,0,0,0.6), 0 4px 14px rgba(0,0,0,0.5)',
        }}
      >
        <div className={`flex items-center gap-3 ${isPlayer ? '' : 'flex-row-reverse'}`}>
          {portrait}
          {bars}
        </div>
      </div>

      {/* Effects row (clickable) */}
      {effects && effects.length > 0 && (
        <div className={`flex flex-wrap gap-1.5 mt-1.5 ${isPlayer ? 'justify-start' : 'justify-end'}`}>
          {effects.map((effect, i) => (
            <button
              key={`${effect.type}-${i}`}
              type="button"
              onClick={() => onEffectClick(effect)}
              title={`${getEffectNameTR(effect.type)} — ${effect.duration} tur`}
              className="relative w-8 h-8 rounded-md bg-black/40 border border-amber-900/50 flex items-center justify-center hover:scale-110 transition-transform"
            >
              <EffectIcon effect={effect.type} size="sm" />
              {effect.duration > 0 && (
                <span className="absolute -bottom-1 -right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-stone-900 border border-amber-700 text-[8px] font-black text-amber-100 flex items-center justify-center leading-none">
                  {effect.duration}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
