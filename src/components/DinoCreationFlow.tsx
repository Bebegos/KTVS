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
import MedallionIcon from './MedallionIcon'
import AbilityIcon from './AbilityIcon'
import StatCardPremium from './StatCardPremium'
import PremiumCard from './PremiumCard'
import PremiumButton from './PremiumButton'
import { homeAssets } from '../lib/gameAssets'

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
    <div
      className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto relative"
      style={{ backgroundImage: `url('${homeAssets.background}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#2a1c0e' }}
    >
      <div className="absolute inset-0 bg-black/45 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <PremiumButton onClick={onBack} className="w-28" contentClassName="text-sm">← Geri</PremiumButton>
          <h1 className="text-2xl sm:text-3xl font-black text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Yeni Dinozor
          </h1>
          <div className="w-28" /> {/* Spacer */}
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 mb-6 justify-center">
          {['class', 'classAbilities', 'spec', 'specAbility', 'stats'].map((s, idx) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition ${
                step === s
                  ? 'bg-amber-400'
                  : ['class', 'classAbilities', 'spec', 'specAbility', 'stats'].indexOf(step) > idx
                  ? 'bg-amber-700'
                  : 'bg-stone-600'
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
              <h2 className="text-2xl font-black text-amber-200 mb-6 text-center drop-shadow">
                Dinozor Sınıfını Seç
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {classes.map(classAbs => {
                  const selected = selectedClass === classAbs.id
                  return (
                    <motion.button
                      key={classAbs.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectClass(classAbs.id)}
                      className="text-left"
                    >
                      <PremiumCard variant="frame" glow={selected ? 'gold' : undefined}>
                        <div className="flex items-center gap-4 p-2">
                          <MedallionIcon id={classAbs.id} type="class" size="xl" className="flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-black text-amber-950 mb-1">{classAbs.name}</h3>
                            <p className="text-sm text-amber-900/80">{classAbs.description}</p>
                          </div>
                        </div>
                      </PremiumCard>
                    </motion.button>
                  )
                })}
              </div>
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
              <h2 className="text-2xl font-black text-amber-200 mb-6 text-center drop-shadow">
                2 Sınıf Yeteneği Seç
              </h2>

              <div className="space-y-3 mb-6">
                {classAbilities.map(ability => {
                  const selected = selectedClassAbilities.includes(ability.id)
                  return (
                    <motion.button
                      key={ability.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelectClassAbility(ability.id)}
                      className="w-full text-left"
                    >
                      <PremiumCard variant="panel" glow={selected ? 'gold' : undefined}>
                        <div className="flex items-center gap-3 p-3">
                          <span className="flex items-center justify-center w-12 h-12 rounded-lg bg-amber-900/10 border border-amber-700/40 flex-shrink-0">
                            <AbilityIcon iconId={ability.icon} size="md" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-amber-950 mb-0.5">{ability.name}</h4>
                            <p className="text-sm text-amber-900/80 leading-snug">{ability.description}</p>
                            <p className="text-xs text-amber-800/70 mt-0.5">
                              Bekleme: {ability.cooldown} tur • Hasar: {Math.round(ability.damageMultiplier * 100)}%
                            </p>
                          </div>
                          {selected && (
                            <span className="flex-shrink-0 w-8 h-8 bg-amber-600 border-2 border-amber-300 rounded-full flex items-center justify-center text-amber-50 font-black">✓</span>
                          )}
                        </div>
                      </PremiumCard>
                    </motion.button>
                  )
                })}
              </div>

              <div className="flex justify-center">
                <PremiumButton onClick={handleProceedToSpec} disabled={selectedClassAbilities.length !== 2} className="w-full max-w-xs" contentClassName="text-base">
                  Devam Et
                </PremiumButton>
              </div>
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
              <h2 className="col-span-full text-2xl font-black text-amber-200 mb-2 text-center drop-shadow">
                Özelleştirme Seç
              </h2>

              {specs.map(spec => {
                const selected = selectedSpec === spec.id
                return (
                  <motion.button
                    key={spec.id}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleSelectSpec(spec.id)}
                  >
                    <PremiumCard variant="frame" glow={selected ? 'gold' : undefined}>
                      <div className="flex flex-col items-center text-center p-2">
                        <MedallionIcon id={spec.id} type="spec" size="xl" className="mb-2" />
                        <h3 className="text-lg font-black text-amber-950 mb-1">{spec.name}</h3>
                        <p className="text-sm text-amber-900/80">{spec.description}</p>
                      </div>
                    </PremiumCard>
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
              <h2 className="text-2xl font-black text-amber-200 mb-6 text-center drop-shadow">
                1 Özel Yetenek Seç
              </h2>

              <div className="space-y-3 mb-6">
                {specAbilities.map(ability => {
                  const selected = selectedSpecAbility === ability.id
                  return (
                    <motion.button
                      key={ability.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelectSpecAbility(ability.id)}
                      className="w-full text-left"
                    >
                      <PremiumCard variant="panel" glow={selected ? 'gold' : undefined}>
                        <div className="flex items-center gap-3 p-3">
                          <span className="flex items-center justify-center w-12 h-12 rounded-lg bg-amber-900/10 border border-amber-700/40 flex-shrink-0">
                            <AbilityIcon iconId={ability.icon} size="md" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-amber-950 mb-0.5">{ability.name}</h4>
                            <p className="text-sm text-amber-900/80 leading-snug">{ability.description}</p>
                            <p className="text-xs text-amber-800/70 mt-0.5">
                              {ability.isPassive ? 'Pasif Yetenek' : `Bekleme: ${ability.cooldown} tur`}
                            </p>
                          </div>
                          {selected && (
                            <span className="flex-shrink-0 w-8 h-8 bg-amber-600 border-2 border-amber-300 rounded-full flex items-center justify-center text-amber-50 font-black">✓</span>
                          )}
                        </div>
                      </PremiumCard>
                    </motion.button>
                  )
                })}
              </div>

              <div className="flex justify-center">
                <PremiumButton onClick={handleProceedToStats} disabled={!selectedSpecAbility} className="w-full max-w-xs" contentClassName="text-base">
                  Devam Et
                </PremiumButton>
              </div>
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
              <h2 className="text-2xl font-black text-amber-200 mb-6 text-center drop-shadow">
                Dinozor Adı ve İstatistikleri
              </h2>

              <PremiumCard variant="frame">
                <div className="p-2 space-y-4">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-black text-amber-900 mb-2">Dinozor Adı *</label>
                  <input
                    type="text"
                    value={stats.name}
                    onChange={e => setStats({ ...stats, name: e.target.value })}
                    placeholder="Dinozor adını gir..."
                    className="w-full px-4 py-2.5 rounded-lg font-bold text-amber-950 placeholder-amber-800/40 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    style={{ background: 'linear-gradient(180deg, #efe0c0 0%, #d8c49e 100%)', border: '2px solid #a9853f' }}
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
                        <div className="p-3 bg-amber-900/8 border border-amber-900/25 rounded-lg">
                          <p className="text-xs font-black uppercase tracking-wide text-amber-800/80 mb-2">Sınıfından Gelen Statlar</p>
                          <div className="space-y-1 text-xs font-semibold text-amber-900/85">
                            {breakdown.classTheme && (
                              <>
                                <p>Saldırı: +{breakdown.classTheme.classDistribution.atk}</p>
                                <p>Savunma: +{breakdown.classTheme.classDistribution.def}</p>
                                <p>Hız: +{breakdown.classTheme.classDistribution.spd}</p>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="p-3 bg-amber-900/8 border border-amber-900/25 rounded-lg">
                          <p className="text-xs font-black uppercase tracking-wide text-amber-800/80 mb-2">Özelleştirmesinden Gelen Bonuslar</p>
                          <div className="space-y-1 text-xs font-semibold text-amber-900/85">
                            {breakdown.specTheme && (
                              <>
                                {breakdown.specTheme.hpBonus && (
                                  <p>Can Bonusu: <span className="font-black text-red-700">+{breakdown.specTheme.hpBonus}</span></p>
                                )}
                                <p>Saldırı: +{breakdown.specTheme.specDistribution.atk}</p>
                                <p>Savunma: +{breakdown.specTheme.specDistribution.def}</p>
                                <p>Hız: +{breakdown.specTheme.specDistribution.spd}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Final stats — premium cards (tap to open stat detail) */}
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
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <StatCardPremium stat="sta" dino={tempDino} value={finalStats.maxHp} />
                            <StatCardPremium stat="atk" dino={tempDino} value={finalStats.atk} />
                            <StatCardPremium stat="def" dino={tempDino} value={finalStats.def} />
                            <StatCardPremium stat="spd" dino={tempDino} value={finalStats.spd} />
                          </div>
                        )
                      })()}
                    </>
                  )
                })()}

                {/* Summary */}
                <div className="mt-2 p-4 bg-amber-900/10 border border-amber-900/25 rounded-lg">
                  <p className="text-sm font-black uppercase tracking-wide text-amber-800/80 mb-2">Özet</p>
                  <div className="space-y-1 text-sm font-semibold text-amber-900/85">
                    <p>Sınıf: <span className="font-black text-amber-950">{CLASS_ABILITIES[selectedClass].name}</span></p>
                    <p>Özelleştirme: <span className="font-black text-amber-950">{SPEC_ABILITIES[selectedSpec].name}</span></p>
                    <p>Yetenekler: <span className="font-black text-amber-950">{selectedClassAbilities.length} Sınıf + 1 Özel = 3 Toplam</span></p>
                  </div>
                </div>

                {/* Create Button */}
                <div className="flex justify-center pt-1">
                  <PremiumButton onClick={handleCreateDino} disabled={loading || !stats.name.trim()} className="w-full max-w-sm" contentClassName="text-base">
                    {loading ? 'Oluşturuluyor...' : 'Dinozor Oluştur'}
                  </PremiumButton>
                </div>
                </div>
              </PremiumCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
