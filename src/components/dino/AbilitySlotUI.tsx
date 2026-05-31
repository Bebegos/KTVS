// AbilitySlotUI - Render ability slot with lock enforcement
// CRITICAL: This component prevents interaction with locked slots

import { Dino } from '../../game/types'
import { slotService } from '../../lib/services'
import AbilityIcon from '../AbilityIcon'

interface AbilitySlotUIProps {
  dino: Dino
  slot: number
  onClick?: (slot: number) => void
  size?: 'sm' | 'md' | 'lg'
  showLockReason?: boolean
}

export default function AbilitySlotUI({
  dino,
  slot,
  onClick,
  size = 'md',
  showLockReason = true,
}: AbilitySlotUIProps) {
  const isLocked = slotService.isSlotLocked(dino, slot)
  const isFilled = slotService.isSlotFilled(dino, slot)
  const canClick = slotService.canClickSlot(dino, slot)
  const requiredLevel = slotService.getSlotRequiredLevel(slot)
  const ability = dino.abilities[slot]

  const handleClick = () => {
    if (!canClick || !onClick) return
    onClick(slot)
  }

  // Size styles
  const sizeClasses = {
    sm: 'p-2 min-h-[80px]',
    md: 'p-4 min-h-[120px]',
    lg: 'p-6 min-h-[160px]',
  }

  // Locked slot rendering
  if (isLocked) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-xl flex flex-col items-center justify-center gap-2 hs-card border-2 border-dashed border-gray-500/30 text-gray-500 opacity-40 cursor-not-allowed`}
      >
        <span className="text-2xl">🔒</span>
        <p className="text-xs font-bold">Boş Slot</p>
        {showLockReason && <p className="text-xs text-gray-400">Seviye {requiredLevel} açılır</p>}
      </div>
    )
  }

  // Empty unlocked slot
  if (!isFilled) {
    return (
      <button
        onClick={handleClick}
        disabled={!canClick}
        className={`${sizeClasses[size]} rounded-xl font-bold transition flex flex-col items-center justify-center gap-2 hs-card border-2 border-dashed border-neon-cyan/30 text-neon-cyan/70 hover:text-neon-cyan hover:border-neon-cyan/50 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className="text-2xl">➕</span>
        <p className="text-xs font-bold">Yetenek Ekle</p>
      </button>
    )
  }

  // Filled slot
  return (
    <button
      onClick={handleClick}
      disabled={!canClick}
      className={`${sizeClasses[size]} rounded-xl font-bold transition flex flex-col items-start gap-2 hs-card neon-border-cyan border-2 text-neon-cyan hover:shadow-neon-cyan disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {ability && (
        <>
          <div className="flex items-center gap-2 w-full">
            <AbilityIcon iconId={ability.icon} size="md" />
            <p className="font-black text-sm">{ability.name}</p>
          </div>
          <div className="text-xs space-y-1 w-full">
            <div className="flex justify-between">
              <span>×{ability.multiplier || 1}</span>
              {ability.cd > 0 && <span className="text-neon-cyan/70">CD: {ability.cd}</span>}
            </div>
          </div>
        </>
      )}
    </button>
  )
}
