import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth-context'
import { getDinos } from '../lib/supabase'
import { Dino } from '../game/types'
import DinoList from '../components/DinoList'
import DinoForm from '../components/DinoForm'
import BattleScreenNew from '../components/BattleScreenNew'
import BattleTable from '../components/BattleTable'
import MatchLog from '../components/MatchLog'

type PageName = 'home' | 'dino-list' | 'battle' | 'battle-table' | 'match-log' | 'dino-form' | 'battle-select'

export default function Home() {
  const { user, signOut } = useAuth()
  const [page, setPage] = useState<PageName>('home')
  const [dinos, setDinos] = useState<Dino[]>([])
  const [selectedDino1, setSelectedDino1] = useState<Dino | undefined>()
  const [selectedDino2, setSelectedDino2] = useState<Dino | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // User değişince (login/logout) dinozorları yeniden yükle
    if (user?.id) {
      loadDinos()
    } else {
      setDinos([])
      setLoading(false)
    }
  }, [user?.id])

  async function loadDinos() {
    setLoading(true)
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
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 gap-6 relative overflow-hidden">
        {/* Arka plan efekti */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-neon-cyan opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-neon-purple opacity-5 rounded-full blur-3xl"></div>
        </div>

        {/* Üst Bar */}
        <div className="absolute top-4 right-4 flex gap-3 items-center z-10">
          <div className="glass px-4 py-2 rounded-lg">
            <p className="text-sm font-bold text-neon-cyan">👤 {user?.username || user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg font-bold text-sm backdrop-blur-md border border-red-500/30 transition"
          >
            🚪 Çıkış
          </button>
        </div>

        {/* Başlık */}
        <div className="text-center mb-8 z-10">
          <div className="text-8xl mb-4 float-animation">🦖</div>
          <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink mb-2">
            Dino-RP
          </h1>
          <p className="text-lg text-neon-cyan opacity-80">Dinozor Savaş ve Gelişim Oyunu</p>
        </div>

        {/* Butonlar */}
        <div className="w-full max-w-sm flex flex-col gap-4 z-10">
          <button
            onClick={() => setPage('dino-list')}
            className="w-full px-6 py-4 glass-dark neon-border-cyan rounded-xl font-bold text-lg text-neon-cyan hover:shadow-neon-cyan active:scale-95 transition duration-300"
          >
            🦖 Dinozorlarım
          </button>

          <button
            onClick={() => setPage('battle-select')}
            className="w-full px-6 py-4 glass-dark neon-border-pink rounded-xl font-bold text-lg text-pink-400 hover:shadow-neon-pink active:scale-95 transition duration-300"
          >
            ⚔️ Savaş (2 vs 2)
          </button>

          <button
            onClick={() => setPage('battle-table')}
            className="w-full px-6 py-4 glass-dark neon-border-purple rounded-xl font-bold text-lg text-neon-purple hover:shadow-neon-purple active:scale-95 transition duration-300"
          >
            🎲 Masada Oyna
          </button>

          <button
            onClick={() => setPage('match-log')}
            className="w-full px-6 py-4 glass-dark border border-blue-500/30 rounded-xl font-bold text-lg text-blue-400 hover:shadow-blue-500/50 active:scale-95 transition duration-300"
          >
            📋 Maç Günlüğü
          </button>

          <button
            onClick={() => setPage('dino-form')}
            className="w-full px-6 py-4 glass-dark neon-border-cyan rounded-xl font-bold text-lg text-neon-cyan hover:shadow-neon-cyan active:scale-95 transition duration-300"
          >
            ✨ Yeni Dinozor
          </button>
        </div>
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

  if (page === 'battle-table') {
    return (
      <BattleTable
        onBack={() => setPage('home')}
        onRefresh={(newDinos) => {
          setDinos(newDinos)
          setPage('home')
        }}
      />
    )
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
      <BattleScreenNew
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
    <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto relative">
      {/* Arka plan efekti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-96 h-96 bg-neon-pink opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <button
          onClick={onBack}
          className="px-4 py-2 glass-dark neon-border-cyan rounded-lg font-bold text-neon-cyan hover:shadow-neon-cyan transition"
        >
          ← Geri
        </button>

        <h1 className="text-4xl font-black text-center mt-4 text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-purple">⚔️ Savaş Seç</h1>

        {dinos.length < 2 ? (
          <div className="flex-1 flex items-center justify-center mt-8">
            <p className="text-xl text-neon-cyan">Savaş için en az 2 dinozor gerek!</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row gap-4 mt-6">
            <div className="flex-1 flex flex-col gap-3">
              <p className="font-bold text-lg text-neon-cyan">1. Dinozor:</p>
              <div className="flex flex-col gap-2">
                {dinos.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setSelected1(d)}
                    className={`p-3 rounded-lg text-left font-bold transition ${
                      selected1?.id === d.id
                        ? 'glass-dark neon-border-cyan text-neon-cyan scale-105'
                        : 'glass-dark border border-cyan-500/20 text-neon-cyan hover:border-cyan-500/50'
                    }`}
                  >
                    🦖 {d.name} Lvl {d.level}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-3">
              <p className="font-bold text-lg text-neon-pink">2. Dinozor:</p>
              <div className="flex flex-col gap-2">
                {dinos.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setSelected2(d)}
                    className={`p-3 rounded-lg text-left font-bold transition ${
                      selected2?.id === d.id
                        ? 'glass-dark neon-border-pink text-neon-pink scale-105'
                        : 'glass-dark border border-pink-500/20 text-neon-pink hover:border-pink-500/50'
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
          className="w-full mt-6 px-6 py-4 glass-dark neon-border-pink rounded-lg font-bold text-lg text-neon-pink hover:shadow-neon-pink disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition"
        >
          ⚔️ Savaşı Başlat
        </button>
      </div>
    </div>
  )
}
