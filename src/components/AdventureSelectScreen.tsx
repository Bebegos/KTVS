import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dino } from '../game/types'
import { Adventure, getAdventuresByLevel, getTotalEnemyCount } from '../lib/adventures'
import DinoCard from './DinoCard'
import PremiumButton from './PremiumButton'
import PremiumCard from './PremiumCard'
import { homeAssets } from '../lib/gameAssets'

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
    <div
      className="w-full min-h-screen flex flex-col p-4 gap-5 relative overflow-y-auto"
      style={{ backgroundImage: `url('${homeAssets.background}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#2a1c0e' }}
    >
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      <div className="absolute top-4 left-4 z-20">
        <PremiumButton onClick={onBack} className="w-28" contentClassName="text-sm">← Geri</PremiumButton>
      </div>

      {!selectedDino ? (
        // DINO SELECTION
        <div className="flex flex-col items-center gap-6 z-10 mt-16">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-black text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Maceraya Başla</h1>
            <p className="text-base font-bold text-amber-300/90 mt-1 drop-shadow">Dinozorunu seç</p>
          </div>

          {dinos.length === 0 ? (
            <p className="text-xl font-bold text-amber-100 drop-shadow">Dinozor yok!</p>
          ) : (
            <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {dinos.map((dino) => (
                <DinoCard key={dino.id} dino={dino} mode="selection" onClick={() => setSelectedDino(dino)} />
              ))}
            </div>
          )}
        </div>
      ) : (
        // ADVENTURE SELECTION
        <div className="flex flex-col items-center gap-5 z-10 mt-16 w-full">
          <div className="flex items-center gap-3 w-full max-w-2xl">
            <PremiumButton onClick={() => setSelectedDino(null)} className="w-36 flex-shrink-0" contentClassName="text-xs">
              Dino Değiştir
            </PremiumButton>
            <div className="flex-1">
              <PremiumCard variant="panel">
                <div className="px-4 py-2 text-center">
                  <p className="text-xs font-bold text-amber-800/80">Seçili Dino</p>
                  <h2 className="text-lg font-black text-amber-950">{selectedDino.name} (Lvl {selectedDino.level})</h2>
                </div>
              </PremiumCard>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-black text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Maceraları Seç</h1>
            <p className="text-base font-bold text-amber-300/90 mt-1 drop-shadow">Seviyen için uygun görevler</p>
          </div>

          {availableAdventures.length === 0 ? (
            <p className="text-xl font-bold text-amber-100 drop-shadow">Bu seviye için macera yok</p>
          ) : (
            <div className="w-full max-w-2xl space-y-3">
              {availableAdventures.map((adventure) => {
                const diff =
                  adventure.difficulty === 'easy' ? 'Kolay' : adventure.difficulty === 'normal' ? 'Normal' : 'Zor'
                return (
                  <motion.button
                    key={adventure.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onStartAdventure(selectedDino, adventure)}
                    className="w-full text-left"
                  >
                    <PremiumCard variant="panel">
                      <div className="p-4">
                        <h2 className="text-xl font-black text-amber-950 mb-1">{adventure.name}</h2>
                        <p className="text-sm text-amber-900/80 mb-3">{adventure.description}</p>
                        <div className="flex gap-2 text-xs font-black flex-wrap">
                          <span className="bg-amber-900/15 border border-amber-900/30 rounded px-2.5 py-1 text-amber-900">{diff}</span>
                          <span className="bg-amber-900/15 border border-amber-900/30 rounded px-2.5 py-1 text-amber-900">{getTotalEnemyCount(adventure)} Düşman</span>
                          <span className="bg-green-900/10 border border-green-800/30 rounded px-2.5 py-1 text-green-800">{adventure.xpReward} XP</span>
                          <span className="bg-amber-900/15 border border-amber-700/40 rounded px-2.5 py-1 text-amber-800">{adventure.coinReward} DinoCoin</span>
                        </div>
                      </div>
                    </PremiumCard>
                  </motion.button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
