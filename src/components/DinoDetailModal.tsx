import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino } from '../game/types'
import { abilityDefinitionService } from '../lib/services/abilityDefinitionService'
import AbilityIcon from './AbilityIcon'
import SvgIcon from './SvgIcon'
import { getEffectEmoji } from '../lib/effect-translations'
import RewardSpendingModal from './RewardSpendingModal'
import DinoCard from './DinoCard'
import { discoveryService } from '../lib/services'

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

  const hasPendingRewards = dino.pendingRewards && (dino.pendingRewards.unspentStatPoints > 0 || discoveryService.getDiscoveries(dino).length > 0)

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
        className="max-w-2xl w-full my-8"
      >
        {/* Close button */}
        <div className="flex justify-end mb-3">
          <button
            onClick={onClose}
            className="hs-btn hs-btn-sm"
          >
            <span>✕</span>
          </button>
        </div>

        {/* Unified Hearthstone Dino Card as header */}
        <DinoCard dino={dino} mode="display" />

        {/* Pending Rewards */}
        {hasPendingRewards && dino.pendingRewards && (
          <div className="mt-4 p-6 rounded-2xl border border-yellow-500/40 space-y-3 bg-yellow-500/5 backdrop-blur-md">
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
              <span>Ödüllerini Harca →</span>
            </button>
          </div>
        )}

        {/* Abilities */}
        {dino.abilityIds.length > 0 && (
          <div className="mt-4 p-5 rounded-2xl border-2 border-amber-900/40 space-y-4" style={{ background: 'linear-gradient(180deg, rgba(232,220,192,0.97) 0%, rgba(214,196,158,0.97) 100%)' }}>
            <h2 className="text-lg font-black text-amber-950">⚡ Yetenek Detayları</h2>
            <div className="space-y-3">
              {dino.abilityIds.map((abilityId, idx) => {
                if (!abilityId) return null
                const ability = abilityDefinitionService.getAbility(abilityId)
                if (!ability) return null

                return (
                  <div key={idx} className="bg-amber-900/8 border border-amber-900/25 rounded-lg p-3 space-y-2">
                    <div className="flex items-start gap-3">
                      <AbilityIcon iconId={ability.icon} size="md" />
                      <div className="flex-1">
                        <p className="font-black text-amber-950 text-sm">{ability.name}</p>
                        <p className="text-xs text-amber-900/75">{ability.description}</p>
                      </div>
                    </div>

                    <div className="text-xs text-amber-900/80 space-y-1 ml-11">
                      <div className="flex justify-between">
                        <span>Hasar Çarpanı:</span>
                        <span className="font-black">×{ability.damageMultiplier || 1}</span>
                      </div>
                      {ability.cooldown > 0 && (
                        <div className="flex justify-between">
                          <span>Bekleme:</span>
                          <span className="font-black">{ability.cooldown} tur</span>
                        </div>
                      )}
                      {ability.effects && ability.effects.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span>Efektler:</span>
                          <div className="flex gap-1">
                            {ability.effects.map((effectId: any, idx2: number) => (
                              <SvgIcon key={idx2} id={effectId} type="effect" size="xs" fallback={getEffectEmoji(effectId)} />
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
        <div className="mt-4 p-4 flex gap-3 justify-end rounded-2xl border-2 border-amber-900/40" style={{ background: 'linear-gradient(180deg, rgba(232,220,192,0.97) 0%, rgba(214,196,158,0.97) 100%)' }}>
          {onEdit && (
            <button onClick={onEdit} className="px-5 py-2 rounded-lg font-black text-amber-50 bg-amber-700/90 border-2 border-amber-400/60 hover:bg-amber-600 transition-colors">
              ✏️ Düzenle
            </button>
          )}
          <button onClick={onClose} className="px-5 py-2 rounded-lg font-black text-amber-950 bg-amber-900/15 border-2 border-amber-900/40 hover:bg-amber-900/25 transition-colors">
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
