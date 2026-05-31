import { motion } from 'framer-motion'
import { ActiveEffect } from '../game/types'
import { getEffect, getEffectDuration } from '../lib/effects'
import SvgIcon from './SvgIcon'
import { getEffectNameTR, getEffectEmoji, isBuffEffect } from '../lib/effect-translations'

interface EffectInfoModalProps {
  effect: ActiveEffect
  isOpen: boolean
  onClose: () => void
}

export default function EffectInfoModal({ effect, isOpen, onClose }: EffectInfoModalProps) {
  if (!isOpen) return null

  const effectDef = getEffect(effect.type)
  if (!effectDef) return null

  const duration = getEffectDuration(effect.type, 1)

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
        className={`glass-dark rounded-xl p-6 max-w-md w-full border-2 ${
          isBuffEffect(effect.type)
            ? 'neon-border-cyan'
            : 'neon-border-pink'
        }`}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0">
            <SvgIcon
              id={effect.type}
              type="effect"
              size="lg"
              fallback={getEffectEmoji(effect.type)}
            />
          </div>
          <div className="flex-1">
            <h2 className={`text-2xl font-black ${
              isBuffEffect(effect.type)
                ? 'text-green-400'
                : 'text-red-400'
            }`}>
              {getEffectNameTR(effect.type)}
            </h2>
            <p className={`text-xs font-bold ${
              isBuffEffect(effect.type)
                ? 'text-green-300/70'
                : 'text-red-300/70'
            }`}>
              {isBuffEffect(effect.type) ? '⬆️ BUFF' : '⬇️ DEBUFF'}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`${
              isBuffEffect(effect.type)
                ? 'text-green-400/70 hover:text-green-400'
                : 'text-red-400/70 hover:text-red-400'
            } text-2xl`}
          >
            ✕
          </button>
        </div>

        {/* Duration Info */}
        <div className={`mb-4 p-3 rounded-lg font-bold ${
          isBuffEffect(effect.type)
            ? 'bg-green-500/20 border border-green-500/50 text-green-400'
            : 'bg-red-500/20 border border-red-500/50 text-red-400'
        }`}>
          <p className="text-xs text-white/70 mb-1">Kalan Süre</p>
          <p className="text-2xl font-black">{effect.duration} / {duration} tur</p>
        </div>

        {/* Description */}
        <div className="mb-4 p-3 rounded-lg bg-slate-700/40">
          <p className="text-sm text-neon-cyan/90 leading-relaxed">{effectDef.fullDescription}</p>
        </div>

        {/* Effect Type */}
        <div className="mb-4 p-3 rounded-lg bg-slate-700/40 border border-neon-cyan/30">
          <p className="text-xs font-bold text-neon-cyan/70 mb-2">ETKİ TÜRü:</p>
          <span className={`inline-block px-3 py-1 rounded text-xs font-bold ${
            isBuffEffect(effect.type)
              ? 'bg-green-500/30 text-green-300'
              : 'bg-red-500/30 text-red-300'
          }`}>
            {isBuffEffect(effect.type) ? '✓ Olumlu Etki' : '✗ Olumsuz Etki'}
          </span>
        </div>

        {/* Color Info */}
        <div className="mb-4 flex gap-2 items-center justify-center p-2 rounded-lg bg-slate-700/40">
          <div className={`w-6 h-6 rounded border-2 ${
            isBuffEffect(effect.type)
              ? 'bg-green-500/30 border-green-500'
              : 'bg-red-500/30 border-red-500'
          }`} />
          <p className="text-xs text-neon-cyan/70 font-bold">
            {isBuffEffect(effect.type)
              ? 'Yeşil: Olumlu Efekt'
              : 'Kırmızı: Olumsuz Efekt'}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`w-full px-4 py-3 glass-dark rounded-lg font-bold active:scale-95 transition ${
            isBuffEffect(effect.type)
              ? 'neon-border-cyan text-neon-cyan hover:shadow-neon-cyan'
              : 'neon-border-pink text-red-400 hover:shadow-red-500/50'
          } border-2`}
        >
          ← Kapat
        </button>
      </motion.div>
    </motion.div>
  )
}
