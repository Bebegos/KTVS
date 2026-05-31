import { motion } from 'framer-motion'
import { Dino } from '../game/types'
import { abilityCalculationService } from '../lib/services/abilityCalculationService'
import { abilityDefinitionService } from '../lib/services/abilityDefinitionService'
import AbilityIcon from './AbilityIcon'
import SvgIcon from './SvgIcon'
import { getEffectNameTR, getEffectEmoji, isBuffEffect } from '../lib/effect-translations'

interface AbilityInfoModalProps {
  abilityId: string
  dino: Dino
  cooldown: number
  isOpen: boolean
  onClose: () => void
}

export default function AbilityInfoModal({ abilityId, dino, cooldown, isOpen, onClose }: AbilityInfoModalProps) {
  if (!isOpen) return null

  const ability = abilityDefinitionService.getAbility(abilityId)
  if (!ability) return null

  const isCooling = cooldown > 0
  const canUse = !isCooling

  // Calculate actual damage/healing values
  let baseValue = 0
  let valueType = 'dmg'
  if (ability.kind === 'heal') {
    baseValue = abilityCalculationService.calculateAbilityHealing(abilityId, dino)
    valueType = 'heal'
  } else if (ability.kind === 'attack' || ability.kind === 'debuff') {
    baseValue = abilityCalculationService.calculateAbilityBaseDamage(abilityId, dino)
    valueType = 'dmg'
  }

  const effects = abilityCalculationService.getAbilityEffects(abilityId)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[300] p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="glass-dark neon-border-cyan rounded-xl p-6 max-w-md w-full border-2"
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0">
            <AbilityIcon iconId={ability.icon} size="lg" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-neon-cyan">{ability.name}</h2>
            <p className={`text-xs font-bold ${ability.kind === 'heal' ? 'text-green-400' : 'text-neon-cyan/70'}`}>
              {ability.kind.toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neon-cyan/70 hover:text-neon-cyan text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Cooldown Info */}
        {ability.cd > 0 && (
          <div className={`mb-4 p-3 rounded-lg font-bold ${
            isCooling
              ? 'bg-red-500/20 border border-red-500/50 text-red-400'
              : 'bg-green-500/20 border border-green-500/50 text-green-400'
          }`}>
            {isCooling ? `⏳ Hazırlanıyor: ${cooldown} tur` : '✓ Hazır'}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-700/40 rounded-lg p-3 text-center">
            <p className="text-xs text-neon-cyan/70 font-bold mb-1">Hasar Çarpanı</p>
            <p className="text-xl font-black text-neon-cyan">×{ability.multiplier || 1}</p>
          </div>
          <div className="bg-slate-700/40 rounded-lg p-3 text-center">
            <p className="text-xs text-neon-cyan/70 font-bold mb-1">Cooldown</p>
            <p className="text-xl font-black text-neon-cyan">{ability.cd}T</p>
          </div>
        </div>

        {/* Effect Info */}
        {ability.effects && ability.effects.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-slate-700/40 border border-neon-purple/30">
            <p className="text-xs font-bold text-neon-purple mb-2">EFEKTLER:</p>
            <div className="space-y-2">
              {ability.effects.map((effectId, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <SvgIcon
                    id={effectId}
                    type="effect"
                    size="sm"
                    fallback={getEffectEmoji(effectId)}
                  />
                  <span className={`font-bold ${isBuffEffect(effectId) ? 'text-green-400' : 'text-red-400'}`}>
                    {getEffectNameTR(effectId)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {ability.description && (
          <div className="mb-4 p-3 rounded-lg bg-slate-700/40">
            <p className="text-sm text-neon-cyan/90">{ability.description}</p>
          </div>
        )}

        {/* Kind Info */}
        <div className="mb-4 p-3 rounded-lg bg-slate-700/40 border border-neon-cyan/30">
          <p className="text-xs font-bold text-neon-cyan/70 mb-1">TÜR:</p>
          <div className="flex flex-wrap gap-2">
            <span className={`px-2 py-1 rounded text-xs font-bold ${
              ability.kind === 'heal' ? 'bg-green-500/30 text-green-300' :
              ability.kind === 'buff' ? 'bg-blue-500/30 text-blue-300' :
              ability.kind === 'debuff' ? 'bg-red-500/30 text-red-300' :
              ability.kind === 'ultimate' ? 'bg-yellow-500/30 text-yellow-300' :
              'bg-neon-cyan/30 text-neon-cyan'
            }`}>
              {ability.kind === 'heal' ? '💚 İyileştirme' :
               ability.kind === 'buff' ? '⬆️ Buff' :
               ability.kind === 'debuff' ? '⬇️ Debuff' :
               ability.kind === 'ultimate' ? '👑 Ultimate' :
               ability.kind === 'attack' ? '⚔️ Saldırı' :
               ability.kind === 'passive' ? '✨ Pasif' :
               ability.kind === 'utility' ? '🛠️ Yardımcı' :
               ability.kind}
            </span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-3 glass-dark neon-border-cyan rounded-lg font-bold text-neon-cyan hover:shadow-neon-cyan active:scale-95 transition"
        >
          ← Kapat
        </button>
      </motion.div>
    </motion.div>
  )
}
