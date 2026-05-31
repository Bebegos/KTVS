import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino } from '../game/types'
import { pendingRewardsService } from '../lib/services'
import { abilityDefinitionService } from '../lib/services/abilityDefinitionService'
import { updateDino } from '../lib/supabase'
import AbilityIcon from './AbilityIcon'

interface RewardSpendingModalProps {
  dino: Dino
  isOpen: boolean
  onClose: () => void
  onConfirm?: (dino: Dino) => void
}

export default function RewardSpendingModal({ dino, isOpen, onClose, onConfirm }: RewardSpendingModalProps) {
  const [statAllocation, setStatAllocation] = useState({
    atk: 0,
    def: 0,
    spd: 0,
  })
  const [selectedAbilities, setSelectedAbilities] = useState<Map<string, number>>(new Map())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !dino.pendingRewards) return null

  const pendingPoints = dino.pendingRewards.unspentStatPoints
  // Filter out placeholder abilities - those are handled by AbilityDiscoveryModal
  const pendingAbilities = dino.pendingRewards.pendingAbilityIds.filter(id => !id.startsWith('__'))
  const allocatedPoints = statAllocation.atk + statAllocation.def + statAllocation.spd
  const remainingPoints = pendingPoints - allocatedPoints

  const emptySlots = dino.abilityIds
    .map((id, idx) => (!id ? idx : -1))
    .filter(idx => idx !== -1)

  const canSubmit =
    allocatedPoints === pendingPoints &&
    selectedAbilities.size === pendingAbilities.length &&
    remainingPoints === 0

  async function handleSubmit() {
    if (!canSubmit) return

    setSaving(true)
    setError(null)

    try {
      const updatedDino = { ...dino }

      // Apply stat points
      pendingRewardsService.spendStatPoints(
        updatedDino,
        statAllocation.atk,
        statAllocation.def,
        statAllocation.spd
      )

      // Assign abilities to slots
      selectedAbilities.forEach((slot, abilityId) => {
        pendingRewardsService.assignPendingAbility(updatedDino, abilityId, slot)
      })

      // Clear remaining pending rewards
      pendingRewardsService.clearPendingRewards(updatedDino)

      // Save to database
      const dbUpdates: any = {
        atk: updatedDino.atk,
        def: updatedDino.def,
        spd: updatedDino.spd,
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

      if (onConfirm) {
        onConfirm(updatedDino)
      }

      onClose()
    } catch (err) {
      console.error('Error saving rewards:', err)
      setError('Ödüllerini kaydetme hatası. Lütfen tekrar dene.')
    } finally {
      setSaving(false)
    }
  }

  function handleAbilitySlot(abilityId: string, slot: number) {
    const newMap = new Map(selectedAbilities)
    if (newMap.has(abilityId)) {
      newMap.delete(abilityId)
    } else {
      newMap.set(abilityId, slot)
    }
    setSelectedAbilities(newMap)
  }

  function handleStatChange(stat: keyof typeof statAllocation, value: number) {
    const newValue = Math.max(0, Math.min(pendingPoints, value))
    setStatAllocation(prev => ({
      ...prev,
      [stat]: newValue,
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[300] p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="rounded-2xl max-w-2xl w-full border-2 border-yellow-500 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-lg my-8"
      >
        {/* Header */}
        <div className="p-6 border-b border-yellow-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-yellow-300">⚡ Ödüllerini Harca</h1>
            <button
              onClick={onClose}
              className="hs-btn hs-btn-sm"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-yellow-300/70">{dino.name} — Seviye {dino.level}</p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/20 border-b border-red-500/30 text-red-300 text-sm font-bold">
            {error}
          </div>
        )}

        {/* Stat Points Section */}
        <div className="p-6 border-b border-yellow-500/30 space-y-4 bg-yellow-500/5">
          <h2 className="font-bold text-yellow-300 mb-4">📈 {pendingPoints} Stat Puanı Dağıt</h2>

          <div className="space-y-3">
            {/* ATK */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-orange-300">⚔️ SALDIRI</label>
                <span className="text-lg font-black text-orange-400">{statAllocation.atk}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStatChange('atk', statAllocation.atk - 1)}
                  className="hs-btn hs-btn-red hs-btn-xs"
                >
                  −
                </button>
                <input
                  type="range"
                  min="0"
                  max={pendingPoints}
                  value={statAllocation.atk}
                  onChange={e => handleStatChange('atk', parseInt(e.target.value))}
                  className="flex-1"
                />
                <button
                  onClick={() => handleStatChange('atk', statAllocation.atk + 1)}
                  className="hs-btn hs-btn-green hs-btn-xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* DEF */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-blue-300">🛡️ SAVUNMA</label>
                <span className="text-lg font-black text-blue-400">{statAllocation.def}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStatChange('def', statAllocation.def - 1)}
                  className="hs-btn hs-btn-red hs-btn-xs"
                >
                  −
                </button>
                <input
                  type="range"
                  min="0"
                  max={pendingPoints}
                  value={statAllocation.def}
                  onChange={e => handleStatChange('def', parseInt(e.target.value))}
                  className="flex-1"
                />
                <button
                  onClick={() => handleStatChange('def', statAllocation.def + 1)}
                  className="hs-btn hs-btn-green hs-btn-xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* SPD */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-yellow-300">⚡ HIZ</label>
                <span className="text-lg font-black text-yellow-400">{statAllocation.spd}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStatChange('spd', statAllocation.spd - 1)}
                  className="hs-btn hs-btn-red hs-btn-xs"
                >
                  −
                </button>
                <input
                  type="range"
                  min="0"
                  max={pendingPoints}
                  value={statAllocation.spd}
                  onChange={e => handleStatChange('spd', parseInt(e.target.value))}
                  className="flex-1"
                />
                <button
                  onClick={() => handleStatChange('spd', statAllocation.spd + 1)}
                  className="hs-btn hs-btn-green hs-btn-xs"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className={`text-sm font-bold mt-3 px-3 py-2 rounded transition ${
            remainingPoints === 0
              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {remainingPoints === 0
              ? '✓ Tüm puanlar dağıtıldı'
              : `⚠️ Kalan: ${remainingPoints} puan`}
          </div>
        </div>

        {/* Abilities Section */}
        {pendingAbilities.length > 0 && (
          <div className="p-6 border-b border-yellow-500/30 space-y-4 bg-purple-500/5">
            <h2 className="font-bold text-purple-300 mb-4">✨ {pendingAbilities.length} Yetenek Seç</h2>

            {emptySlots.length === 0 ? (
              <p className="text-sm text-red-300 font-bold">⚠️ Boş yetenek slotu yok!</p>
            ) : (
              <div className="space-y-3">
                {pendingAbilities.map((abilityId, idx) => {
                  const ability = abilityDefinitionService.getAbility(abilityId)
                  if (!ability) return null

                  return (
                    <div
                      key={abilityId}
                      className="bg-gradient-to-r from-purple-900/30 to-purple-900/10 border border-purple-600/40 rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <AbilityIcon iconId={ability.icon} size="md" />
                        <div>
                          <p className="font-bold text-purple-300">{ability.name}</p>
                          <p className="text-xs text-purple-300/70">{ability.description}</p>
                        </div>
                      </div>

                      {emptySlots.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {emptySlots.map(slot => (
                            <button
                              key={slot}
                              onClick={() => handleAbilitySlot(abilityId, slot)}
                              className="hs-btn hs-btn-purple hs-btn-sm"
                            >
                              Slot {slot}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-red-300 font-bold">Boş slot yok</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            <div className={`text-sm font-bold mt-3 px-3 py-2 rounded transition ${
              selectedAbilities.size === pendingAbilities.length
                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {selectedAbilities.size === pendingAbilities.length
                ? `✓ Tüm yetenekler seçildi (${selectedAbilities.size}/${pendingAbilities.length})`
                : `⚠️ ${pendingAbilities.length - selectedAbilities.size} yetenek seçilecek`}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="hs-btn"
          >
            İptal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || saving}
            className="hs-btn hs-btn-green"
          >
            {saving ? '💾 Kaydediliyor...' : '✓ Onayla'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
