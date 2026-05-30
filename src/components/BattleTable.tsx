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
      <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-dino-100 to-blue-100">
        <p className="text-xl font-bold text-dino-700">Yükleniyor...</p>
      </div>
    )
  }

  // Dinozor Seçim Ekranı
  if (!selectedDino) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 gap-4 bg-gradient-to-br from-dino-100 via-purple-100 to-blue-100">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 px-4 py-2 bg-gray-500 text-white rounded-lg font-bold"
        >
          ← Geri
        </button>

        <div className="text-center mb-8">
          <div className="text-8xl mb-2">🎲</div>
          <h1 className="text-4xl font-black text-dino-700">Masada Oyna</h1>
          <p className="text-lg text-dino-600 mt-2">Kendi dinozorunu seç</p>
        </div>

        {dinos.length === 0 ? (
          <div className="text-center">
            <p className="text-xl text-dino-600 mb-4">Dinozor yok!</p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg font-bold"
            >
              Geri Dön
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            {dinos.map(dino => (
              <button
                key={dino.id}
                onClick={() => setSelectedDino(dino)}
                className="p-6 bg-white border-4 border-dino-400 rounded-xl hover:border-dino-600 hover:shadow-lg active:scale-95 transition"
              >
                <div className="text-5xl mb-2">🦖</div>
                <h2 className="text-2xl font-black text-dino-700 mb-1">{dino.name}</h2>
                <p className="text-sm text-dino-600 font-bold">Lvl {dino.level}</p>
                <div className="grid grid-cols-3 gap-2 mt-3 text-xs font-bold">
                  <div className="bg-red-100 p-2 rounded">❤️ {dino.maxHp}</div>
                  <div className="bg-orange-100 p-2 rounded">⚔️ {dino.atk}</div>
                  <div className="bg-blue-100 p-2 rounded">🛡️ {dino.def}</div>
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
