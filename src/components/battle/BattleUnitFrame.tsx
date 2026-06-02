import { useState } from 'react'
import { ActiveEffect } from '../../game/types'
import HealthBar from '../HealthBar'
import EffectIcon from '../EffectIcon'
import { getEffectNameTR } from '../../lib/effect-translations'
import { battleAssets } from '../../lib/gameAssets'

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
 * WoW-style unit frame: the ornate PNG frame (portrait socket + recessed bar
 * channel) with the dino portrait seated in the socket and a Hearthstone health
 * bar in the channel, plus clickable status effects below.
 *
 * The player frame is used as-authored (socket left); the enemy frame is the
 * same art mirrored (socket right), so content insets flip accordingly. Falls
 * back to a plain CSS frame if the PNG is missing.
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
  const [imgFailed, setImgFailed] = useState(false)
  const [enemyArtFailed, setEnemyArtFailed] = useState(false)
  const isPlayer = side === 'player'
  const accent = isPlayer ? '#d4af37' : '#c08a4a'
  // Enemy uses dedicated art if present, otherwise the player art mirrored.
  const useEnemyArt = side === 'enemy' && !enemyArtFailed
  const frameSrc = useEnemyArt ? battleAssets.unitFrameEnemy : battleAssets.unitFramePlayer
  const mirror = side === 'enemy' && enemyArtFailed

  // Painted-zone insets measured from the 640×220 frame art.
  const socket = isPlayer
    ? { left: '3%', top: '15%', width: '22%', height: '68%' }
    : { left: '75%', top: '15%', width: '22%', height: '68%' }
  const bars = isPlayer
    ? { left: '46%', right: '5%', top: '28%', height: '46%' }
    : { right: '46%', left: '5%', top: '28%', height: '46%' }

  const portrait = (
    <div className="absolute flex items-center justify-center" style={socket}>
      <div className="relative w-full h-full rounded-full flex items-center justify-center">
        <span className="text-2xl sm:text-3xl drop-shadow">🦖</span>
        {level != null && (
          <span
            className="absolute -bottom-0.5 right-0 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-black text-amber-50 flex items-center justify-center leading-none"
            style={{ background: '#2a1d0e', border: `1.5px solid ${accent}` }}
          >
            {level}
          </span>
        )}
      </div>
    </div>
  )

  const barBlock = (
    <div className="absolute flex flex-col justify-center gap-0.5" style={bars}>
      <p
        className={`font-black text-amber-100 text-[11px] sm:text-xs truncate leading-none ${isPlayer ? 'text-left' : 'text-right'}`}
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}
      >
        {name}
      </p>
      <HealthBar current={currentHp} max={maxHp} variant={isPlayer ? 'player' : 'enemy'} size="sm" />
    </div>
  )

  return (
    <div className="w-60 sm:w-80 max-w-[46vw]">
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
        {barBlock}
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
