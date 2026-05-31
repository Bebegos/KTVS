import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../lib/auth-context'
import { Dino, DinoAbility } from '../game/types'
import { createDino, getDinos } from '../lib/supabase'
import {
  getAllClasses,
  getSpecsByClass,
  getClassAbilities,
  getSpecAbilities,
  CLASS_ABILITIES,
  SPEC_ABILITIES,
} from '../lib/abilities'
import { getClassIcon, getSpecIcon, getAbilityIcon } from '../lib/icons'
import SvgIcon from './SvgIcon'

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
      const abilities: DinoAbility[] = []

      // Add 2 selected class abilities
      for (const abilityId of selectedClassAbilities) {
        const abilityDef = classAbilities.find(a => a.id === abilityId)
        if (abilityDef) {
          // Map ability kind to system kind: 'attack'/'debuff'/etc -> 'buff' or 'debuff'
          const systemKind = abilityDef.kind === 'buff' ? 'buff' : 'debuff'
          abilities.push({
            name: abilityDef.name,
            cd: 0,
            kind: systemKind,
            effect: abilityDef.effect as any,
            multiplier: abilityDef.damageMultiplier,
            icon: abilityDef.icon,
          })
        }
      }

      // Add 1 selected spec ability
      const specAbilityDef = specAbilities.find(a => a.id === selectedSpecAbility)
      if (specAbilityDef) {
        const systemKind = specAbilityDef.kind === 'buff' ? 'buff' : 'debuff'
        abilities.push({
          name: specAbilityDef.name,
          cd: 0,
          kind: systemKind,
          effect: specAbilityDef.effect as any,
          multiplier: specAbilityDef.damageMultiplier,
          icon: specAbilityDef.icon,
        })
      }

      // Add 2 placeholder abilities for future leveling
      abilities.push(
        {
          name: '[Seviye 2\'de Açılacak]',
          cd: 0,
          kind: 'debuff',
          effect: 'none',
          multiplier: 0,
          icon: 'placeholder',
        },
        {
          name: '[Seviye 3\'te Açılacak]',
          cd: 0,
          kind: 'debuff',
          effect: 'none',
          multiplier: 0,
          icon: 'placeholder',
        }
      )

      await createDino({
        name: stats.name,
        max_hp: stats.maxHp,
        atk: stats.atk,
        def: stats.def,
        spd: stats.spd,
        level: 1,
        xp: 0,
        abilities,
        owner_id: user?.id,
        class: selectedClass,
        spec: selectedSpec,
        selected_ability_ids: [...selectedClassAbilities, selectedSpecAbility],
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
            className="px-4 py-2 glass-dark neon-border-cyan rounded-lg font-bold text-neon-cyan hover:shadow-neon-cyan transition"
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
              className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto"
            >
              <h2 className="col-span-full text-2xl font-bold text-neon-cyan mb-2 text-center">
                Dinozor Sınıfını Seç
              </h2>

              {classes.map(classAbs => {
                const icon = getClassIcon(classAbs.id)
                return (
                  <motion.button
                    key={classAbs.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectClass(classAbs.id)}
                    className="glass-dark neon-border-cyan rounded-xl p-6 text-left transition hover:shadow-neon-cyan"
                  >
                    <p className="text-5xl mb-3">{icon?.emoji || '❓'}</p>
                    <h3 className="text-xl font-black text-neon-cyan mb-1">{classAbs.name}</h3>
                    <p className="text-sm text-neon-cyan/70">{classAbs.description}</p>
                  </motion.button>
                )
              })}
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
                        ? 'glass-dark neon-border-cyan border-2 shadow-neon-cyan'
                        : 'glass-dark neon-border-cyan border hover:border-neon-cyan'
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
                className="w-full px-6 py-3 glass-dark neon-border-cyan rounded-lg font-bold text-neon-cyan hover:shadow-neon-cyan transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                const icon = getSpecIcon(spec.id)
                return (
                  <motion.button
                    key={spec.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectSpec(spec.id)}
                    className="glass-dark neon-border-purple rounded-xl p-6 text-left transition hover:shadow-neon-purple"
                  >
                    <p className="text-5xl mb-3">{icon?.emoji || '❓'}</p>
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
                        ? 'glass-dark neon-border-purple border-2 shadow-neon-purple'
                        : 'glass-dark neon-border-purple border hover:border-neon-purple'
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
                className="w-full px-6 py-3 glass-dark neon-border-purple rounded-lg font-bold text-neon-purple hover:shadow-neon-purple transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Devam Et →
              </button>
            </motion.div>
          )}

          {/* Step 5: Stats & Name */}
          {step === 'stats' && (
            <motion.div
              key="stats"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-2xl font-bold text-neon-pink mb-6 text-center">
                Temel Özellikler
              </h2>

              <div className="glass-dark neon-border-pink rounded-lg p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-neon-pink mb-2">Dinozor Adı *</label>
                  <input
                    type="text"
                    value={stats.name}
                    onChange={e => setStats({ ...stats, name: e.target.value })}
                    placeholder="Dinozor adını gir..."
                    className="w-full px-4 py-2 bg-slate-700 border border-neon-pink/50 rounded-lg text-neon-pink placeholder-neon-pink/50 focus:outline-none focus:border-neon-pink"
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  {['maxHp', 'atk', 'def', 'spd'].map(stat => (
                    <div key={stat}>
                      <label className="block text-sm font-bold text-neon-pink mb-2 capitalize">
                        {stat === 'maxHp' ? 'Can' : stat === 'atk' ? 'Saldırı' : stat === 'def' ? 'Savunma' : 'Hız'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max={stat === 'maxHp' ? 100 : 20}
                          value={stats[stat as keyof typeof stats]}
                          onChange={e =>
                            setStats({ ...stats, [stat]: Math.max(1, parseInt(e.target.value) || 0) })
                          }
                          className="flex-1 px-3 py-2 bg-slate-700 border border-neon-pink/50 rounded-lg text-neon-pink focus:outline-none focus:border-neon-pink"
                        />
                        <span className="text-neon-pink/70 text-sm font-bold w-8">
                          {stats[stat as keyof typeof stats]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-6 p-4 bg-neon-pink/10 border border-neon-pink/30 rounded-lg">
                  <p className="text-sm font-bold text-neon-pink mb-3">📋 Özet:</p>
                  <div className="space-y-1 text-sm text-neon-pink/80">
                    <p>Sınıf: <span className="font-bold">{CLASS_ABILITIES[selectedClass!].name}</span></p>
                    <p>Özellik: <span className="font-bold">{SPEC_ABILITIES[selectedSpec!].name}</span></p>
                    <p>Seçili Yetenekler: <span className="font-bold">{selectedClassAbilities.length + 1}/5</span></p>
                  </div>
                </div>

                {/* Create Button */}
                <button
                  onClick={handleCreateDino}
                  disabled={loading || !stats.name.trim()}
                  className="w-full px-6 py-3 glass-dark neon-border-pink rounded-lg font-bold text-neon-pink hover:shadow-neon-pink transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
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
