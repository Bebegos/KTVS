import { useState } from 'react'
import { battleAssets } from '../../lib/gameAssets'
import PremiumAbilityButton from '../PremiumAbilityButton'
import type { BattleArenaSlot } from './BattleArena'

const tileStyle = {
  backgroundImage: `url('${battleAssets.actionBar.center}')`,
  backgroundSize: '100% 100%',
  backgroundRepeat: 'no-repeat',
} as const

// One desktop action-bar tile = a single stone plate piece at its native aspect.
const DESKTOP_TILE = 'relative flex-shrink-0 aspect-[320/256] h-14 sm:h-20 md:h-28 lg:h-36 xl:h-44'
// Negative margin so adjacent plates interlock tightly at their gold edges.
const OVERLAP = '-ml-3 sm:-ml-5 lg:-ml-8'

function Ornament({ side }: { side: 'left' | 'right' }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  const src = side === 'left' ? battleAssets.actionBar.ornamentLeft : battleAssets.actionBar.ornamentRight
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      onError={() => setFailed(true)}
      draggable={false}
      className={`relative z-20 self-end w-auto object-contain h-24 sm:h-32 md:h-44 lg:h-52 xl:h-60 ${
        side === 'left' ? '-mr-6 lg:-mr-10' : '-ml-6 lg:-ml-10'
      }`}
    />
  )
}

function SlotButton({
  slot,
  playerAtk,
  onSelectAbility,
}: {
  slot: BattleArenaSlot
  playerAtk: number
  onSelectAbility: (idx: number) => void
}) {
  return (
    <PremiumAbilityButton
      ability={slot.ability}
      index={slot.index}
      atk={playerAtk}
      isUltimate={slot.isUltimate}
      isSelected={slot.isSelected}
      isLocked={slot.isLocked}
      canUse={slot.canUse}
      cooldown={slot.cooldown}
      maxCooldown={slot.maxCooldown}
      disabled={slot.disabled}
      lockedLevel={slot.lockedLevel}
      onClick={() => onSelectAbility(slot.index)}
      showPreview={false}
    />
  )
}

/**
 * WoW-style action bar.
 *  - Desktop (lg+): guardian ornaments at each end and a row of interlocking
 *    stone-plate tiles, one ability centered per tile, plus empty bookend tiles.
 *  - Mobile (<lg): a full-width grid of plate tiles (≈2 rows) with finger-sized
 *    ability buttons.
 */
export default function BattleActionBar({
  slots,
  playerAtk,
  onSelectAbility,
}: {
  slots: BattleArenaSlot[]
  playerAtk: number
  onSelectAbility: (idx: number) => void
}) {
  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:flex items-end justify-center w-full">
        <Ornament side="left" />
        <div className={DESKTOP_TILE} style={tileStyle} aria-hidden />
        {slots.map((slot) => (
          <div key={slot.index} className={`${DESKTOP_TILE} ${OVERLAP}`} style={tileStyle}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-[72%] aspect-square">
                <SlotButton slot={slot} playerAtk={playerAtk} onSelectAbility={onSelectAbility} />
              </div>
            </div>
          </div>
        ))}
        <div className={`${DESKTOP_TILE} ${OVERLAP}`} style={tileStyle} aria-hidden />
        <Ornament side="right" />
      </div>

      {/* MOBILE — full-width interlocking plate tiles, ~2 rows */}
      <div className="flex flex-col lg:hidden w-full">
        {[slots.slice(0, 3), slots.slice(3, 6)].map((row, ri) => (
          <div key={ri} className={`flex w-full ${ri > 0 ? '-mt-5' : ''}`}>
            {row.map((slot, ci) => (
              <div
                key={slot.index}
                className={`relative flex-1 min-w-0 aspect-[320/256] ${ci > 0 ? '-ml-5' : ''}`}
                style={tileStyle}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-[80%] aspect-square translate-y-[4%]">
                    <SlotButton slot={slot} playerAtk={playerAtk} onSelectAbility={onSelectAbility} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}
