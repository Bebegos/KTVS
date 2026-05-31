import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dino } from '../game/types'
import { Adventure, getAdventuresByLevel, getTotalEnemyCount } from '../lib/adventures'
import StatIcon from './StatIcon'

interface AdventureSelectScreenProps {
  dinos: Dino[]
  onStartAdventure: (dino: Dino, adventure: Adventure) => void
  onBack: () => void
}

export default function AdventureSelectScreen({
  dinos,
  onStartAdventure,
  onBack,
}: AdventureSelectScreenProps) {
  const [selectedDino, setSelectedDino] = useState<Dino | null>(null)
  const availableAdventures = selectedDino ? getAdventuresByLevel(selectedDino.level) : []

  return (
    <div className="w-full min-h-screen flex flex-col p-4 gap-6 relative overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-neon-cyan opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-neon-purple opacity-5 rounded-full blur-3xl"></div>
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        className="hs-btn absolute top-4 left-4 z-10"
      >
        ← Geri
      </button>

      {!selectedDino ? (
        // DINO SELECTION
        <div className="flex flex-col items-center gap-6 z-10 mt-8">
          <div className="text-center mb-4">
            <div className="text-6xl mb-3">🦖</div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">
              Maceraya Başla
            </h1>
            <p className="text-lg text-neon-cyan/80 mt-2">Dinozorunu seç</p>
          </div>

          {dinos.length === 0 ? (
            <div className="text-center">
              <p className="text-xl text-neon-cyan">Dinozor yok!</p>
            </div>
          ) : (
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dinos.map((dino) => (
                <motion.button
                  key={dino.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDino(dino)}
                  className="glass-dark neon-border-cyan rounded-xl p-6 text-left hover:shadow-neon-cyan transition"
                >
                  <div className="text-4xl mb-3">🦖</div>
                  <h2 className="text-2xl font-black text-neon-cyan">{dino.name}</h2>
                  <p className="text-sm text-neon-cyan/70 mb-4">Seviye {dino.level}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                    <div className="glass border border-red-500/30 p-2 rounded text-red-400 flex items-center gap-2">
                      <StatIcon stat="hp" size="xs" />
                      {dino.maxHp}
                    </div>
                    <div className="glass border border-orange-500/30 p-2 rounded text-orange-400 flex items-center gap-2">
                      <StatIcon stat="atk" size="xs" />
                      {dino.atk}
                    </div>
                    <div className="glass border border-blue-500/30 p-2 rounded text-blue-400 flex items-center gap-2">
                      <StatIcon stat="def" size="xs" />
                      {dino.def}
                    </div>
                    <div className="glass border border-yellow-500/30 p-2 rounded text-yellow-400 flex items-center gap-2">
                      <StatIcon stat="spd" size="xs" />
                      {dino.spd}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      ) : (
        // ADVENTURE SELECTION
        <div className="flex flex-col items-center gap-6 z-10 mt-8">
          <div className="flex items-center gap-4 w-full max-w-2xl">
            <button
              onClick={() => setSelectedDino(null)}
              className="hs-btn hs-btn-purple"
            >
              ← Dino Değiştir
            </button>
            <div className="flex-1 glass-dark neon-border-cyan rounded-lg p-4 text-center">
              <p className="text-sm text-neon-cyan/70">Seçili Dino</p>
              <h2 className="text-2xl font-black text-neon-cyan">{selectedDino.name} (Lvl {selectedDino.level})</h2>
            </div>
          </div>

          <div className="text-center mb-4">
            <div className="text-6xl mb-3">🗺️</div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-pink">
              Maceraları Seç
            </h1>
            <p className="text-lg text-neon-purple/80 mt-2">Seviyen için uygun görevler</p>
          </div>

          {availableAdventures.length === 0 ? (
            <div className="text-center">
              <p className="text-xl text-neon-cyan">Bu seviye için macera yok</p>
            </div>
          ) : (
            <div className="w-full max-w-2xl space-y-4">
              {availableAdventures.map((adventure) => (
                <motion.button
                  key={adventure.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onStartAdventure(selectedDino, adventure)}
                  className={`w-full glass-dark rounded-xl p-6 text-left transition ${
                    adventure.difficulty === 'easy'
                      ? 'neon-border-cyan hover:shadow-neon-cyan'
                      : adventure.difficulty === 'normal'
                      ? 'neon-border-purple hover:shadow-neon-purple'
                      : 'border border-red-500/50 hover:shadow-red-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-2xl font-black mb-2">{adventure.name}</h2>
                      <p className="text-neon-cyan/70 mb-3">{adventure.description}</p>

                      <div className="flex gap-4 text-sm font-bold flex-wrap">
                        <div className="glass-dark border border-neon-cyan/30 rounded px-3 py-1">
                          {adventure.difficulty === 'easy' ? '🟢' : adventure.difficulty === 'normal' ? '🟡' : '🔴'}{' '}
                          {adventure.difficulty === 'easy'
                            ? 'Kolay'
                            : adventure.difficulty === 'normal'
                            ? 'Normal'
                            : 'Zor'}
                        </div>
                        <div className="glass-dark border border-neon-purple/30 rounded px-3 py-1">
                          ⚔️ {getTotalEnemyCount(adventure)} Düşman
                        </div>
                        <div className="glass-dark border border-yellow-500/30 rounded px-3 py-1 text-yellow-400">
                          ✨ {adventure.xpReward} XP
                        </div>
                        <div className="glass-dark border border-orange-500/30 rounded px-3 py-1 text-orange-400">
                          💰 {adventure.coinReward} DinoCoin
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
