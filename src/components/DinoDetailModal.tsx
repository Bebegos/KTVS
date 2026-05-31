import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino } from '../game/types'
import { abilityDefinitionService } from '../lib/services/abilityDefinitionService'
import { getClassIcon, getSpecIcon } from '../lib/icons'
import AbilityIcon from './AbilityIcon'
import MedallionIcon from './MedallionIcon'
import SvgIcon from './SvgIcon'
import { getEffectNameTR, getEffectEmoji, isBuffEffect } from '../lib/effect-translations'
import RewardSpendingModal from './RewardSpendingModal'

interface DinoDetailModalProps {
  dino: Dino
  isOpen: boolean
  onClose: () => void
  onEdit?: () => void
  onSpendRewards?: (updatedDino: Dino) => void
}

export default function DinoDetailModal({ dino, isOpen, onClose, onEdit, onSpendRewards }: DinoDetailModalProps) {
  const [rewardModalOpen, setRewardModalOpen] = useState(false)

  if (!isOpen) return null

  const hasPendingRewards = dino.pendingRewards && (dino.pendingRewards.unspentStatPoints > 0 || dino.pendingRewards.pendingAbilityIds.length > 0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="rounded-2xl max-w-2xl w-full border-2 border-neon-cyan bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-lg my-8"
      >
        {/* Header with dino info */}
        <div className="p-6 border-b border-neon-cyan/30 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="text-5xl">🦖</div>
              <div>
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">
                  {dino.name}
                </h1>
                <p className="text-sm text-neon-cyan/70 mt-1">
                  ⭐ Seviye {dino.level} • 💫 {dino.xp}/100 XP
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="hs-btn hs-btn-sm"
            >
              ✕
            </button>
          </div>

          {/* Class & Spec badges */}
          {(dino.class || dino.spec) && (
            <div className="flex gap-3 flex-wrap">
              {dino.class && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2">
                  <MedallionIcon id={dino.class} type="class" size="sm" />
                  <span className="text-xs font-bold text-blue-300">{getClassIcon(dino.class)?.label}</span>
                </div>
              )}
              {dino.spec && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-purple-500/10 border border-purple-500/30 rounded-lg px-3 py-2">
                  <MedallionIcon id={dino.spec} type="spec" size="sm" />
                  <span className="text-xs font-bold text-purple-300">{getSpecIcon(dino.spec)?.label}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="p-6 border-b border-neon-cyan/30 space-y-4">
          <h2 className="text-lg font-bold text-neon-cyan mb-3">📊 İstatistikler</h2>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
              <p className="text-xs text-red-400 font-bold mb-1">❤️ CAN</p>
              <p className="text-2xl font-black text-red-300">{dino.maxHp}</p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 text-center">
              <p className="text-xs text-orange-400 font-bold mb-1">⚔️ SALDIRI</p>
              <p className="text-2xl font-black text-orange-300">{dino.atk}</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
              <p className="text-xs text-blue-400 font-bold mb-1">🛡️ SAVUNMA</p>
              <p className="text-2xl font-black text-blue-300">{dino.def}</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
              <p className="text-xs text-yellow-400 font-bold mb-1">⚡ HIZ</p>
              <p className="text-2xl font-black text-yellow-300">{dino.spd}</p>
            </div>
          </div>
        </div>

        {/* Pending Rewards */}
        {hasPendingRewards && dino.pendingRewards && (
          <div className="p-6 border-b border-yellow-500/30 space-y-3 bg-yellow-500/5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl animate-pulse">⚡</span>
              <h2 className="text-lg font-bold text-yellow-300">SEVIYE ATLADI! Ödüllerini Harca</h2>
            </div>

            {dino.pendingRewards && dino.pendingRewards.unspentStatPoints > 0 && (
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
                <p className="text-sm font-bold text-yellow-300 mb-2">
                  📈 {dino.pendingRewards.unspentStatPoints} Stat Puanı Hazır
                </p>
                <p className="text-xs text-yellow-300/70">
                  Saldırı, Savunma veya Hız arasında dağıt
                </p>
              </div>
            )}

            {dino.pendingRewards && dino.pendingRewards.pendingAbilityIds.length > 0 && (
              <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-3">
                <p className="text-sm font-bold text-purple-300 mb-2">
                  ✨ {dino.pendingRewards.pendingAbilityIds.length} Yetenek Seçilecek
                </p>
                <div className="space-y-2">
                  {dino.pendingRewards.pendingAbilityIds.map(abilityId => {
                    const ability = abilityDefinitionService.getAbility(abilityId)
                    return ability ? (
                      <div key={abilityId} className="flex items-center gap-2 text-xs text-purple-300">
                        <span>•</span>
                        <span className="font-bold">{ability.name}</span>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            )}

            <button
              onClick={() => setRewardModalOpen(true)}
              className="hs-btn hs-btn-block mt-3"
            >
              Ödüllerini Harca →
            </button>
          </div>
        )}

        {/* Abilities */}
        {dino.abilityIds.length > 0 && (
          <div className="p-6 border-b border-neon-cyan/30 space-y-4">
            <h2 className="text-lg font-bold text-neon-cyan">⚡ Yetenekler</h2>
            <div className="space-y-3">
              {dino.abilityIds.map((abilityId, idx) => {
                if (!abilityId) return null
                const ability = abilityDefinitionService.getAbility(abilityId)
                if (!ability) return null

                return (
                  <div
                    key={idx}
                    className="bg-gradient-to-r from-neon-purple/10 to-neon-purple/5 border border-neon-purple/30 rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-start gap-3">
                      <AbilityIcon iconId={ability.icon} size="md" />
                      <div className="flex-1">
                        <p className="font-bold text-neon-purple text-sm">{ability.name}</p>
                        <p className="text-xs text-neon-purple/70">{ability.description}</p>
                      </div>
                    </div>

                    {/* Ability details */}
                    <div className="text-xs text-neon-purple/70 space-y-1 ml-11">
                      <div className="flex justify-between">
                        <span>Hasar Çarpanı:</span>
                        <span className="font-bold">×{ability.damageMultiplier || 1}</span>
                      </div>
                      {ability.cooldown > 0 && (
                        <div className="flex justify-between">
                          <span>Cooldown:</span>
                          <span className="font-bold">{ability.cooldown} tur</span>
                        </div>
                      )}
                      {ability.effects && ability.effects.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span>Efektler:</span>
                          <div className="flex gap-1">
                            {ability.effects.map((effectId: any, idx2: number) => (
                              <SvgIcon
                                key={idx2}
                                id={effectId}
                                type="effect"
                                size="xs"
                                fallback={getEffectEmoji(effectId)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-6 flex gap-3 justify-end">
          {onEdit && (
            <button
              onClick={onEdit}
              className="hs-btn hs-btn-purple"
            >
              ✏️ Düzenle
            </button>
          )}
          <button
            onClick={onClose}
            className="hs-btn"
          >
            ← Kapat
          </button>
        </div>
      </motion.div>

      {/* Reward Spending Modal */}
      <AnimatePresence>
        {rewardModalOpen && (
          <RewardSpendingModal
            dino={dino}
            isOpen={rewardModalOpen}
            onClose={() => setRewardModalOpen(false)}
            onConfirm={(updatedDino) => {
              if (onSpendRewards) {
                onSpendRewards(updatedDino)
              }
              setRewardModalOpen(false)
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
