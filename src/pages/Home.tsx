import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth-context'
import { getDinos } from '../lib/supabase'
import { Dino } from '../game/types'
import DinoList from '../components/DinoList'
import DinoForm from '../components/DinoForm'
import BattleScreen from '../components/BattleScreen'
import MatchLog from '../components/MatchLog'

type PageName = 'home' | 'dino-list' | 'battle' | 'match-log' | 'dino-form' | 'battle-select'

export default function Home() {
  const { user, signOut } = useAuth()
  const [page, setPage] = useState<PageName>('home')
  const [dinos, setDinos] = useState<Dino[]>([])
  const [selectedDino1, setSelectedDino1] = useState<Dino | undefined>()
  const [selectedDino2, setSelectedDino2] = useState<Dino | undefined>()
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

  async function handleSignOut() {
    try {
      await signOut()
    } catch (err) {
      console.error('Çıkış hatası:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-dino-100 to-blue-100">
        <div className="text-center">
          <div className="text-6xl mb-4">🦖</div>
          <p className="text-xl font-bold text-dino-700">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Ana Menü
  if (page === 'home') {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 gap-4 bg-gradient-to-br from-dino-100 via-purple-100 to-blue-100">
        {/* Üst Bar */}
        <div className="absolute top-4 right-4 flex gap-2 items-center">
          <p className="text-sm font-bold text-dino-700">👤 {user?.username || user?.email}</p>
          <button
            onClick={handleSignOut}
            className="px-3 py-2 bg-red-500 text-white rounded font-bold text-sm hover:bg-red-600"
          >
            🚪 Çıkış
          </button>
        </div>

        {/* Başlık */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-2">🦖</div>
          <h1 className="text-4xl font-bold text-dino-700">Dino-RP</h1>
          <p className="text-lg text-dino-600 mt-2">Dinozor Savaş ve Gelişim Oyunu</p>
        </div>

        {/* Butonlar */}
        <button
          onClick={() => setPage('dino-list')}
          className="w-full max-w-sm px-6 py-4 bg-gradient-to-br from-dino-400 to-dino-600 text-white rounded-xl font-bold text-lg hover:shadow-lg active:scale-95 transition shadow-md"
        >
          🦖 Dinozorlarım
        </button>

        <button
          onClick={() => setPage('battle-select')}
          className="w-full max-w-sm px-6 py-4 bg-gradient-to-br from-red-400 to-red-600 text-white rounded-xl font-bold text-lg hover:shadow-lg active:scale-95 transition shadow-md"
        >
          ⚔️ Savaş
        </button>

        <button
          onClick={() => setPage('match-log')}
          className="w-full max-w-sm px-6 py-4 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-xl font-bold text-lg hover:shadow-lg active:scale-95 transition shadow-md"
        >
          📋 Maç Günlüğü
        </button>

        <button
          onClick={() => setPage('dino-form')}
          className="w-full max-w-sm px-6 py-4 bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-lg active:scale-95 transition shadow-md"
        >
          ✨ Yeni Dinozor
        </button>
      </div>
    )
  }

  if (page === 'dino-list') {
    return (
      <DinoList
        dinos={dinos}
        onBack={() => setPage('home')}
        onRefresh={(newDinos) => {
          setDinos(newDinos)
          setPage('home')
        }}
      />
    )
  }

  if (page === 'dino-form') {
    return (
      <DinoForm
        onBack={() => setPage('home')}
        onRefresh={(newDinos) => {
          setDinos(newDinos)
          setPage('home')
        }}
      />
    )
  }

  if (page === 'match-log') {
    return <MatchLog onBack={() => setPage('home')} />
  }

  if (page === 'battle-select') {
    return (
      <BattleSelect
        dinos={dinos}
        onSelectBattle={(d1, d2) => {
          setSelectedDino1(d1)
          setSelectedDino2(d2)
          setPage('battle')
        }}
        onBack={() => setPage('home')}
      />
    )
  }

  if (page === 'battle' && selectedDino1 && selectedDino2) {
    return (
      <BattleScreen
        dino1={selectedDino1}
        dino2={selectedDino2}
        onBack={() => setPage('home')}
        onRefresh={(newDinos) => {
          setDinos(newDinos)
          setPage('home')
        }}
      />
    )
  }

  return null
}

function BattleSelect({
  dinos,
  onSelectBattle,
  onBack,
}: {
  dinos: Dino[]
  onSelectBattle: (d1: Dino, d2: Dino) => void
  onBack: () => void
}) {
  const [selected1, setSelected1] = useState<Dino | null>(null)
  const [selected2, setSelected2] = useState<Dino | null>(null)

  function handleStart() {
    if (selected1 && selected2 && selected1.id !== selected2.id) {
      onSelectBattle(selected1, selected2)
    }
  }

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto bg-gradient-to-br from-dino-100 to-blue-100">
      <button
        onClick={onBack}
        className="self-start px-4 py-2 bg-gray-500 text-white rounded-lg font-bold"
      >
        ← Geri
      </button>

      <h1 className="text-3xl font-bold text-dino-700 text-center">⚔️ Savaş Seç</h1>

      {dinos.length < 2 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-dino-600">Savaş için en az 2 dinozor gerek!</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <p className="font-bold text-lg text-dino-700">1. Dinozor:</p>
            <div className="flex flex-col gap-2">
              {dinos.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelected1(d)}
                  className={`p-3 rounded text-left font-bold transition ${
                    selected1?.id === d.id
                      ? 'bg-dino-500 text-white scale-105'
                      : 'bg-white border-2 border-dino-300 text-dino-700 hover:border-dino-500'
                  }`}
                >
                  🦖 {d.name} Lvl {d.level}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <p className="font-bold text-lg text-dino-700">2. Dinozor:</p>
            <div className="flex flex-col gap-2">
              {dinos.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelected2(d)}
                  className={`p-3 rounded text-left font-bold transition ${
                    selected2?.id === d.id
                      ? 'bg-red-500 text-white scale-105'
                      : 'bg-white border-2 border-red-300 text-red-700 hover:border-red-500'
                  }`}
                >
                  🦖 {d.name} Lvl {d.level}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleStart}
        disabled={!selected1 || !selected2 || selected1.id === selected2.id}
        className="w-full px-6 py-4 bg-gradient-to-br from-red-500 to-red-700 text-white rounded-lg font-bold text-lg hover:shadow-lg disabled:bg-gray-400 active:scale-95 transition"
      >
        ⚔️ Savaşı Başlat
      </button>
    </div>
  )
}
