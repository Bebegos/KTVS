import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino } from '../game/types'
import { abilityDefinitionService, discoveryService } from '../lib/services'
import AbilityIcon from './AbilityIcon'
import EffectIcon from './EffectIcon'
import AbilityTypeIcon from './AbilityTypeIcon'
import AbilitySlotDisplay from './AbilitySlotDisplay'
import PremiumButton from './PremiumButton'
import PremiumCard from './PremiumCard'
import MedallionIcon from './MedallionIcon'
import StatCardPremium from './StatCardPremium'
import { getClassIcon, getSpecIcon } from '../lib/icons'
import { getEffectNameTR } from '../lib/effect-translations'
import { hpBarAssets, uiAssets } from '../lib/gameAssets'
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

  const filledAbilities = dino.abilityIds?.filter((id) => id).length || 0

  return (
    <div className="flex-1 flex flex-col p-4 gap-6 overflow-y-auto relative bg-gradient-to-br from-stone-950 via-amber-950/20 to-stone-950">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-amber-500 opacity-5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-700 opacity-5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Back Button (premium PNG menu button) */}
        <PremiumButton onClick={onBack} className="w-32" contentClassName="text-sm">
          ← Geri
        </PremiumButton>

        {/* Hero Header Card */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md">
          <PremiumCard variant="frame">
            <div className="text-center space-y-1 py-1">
              <h1 className="text-2xl sm:text-3xl font-black text-amber-950 drop-shadow-sm">
                {dino.name}
              </h1>
              <p className="text-xs font-black uppercase tracking-widest text-amber-800">
                Level {dino.level} • {dino.element || 'Normal'}
              </p>
            </div>
          </PremiumCard>
        </motion.div>

        {/* Level-up reward call to action */}
        {hasPendingRewards && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <PremiumCard variant="panel">
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={uiAssets.levelUp}
                    alt=""
                    className="w-10 h-10 object-contain animate-pulse"
                    draggable={false}
                  />
                  <h3 className="text-lg font-black text-amber-900">SEVİYE ÖDÜLLERİ HAZIR!</h3>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {statPoints > 0 && (
                    <div className="flex items-center gap-2">
                      <img src={uiAssets.statPoints} alt="" className="w-8 h-8 object-contain" draggable={false} />
                      <PremiumButton
                        onClick={() => setShowBonusAllocator(true)}
                        disabled={statPoints <= 0}
                        className="w-40"
                        contentClassName="text-xs"
                      >
                        Stat Dağıt ({statPoints})
                      </PremiumButton>
                    </div>
                  )}

                  {discoveryCount > 0 && (
                    <div className="flex items-center gap-2">
                      <img src={uiAssets.abilityChest} alt="" className="w-8 h-8 object-contain" draggable={false} />
                      <PremiumButton
                        onClick={() => setShowAbilityDiscovery(true)}
                        disabled={discoveryCount <= 0}
                        className="w-40"
                        contentClassName="text-xs"
                      >
                        Yetenek Aç ({discoveryCount})
                      </PremiumButton>
                    </div>
                  )}
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        )}

        {/* Class & Spec on same row as header */}
        {(dino.class || dino.spec) && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md">
            <PremiumCard variant="frame">
              <div className="text-center space-y-3 py-1">
                <p className="text-xs font-black text-amber-900/80 uppercase tracking-wide">
                  Sınıf & Özelleştirme
                </p>
                <div className="flex gap-2 px-2">
                  {dino.class && (
                    <div className="flex items-center justify-center gap-2 bg-amber-900/10 border border-amber-900/30 rounded-lg px-3 py-2 flex-1">
                      <MedallionIcon id={dino.class} type="class" size="md" />
                      <span className="text-xs font-black text-amber-950">
                        {getClassIcon(dino.class)?.label}
                      </span>
                    </div>
                  )}
                  {dino.spec && (
                    <div className="flex items-center justify-center gap-2 bg-amber-900/10 border border-amber-900/30 rounded-lg px-3 py-2 flex-1">
                      <MedallionIcon id={dino.spec} type="spec" size="md" />
                      <span className="text-xs font-black text-amber-950">
                        {getSpecIcon(dino.spec)?.label}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Stats & Info */}
          <div className="lg:col-span-1 space-y-6">

            {/* Stats — each stat its own premium Hearthstone card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <PremiumCard variant="frame">
                <div className="space-y-4 py-3">
                  <p className="text-xs font-black text-amber-900 uppercase tracking-wide">
                    İstatistikler
                  </p>
                  <div className="space-y-3">
                    <StatCardPremium stat="sta" dino={dino} value={dino.sta || 0} />
                    <StatCardPremium stat="atk" dino={dino} value={dino.atk} />
                    <StatCardPremium stat="def" dino={dino} value={dino.def} />
                    <StatCardPremium stat="spd" dino={dino} value={dino.spd} />
                  </div>
                </div>
              </PremiumCard>
            </motion.div>

            {/* XP Bar (reuses the premium HP-bar frame art, gold fill) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <PremiumCard variant="panel">
                <div className="p-4 space-y-2">
                  {(() => {
                    const maxXpForLevel = Math.floor(100 * Math.pow(dino.level, 1.5))
                    const xpPercent = Math.min(100, (dino.xp / maxXpForLevel) * 100)
                    return (
                      <>
                        <div className="flex justify-between items-center">
                          <p className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                            <img src={uiAssets.experience} alt="" className="w-5 h-5 object-contain" draggable={false} />
                            DENEYİM
                          </p>
                          <p className="text-xs font-black text-amber-900">
                            {dino.xp}/{maxXpForLevel}
                          </p>
                        </div>
                        {/* WoW-style segmented bar: 10 healthy-fill pieces (each = 10%) */}
                        <div className="relative w-full h-6 bg-amber-950/40 rounded-sm border border-amber-900/30">
                          <div className="absolute inset-y-1 left-1 right-1 flex gap-1">
                            {Array.from({ length: 10 }).map((_, i) => {
                              const segFill = Math.max(0, Math.min(1, xpPercent / 10 - i))
                              return (
                                <div
                                  key={i}
                                  className="relative flex-1 overflow-hidden rounded-sm bg-amber-950/30 border border-amber-900/40"
                                >
                                  <div
                                    className="h-full transition-all duration-500"
                                    style={{
                                      width: `${segFill * 100}%`,
                                      backgroundImage: `url('${hpBarAssets.healthy}')`,
                                      backgroundSize: '1000% 100%',
                                      backgroundPosition: `${i * 11.1}% 0`,
                                      backgroundRepeat: 'no-repeat',
                                    }}
                                  />
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </PremiumCard>
            </motion.div>
          </div>

          {/* Right Column: Abilities & Rewards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stat bonus allocator (inline when active) */}
            {hasPendingRewards && dino.pendingRewards && showBonusAllocator &&
              dino.pendingRewards.unspentStatPoints > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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
                </motion.div>
              )}

            {/* Abilities Board */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <PremiumCard variant="frame">
                <div className="space-y-4">
                  <h2 className="text-lg font-black text-amber-950 flex items-center gap-2">
                    <AbilityTypeIcon kind="ultimate" size="sm" />
                    YETENEKLER ({filledAbilities}/6)
                  </h2>

                  {/* Slot Grid — compact (≈half size); content scales via container queries */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                    {[0, 1, 2, 3, 4].map((slotIdx) => {
                      const abilityId = dino.abilityIds?.[slotIdx]
                      const ability = abilityId ? abilityDefinitionService.getAbility(abilityId) : null
                      return (
                        <AbilitySlotDisplay
                          key={slotIdx}
                          ability={ability}
                          slotIndex={slotIdx}
                          atk={dino.atk}
                        />
                      )
                    })}
                  </div>

                  {/* Ultimate slot — centered, same compact cell size */}
                  <div className="flex justify-center pt-1">
                    <div className="w-1/3 sm:w-1/5">
                      {(() => {
                        const abilityId = dino.abilityIds?.[5]
                        const ability = abilityId ? abilityDefinitionService.getAbility(abilityId) : null
                        return (
                          <AbilitySlotDisplay
                            ability={ability}
                            slotIndex={5}
                            atk={dino.atk}
                            isUltimate
                          />
                        )
                      })()}
                    </div>
                  </div>

                  {/* Detailed Ability List */}
                  {dino.abilityIds && dino.abilityIds.some((id) => id) && (
                    <div className="mt-4 pt-4 border-t border-amber-900/20 space-y-3">
                      <p className="text-xs font-black text-amber-900/80 uppercase tracking-wide">
                        Yetenek Detayları
                      </p>
                      {dino.abilityIds.map((abilityId, idx) => {
                        if (!abilityId) return null
                        const ability = abilityDefinitionService.getAbility(abilityId)
                        if (!ability) return null

                        const baseValue = Math.floor((ability.damageMultiplier || 1) * dino.atk)
                        const isPower = ability.kind === 'buff' || ability.kind === 'debuff'
                        const displayValue = isPower ? ability.damageMultiplier || 1 : baseValue
                        const displayLabel =
                          ability.kind === 'heal'
                            ? 'İyileştirme'
                            : ability.kind === 'buff'
                            ? 'Güçlendirme'
                            : ability.kind === 'debuff'
                            ? 'Zayıflatma'
                            : 'Hasar'

                        return (
                          <div
                            key={idx}
                            className="bg-amber-900/8 border border-amber-900/25 rounded-lg p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <AbilityIcon iconId={ability.icon} size="md" />
                                <div className="min-w-0">
                                  <p className="font-black text-amber-950 text-base truncate">
                                    {ability.name}
                                  </p>
                                  <p className="text-sm text-amber-900/75 leading-snug line-clamp-2">
                                    {ability.description}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-col items-center bg-amber-900/15 rounded-lg px-3 py-2 flex-shrink-0">
                                <AbilityTypeIcon kind={ability.kind} size="md" />
                                <p className="font-black text-amber-950 text-lg leading-none mt-1">
                                  {displayValue}
                                </p>
                                <p className="text-[10px] text-amber-800 font-bold">{displayLabel}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 items-center">
                              {ability.effects && ability.effects.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {ability.effects.map((effect) => (
                                    <div
                                      key={effect}
                                      className="flex items-center gap-1.5 bg-amber-900/12 border border-amber-900/30 rounded px-2.5 py-1"
                                    >
                                      <EffectIcon effect={effect} size="sm" />
                                      <span className="text-xs font-bold text-amber-900">
                                        {getEffectNameTR(effect)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {ability.cooldown > 0 && (
                                <span className="text-xs font-bold text-amber-800/80">
                                  Bekleme: {ability.cooldown}t
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </PremiumCard>
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
