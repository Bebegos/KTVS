import { useState } from 'react'
import { ActiveEffect } from '../../game/types'
import EffectIcon from '../EffectIcon'
import MedallionIcon from '../MedallionIcon'
import { getEffectNameTR } from '../../lib/effect-translations'
import { battleAssets } from '../../lib/gameAssets'

interface BattleUnitFrameProps {
  side: 'player' | 'enemy'
  name: string
  level?: number
  currentHp: number
  maxHp: number
  effects: ActiveEffect[]
  /** Spec medallion id (small badge). */
  specId?: string
  /** Class medallion id (main portrait); falls back to a default class. */
  classId?: string
  onEffectClick: (effect: ActiveEffect) => void
}

/** Default class portrait when a unit has no class of its own. */
const DEFAULT_PORTRAIT_CLASS = 'big_carnivore'

/**
 * WoW-style unit frame: the ornate PNG frame with the class medallion seated in
 * the portrait socket (a smaller spec medallion + level badge beneath it), a
 * health bar in the recessed channel with the HP value overlaid, and a separate
 * name card floating above the bar. Effects sit below, clickable.
 *
 * Player art is used as-authored (socket left); the enemy reuses it mirrored.
 */
export default function BattleUnitFrame({
  side,
  name,
  level,
  currentHp,
  maxHp,
  effects,
  specId,
  classId,
  onEffectClick,
}: BattleUnitFrameProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const [enemyArtFailed, setEnemyArtFailed] = useState(false)
  const isPlayer = side === 'player'
  const accent = isPlayer ? '#d4af37' : '#c08a4a'
  const useEnemyArt = side === 'enemy' && !enemyArtFailed
  const frameSrc = useEnemyArt ? battleAssets.unitFrameEnemy : battleAssets.unitFramePlayer
  const mirror = side === 'enemy' && enemyArtFailed

  // Painted-zone insets measured from the 640×220 frame art.
  const socket = isPlayer
    ? { left: '3%', top: '14%', width: '23%', height: '70%' }
    : { left: '74%', top: '14%', width: '23%', height: '70%' }
  const bars = isPlayer
    ? { left: '46%', right: '7%', top: '40%', height: '27%' }
    : { right: '46%', left: '7%', top: '40%', height: '27%' }

  const pct = Math.max(0, Math.min(100, (currentHp / maxHp) * 100))
  const shown = Math.max(0, Math.round(currentHp))
  const badge = 'w-5 h-5 sm:w-7 sm:h-7'

  const portrait = (
    <div className="absolute" style={socket}>
      {/* Main class medallion fills the socket ring */}
      <div className="absolute inset-[9%]">
        <MedallionIcon id={classId || DEFAULT_PORTRAIT_CLASS} type="class" fill />
      </div>
      {/* Spec + level badges beneath the socket */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-[6%] flex items-center gap-1">
        {specId && (
          <div
            className={`${badge} rounded-full overflow-hidden flex items-center justify-center bg-stone-900/80`}
            style={{ border: `2px solid ${accent}` }}
          >
            <MedallionIcon id={specId} type="spec" fill />
          </div>
        )}
        {level != null && (
          <div
            className={`${badge} rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black text-amber-100 bg-stone-900`}
            style={{ border: `2px solid ${accent}` }}
          >
            {level}
          </div>
        )}
      </div>
    </div>
  )

  const healthBar = (
    <div className="absolute" style={bars}>
      <div
        className="relative w-full h-full rounded-full overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #2a0c0c 0%, #471212 100%)',
          boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.7)',
          border: '1px solid rgba(0,0,0,0.5)',
        }}
      >
        <div
          className="h-full transition-[width] duration-500"
          style={{
            width: `${pct}%`,
            background: isPlayer
              ? 'linear-gradient(180deg, #ff6f5e 0%, #d63b2c 45%, #8b1a14 100%)'
              : 'linear-gradient(180deg, #e0584a 0%, #b5392c 45%, #7a1d16 100%)',
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-1/2 rounded-t-full pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.30), transparent)' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-[11px] sm:text-sm font-black text-white leading-none"
            style={{ textShadow: '0 0 3px #000, 0 1px 2px #000, 0 0 6px rgba(0,0,0,0.9)' }}
          >
            {shown}
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="w-60 sm:w-72 md:w-80 lg:w-[26rem] xl:w-[32rem] max-w-[46vw]">
      {/* Name card floating above the bar (aligned over the channel side) */}
      <div className={`flex ${isPlayer ? 'justify-end' : 'justify-start'} mb-1 px-[3%]`}>
        <div
          className="max-w-[62%] truncate px-3 py-0.5 rounded-md text-[11px] sm:text-xs font-black text-amber-950 text-center shadow"
          style={{ background: 'linear-gradient(180deg, #efe0c0 0%, #cdb487 100%)', border: `1.5px solid ${accent}` }}
        >
          {name}
        </div>
      </div>

      {/* Frame + seated content */}
      <div className="relative w-full aspect-[640/220]">
        {!imgFailed ? (
          <img
            src={frameSrc}
            alt=""
            aria-hidden
            onError={() => {
              if (side === 'enemy' && !enemyArtFailed) setEnemyArtFailed(true)
              else setImgFailed(true)
            }}
            className="absolute inset-0 w-full h-full object-contain"
            style={mirror ? { transform: 'scaleX(-1)' } : undefined}
            draggable={false}
          />
        ) : (
          <div
            className="absolute inset-0 rounded-xl"
            style={{ background: 'linear-gradient(180deg, rgba(40,28,14,0.92), rgba(24,16,8,0.92))', border: `2px solid ${accent}` }}
          />
        )}
        {portrait}
        {healthBar}
      </div>

      {/* Effects row (clickable) */}
      {effects && effects.length > 0 && (
        <div className={`flex flex-wrap gap-1.5 mt-1 ${isPlayer ? 'justify-start pl-1' : 'justify-end pr-1'}`}>
          {effects.map((effect, i) => (
            <button
              key={`${effect.type}-${i}`}
              type="button"
              onClick={() => onEffectClick(effect)}
              title={`${getEffectNameTR(effect.type)} — ${effect.duration} tur`}
              className="relative w-8 h-8 rounded-md bg-black/45 border border-amber-900/50 flex items-center justify-center hover:scale-110 transition-transform"
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
