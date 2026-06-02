import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Ability, ActiveEffect, BattleVisualEffects } from '../../game/types'
import { battleAssets, modalAssets, squareMenuButtonAssets } from '../../lib/gameAssets'
import AbilityIcon from '../AbilityIcon'
import BattleUnitFrame from './BattleUnitFrame'
import BattleActionBar from './BattleActionBar'
import FloatingDamageNumber from '../battle-effects/FloatingDamageNumber'

export interface BattleArenaSlot {
  ability: Ability | null
  index: number
  isUltimate?: boolean
  isSelected: boolean
  isLocked: boolean
  canUse: boolean
  cooldown: number
  maxCooldown: number
  disabled: boolean
  lockedLevel?: number
}

export interface BattleArenaSide {
  name: string
  level?: number
  currentHp: number
  maxHp: number
  effects: ActiveEffect[]
  /** Spec medallion id for the portrait (preferred). */
  specId?: string
  /** Class medallion id, used if no spec is available. */
  classId?: string
}

export interface FloatingDamage {
  id: string
  damage: number
  isCritical: boolean
  isHealing: boolean
  x: number
  y: number
}

interface BattleArenaProps {
  player: BattleArenaSide
  opponent: BattleArenaSide
  playerAtk: number
  round: number
  battleLog: string[]
  slots: BattleArenaSlot[]
  onSelectAbility: (idx: number) => void
  onEffectClick: (effect: ActiveEffect) => void
  /** Optional status line shown above the action bar (e.g. "Rakip beklemede..."). */
  statusText?: string
  /** Optional abandon/forfeit/exit handler. */
  onAbandon?: () => void
  /** Optional primary action shown above the bar (e.g. "End Turn" in offline mode). */
  primaryAction?: { label: string; onClick: () => void; disabled?: boolean }
  // Transient animation layers (owned by the mode controller)
  activeEffectOverlay: boolean
  currentVisualEffects: BattleVisualEffects | null
  onEffectOverlayComplete: () => void
  floatingDamages: FloatingDamage[]
  /** Icon id of the ability currently being cast (zooms in at screen center). */
  castIconId?: string
}

/**
 * Unified WoW-style battle view shared by every mode (Adventure PVE, Offline
 * PVE, Duello PVP). Pure presentation: it renders the arena from battleState
 * data + callbacks. Mode-specific orchestration (AI, networking, rewards) lives
 * in the per-mode controllers that render this.
 */
export default function BattleArena({
  player,
  opponent,
  playerAtk,
  round,
  battleLog,
  slots,
  onSelectAbility,
  onEffectClick,
  statusText,
  onAbandon,
  primaryAction,
  activeEffectOverlay,
  currentVisualEffects,
  onEffectOverlayComplete,
  floatingDamages,
  castIconId,
}: BattleArenaProps) {
  // null = nothing shown in the center; 'log' = battle log card.
  const [centerCard, setCenterCard] = useState<null | 'log'>(null)
  const [bgFailed, setBgFailed] = useState(false)

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-stone-950 via-amber-950/30 to-stone-950">
      {/* Battlefield background (falls back to the gradient above if missing) */}
      {!bgFailed && (
        <img
          src={battleAssets.background}
          alt=""
          aria-hidden
          onError={() => setBgFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      )}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      {/* Floating damage numbers */}
      <AnimatePresence>
        {floatingDamages.map((d) => (
          <FloatingDamageNumber key={d.id} damage={d.damage} isCritical={d.isCritical} isHealing={d.isHealing} x={d.x} y={d.y} />
        ))}
      </AnimatePresence>

      {/* Center cast animation: the acting ability's icon zooms in */}
      <AnimatePresence>
        {activeEffectOverlay && castIconId && (
          <motion.div
            key={`cast-${castIconId}-${round}`}
            className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
            initial={{ scale: 0.25, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 1.7, opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <div className="w-36 h-36 sm:w-52 sm:h-52 lg:w-64 lg:h-64 drop-shadow-[0_0_40px_rgba(0,0,0,0.85)]">
              <AbilityIcon iconId={castIconId} fill />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HUD: unit frames in the corners, toggles + center card below */}
      <div className="absolute top-0 inset-x-0 z-20 p-2 sm:p-3 pointer-events-none">
        <div className="flex items-start justify-between gap-2">
          <div className="pointer-events-auto">
            <BattleUnitFrame side="player" name={player.name} level={player.level} currentHp={player.currentHp} maxHp={player.maxHp} effects={player.effects} specId={player.specId} classId={player.classId} onEffectClick={onEffectClick} />
          </div>
          <div className="pointer-events-auto">
            <BattleUnitFrame side="enemy" name={opponent.name} level={opponent.level} currentHp={opponent.currentHp} maxHp={opponent.maxHp} effects={opponent.effects} specId={opponent.specId} classId={opponent.classId} onEffectClick={onEffectClick} />
          </div>
        </div>

        {/* Center toggles + display card */}
        <div className="mt-2 flex flex-col items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2">
            <SquareIconButton
              active={centerCard === 'log'}
              onClick={() => setCenterCard((c) => (c === 'log' ? null : 'log'))}
              title="Savaş Kaydı"
            >
              📜
            </SquareIconButton>
            {onAbandon && (
              <SquareIconButton onClick={onAbandon} title="Terk Et">
                🚪
              </SquareIconButton>
            )}
          </div>

          {/* Battle log card (themed) — only when toggled on */}
          {centerCard === 'log' && (
            <div
              className="w-[min(92vw,32rem)] p-3 sm:p-4"
              style={{
                borderStyle: 'solid',
                borderWidth: '24px',
                borderImageSource: `url('${modalAssets.frame}')`,
                borderImageSlice: '58 fill',
                borderImageRepeat: 'stretch',
              }}
            >
              <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-amber-900 mb-2">
                📜 Savaş Kaydı
              </p>
              <div className="h-32 overflow-y-auto pr-1 space-y-1">
                {battleLog.length === 0 ? (
                  <p className="text-amber-900/50 text-sm text-center py-6">Savaş henüz başlamadı…</p>
                ) : (
                  battleLog.slice(0, 8).map((msg, idx) => (
                    <p
                      key={`${idx}-${msg.slice(0, 8)}`}
                      className="text-xs font-semibold text-amber-950/90 bg-amber-900/10 border border-amber-900/20 rounded px-2 py-1 break-words"
                    >
                      {msg}
                    </p>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM ACTION BAR (fixed to screen bottom, WoW-style) */}
      <div className="absolute bottom-0 inset-x-0 z-30">
        {(statusText || primaryAction) && (
          <div className="flex justify-center items-center gap-3 mb-1.5">
            {statusText && (
              <span className="px-4 py-1 rounded-full text-xs font-black text-amber-100 bg-stone-950/80 border border-amber-700/50">
                {statusText}
              </span>
            )}
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled}
                className="px-5 py-1.5 rounded-lg text-sm font-black text-amber-50 bg-amber-700/90 border border-amber-400/60 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg"
              >
                {primaryAction.label}
              </button>
            )}
          </div>
        )}

        <BattleActionBar slots={slots} playerAtk={playerAtk} onSelectAbility={onSelectAbility} />
      </div>
    </div>
  )
}

function SquareIconButton({
  active = false,
  onClick,
  title,
  children,
}: {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  const [hover, setHover] = useState(false)
  const frame = active
    ? squareMenuButtonAssets.pressed
    : hover
    ? squareMenuButtonAssets.hover
    : squareMenuButtonAssets.base
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`relative w-11 h-11 sm:w-12 sm:h-12 bg-transparent border-0 p-0 transition-transform hover:scale-105 active:scale-95 ${
        active ? 'drop-shadow-[0_0_10px_rgba(212,175,55,0.7)]' : ''
      }`}
      style={{
        backgroundImage: `url('${frame}')`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <span className="absolute inset-0 flex items-center justify-center text-base sm:text-lg">{children}</span>
    </button>
  )
}

