import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ActiveEffect } from '../game/types'
import { getEffect } from '../lib/effects'
import SvgIcon from './SvgIcon'

interface EffectsDisplayProps {
  effects: ActiveEffect[]
  battleCharacterMaxHp?: number
}

interface SelectedEffect {
  effect: ActiveEffect
  definition: ReturnType<typeof getEffect>
}

export default function EffectsDisplay({ effects, battleCharacterMaxHp = 100 }: EffectsDisplayProps) {
  const [selectedEffect, setSelectedEffect] = useState<SelectedEffect | null>(null)

  return (
    <>
      {/* Effects icons */}
      <div className="flex gap-2 flex-wrap">
        {effects.map((effect, idx) => {
          const definition = getEffect(effect.type)
          if (!definition) return null

          return (
            <motion.button
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() =>
                setSelectedEffect({ effect, definition })
              }
              className="relative group"
              title={definition.name}
            >
              <div className="cursor-help hover:scale-110 transition">
                <SvgIcon id={effect.type} type="effect" size="md" fallback={definition.emoji} />
              </div>
              {/* Duration badge */}
              <div className="absolute -top-2 -right-2 bg-gradient-to-br from-gem-health to-gem-health-dark text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center border border-gold/60 shadow-md">
                {effect.duration}
              </div>
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                <div className="bg-slate-900 border border-neon-cyan/50 rounded px-2 py-1 text-xs text-neon-cyan whitespace-nowrap">
                  {definition.name}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Effects detail modal */}
      <AnimatePresence>
        {selectedEffect && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[300] p-4"
            onClick={() => setSelectedEffect(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-dark neon-border-cyan rounded-xl p-6 max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              {selectedEffect.definition && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <SvgIcon
                      id={selectedEffect.effect.type}
                      type="effect"
                      size="xl"
                      fallback={selectedEffect.definition.emoji}
                    />
                    <div>
                      <h2 className="text-2xl font-black text-neon-cyan">
                        {selectedEffect.definition.name}
                      </h2>
                      <p className="text-xs text-neon-cyan/70">
                        {selectedEffect.definition.type === 'buff'
                          ? '📈 Buff'
                          : '📉 Debuff'}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 p-3 border border-neon-cyan/30 rounded-lg bg-neon-cyan/5">
                    <p className="text-sm text-neon-cyan font-bold">
                      ⏱️ Kalan: {selectedEffect.effect.duration} tur
                    </p>
                  </div>

                  <div className="mb-4 p-3 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20">
                    <p className="text-sm text-neon-cyan/90 leading-relaxed">
                      {selectedEffect.definition.fullDescription}
                    </p>
                  </div>

                  {/* Damage Details */}
                  {selectedEffect.definition && selectedEffect.definition.levels && (() => {
                    const defaultLevel = selectedEffect.definition.defaultLevel || 1
                    const levelData = selectedEffect.definition.levels[defaultLevel] || selectedEffect.definition.levels[1]
                    return levelData && (levelData.damage !== undefined || levelData.damagePercent !== undefined) ? (
                      <div className="mb-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <p className="text-xs font-bold text-orange-400 mb-2">⚡ HASAR DETAYLARI:</p>
                        <div className="space-y-1 text-xs text-white/80">
                          {levelData.damage !== undefined && (
                            <div className="flex justify-between">
                              <span>Sabit Hasar:</span>
                              <span className="font-bold">{levelData.damage} / tur</span>
                            </div>
                          )}
                          {levelData.damagePercent !== undefined && (
                            <div className="flex justify-between">
                              <span>Yüzde Hasar:</span>
                              <span className="font-bold">{levelData.damagePercent}% / tur</span>
                            </div>
                          )}
                          {levelData.damagePercent !== undefined && (
                            <div className="flex justify-between text-white/60 text-xs">
                              <span>({Math.round((battleCharacterMaxHp * levelData.damagePercent) / 100)} HP / tur)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null
                  })()}

                  {/* Stat Bonuses */}
                  {selectedEffect.definition && selectedEffect.definition.levels && (() => {
                    const defaultLevel = selectedEffect.definition.defaultLevel || 1
                    const levelData = selectedEffect.definition.levels[defaultLevel] || selectedEffect.definition.levels[1]
                    return levelData && levelData.statBonus ? (
                      <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <p className="text-xs font-bold text-blue-400 mb-2">📊 STAT BONUS:</p>
                        <div className="space-y-1 text-xs text-white/80">
                          {levelData.statBonus.atk !== undefined && (
                            <div className="flex justify-between">
                              <span>Saldırı:</span>
                              <span className={levelData.statBonus.atk > 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                                {levelData.statBonus.atk > 0 ? '+' : ''}{levelData.statBonus.atk}%
                              </span>
                            </div>
                          )}
                          {levelData.statBonus.def !== undefined && (
                            <div className="flex justify-between">
                              <span>Savunma:</span>
                              <span className={levelData.statBonus.def > 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                                {levelData.statBonus.def > 0 ? '+' : ''}{levelData.statBonus.def}%
                              </span>
                            </div>
                          )}
                          {levelData.statBonus.spd !== undefined && (
                            <div className="flex justify-between">
                              <span>Hız:</span>
                              <span className={levelData.statBonus.spd > 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                                {levelData.statBonus.spd > 0 ? '+' : ''}{levelData.statBonus.spd}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null
                  })()}
                </>
              )}

              <button
                onClick={() => setSelectedEffect(null)}
                className="hs-btn hs-btn-block"
              >
                Kapat
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
