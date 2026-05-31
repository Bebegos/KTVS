import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino } from '../game/types'
import { abilityDefinitionService } from '../lib/services'
import DinoCard from './DinoCard'
import AbilityIcon from './AbilityIcon'
import SvgIcon from './SvgIcon'
import { getEffectEmoji } from '../lib/effect-translations'
import RewardSpendingModal from './RewardSpendingModal'
import StatBonusAllocator from './StatBonusAllocator'
import AbilityDiscoveryModal from './AbilityDiscoveryModal'

interface DinoDetailPageProps {
  dino: Dino
  onBack: () => void
  onRefresh: (dinos: Dino[]) => void
}

export default function DinoDetailPage({ dino: initialDino, onBack, onRefresh }: DinoDetailPageProps) {
  const [dino, setDino] = useState(initialDino)
  const [rewardModalOpen, setRewardModalOpen] = useState(false)
  const [showBonusAllocator, setShowBonusAllocator] = useState(false)
  const [showAbilityDiscovery, setShowAbilityDiscovery] = useState(false)

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
        {/* Back Button */}
        <button
          onClick={onBack}
          className="hs-btn mb-4"
        >
          <span>Geri</span>
        </button>

        {/* Main Dinosaur Card */}
        <div className="mb-6 max-w-2xl">
          <DinoCard
            dino={dino}
            mode="display"
            actions={
              hasPendingRewards
                ? [
                    {
                      label: 'Ödülü Kullan',
                      onClick: () => setRewardModalOpen(true),
                      variant: 'green' as const,
                    },
                  ]
                : []
            }
          />
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
                <StatDisplay
                  stat="sta"
                  dino={dino}
                  value={dino.sta || 0}
                  size="md"
                  showBonus={false}
                  showDetailButton={true}
                />
                <StatDisplay
                  stat="atk"
                  dino={dino}
                  value={dino.atk}
                  size="md"
                  showDetailButton={true}
                />
                <StatDisplay
                  stat="def"
                  dino={dino}
                  value={dino.def}
                  size="md"
                  showDetailButton={true}
                />
                <StatDisplay
                  stat="spd"
                  dino={dino}
                  value={dino.spd}
                  size="md"
                  showDetailButton={true}
                />
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
            {/* Pending Rewards - Show Bonus Allocator or Action Buttons */}
            {hasPendingRewards && dino.pendingRewards && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {showBonusAllocator && dino.pendingRewards.unspentStatPoints > 0 ? (
                  <StatBonusAllocator
                    dino={dino}
                    bonusPoints={dino.pendingRewards.unspentStatPoints}
                    onComplete={(updatedDino) => {
                      setDino(updatedDino)
                      setShowBonusAllocator(false)
                      onRefresh([updatedDino])
                    }}
                    onCancel={() => setShowBonusAllocator(false)}
                  />
                ) : (
                  <div className="bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-yellow-500/10 border-2 border-yellow-500/40 rounded-xl p-5 space-y-4 shadow-lg shadow-yellow-500/20">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl animate-pulse">⚡</span>
                      <div>
                        <h2 className="text-xl font-black text-yellow-300">SEVİYE ATLADI!</h2>
                        <p className="text-xs text-yellow-300/70">Yeni ödüllerini keşfet</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {dino.pendingRewards.unspentStatPoints > 0 && (
                        <div className="bg-yellow-600/20 border border-yellow-500/50 rounded-lg p-4">
                          <p className="text-sm font-black text-yellow-200 mb-2">
                            📈 {dino.pendingRewards.unspentStatPoints} STAT PUANI HAZIR
                          </p>
                          <p className="text-xs text-yellow-300/80">
                            Statlarınızı güçlendir
                          </p>
                        </div>
                      )}

                      {dino.pendingRewards.pendingAbilityIds.filter(id => !id.startsWith('__')).length > 0 && (
                        <div className="bg-purple-600/20 border border-purple-500/50 rounded-lg p-4">
                          <p className="text-sm font-black text-purple-200 mb-3">
                            ✨ {dino.pendingRewards.pendingAbilityIds.filter(id => !id.startsWith('__')).length} YETENEĞİ KEŞFET
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      {dino.pendingRewards.unspentStatPoints > 0 && (
                        <button
                          onClick={() => setShowBonusAllocator(true)}
                          className="hs-btn hs-btn-green flex-1"
                        >
                          📊 Stat Ekle
                        </button>
                      )}
                      {dino.pendingRewards.pendingAbilityIds.filter(id => !id.startsWith('__')).length > 0 && (
                        <button
                          onClick={() => setShowAbilityDiscovery(true)}
                          className="hs-btn hs-btn-purple flex-1"
                        >
                          ✨ Yetenek Keşfet
                        </button>
                      )}
                    </div>
                  </div>
                )}
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

      {/* Modals */}
      <AnimatePresence>
        {rewardModalOpen && dino.pendingRewards && (
          <RewardSpendingModal
            dino={dino}
            isOpen={rewardModalOpen}
            onClose={() => setRewardModalOpen(false)}
            onConfirm={handleRewardSpent}
          />
        )}
        {showAbilityDiscovery && dino.pendingRewards && (
          <AbilityDiscoveryModal
            dino={dino}
            abilityCount={dino.pendingRewards.pendingAbilityIds.filter(id => !id.startsWith('__')).length}
            isOpen={showAbilityDiscovery}
            onClose={() => setShowAbilityDiscovery(false)}
            onComplete={(updatedDino) => {
              setDino(updatedDino)
              setShowAbilityDiscovery(false)
              onRefresh([updatedDino])
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
