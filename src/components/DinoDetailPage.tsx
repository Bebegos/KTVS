import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dino } from '../game/types'
import { abilityDefinitionService } from '../lib/services'
import { getClassIcon, getSpecIcon } from '../lib/icons'
import AbilityIcon from './AbilityIcon'
import MedallionIcon from './MedallionIcon'
import SvgIcon from './SvgIcon'
import { getEffectEmoji } from '../lib/effect-translations'
import RewardSpendingModal from './RewardSpendingModal'

interface DinoDetailPageProps {
  dino: Dino
  onBack: () => void
  onRefresh: (dinos: Dino[]) => void
}

export default function DinoDetailPage({ dino, onBack, onRefresh }: DinoDetailPageProps) {
  const [rewardModalOpen, setRewardModalOpen] = useState(false)

  const hasPendingRewards = dino.pendingRewards && (dino.pendingRewards.unspentStatPoints > 0 || dino.pendingRewards.pendingAbilityIds.length > 0)

  function handleRewardSpent(updatedDino: Dino) {
    onRefresh([updatedDino])
    setRewardModalOpen(false)
  }

  return (
    <div className="flex-1 flex flex-col p-4 gap-6 overflow-y-auto relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-neon-cyan opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-neon-purple opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-800/60 border border-neon-cyan/40 rounded-lg font-bold text-neon-cyan hover:border-neon-cyan hover:shadow-neon-cyan transition"
          >
            ← Geri
          </button>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple flex-1">
            🦖 {dino.name}
          </h1>
          <div className="text-center">
            <p className="text-neon-cyan/70 text-sm">⭐ Seviye {dino.level}</p>
            <p className="text-gold-light font-bold">💫 {dino.xp}/100 XP</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Stats & Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Class & Spec */}
            {(dino.class || dino.spec) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-slate-800/60 to-slate-800/40 border border-neon-cyan/30 rounded-xl p-4 space-y-3"
              >
                <p className="text-xs font-bold text-neon-cyan/70 uppercase">Sınıf & Özelleştirme</p>
                <div className="flex gap-3">
                  {dino.class && (
                    <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-2 flex-1">
                      <MedallionIcon id={dino.class} type="class" size="sm" />
                      <span className="text-xs font-bold text-blue-300">{getClassIcon(dino.class)?.label}</span>
                    </div>
                  )}
                  {dino.spec && (
                    <div className="flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-2 flex-1">
                      <MedallionIcon id={dino.spec} type="spec" size="sm" />
                      <span className="text-xs font-bold text-purple-300">{getSpecIcon(dino.spec)?.label}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-slate-800/60 to-slate-800/40 border border-neon-cyan/30 rounded-xl p-4 space-y-3"
            >
              <p className="text-xs font-bold text-neon-cyan/70 uppercase">İstatistikler</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <span className="text-xs font-bold text-red-400">❤️ CAN</span>
                  <span className="text-xl font-black text-red-300">{dino.maxHp}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <span className="text-xs font-bold text-orange-400">⚔️ SALDIRI</span>
                  <span className="text-xl font-black text-orange-300">{dino.atk}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <span className="text-xs font-bold text-blue-400">🛡️ SAVUNMA</span>
                  <span className="text-xl font-black text-blue-300">{dino.def}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <span className="text-xs font-bold text-yellow-400">⚡ HIZ</span>
                  <span className="text-xl font-black text-yellow-300">{dino.spd}</span>
                </div>
              </div>
            </motion.div>

            {/* XP Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-slate-800/60 to-slate-800/40 border border-gold-dark/30 rounded-xl p-4 space-y-3"
            >
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-gold-light">✨ DENEYIM</p>
                <p className="text-xs font-bold text-gold-light">{dino.xp}/100</p>
              </div>
              <div className="w-full bg-gradient-to-r from-slate-900 to-slate-800 rounded-full h-4 overflow-hidden border border-gold-dark/40">
                <div
                  className="bg-gradient-to-r from-gold-light via-gold-mid to-gold-dark h-full transition-all duration-500"
                  style={{ width: `${(dino.xp / 100) * 100}%` }}
                />
              </div>
            </motion.div>
          </div>

          {/* Right Column: Abilities & Rewards */}
          <div className="lg:col-span-2 space-y-4">
            {/* Pending Rewards */}
            {hasPendingRewards && dino.pendingRewards && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-yellow-500/10 border-2 border-yellow-500/40 rounded-xl p-5 space-y-4 shadow-lg shadow-yellow-500/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl animate-pulse">⚡</span>
                  <div>
                    <h2 className="text-xl font-black text-yellow-300">SEVİYE ATLADI!</h2>
                    <p className="text-xs text-yellow-300/70">Ödüllerini harcamaya hazır mısın?</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {dino.pendingRewards.unspentStatPoints > 0 && (
                    <div className="bg-yellow-600/20 border border-yellow-500/50 rounded-lg p-4">
                      <p className="text-sm font-black text-yellow-200 mb-2">
                        📈 {dino.pendingRewards.unspentStatPoints} STAT PUANI
                      </p>
                      <p className="text-xs text-yellow-300/80">
                        Saldırı, Savunma ve Hız arasında dağıt
                      </p>
                    </div>
                  )}

                  {dino.pendingRewards.pendingAbilityIds.length > 0 && (
                    <div className="bg-purple-600/20 border border-purple-500/50 rounded-lg p-4">
                      <p className="text-sm font-black text-purple-200 mb-3">
                        ✨ {dino.pendingRewards.pendingAbilityIds.length} YETENEĞİ SEÇ
                      </p>
                      <div className="space-y-2">
                        {dino.pendingRewards.pendingAbilityIds.map(abilityId => {
                          const ability = abilityDefinitionService.getAbility(abilityId)
                          return ability ? (
                            <div key={abilityId} className="flex items-center gap-2 text-xs text-purple-300 bg-purple-900/30 px-3 py-2 rounded">
                              <span>•</span>
                              <span className="font-bold">{ability.name}</span>
                            </div>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setRewardModalOpen(true)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-yellow-100 font-black rounded-lg transition active:scale-95 shadow-lg shadow-yellow-500/30"
                >
                  Ödüllerini Harca →
                </button>
              </motion.div>
            )}

            {/* Abilities */}
            {dino.abilityIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-slate-800/60 to-slate-800/40 border border-neon-purple/30 rounded-xl p-5 space-y-4"
              >
                <h2 className="text-lg font-black text-neon-purple">⚡ YETENEKLER ({dino.abilityIds.filter(id => id).length})</h2>

                <div className="space-y-3">
                  {dino.abilityIds.map((abilityId, idx) => {
                    if (!abilityId) return null
                    const ability = abilityDefinitionService.getAbility(abilityId)
                    if (!ability) return null

                    return (
                      <div
                        key={idx}
                        className="bg-gradient-to-r from-neon-purple/10 to-neon-purple/5 border border-neon-purple/30 rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-start gap-3">
                          <AbilityIcon iconId={ability.icon} size="md" />
                          <div className="flex-1">
                            <p className="font-black text-neon-purple text-sm">{ability.name}</p>
                            <p className="text-xs text-neon-purple/70">{ability.description}</p>
                          </div>
                        </div>

                        {/* Ability Details */}
                        <div className="text-xs text-neon-purple/70 space-y-1 ml-11">
                          <div className="flex justify-between">
                            <span>Hasar Çarpanı:</span>
                            <span className="font-bold">×{ability.damageMultiplier || 1}</span>
                          </div>
                          {ability.cooldown && ability.cooldown > 0 && (
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
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Reward Spending Modal */}
      {rewardModalOpen && dino.pendingRewards && (
        <RewardSpendingModal
          dino={dino}
          isOpen={rewardModalOpen}
          onClose={() => setRewardModalOpen(false)}
          onConfirm={handleRewardSpent}
        />
      )}
    </div>
  )
}
