import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth-context'
import { getDinos } from '../lib/supabase'
import { Dino } from '../game/types'
import BattleTableModeV2 from './BattleTableModeV2'

interface BattleTableProps {
  onBack: () => void
  onRefresh: (dinos: Dino[]) => void
}

export default function BattleTable({ onBack, onRefresh }: BattleTableProps) {
  const { user } = useAuth()
  const [dinos, setDinos] = useState<Dino[]>([])
  const [selectedDino, setSelectedDino] = useState<Dino | null>(null)
  const [loading, setLoading] = useState(true)

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

  // Dinozor Seçim Ekranı
  if (!selectedDino) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 gap-4 relative overflow-hidden">
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

        <div className="text-center mb-8 relative z-10">
          <div className="text-8xl mb-4 float-animation">🎲</div>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple mb-2">
            Masada Oyna
          </h1>
          <p className="text-lg text-neon-cyan/80">Kendi dinozorunu seç</p>
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
              <button
                key={dino.id}
                onClick={() => setSelectedDino(dino)}
                className="p-6 glass-dark neon-border-cyan rounded-xl hover:shadow-neon-cyan active:scale-95 transition"
              >
                <div className="text-5xl mb-3">🦖</div>
                <h2 className="text-2xl font-black text-neon-cyan mb-1">{dino.name}</h2>
                <p className="text-sm text-neon-cyan/80 font-bold mb-4">Lvl {dino.level}</p>
                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  <div className="glass border border-red-500/30 p-2 rounded text-red-400">❤️ {dino.maxHp}</div>
                  <div className="glass border border-orange-500/30 p-2 rounded text-orange-400">⚔️ {dino.atk}</div>
                  <div className="glass border border-blue-500/30 p-2 rounded text-blue-400">🛡️ {dino.def}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Savaş Ekranı
  return (
    <BattleTableModeV2
      dino={selectedDino}
      onBack={() => {
        setSelectedDino(null)
        loadDinos()
      }}
      onRefresh={onRefresh}
    />
  )
}
