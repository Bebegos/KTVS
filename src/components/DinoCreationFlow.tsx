import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../lib/auth-context'
import { Dino } from '../game/types'
import { createDino, getDinos } from '../lib/supabase'
import {
  getAllClasses,
  getSpecsByClass,
  getClassAbilities,
  getSpecAbilities,
  CLASS_ABILITIES,
  SPEC_ABILITIES,
} from '../lib/abilities'
import { getClassIcon, getSpecIcon } from '../lib/icons'
import { calculateStartingStats, getStatDistributionBreakdown } from '../lib/statDistribution'
import SvgIcon from './SvgIcon'
import MedallionIcon from './MedallionIcon'
import StatDisplay from './StatDisplay'
import HsCard, { HsCardGrid } from './HsCard'

interface DinoCreationFlowProps {
  onBack: () => void
  onRefresh: (dinos: Dino[]) => void
}

type Step = 'class' | 'classAbilities' | 'spec' | 'specAbility' | 'stats'

const INITIAL_STATS = {
  name: '',
  maxHp: 30,
  atk: 5,
  def: 5,
  spd: 5,
}

export default function DinoCreationFlow({ onBack, onRefresh }: DinoCreationFlowProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<Step>('class')
  const [loading, setLoading] = useState(false)

  // Selection state
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [selectedClassAbilities, setSelectedClassAbilities] = useState<string[]>([])
  const [selectedSpec, setSelectedSpec] = useState<string | null>(null)
  const [selectedSpecAbility, setSelectedSpecAbility] = useState<string | null>(null)

  // Stats state
  const [stats, setStats] = useState(INITIAL_STATS)

  const classes = getAllClasses()
  const specs = selectedClass ? getSpecsByClass(selectedClass) : []
  const classAbilities = selectedClass ? getClassAbilities(selectedClass)?.abilities || [] : []
  const specAbilities = selectedSpec ? getSpecAbilities(selectedSpec)?.abilities || [] : []

  function handleSelectClass(classId: string) {
    setSelectedClass(classId)
    setSelectedClassAbilities([])
    setSelectedSpec(null)
    setSelectedSpecAbility(null)
    setStep('classAbilities')
  }

  function handleSelectClassAbility(abilityId: string) {
    if (selectedClassAbilities.includes(abilityId)) {
      setSelectedClassAbilities(selectedClassAbilities.filter(id => id !== abilityId))
    } else if (selectedClassAbilities.length < 2) {
      setSelectedClassAbilities([...selectedClassAbilities, abilityId])
    }
  }

  function handleProceedToSpec() {
    if (selectedClassAbilities.length === 2) {
      setStep('spec')
    }
  }

  function handleSelectSpec(specId: string) {
    setSelectedSpec(specId)
    setSelectedSpecAbility(null)
    setStep('specAbility')
  }

  function handleSelectSpecAbility(abilityId: string) {
    setSelectedSpecAbility(abilityId)
  }

  function handleProceedToStats() {
    if (selectedSpecAbility) {
      setStep('stats')
    }
  }

  async function handleCreateDino() {
    if (!stats.name.trim() || !selectedClass || !selectedSpec || selectedClassAbilities.length !== 2 || !selectedSpecAbility) {
      alert('Tüm alanları doldurunuz!')
      return
    }

    setLoading(true)
    try {
      // Calculate stats based on class and spec
      const calculatedStats = calculateStartingStats(selectedClass, selectedSpec)

      // Collect selected ability IDs (2 class + 1 spec)
      const abilityIds = [...selectedClassAbilities, selectedSpecAbility]

      await createDino({
        name: stats.name,
        sta: calculatedStats.maxHp, // Use the calculated HP as stamina base
        atk: calculatedStats.atk,
        def: calculatedStats.def,
        spd: calculatedStats.spd,
        stamina_to_hp_multiplier: calculatedStats.hpPerLevelStat, // Changed field name
        level: 1,
        xp: 0,
        ability_ids: abilityIds,
        owner_id: user?.id,
        class: selectedClass,
        spec: selectedSpec,
      })

      const updated = await getDinos(user?.id)
      onRefresh(updated as Dino[])
      onBack()
    } catch (err) {
      console.error('Kayıt hatası:', err)
      alert('Dinozor kaydedilemedi!')
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-96 h-96 bg-neon-purple opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-neon-cyan opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="hs-btn"
          >
            ← Geri
          </button>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink">
            ✨ Yeni Dinozor
          </h1>
          <div className="w-24" /> {/* Spacer */}
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 mb-6 justify-center">
          {['class', 'classAbilities', 'spec', 'specAbility', 'stats'].map((s, idx) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition ${
                step === s
                  ? 'bg-neon-cyan'
                  : ['class', 'classAbilities', 'spec', 'specAbility', 'stats'].indexOf(step) > idx
                  ? 'bg-neon-purple'
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Class Selection */}
          {step === 'class' && (
            <motion.div
              key="class"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h2 className="text-2xl font-bold text-neon-cyan mb-6 text-center">
                🦖 Dinozor Sınıfını Seç
              </h2>

              <HsCardGrid className="max-w-4xl mx-auto">
                {classes.map(classAbs => {
                  return (
                    <HsCard
                      key={classAbs.id}
                      onClick={() => handleSelectClass(classAbs.id)}
                      selected={selectedClass === classAbs.id}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <MedallionIcon id={classAbs.id} type="class" size="xl" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-black text-amber-900 mb-1">{classAbs.emoji} {classAbs.name}</h3>
                          <p className="text-sm text-amber-800">{classAbs.description}</p>
                        </div>
                      </div>
                    </HsCard>
                  )
                })}
              </HsCardGrid>
            </motion.div>
          )}

          {/* Step 2: Class Abilities Selection */}
          {step === 'classAbilities' && selectedClass && (
            <motion.div
              key="classAbilities"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-2xl font-bold text-neon-cyan mb-6 text-center">
                2 Sınıf Yeteneği Seç
              </h2>

              <div className="grid grid-cols-1 gap-3 mb-6">
                {classAbilities.map(ability => (
                  <motion.button
                    key={ability.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectClassAbility(ability.id)}
                    className={`p-4 rounded-lg transition ${
                      selectedClassAbilities.includes(ability.id)
                        ? 'bg-slate-800/80 border-2 border-neon-cyan shadow-neon-cyan'
                        : 'bg-slate-800/60 border border-neon-cyan/40 hover:border-neon-cyan'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <SvgIcon id={ability.id} type="ability" size="lg" fallback={ability.emoji} />
                      <div className="flex-1 text-left">
                        <h4 className="font-black text-neon-cyan mb-1">{ability.name}</h4>
                        <p className="text-sm text-neon-cyan/70 mb-1">{ability.description}</p>
                        <p className="text-xs text-neon-cyan/50">
                          Cooldown: {ability.cooldown} tur | Hasar: {Math.round(ability.damageMultiplier * 100)}%
                        </p>
                      </div>
                      {selectedClassAbilities.includes(ability.id) && (
                        <p className="text-2xl">✓</p>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              <button
                onClick={handleProceedToSpec}
                disabled={selectedClassAbilities.length !== 2}
                className="hs-btn hs-btn-block"
              >
                Devam Et →
              </button>
            </motion.div>
          )}

          {/* Step 3: Spec Selection */}
          {step === 'spec' && selectedClass && (
            <motion.div
              key="spec"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
            >
              <h2 className="col-span-full text-2xl font-bold text-neon-cyan mb-2 text-center">
                Özelleştirme Seç
              </h2>

              {specs.map(spec => {
                return (
                  <motion.button
                    key={spec.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectSpec(spec.id)}
                    className="bg-slate-800/60 border border-neon-purple/40 rounded-xl p-6 text-center transition hover:border-neon-purple hover:shadow-neon-purple flex flex-col items-center"
                  >
                    <MedallionIcon id={spec.id} type="spec" size="xl" className="mb-3" />
                    <h3 className="text-xl font-black text-neon-purple mb-1">{spec.name}</h3>
                    <p className="text-sm text-neon-purple/70">{spec.description}</p>
                  </motion.button>
                )
              })}
            </motion.div>
          )}

          {/* Step 4: Spec Ability Selection */}
          {step === 'specAbility' && selectedSpec && (
            <motion.div
              key="specAbility"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-2xl font-bold text-neon-purple mb-6 text-center">
                1 Özel Yetenek Seç
              </h2>

              <div className="grid grid-cols-1 gap-3 mb-6">
                {specAbilities.map(ability => (
                  <motion.button
                    key={ability.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectSpecAbility(ability.id)}
                    className={`p-4 rounded-lg transition ${
                      selectedSpecAbility === ability.id
                        ? 'bg-slate-800/80 border-2 border-neon-purple shadow-neon-purple'
                        : 'bg-slate-800/60 border border-neon-purple/40 hover:border-neon-purple'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <SvgIcon id={ability.id} type="ability" size="lg" fallback={ability.emoji} />
                      <div className="flex-1 text-left">
                        <h4 className="font-black text-neon-purple mb-1">{ability.name}</h4>
                        <p className="text-sm text-neon-purple/70 mb-1">{ability.description}</p>
                        <p className="text-xs text-neon-purple/50">
                          {ability.isPassive ? 'Pasif Yetenek' : `Cooldown: ${ability.cooldown} tur`}
                        </p>
                      </div>
                      {selectedSpecAbility === ability.id && (
                        <p className="text-2xl">✓</p>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              <button
                onClick={handleProceedToStats}
                disabled={!selectedSpecAbility}
                className="hs-btn hs-btn-purple hs-btn-block"
              >
                Devam Et →
              </button>
            </motion.div>
          )}

          {/* Step 5: Stats & Name */}
          {step === 'stats' && selectedClass && selectedSpec && (
            <motion.div
              key="stats"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-2xl font-bold text-neon-pink mb-6 text-center">
                Dinozor Adı ve İstatistikleri
              </h2>

              <div className="bg-slate-800/60 border border-neon-pink/40 rounded-lg p-6 space-y-4">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-bold text-neon-pink mb-2">🦖 Dinozor Adı *</label>
                  <input
                    type="text"
                    value={stats.name}
                    onChange={e => setStats({ ...stats, name: e.target.value })}
                    placeholder="Dinozor adını gir..."
                    className="w-full px-4 py-2 bg-slate-700 border border-neon-pink/50 rounded-lg text-neon-pink placeholder-neon-pink/50 focus:outline-none focus:border-neon-pink"
                  />
                </div>

                {/* Auto-Calculated Stats Breakdown */}
                {(() => {
                  const breakdown = getStatDistributionBreakdown(selectedClass, selectedSpec)
                  const finalStats = breakdown.final

                  return (
                    <>
                      {/* Stat Distribution Explanation */}
                      <div className="mt-6 space-y-3">
                        <div className="p-3 bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/30 rounded-lg">
                          <p className="text-xs font-bold text-blue-400 mb-2">📊 SINIFINDAN GELEN STATLAR:</p>
                          <div className="space-y-1 text-xs text-white/80">
                            {breakdown.classTheme && (
                              <>
                                <p>Başlangıç Can: <span className="font-bold text-red-400">{breakdown.classTheme.baseHp}</span></p>
                                <p>Saldırı: +{breakdown.classTheme.classDistribution.atk}</p>
                                <p>Savunma: +{breakdown.classTheme.classDistribution.def}</p>
                                <p>Hız: +{breakdown.classTheme.classDistribution.spd}</p>
                                <p>Level Bonus: <span className="font-bold text-red-400">{breakdown.classTheme.hpPerLevelStat}x HP</span>/stat</p>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="p-3 bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/30 rounded-lg">
                          <p className="text-xs font-bold text-purple-400 mb-2">⭐ ÖZELLESTIRMESINDEN GELEN BONUSLAR:</p>
                          <div className="space-y-1 text-xs text-white/80">
                            {breakdown.specTheme && (
                              <>
                                {breakdown.specTheme.hpBonus && (
                                  <p>Can Bonusu: <span className="font-bold text-red-400">+{breakdown.specTheme.hpBonus}</span></p>
                                )}
                                <p>Saldırı: +{breakdown.specTheme.specDistribution.atk}</p>
                                <p>Savunma: +{breakdown.specTheme.specDistribution.def}</p>
                                <p>Hız: +{breakdown.specTheme.specDistribution.spd}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Final Stats Display - Premium StatDisplay Components */}
                      <div className="mt-6 space-y-3">
                        {(() => {
                          const tempDino: Dino = {
                            id: 'temp',
                            name: stats.name,
                            maxHp: finalStats.maxHp,
                            atk: finalStats.atk,
                            def: finalStats.def,
                            spd: finalStats.spd,
                            sta: finalStats.maxHp,
                            level: 1,
                            xp: 0,
                            abilityIds: [],
                            familyCode: '',
                            class: selectedClass,
                            spec: selectedSpec,
                            staminaToHpMultiplier: finalStats.hpPerLevelStat,
                          }
                          return (
                            <div className="grid grid-cols-2 gap-3">
                              <StatDisplay
                                stat="sta"
                                dino={tempDino}
                                value={finalStats.maxHp}
                                size="md"
                                showDetailButton={true}
                              />
                              <StatDisplay
                                stat="atk"
                                dino={tempDino}
                                value={finalStats.atk}
                                size="md"
                                showDetailButton={true}
                              />
                              <StatDisplay
                                stat="def"
                                dino={tempDino}
                                value={finalStats.def}
                                size="md"
                                showDetailButton={true}
                              />
                              <StatDisplay
                                stat="spd"
                                dino={tempDino}
                                value={finalStats.spd}
                                size="md"
                                showDetailButton={true}
                              />
                            </div>
                          )
                        })()}
                      </div>
                    </>
                  )
                })()}

                {/* Summary */}
                <div className="mt-6 p-4 bg-neon-pink/10 border border-neon-pink/30 rounded-lg">
                  <p className="text-sm font-bold text-neon-pink mb-3">📋 ÖZETi:</p>
                  <div className="space-y-1 text-sm text-neon-pink/80">
                    <p>Sınıf: <span className="font-bold">{CLASS_ABILITIES[selectedClass].name}</span></p>
                    <p>Özelleştirme: <span className="font-bold">{SPEC_ABILITIES[selectedSpec].name}</span></p>
                    <p>Yetenekler: <span className="font-bold">{selectedClassAbilities.length} Sınıf + 1 Özel = 3 Toplam</span></p>
                  </div>
                </div>

                {/* Create Button */}
                <button
                  onClick={handleCreateDino}
                  disabled={loading || !stats.name.trim()}
                  className="hs-button-green w-full px-6 py-4 text-lg mt-4"
                >
                  {loading ? '⏳ Dinozor Oluşturuluyor...' : '🎉 Dinozor Oluştur!'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
