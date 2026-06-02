import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/auth-context'
import { getDinos, getUserCoins } from '../lib/supabase'
import { Dino } from '../game/types'
import { APP_VERSION } from '../config/version'
import { Adventure } from '../lib/adventures'
import DinoList from '../components/DinoList'
import DinoCard from '../components/DinoCard'
import DinoCreationFlow from '../components/DinoCreationFlow'
import DinoDetailPage from '../components/DinoDetailPage'
import BattleTable from '../components/BattleTable'
import BattleTableModeV2 from '../components/BattleTableModeV2'
import DuelloVsMode from '../components/DuelloVsMode'
import MatchLog from '../components/MatchLog'
import AdventureSelectScreen from '../components/AdventureSelectScreen'
import AdventureBattleScreen from '../components/AdventureBattleScreen'
import DinoCoinsDisplay from '../components/DinoCoinsDisplay'
import SiteLogo from '../components/SiteLogo'
import PremiumButton from '../components/PremiumButton'
import { homeAssets } from '../lib/gameAssets'

type PageName = 'home' | 'dino-list' | 'dino-detail' | 'match-log' | 'dino-form' | 'offline-select' | 'offline-battle' | 'duello-vs-select' | 'duello-vs' | 'adventure-select' | 'adventure-battle'

export default function Home() {
  const { user, signOut } = useAuth()
  const [page, setPage] = useState<PageName>('home')
  const [dinos, setDinos] = useState<Dino[]>([])
  const [selectedDetailDino, setSelectedDetailDino] = useState<Dino | null>(null)
  const [selectedOfflineDino, setSelectedOfflineDino] = useState<Dino | null>(null)
  const [selectedDuelloDino, setSelectedDuelloDino] = useState<Dino | null>(null)
  const [selectedAdventureDino, setSelectedAdventureDino] = useState<Dino | null>(null)
  const [selectedAdventure, setSelectedAdventure] = useState<Adventure | null>(null)
  const [userCoins, setUserCoins] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

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
    const menuItems = [
      { icon: homeAssets.menu.duel, label: 'DÜELLO VS', onClick: () => setPage('duello-vs-select') },
      {
        icon: homeAssets.menu.offline,
        label: 'Masada Oyna',
        onClick: () => {
          if (dinos.length > 0) {
            setSelectedOfflineDino(dinos[0])
            setPage('offline-battle')
          } else {
            setPage('offline-select')
          }
        },
      },
      { icon: homeAssets.menu.adventure, label: 'Maceralar', onClick: () => setPage('adventure-select') },
      { icon: homeAssets.menu.mydinos, label: 'Dinozorlarım', onClick: () => setPage('dino-list') },
      { icon: homeAssets.menu.matchlog, label: 'Maç Günlüğü', onClick: () => setPage('match-log') },
      { icon: homeAssets.menu.newdino, label: 'Yeni Dinozor', onClick: () => setPage('dino-form') },
    ]

    return (
      <div
        className="w-full min-h-screen flex flex-col items-center justify-start md:justify-center p-4 gap-3 relative overflow-y-auto"
        style={{
          backgroundImage: `url('${homeAssets.background}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#2a1c0e',
        }}
      >
        {/* Üst Bar - akışta, taşmaz; mobilde sarar */}
        <div className="w-full flex items-center justify-between flex-wrap gap-2 z-20">
          <div className="hs-wood-frame px-3 py-1 rounded-lg">
            <p className="text-xs font-bold text-gold-light">v{APP_VERSION}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* DinoCoin Display */}
            <DinoCoinsDisplay coins={userCoins} size="sm" />

            {/* User Info */}
            <div className="hs-wood-frame px-3 py-2 rounded-lg">
              <p className="text-sm font-bold text-gold-light">👤 {user?.username || user?.email?.split('@')[0]}</p>
            </div>

            {/* Settings (gear) with logout popover */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setShowSettings((s) => !s)}
                title="Ayarlar"
                className="w-10 h-10"
              >
                <img src={homeAssets.menu.settings} alt="Ayarlar" className="w-full h-full object-contain" draggable={false} />
              </motion.button>

              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 z-30 hs-wood-frame rounded-lg p-2"
                >
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-black/20 transition-colors w-full"
                  >
                    <img src={homeAssets.menu.logout} alt="" className="w-6 h-6 object-contain" draggable={false} />
                    <span className="text-sm font-bold text-gold-light whitespace-nowrap">Çıkış</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Başlık - logo + slogan */}
        <div className="text-center z-10">
          <div className="flex justify-center">
            <SiteLogo size={180} />
          </div>
          <p className="text-base hs-text-bronze opacity-90 -mt-2">Dinozor Savaş ve Gelişim Oyunu</p>
        </div>

        {/* Menü butonları — premium plaka + madalyon ikon, merkezi disk üzerinde */}
        <div className="w-full max-w-xs flex flex-col items-center gap-2 z-10 pb-8">
          {menuItems.map((item) => (
            <PremiumButton
              key={item.label}
              onClick={item.onClick}
              className="w-full"
              contentClassName="gap-2 text-sm sm:text-base"
            >
              <img src={item.icon} alt="" className="w-7 h-7 sm:w-8 sm:h-8 object-contain flex-shrink-0" draggable={false} />
              {item.label}
            </PremiumButton>
          ))}
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
        onViewDetail={(dino) => {
          setSelectedDetailDino(dino)
          setPage('dino-detail')
        }}
      />
    )
  }

  if (page === 'dino-detail' && selectedDetailDino) {
    return (
      <DinoDetailPage
        dino={selectedDetailDino}
        onBack={() => {
          setSelectedDetailDino(null)
          setPage('dino-list')
        }}
        onRefresh={(updatedDinos) => {
          // Merge updated dinos with existing list
          const updatedIds = new Set(updatedDinos.map(d => d.id))
          const merged = [
            ...dinos.filter(d => !updatedIds.has(d.id)),
            ...updatedDinos
          ]
          setDinos(merged)
          // Update selected dino if it was updated
          const updated = updatedDinos.find(d => d.id === selectedDetailDino.id)
          if (updated) setSelectedDetailDino(updated)
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
        className="hs-btn absolute top-4 left-4 z-10"
      >
        <span>Geri</span>
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
            className="hs-btn hs-btn-purple hs-btn-lg"
          >
            <span>Geri Dön</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-6xl relative z-10 pb-8">
          {dinos.map(dino => (
            <DinoCard
              key={dino.id}
              dino={dino}
              mode="selection"
              onClick={() => onSelect(dino)}
            />
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
        className="hs-btn absolute top-4 left-4 z-10"
      >
        <span>Geri</span>
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
            className="hs-btn hs-btn-purple hs-btn-lg"
          >
            <span>Geri Dön</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-6xl relative z-10 pb-8">
          {dinos.map(dino => (
            <DinoCard
              key={dino.id}
              dino={dino}
              mode="selection"
              onClick={() => onSelect(dino)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

