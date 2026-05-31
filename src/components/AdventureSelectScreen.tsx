import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dino } from '../game/types'
import { Adventure, getAdventuresByLevel, getTotalEnemyCount } from '../lib/adventures'
import DinoCard from './DinoCard'

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
        <span>Geri</span>
      </button>

      {!selectedDino ? (
        // DINO SELECTION
        <div className="flex flex-col items-center gap-6 z-10 mt-8">
          <div className="text-center mb-4">
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
            <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {dinos.map((dino) => (
                <DinoCard
                  key={dino.id}
                  dino={dino}
                  mode="selection"
                  onClick={() => setSelectedDino(dino)}
                />
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
              <span>Dino Değiştir</span>
            </button>
            <div className="flex-1 glass-dark neon-border-cyan rounded-lg p-4 text-center">
              <p className="text-sm text-neon-cyan/70">Seçili Dino</p>
              <h2 className="text-2xl font-black text-neon-cyan">{selectedDino.name} (Lvl {selectedDino.level})</h2>
            </div>
          </div>

          <div className="text-center mb-4">
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
                          {adventure.difficulty === 'easy'
                            ? 'Kolay'
                            : adventure.difficulty === 'normal'
                            ? 'Normal'
                            : 'Zor'}
                        </div>
                        <div className="glass-dark border border-neon-purple/30 rounded px-3 py-1">
                          {getTotalEnemyCount(adventure)} Düşman
                        </div>
                        <div className="glass-dark border border-yellow-500/30 rounded px-3 py-1 text-yellow-400">
                          {adventure.xpReward} XP
                        </div>
                        <div className="glass-dark border border-orange-500/30 rounded px-3 py-1 text-orange-400">
                          {adventure.coinReward} DinoCoin
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
