import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino } from '../game/types'
import { abilityDefinitionService, discoveryService } from '../lib/services'
import HearthstoneCard from './HearthstoneCard'
import AbilityIcon from './AbilityIcon'
import SvgIcon from './SvgIcon'
import MedallionIcon from './MedallionIcon'
import StatDisplay from './StatDisplay'
import { getClassIcon, getSpecIcon } from '../lib/icons'
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

  const statPoints = dino.pendingRewards?.unspentStatPoints || 0
  const discoveryCount = discoveryService.getDiscoveries(dino).length
  const hasPendingRewards = statPoints > 0 || discoveryCount > 0

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

        {/* Minimal Header Card with just Name & Level */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 max-w-md"
        >
          <HearthstoneCard
            title={dino.name}
            subtitle={`Level ${dino.level} • ${dino.element || 'Normal'}`}
            mode="display"
            className="minimal-dino-header"
          >
            <div className="text-center space-y-2">
              <div className="text-4xl">✨</div>
              <p className="text-xs text-gold-light font-bold uppercase tracking-wider">Dinozorlaştırma Ekranı</p>
            </div>
          </HearthstoneCard>
        </motion.div>

        {/* Level-up reward call to action */}
        {hasPendingRewards && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-reward-banner rounded-2xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/15 via-yellow-600/10 to-amber-500/15 p-4 space-y-3 mb-6"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-pulse">⚡</span>
              <h3 className="text-lg font-black text-amber-200">SEVİYE ÖDÜLLERİ HAZIR!</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Stat distribution button */}
              <button
                onClick={() => setShowBonusAllocator(true)}
                disabled={statPoints <= 0}
                className="hs-btn hs-btn-green disabled:opacity-40"
              >
                <span>📊 Stat Dağıt{statPoints > 0 ? ` (${statPoints})` : ''}</span>
              </button>

              {/* Ability discovery button (premium amber glow) */}
              <button
                onClick={() => setShowAbilityDiscovery(true)}
                disabled={discoveryCount <= 0}
                className="hs-btn hs-btn-premium disabled:opacity-40 disabled:animate-none"
              >
                <span>✦ Yetenek Aç{discoveryCount > 0 ? ` (${discoveryCount})` : ''} ✦</span>
              </button>
            </div>
          </motion.div>
        )}

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

            {/* Abilities with Empty Slots Visualization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-slate-800/60 to-slate-800/40 border border-neon-purple/30 rounded-xl p-5 space-y-4"
            >
              <h2 className="text-lg font-black text-neon-purple">⚡ YETENEKLER ({dino.abilityIds?.filter(id => id).length || 0}/6)</h2>

              {/* Slot Grid (6 total slots) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Slots 0-4: Class/Spec abilities */}
                {[0, 1, 2, 3, 4].map((slotIdx) => {
                  const abilityId = dino.abilityIds?.[slotIdx]
                  const ability = abilityId ? abilityDefinitionService.getAbility(abilityId) : null

                  if (ability) {
                    return (
                      <div
                        key={slotIdx}
                        className="bg-gradient-to-b from-neon-purple/30 to-neon-purple/10 border-2 border-neon-purple/50 rounded-lg p-3 space-y-2"
                      >
                        <div className="flex justify-center">
                          <AbilityIcon iconId={ability.icon} size="md" />
                        </div>
                        <p className="text-xs font-black text-neon-purple text-center line-clamp-2">{ability.name}</p>
                        <p className="text-xs text-neon-purple/70 text-center">×{ability.damageMultiplier || 1}</p>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={slotIdx}
                      className="bg-gradient-to-b from-slate-700/30 to-slate-800/30 border-2 border-dashed border-neon-purple/20 rounded-lg p-3 flex items-center justify-center min-h-24"
                    >
                      <div className="text-center">
                        <p className="text-2xl opacity-30">⚡</p>
                        <p className="text-xs text-neon-purple/40 font-bold">Slot {slotIdx + 1}</p>
                      </div>
                    </div>
                  )
                })}

                {/* Slot 5: Ultimate ability */}
                {(() => {
                  const abilityId = dino.abilityIds?.[5]
                  const ability = abilityId ? abilityDefinitionService.getAbility(abilityId) : null

                  if (ability) {
                    return (
                      <div
                        key={5}
                        className="col-span-2 sm:col-span-3 bg-gradient-to-b from-orange-500/30 to-red-600/20 border-2 border-orange-400/60 rounded-lg p-3 space-y-2"
                      >
                        <div className="flex justify-center">
                          <AbilityIcon iconId={ability.icon} size="lg" />
                        </div>
                        <p className="text-sm font-black text-orange-300 text-center">👑 {ability.name}</p>
                        <p className="text-xs text-orange-300/70 text-center">×{ability.damageMultiplier || 1}</p>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={5}
                      className="col-span-2 sm:col-span-3 bg-gradient-to-b from-orange-500/10 to-red-600/10 border-2 border-dashed border-orange-400/20 rounded-lg p-4 flex items-center justify-center min-h-20"
                    >
                      <div className="text-center">
                        <p className="text-3xl opacity-20">👑</p>
                        <p className="text-xs text-orange-400/40 font-bold">ULTIMATE SLOT</p>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Detailed Ability List */}
              {dino.abilityIds && dino.abilityIds.length > 0 && (
                <div className="mt-6 pt-4 border-t border-neon-purple/20 space-y-3">
                  <p className="text-xs font-bold text-neon-purple/70 uppercase">Yetenek Detayları</p>
                  {dino.abilityIds.map((abilityId, idx) => {
                    if (!abilityId) return null
                    const ability = abilityDefinitionService.getAbility(abilityId)
                    if (!ability) return null

                    return (
                      <div
                        key={idx}
                        className="bg-neon-purple/5 border border-neon-purple/20 rounded-lg p-3 space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-black text-neon-purple/70">Slot {idx + 1}:</p>
                          <p className="font-bold text-neon-purple text-sm">{ability.name}</p>
                        </div>
                        <p className="text-xs text-neon-purple/70">{ability.description}</p>
                        <div className="text-xs text-neon-purple/60 flex gap-3">
                          <span>×{ability.damageMultiplier || 1} DMG</span>
                          {ability.cooldown && ability.cooldown > 0 && <span>CD: {ability.cooldown}t</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
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
        {showAbilityDiscovery && (
          <AbilityDiscoveryModal
            dino={dino}
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
