import { ActiveEffect } from '../game/types'
import { getEffect, getEffectDuration } from '../lib/effects'
import EffectIcon from './EffectIcon'
import PremiumModal from './PremiumModal'
import PremiumButton from './PremiumButton'
import { getEffectNameTR, isBuffEffect } from '../lib/effect-translations'

interface EffectInfoModalProps {
  effect: ActiveEffect
  battleCharacterMaxHp?: number
  isOpen: boolean
  onClose: () => void
}

export default function EffectInfoModal({ effect, battleCharacterMaxHp = 100, isOpen, onClose }: EffectInfoModalProps) {
  if (!isOpen) return null

  const effectDef = getEffect(effect.type)
  if (!effectDef) return null

  const duration = getEffectDuration(effect.type, 1)
  const defaultLevel = effectDef.defaultLevel || 1
  const levelData = effectDef.levels[defaultLevel] || effectDef.levels[1]

  const buff = isBuffEffect(effect.type)
  const accent = buff ? '#15803d' : '#b91c1c' // green / red, parchment-readable

  // A parchment sub-panel tinted with the effect accent.
  const panel = 'rounded-lg p-3 border'
  const panelStyle = { background: `${accent}14`, borderColor: `${accent}40` }

  return (
    <PremiumModal onClose={onClose} zIndex={300}>
      <div className="px-4 sm:px-5 pt-0 pb-4 sm:pb-5 -mt-3 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <span
            className="flex items-center justify-center w-14 h-14 rounded-full flex-shrink-0"
            style={{ background: `${accent}1a`, border: `1.5px solid ${accent}55` }}
          >
            <EffectIcon effect={effect.type} size="lg" large />
          </span>
          <div>
            <h2 className="text-2xl font-black text-amber-950 leading-tight">
              {getEffectNameTR(effect.type)}
            </h2>
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: accent }}>
              {buff ? '⬆ Olumlu Etki' : '⬇ Olumsuz Etki'}
            </p>
          </div>
        </div>

        {/* Gold hairline separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-amber-700/55 to-transparent" />

        {/* Duration */}
        <div className={panel} style={panelStyle}>
          <p className="text-[11px] font-black uppercase tracking-wide text-amber-800/80 mb-1">Süre</p>
          <p className="text-2xl font-black text-amber-950 leading-none">
            {effect.duration} <span className="text-base text-amber-800/70">/ {duration} tur</span>
          </p>
        </div>

        {/* Description */}
        <div className="bg-amber-900/10 border border-amber-900/25 rounded-lg p-3">
          <p className="text-sm font-semibold text-amber-950/90 leading-relaxed">
            {effectDef.fullDescription}
          </p>
        </div>

        {/* Damage Details */}
        {levelData && (levelData.damage !== undefined || levelData.damagePercent !== undefined) && (
          <div className={panel} style={panelStyle}>
            <p className="text-[11px] font-black uppercase tracking-wide mb-2" style={{ color: accent }}>
              ⚡ Hasar Detayları
            </p>
            <div className="space-y-1 text-sm font-semibold text-amber-950/90">
              {levelData.damage !== undefined && (
                <div className="flex justify-between">
                  <span>Sabit Hasar</span>
                  <span className="font-black">{levelData.damage} / tur</span>
                </div>
              )}
              {levelData.damagePercent !== undefined && (
                <div className="flex justify-between">
                  <span>Yüzde Hasar</span>
                  <span className="font-black">{levelData.damagePercent}% / tur</span>
                </div>
              )}
              {levelData.damagePercent !== undefined && battleCharacterMaxHp && (
                <div className="flex justify-between text-amber-800/70">
                  <span>Tahmini</span>
                  <span>{Math.round((battleCharacterMaxHp * levelData.damagePercent) / 100)} HP / tur</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stat Bonuses */}
        {levelData && levelData.statBonus && (
          <div className={panel} style={panelStyle}>
            <p className="text-[11px] font-black uppercase tracking-wide mb-2" style={{ color: accent }}>
              📊 Stat Etkisi
            </p>
            <div className="space-y-1 text-sm font-semibold text-amber-950/90">
              {(['atk', 'def', 'spd'] as const).map((k) => {
                const v = levelData.statBonus?.[k]
                if (v === undefined) return null
                const labelTr = k === 'atk' ? 'Saldırı' : k === 'def' ? 'Savunma' : 'Hız'
                return (
                  <div key={k} className="flex justify-between">
                    <span>{labelTr}</span>
                    <span className="font-black" style={{ color: v > 0 ? '#15803d' : '#b91c1c' }}>
                      {v > 0 ? '+' : ''}
                      {v}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Close */}
        <PremiumButton onClick={onClose} className="w-full" contentClassName="text-sm">
          Kapat
        </PremiumButton>
      </div>
    </PremiumModal>
  )
}
