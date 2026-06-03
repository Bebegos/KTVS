import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Dino } from '../game/types'
import DinoCard from './DinoCard'
import PremiumButton from './PremiumButton'
import { homeAssets } from '../lib/gameAssets'

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
    <div
      className="w-full min-h-screen flex flex-col p-4 gap-6 relative overflow-y-auto"
      style={{ backgroundImage: `url('${homeAssets.background}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#2a1c0e' }}
    >
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      <div className="absolute top-4 left-4 z-20">
        <PremiumButton onClick={onBack} className="w-28" contentClassName="text-sm">← Geri</PremiumButton>
      </div>

      <div className="relative z-10 mt-16">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">PvP Eşleştirme</h1>
          <p className="text-base font-bold text-amber-300/90 mt-1 drop-shadow">{playerDino.name} ile rakip bul</p>
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
              className="px-4 py-2 rounded-lg font-black text-sm transition-colors"
              style={
                filterLevel === filter.value
                  ? { background: 'linear-gradient(180deg,#b8860b,#8a6310)', border: '2px solid #d4af37', color: '#fff7e6' }
                  : { background: 'rgba(20,12,6,0.6)', border: '2px solid rgba(212,175,55,0.4)', color: '#e8d6a8' }
              }
            >
              {filter.label}
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
            <p className="text-2xl font-black text-amber-100 drop-shadow">Rakip bulunamadı</p>
            <p className="text-sm font-bold text-amber-200/80 mt-2">Daha sonra tekrar dene</p>
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
