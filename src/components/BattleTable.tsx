import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/auth-context'
import { getDinos } from '../lib/supabase'
import { Dino } from '../game/types'
import BattleTableModeV2 from './BattleTableModeV2'
import DuelloVsMode from './DuelloVsMode'

interface BattleTableProps {
  onBack: () => void
  onRefresh: (dinos: Dino[]) => void
}

type BattleMode = 'select-mode' | 'select-dino' | 'offline' | 'duello-vs'

export default function BattleTable({ onBack, onRefresh }: BattleTableProps) {
  const { user } = useAuth()
  const [dinos, setDinos] = useState<Dino[]>([])
  const [selectedDino, setSelectedDino] = useState<Dino | null>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<BattleMode>('select-mode')

  useEffect(() => {
    loadDinos()
  }, [])

  async function loadDinos() {
    try {
      if (user?.id) {
        const data = await getDinos(user.id)
        setDinos(data as Dino[])
      }
    } catch (err) {
      console.error('Dinozorlar yüklenemedi:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-20 w-96 h-96 bg-neon-cyan opacity-5 rounded-full blur-3xl"></div>
        </div>
        <p className="text-xl font-bold text-neon-cyan relative z-10">Yükleniyor...</p>
      </div>
    )
  }

  // Mode Seçim Ekranı
  if (mode === 'select-mode') {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 gap-6 relative overflow-hidden">
        {/* Arka plan blur */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 bg-neon-cyan opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-neon-purple opacity-5 rounded-full blur-3xl"></div>
        </div>

        <button
          onClick={onBack}
          className="absolute top-4 left-4 px-4 py-2 glass-dark neon-border-cyan rounded-lg font-bold text-neon-cyan hover:shadow-neon-cyan z-10 transition"
        >
          ← Geri
        </button>

        <div className="text-center mb-6 relative z-10">
          <div className="text-8xl mb-4 float-animation">🎲</div>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple mb-2">
            Masada Oyna
          </h1>
          <p className="text-lg text-neon-cyan/80">Oyun modunu seç</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 relative z-10 max-w-3xl">
          {/* Offline Mode */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setMode('offline')
              setSelectedDino(null)
            }}
            className="flex-1 p-8 glass-dark neon-border-cyan rounded-2xl text-center hover:shadow-neon-cyan transition"
          >
            <svg className="w-24 h-24 mx-auto mb-4 text-neon-cyan" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <h2 className="text-2xl font-black text-neon-cyan mb-2">OFFLINE</h2>
            <p className="text-sm text-neon-cyan/70">Kendi masanızda oynayın</p>
          </motion.button>

          {/* Duello Vs Mode */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setMode('duello-vs')
              setSelectedDino(null)
            }}
            className="flex-1 p-8 glass-dark neon-border-purple rounded-2xl text-center hover:shadow-neon-purple transition"
          >
            <svg className="w-24 h-24 mx-auto mb-4 text-neon-purple" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm6-6c1.66 0 2.99-1.34 2.99-3S16.66 2 15 2c-1.66 0-3 1.34-3 3s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
            <h2 className="text-2xl font-black text-neon-purple mb-2">DÜELLO VS</h2>
            <p className="text-sm text-neon-purple/70">Arkadaşınızla online oynayın</p>
          </motion.button>
        </div>
      </div>
    )
  }

  // Dinozor Seçim Ekranı
  if (!selectedDino && mode !== 'select-mode') {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 gap-4 relative overflow-hidden">
        {/* Arka plan blur */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 bg-neon-cyan opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-neon-purple opacity-5 rounded-full blur-3xl"></div>
        </div>

        <button
          onClick={() => {
            setMode('select-mode')
            setSelectedDino(null)
          }}
          className="absolute top-4 left-4 px-4 py-2 glass-dark neon-border-cyan rounded-lg font-bold text-neon-cyan hover:shadow-neon-cyan z-10 transition"
        >
          ← Geri
        </button>

        <div className="text-center mb-8 relative z-10">
          <div className="text-8xl mb-4 float-animation">🎲</div>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple mb-2">
            {mode === 'offline' ? 'Offline Oyna' : 'Düello Vs'}
          </h1>
          <p className="text-lg text-neon-cyan/80">Dinozorunu seç</p>
        </div>

        {dinos.length === 0 ? (
          <div className="text-center relative z-10">
            <p className="text-xl text-neon-cyan mb-4">Dinozor yok!</p>
            <button
              onClick={onBack}
              className="px-6 py-3 glass-dark neon-border-purple rounded-lg font-bold text-neon-purple hover:shadow-neon-purple"
            >
              Geri Dön
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl relative z-10">
            {dinos.map(dino => (
              <motion.button
                key={dino.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDino(dino)}
                className="p-6 glass-dark neon-border-cyan rounded-xl hover:shadow-neon-cyan transition"
              >
                <div className="text-5xl mb-3">🦖</div>
                <h2 className="text-2xl font-black text-neon-cyan mb-1">{dino.name}</h2>
                <p className="text-sm text-neon-cyan/80 font-bold mb-4">Lvl {dino.level}</p>
                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  <div className="glass border border-red-500/30 p-2 rounded text-red-400">❤️ {dino.maxHp}</div>
                  <div className="glass border border-orange-500/30 p-2 rounded text-orange-400">⚔️ {dino.atk}</div>
                  <div className="glass border border-blue-500/30 p-2 rounded text-blue-400">🛡️ {dino.def}</div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Savaş Ekranı
  if (mode === 'offline' && selectedDino) {
    return (
      <BattleTableModeV2
        dino={selectedDino}
        onBack={() => {
          setSelectedDino(null)
          setMode('select-mode')
          loadDinos()
        }}
        onRefresh={onRefresh}
      />
    )
  }

  if (mode === 'duello-vs' && selectedDino) {
    return (
      <DuelloVsMode
        selectedDino={selectedDino}
        onBack={() => {
          setSelectedDino(null)
          setMode('select-mode')
        }}
      />
    )
  }

  return null
}
