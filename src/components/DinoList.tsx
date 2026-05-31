import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../lib/auth-context'
import { Dino } from '../game/types'
import { deleteDino, getDinos } from '../lib/supabase'
import { abilityDefinitionService } from '../lib/services'
import AbilityIcon from './AbilityIcon'
import MedallionIcon from './MedallionIcon'
import SvgIcon from './SvgIcon'
import DinoDetailModal from './DinoDetailModal'
import StatDisplay from './StatDisplay'
import { getEffectNameTR, getEffectEmoji, isBuffEffect } from '../lib/effect-translations'
import { getClassIcon, getSpecIcon } from '../lib/icons'

interface DinoListProps {
  dinos: Dino[]
  onBack: () => void
  onRefresh: (dinos: Dino[]) => void
  onEdit?: (dino: Dino) => void
  onViewDetail?: (dino: Dino) => void
}

export default function DinoList({ dinos, onBack, onRefresh, onEdit, onViewDetail }: DinoListProps) {
  const { user } = useAuth()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [selectedDino, setSelectedDino] = useState<Dino | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  async function handleDelete(id: string) {
    if (!window.confirm('Silmek istediğine emin misin?')) return

    try {
      await deleteDino(id)
      const updated = await getDinos(user?.id)
      onRefresh(updated as Dino[])
    } catch (err) {
      console.error('Silme hatası:', err)
    } finally {
      setDeleting(null)
    }
  }

  function handleOpenDetail(dino: Dino) {
    if (onViewDetail) {
      onViewDetail(dino)
    } else {
      setSelectedDino(dino)
      setDetailModalOpen(true)
    }
  }

  function handleCloseDetail() {
    setDetailModalOpen(false)
    setSelectedDino(null)
  }

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto relative">
      {/* Arka plan efekti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-neon-cyan opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-neon-purple opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <button
          onClick={onBack}
          className="px-4 py-2 glass-dark neon-border-cyan rounded-lg font-bold text-neon-cyan hover:shadow-neon-cyan transition"
        >
          ← Geri
        </button>

        <h1 className="text-4xl font-black text-center mt-4 text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">🦖 Dinozorlarım</h1>

        {dinos.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center mt-8">
            <p className="text-2xl text-neon-cyan">Henüz dinozor yok. Yeni bir tane oluştur!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4 mt-6">
            {dinos.map(dino => {
              const hasPendingRewards = dino.pendingRewards && (dino.pendingRewards.unspentStatPoints > 0 || dino.pendingRewards.pendingAbilityIds.length > 0)

              return (
                <motion.div
                  key={dino.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOpenDetail(dino)}
                  className={`hs-card rounded-2xl p-6 cursor-pointer transition relative ${
                    hasPendingRewards
                      ? 'ring-2 ring-yellow-500 ring-offset-1 ring-offset-slate-900 shadow-2xl shadow-yellow-500/40'
                      : 'hover:shadow-lg'
                  }`}
                >
                  {/* Level-up badge */}
                  {hasPendingRewards && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute -top-3 -right-3 bg-yellow-500 text-yellow-900 rounded-full w-12 h-12 flex items-center justify-center font-black text-lg shadow-lg"
                    >
                      ⚡
                    </motion.div>
                  )}

                  <div className="text-5xl mb-3">🦖</div>
                  <h2 className="text-3xl font-black bg-gradient-to-r from-gold-light to-gold-mid bg-clip-text text-transparent mb-2">{dino.name}</h2>
                  <p className="text-sm text-gold-light/80 mb-4 font-semibold">
                    {dino.element && `${dino.element} • `}
                    ⭐ Seviye {dino.level}
                  </p>

                  {/* Class & Spec Medallions */}
                  {(dino.class || dino.spec) && (
                    <div className="flex gap-3 mb-4 flex-wrap">
                      {dino.class && (
                        <div className="bg-gradient-to-br from-blue-900/40 to-blue-900/20 border border-blue-600/50 rounded-lg px-3 py-2 flex items-center gap-2 hover:border-blue-500 transition">
                          <MedallionIcon id={dino.class} type="class" size="sm" />
                          <span className="text-xs font-bold text-blue-200">{getClassIcon(dino.class)?.label || 'Unknown'}</span>
                        </div>
                      )}
                      {dino.spec && (
                        <div className="bg-gradient-to-br from-purple-900/40 to-purple-900/20 border border-purple-600/50 rounded-lg px-3 py-2 flex items-center gap-2 hover:border-purple-500 transition">
                          <MedallionIcon id={dino.spec} type="spec" size="sm" />
                          <span className="text-xs font-bold text-purple-200">{getSpecIcon(dino.spec)?.label || 'Unknown'}</span>
                        </div>
                      )}
                    </div>
                  )}

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <StatDisplay
                    stat="sta"
                    dino={dino}
                    value={dino.sta || 0}
                    size="sm"
                    showDetailButton={false}
                  />
                  <StatDisplay
                    stat="atk"
                    dino={dino}
                    value={dino.atk}
                    size="sm"
                    showDetailButton={false}
                  />
                  <StatDisplay
                    stat="def"
                    dino={dino}
                    value={dino.def}
                    size="sm"
                    showDetailButton={false}
                  />
                  <StatDisplay
                    stat="spd"
                    dino={dino}
                    value={dino.spd}
                    size="sm"
                    showDetailButton={false}
                  />
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-bold text-gold-light">✨ DENEYIM</p>
                    <p className="text-xs font-bold text-gold-light">{dino.xp}/100</p>
                  </div>
                  <div className="w-full bg-gradient-to-r from-slate-900 to-slate-800 rounded-full h-3 overflow-hidden border border-gold-dark/40">
                    <div
                      className="bg-gradient-to-r from-gold-light via-gold-mid to-gold-dark h-full transition-all duration-500"
                      style={{ width: `${(dino.xp / 100) * 100}%` }}
                    />
                  </div>
                </div>

                {dino.abilityIds && dino.abilityIds.length > 0 && (
                  <div className="mb-4">
                    <p className="font-bold text-gold-light mb-3 text-xs">⚡ YETENEKLER ({dino.abilityIds.filter(id => id).length})</p>
                    <div className="space-y-2">
                      {dino.abilityIds.map((abilityId: string, idx: number) => {
                        if (!abilityId) return null
                        const ability = abilityDefinitionService.getAbility(abilityId)
                        if (!ability) return null

                        return (
                          <div
                            key={idx}
                            className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 border border-purple-600/40 rounded-lg p-3 flex items-start gap-2 hover:border-purple-500/60 transition"
                          >
                            <AbilityIcon iconId={ability.icon} size="md" className="flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-neon-purple text-sm">{ability.name}</p>
                              <div className="text-xs text-neon-purple/70 space-y-0.5">
                                {!ability.effects || ability.effects.length === 0 ? (
                                  <p>Saldırı • ×{ability.damageMultiplier || 1}</p>
                                ) : (
                                  <p className={isBuffEffect((ability.effects[0] as any)) ? 'text-green-400' : 'text-red-400'}>
                                    {isBuffEffect((ability.effects[0] as any)) ? '⬆️ Buff' : '⬇️ Debuff'} • ×{ability.damageMultiplier || 1}
                                  </p>
                                )}
                                {ability.effects && ability.effects.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <SvgIcon id={ability.effects[0] as any} type="effect" size="xs" fallback={getEffectEmoji((ability.effects[0] as any))} />
                                    <span className="font-bold text-neon-cyan">{getEffectNameTR((ability.effects[0] as any))}</span>
                                  </span>
                                )}
                                {ability.cooldown && ability.cooldown > 0 && <p>CD: <span className="font-bold">{ability.cooldown}</span> tur</p>}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-gold-dark/30">
                  <button
                    onClick={() => handleOpenDetail(dino)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-gold-mid/80 to-gold-dark/80 hover:from-gold-light/80 hover:to-gold-mid/80 text-gold-dark font-bold rounded-lg transition active:scale-95"
                  >
                    ℹ️ Detaylar
                  </button>
                  {onEdit && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(dino) }}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-900/60 to-purple-900/40 hover:from-purple-800/80 hover:to-purple-800/60 border border-purple-600/50 text-purple-200 font-bold rounded-lg transition active:scale-95"
                    >
                      ✏️ Düzen
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(dino.id) }}
                    disabled={deleting === dino.id}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-900/60 to-red-900/40 hover:from-red-800/80 hover:to-red-800/60 border border-red-600/50 text-red-300 font-bold rounded-lg disabled:opacity-50 transition active:scale-95"
                  >
                    {deleting === dino.id ? '⏳' : '🗑️'}
                  </button>
                </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailModalOpen && selectedDino && (
          <DinoDetailModal
            dino={selectedDino}
            isOpen={detailModalOpen}
            onClose={handleCloseDetail}
            onEdit={onEdit ? () => { onEdit(selectedDino); handleCloseDetail() } : undefined}
            onSpendRewards={(updatedDino) => {
              const updatedList = dinos.map(d => d.id === updatedDino.id ? updatedDino : d)
              onRefresh(updatedList)
              handleCloseDetail()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
