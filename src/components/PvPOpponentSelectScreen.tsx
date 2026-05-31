import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Dino } from '../game/types'
import DinoCard from './DinoCard'

interface PvPOpponent {
  id: string
  playerName: string
  dino: Dino
  winRate: number
  level: number
}

interface PvPOpponentSelectScreenProps {
  playerDino: Dino
  availableOpponents: PvPOpponent[]
  loading?: boolean
  onSelectOpponent: (opponent: PvPOpponent) => void
  onBack: () => void
}

export default function PvPOpponentSelectScreen({
  playerDino,
  availableOpponents,
  loading = false,
  onSelectOpponent,
  onBack,
}: PvPOpponentSelectScreenProps) {
  const [filteredOpponents, setFilteredOpponents] = useState<PvPOpponent[]>(availableOpponents)
  const [filterLevel, setFilterLevel] = useState<'all' | 'lower' | 'equal' | 'higher'>('all')

  useEffect(() => {
    let filtered = availableOpponents
    if (filterLevel === 'lower') {
      filtered = filtered.filter(opp => opp.dino.level < playerDino.level)
    } else if (filterLevel === 'equal') {
      filtered = filtered.filter(opp => opp.dino.level === playerDino.level)
    } else if (filterLevel === 'higher') {
      filtered = filtered.filter(opp => opp.dino.level > playerDino.level)
    }
    setFilteredOpponents(filtered)
  }, [filterLevel, availableOpponents, playerDino.level])

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

      <div className="relative z-10 mt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">
            PvP Eşleştirme
          </h1>
          <p className="text-lg text-neon-cyan/80 mt-2">
            {playerDino.name} ile rakip bul
          </p>
        </div>

        {/* Difficulty Filters */}
        <div className="flex gap-2 justify-center mb-6 flex-wrap">
          {[
            { label: 'Tümü', value: 'all' },
            { label: 'Daha Zayıf', value: 'lower' },
            { label: 'Eşit Seviye', value: 'equal' },
            { label: 'Daha Güçlü', value: 'higher' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterLevel(filter.value as any)}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                filterLevel === filter.value
                  ? 'hs-btn hs-btn-cyan'
                  : 'glass-dark border border-neon-cyan/30 text-neon-cyan/70 hover:text-neon-cyan'
              }`}
            >
              <span>{filter.label}</span>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-6xl"
            >
              ⚙️
            </motion.div>
          </div>
        ) : filteredOpponents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl text-neon-cyan">Rakip bulunamadı</p>
            <p className="text-sm text-neon-cyan/70 mt-2">Daha sonra tekrar dene</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-4">
            {filteredOpponents.map((opponent) => (
              <motion.div
                key={opponent.id}
                whileHover={{ translateY: -4 }}
                className="cursor-pointer"
                onClick={() => onSelectOpponent(opponent)}
              >
                <div className="relative">
                  {/* Opponent Card */}
                  <DinoCard
                    dino={opponent.dino}
                    mode="summary"
                  />

                  {/* Opponent Info Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-xl flex flex-col justify-end p-4 opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white font-bold text-sm mb-1">{opponent.playerName}</p>
                    <p className="text-gold-light text-xs font-bold mb-2">
                      승률: {opponent.winRate}%
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectOpponent(opponent)
                      }}
                      className="hs-btn hs-btn-sm hs-btn-green w-full"
                    >
                      <span>Seç</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
