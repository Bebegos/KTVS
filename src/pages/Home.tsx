import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/auth-context'
import { getDinos, getUserCoins } from '../lib/supabase'
import { Dino } from '../game/types'
import { APP_VERSION } from '../config/version'
import { Adventure } from '../lib/adventures'
import DinoList from '../components/DinoList'
import DinoCreationFlow from '../components/DinoCreationFlow'
import BattleTable from '../components/BattleTable'
import BattleTableModeV2 from '../components/BattleTableModeV2'
import DuelloVsMode from '../components/DuelloVsMode'
import MatchLog from '../components/MatchLog'
import AdventureSelectScreen from '../components/AdventureSelectScreen'
import AdventureBattleScreen from '../components/AdventureBattleScreen'
import DinoCoinsDisplay from '../components/DinoCoinsDisplay'

type PageName = 'home' | 'dino-list' | 'match-log' | 'dino-form' | 'offline-select' | 'offline-battle' | 'duello-vs-select' | 'duello-vs' | 'adventure-select' | 'adventure-battle'

export default function Home() {
  const { user, signOut } = useAuth()
  const [page, setPage] = useState<PageName>('home')
  const [dinos, setDinos] = useState<Dino[]>([])
  const [selectedOfflineDino, setSelectedOfflineDino] = useState<Dino | null>(null)
  const [selectedDuelloDino, setSelectedDuelloDino] = useState<Dino | null>(null)
  const [selectedAdventureDino, setSelectedAdventureDino] = useState<Dino | null>(null)
  const [selectedAdventure, setSelectedAdventure] = useState<Adventure | null>(null)
  const [userCoins, setUserCoins] = useState(0)
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
        const dinosData = await getDinos(user.id)
        setDinos(dinosData as Dino[])

        const coinsData = await getUserCoins(user.id)
        setUserCoins(coinsData)
      }
    } catch (err) {
      console.error('Veri yüklenemedi:', err)
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
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-center">
          <div className="text-6xl mb-4 float-animation">🦖</div>
          <p className="text-xl font-bold hs-text-gold">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Ana Menü
  if (page === 'home') {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-start md:justify-center p-4 gap-6 relative overflow-y-auto">
        {/* Arka plan efekti - sıcak meşale ışıltıları */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-gem-attack opacity-10 rounded-full blur-3xl"></div>
        </div>

        {/* Versiyon Göstergesi */}
        <div className="absolute top-4 left-4 z-10">
          <div className="glass px-3 py-1 rounded-lg">
            <p className="text-xs font-bold text-neon-cyan/70">v{APP_VERSION}</p>
          </div>
        </div>

        {/* Üst Bar - Hearthstone Tarzı */}
        <div className="absolute top-4 right-4 flex gap-3 items-center z-10">
          {/* DinoCoin Display */}
          <DinoCoinsDisplay coins={userCoins} size="md" />

          {/* User Info */}
          <div className="glass-dark px-4 py-2 rounded-lg border border-neon-cyan/50 backdrop-blur-md">
            <p className="text-sm font-bold text-neon-cyan">👤 {user?.username || user?.email?.split('@')[0]}</p>
          </div>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSignOut}
            className="px-4 py-2 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg font-bold text-sm backdrop-blur-md border border-red-500/50 transition shadow-lg"
          >
            🚪 Çıkış
          </motion.button>
        </div>

        {/* Başlık - md+ ekranlarda mt-0, sm ekranlarda mt-8 (top bar'dan uzak olması için) */}
        <div className="text-center mb-8 z-10 mt-8 md:mt-0">
          <div className="text-8xl mb-4 float-animation">🦖</div>
          <h1 className="text-6xl font-black hs-text-gold mb-2 font-display tracking-wide">
            Dino-RP
          </h1>
          <p className="text-lg hs-text-bronze opacity-90">Dinozor Savaş ve Gelişim Oyunu</p>
        </div>

        {/* Butonlar */}
        <div className="w-full max-w-sm flex flex-col gap-3 z-10 pb-8">
          {/* Düello VS - En Üstte */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setPage('duello-vs-select')}
            className="hs-button w-full px-6 py-5 rounded-xl text-xl"
          >
            ⚔️ DÜELLO VS
          </motion.button>

          {/* Masada Oyna - Offline Mode */}
          <button
            onClick={() => {
              if (dinos.length > 0) {
                setSelectedOfflineDino(dinos[0])
                setPage('offline-battle')
              } else {
                setPage('offline-select')
              }
            }}
            className="hs-button w-full px-6 py-4 rounded-xl text-lg"
          >
            🎲 Masada Oyna
          </button>

          {/* Maceralar - Adventure Mode */}
          <button
            onClick={() => setPage('adventure-select')}
            className="hs-button w-full px-6 py-4 rounded-xl text-lg"
          >
            🗺️ Maceralar
          </button>

          <button
            onClick={() => setPage('dino-list')}
            className="hs-button w-full px-6 py-4 rounded-xl text-lg"
          >
            🦖 Dinozorlarım
          </button>

          <button
            onClick={() => setPage('match-log')}
            className="hs-button w-full px-6 py-4 rounded-xl text-lg"
          >
            📋 Maç Günlüğü
          </button>

          <button
            onClick={() => setPage('dino-form')}
            className="hs-button w-full px-6 py-4 rounded-xl text-lg"
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
      <DinoCreationFlow
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

  if (page === 'duello-vs-select') {
    if (loading) {
      return (
        <div className="flex items-center justify-center w-full h-screen relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-20 w-96 h-96 bg-neon-purple opacity-5 rounded-full blur-3xl"></div>
          </div>
          <p className="text-xl font-bold text-neon-purple relative z-10">Dinozorlar yükleniyor...</p>
        </div>
      )
    }

    return (
      <DuelloVsSelectDino
        dinos={dinos}
        onSelect={(dino) => {
          setSelectedDuelloDino(dino)
          setPage('duello-vs')
        }}
        onBack={() => setPage('home')}
      />
    )
  }

  if (page === 'duello-vs' && selectedDuelloDino) {
    return (
      <DuelloVsMode
        selectedDino={selectedDuelloDino}
        onBack={() => {
          setSelectedDuelloDino(null)
          setPage('home')
        }}
      />
    )
  }

  if (page === 'offline-select') {
    return (
      <OfflineSelectDino
        dinos={dinos}
        onSelect={(dino) => {
          setSelectedOfflineDino(dino)
          setPage('offline-battle')
        }}
        onBack={() => setPage('home')}
      />
    )
  }

  if (page === 'offline-battle' && selectedOfflineDino) {
    return (
      <BattleTableModeV2
        dino={selectedOfflineDino}
        onBack={() => {
          setSelectedOfflineDino(null)
          setPage('home')
          loadDinos()
        }}
        onRefresh={(newDinos) => {
          setDinos(newDinos)
          setSelectedOfflineDino(null)
          setPage('home')
        }}
      />
    )
  }

  if (page === 'adventure-select') {
    return (
      <AdventureSelectScreen
        dinos={dinos}
        onStartAdventure={(dino, adventure) => {
          setSelectedAdventureDino(dino)
          setSelectedAdventure(adventure)
          setPage('adventure-battle')
        }}
        onBack={() => setPage('home')}
      />
    )
  }

  if (page === 'adventure-battle' && selectedAdventureDino && selectedAdventure) {
    return (
      <AdventureBattleScreen
        playerDino={selectedAdventureDino}
        adventure={selectedAdventure}
        onComplete={(won, xpGained) => {
          setSelectedAdventureDino(null)
          setSelectedAdventure(null)
          setPage('adventure-select')
          loadDinos()
        }}
        onBack={() => {
          setSelectedAdventureDino(null)
          setSelectedAdventure(null)
          setPage('home')
        }}
      />
    )
  }

  return null
}

function DuelloVsSelectDino({
  dinos,
  onSelect,
  onBack,
}: {
  dinos: Dino[]
  onSelect: (dino: Dino) => void
  onBack: () => void
}) {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start md:justify-center p-4 gap-4 relative overflow-y-auto">
      {/* Arka plan blur */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-neon-purple opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-neon-cyan opacity-5 rounded-full blur-3xl"></div>
      </div>

      <button
        onClick={onBack}
        className="absolute top-4 left-4 px-4 py-2 glass-dark neon-border-cyan rounded-lg font-bold text-neon-cyan hover:shadow-neon-cyan z-10 transition"
      >
        ← Geri
      </button>

      <div className="text-center mb-8 relative z-10 mt-8 md:mt-0">
        <div className="text-8xl mb-4 float-animation">⚔️</div>
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan mb-2">
          Düello VS
        </h1>
        <p className="text-lg text-neon-purple/80">Dinozorunu seç</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl relative z-10 pb-8">
          {dinos.map(dino => (
            <motion.button
              key={dino.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(dino)}
              className="p-6 glass-dark neon-border-purple rounded-xl hover:shadow-neon-purple transition"
            >
              <div className="text-5xl mb-3">🦖</div>
              <h2 className="text-2xl font-black text-neon-purple mb-1">{dino.name}</h2>
              <p className="text-sm text-neon-purple/80 font-bold mb-4">Lvl {dino.level ?? 1}</p>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                <div className="glass border border-red-500/30 p-2 rounded text-red-400">❤️ {dino.maxHp ?? 30}</div>
                <div className="glass border border-orange-500/30 p-2 rounded text-orange-400">⚔️ {dino.atk ?? 5}</div>
                <div className="glass border border-blue-500/30 p-2 rounded text-blue-400">🛡️ {dino.def ?? 5}</div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}

function OfflineSelectDino({
  dinos,
  onSelect,
  onBack,
}: {
  dinos: Dino[]
  onSelect: (dino: Dino) => void
  onBack: () => void
}) {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start md:justify-center p-4 gap-4 relative overflow-y-auto">
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

      <div className="text-center mb-8 relative z-10 mt-8 md:mt-0">
        <div className="text-8xl mb-4 float-animation">🎲</div>
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple mb-2">
          Masada Oyna
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl relative z-10 pb-8">
          {dinos.map(dino => (
            <motion.button
              key={dino.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(dino)}
              className="p-6 glass-dark neon-border-cyan rounded-xl hover:shadow-neon-cyan transition"
            >
              <div className="text-5xl mb-3">🦖</div>
              <h2 className="text-2xl font-black text-neon-cyan mb-1">{dino.name}</h2>
              <p className="text-sm text-neon-cyan/80 font-bold mb-4">Lvl {dino.level ?? 1}</p>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                <div className="glass border border-red-500/30 p-2 rounded text-red-400">❤️ {dino.maxHp ?? 30}</div>
                <div className="glass border border-orange-500/30 p-2 rounded text-orange-400">⚔️ {dino.atk ?? 5}</div>
                <div className="glass border border-blue-500/30 p-2 rounded text-blue-400">🛡️ {dino.def ?? 5}</div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}

