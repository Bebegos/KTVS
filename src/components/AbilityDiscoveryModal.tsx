import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dino } from '../game/types'
import { getClassAbilities } from '../lib/abilities'
import { abilityDefinitionService } from '../lib/services'
import { updateDino } from '../lib/supabase'
import AbilityIcon from './AbilityIcon'
import SvgIcon from './SvgIcon'

interface AbilityDiscoveryModalProps {
  dino: Dino
  abilityCount: number // How many abilities to discover
  isOpen: boolean
  onClose: () => void
  onComplete: (updatedDino: Dino, discoveredAbilities: string[]) => void
}

export default function AbilityDiscoveryModal({
  dino,
  abilityCount,
  isOpen,
  onClose,
  onComplete,
}: AbilityDiscoveryModalProps) {
  const [selectedAbilities, setSelectedAbilities] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!isOpen || !dino.class) return null

  // Get class abilities
  const classAbilities = getClassAbilities(dino.class)?.abilities || []

  // Get 3 random abilities for current selection
  const getRandomAbilities = () => {
    if (classAbilities.length === 0) return []

    const shuffled = [...classAbilities].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3)
  }

  const [optionsPerAbility] = useState(() => {
    const options: Record<number, typeof classAbilities> = {}
    for (let i = 0; i < abilityCount; i++) {
      options[i] = getRandomAbilities()
    }
    return options
  })

  const currentOptions = optionsPerAbility[currentIndex] || []
  const isLastAbility = currentIndex === abilityCount - 1
  const currentSelected = selectedAbilities[currentIndex]

  async function handleSelectAbility(abilityId: string) {
    const newSelected = [...selectedAbilities]
    newSelected[currentIndex] = abilityId
    setSelectedAbilities(newSelected)
  }

  async function handleSkip() {
    const newSelected = [...selectedAbilities]
    newSelected[currentIndex] = '' // Empty string means skipped
    setSelectedAbilities(newSelected)
    proceedToNext()
  }

  async function handleConfirm() {
    if (!currentSelected) return

    const newSelected = [...selectedAbilities]
    newSelected[currentIndex] = currentSelected
    setSelectedAbilities(newSelected)
    proceedToNext()
  }

  function proceedToNext() {
    if (currentIndex < abilityCount - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      handleComplete()
    }
  }

  async function handleComplete() {
    setSaving(true)
    try {
      const updatedDino = { ...dino }
      const discoveredAbilities: string[] = []

      // Assign selected abilities to empty slots
      let slotIndex = 0
      for (const abilityId of selectedAbilities) {
        if (abilityId) {
          // Find next empty slot
          while (slotIndex < 6 && updatedDino.abilityIds[slotIndex]) {
            slotIndex++
          }

          if (slotIndex < 6) {
            updatedDino.abilityIds[slotIndex] = abilityId
            discoveredAbilities.push(abilityId)
            slotIndex++
          }
        }
      }

      // Clear pending abilities from pending rewards
      if (updatedDino.pendingRewards) {
        updatedDino.pendingRewards.pendingAbilityIds = updatedDino.pendingRewards.pendingAbilityIds.filter(
          id => !id.startsWith('__')
        )
      }

      // Save to database
      const dbUpdates: any = {
        ability_ids: updatedDino.abilityIds,
      }

      if (updatedDino.pendingRewards) {
        dbUpdates.pending_rewards = {
          unspent_stat_points: updatedDino.pendingRewards.unspentStatPoints,
          pending_ability_ids: updatedDino.pendingRewards.pendingAbilityIds,
        }
      } else {
        dbUpdates.pending_rewards = null
      }

      await updateDino(dino.id, dbUpdates)
      onComplete(updatedDino, discoveredAbilities)
    } catch (err) {
      console.error('Yetenek kaydetme hatası:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[250] p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="rounded-2xl max-w-2xl w-full border-2 border-neon-purple/40 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-lg p-6 space-y-6 my-8"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-pink">
            ✨ YETENEĞİ KEŞFET
          </p>
          <p className="text-sm text-neon-purple/70">
            {currentIndex + 1} / {abilityCount}
          </p>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden mt-3">
            <div
              className="bg-gradient-to-r from-neon-purple to-neon-pink h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / abilityCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Ability Options */}
        <div className="space-y-3">
          {currentOptions.map((ability, idx) => {
            const abilityDef = abilityDefinitionService.getAbility(ability.id)
            const isSelected = currentSelected === ability.id

            return (
              <motion.button
                key={ability.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => handleSelectAbility(ability.id)}
                className={`w-full p-4 rounded-xl border-2 transition text-left ${
                  isSelected
                    ? 'border-neon-purple bg-neon-purple/20 shadow-lg shadow-neon-purple/30'
                    : 'border-neon-purple/30 bg-gradient-to-r from-slate-800/60 to-slate-800/40 hover:border-neon-purple/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  {abilityDef && <AbilityIcon iconId={abilityDef.icon} size="md" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-neon-purple text-sm">{ability.name}</p>
                    <p className="text-xs text-neon-purple/70 mt-1">{ability.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-neon-purple/60">
                      <span>⚔️ {Math.round((ability.damageMultiplier || 1) * 100)}%</span>
                      {ability.cooldown > 0 && <span>❄️ {ability.cooldown}tur</span>}
                    </div>
                  </div>
                  {isSelected && <p className="text-2xl">✓</p>}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="hs-btn flex-1"
          >
            Atla
          </button>
          <button
            onClick={handleConfirm}
            disabled={!currentSelected || saving}
            className="hs-btn hs-btn-purple flex-1"
          >
            {isLastAbility && saving
              ? '💾 Kaydediliyor...'
              : isLastAbility
                ? '✓ Tamamla'
                : '→ Devam'}
          </button>
        </div>

        {/* Info */}
        <div className="text-center text-xs text-slate-400 bg-slate-800/40 p-3 rounded-lg">
          <p>Sınıfının yetenekleri arasından rastgele seçilen 3'ünü görüyorsun.</p>
        </div>
      </motion.div>
    </motion.div>
  )
}
