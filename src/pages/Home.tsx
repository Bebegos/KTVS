import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/auth-context'
import { getDinos, getUserCoins } from '../lib/supabase'
import { Dino } from '../game/types'
import { APP_VERSION } from '../config/version'
import { Adventure } from '../lib/adventures'
import DinoList from '../components/DinoList'
import DinoCreationFlow from '../components/DinoCreationFlow'
import DinoDetailPage from '../components/DinoDetailPage'
import BattleTableModeV2 from '../components/BattleTableModeV2'
import DuelloVsMode from '../components/DuelloVsMode'
import MatchLog from '../components/MatchLog'
import AdventureSelectScreen from '../components/AdventureSelectScreen'
import AdventureBattleScreen from '../components/AdventureBattleScreen'
import DinoCoinsDisplay from '../components/DinoCoinsDisplay'
import PremiumButton from '../components/PremiumButton'
import DinoCarousel from '../components/DinoCarousel'
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
    const mainItems = [
      { icon: homeAssets.menu.duel, label: 'DÜELLO VS', onClick: () => setPage('duello-vs-select') },
      {
        icon: homeAssets.menu.offline,
        label: 'MASADA OYNA',
        onClick: () => {
          if (dinos.length > 0) {
            setSelectedOfflineDino(dinos[0])
            setPage('offline-battle')
          } else {
            setPage('offline-select')
          }
        },
      },
      { icon: homeAssets.menu.adventure, label: 'MACERALAR', onClick: () => setPage('adventure-select') },
    ]
    const secondaryItems = [
      { icon: homeAssets.menu.mydinos, label: 'Dinozorlarım', onClick: () => setPage('dino-list') },
      { icon: homeAssets.menu.matchlog, label: 'Maç Günlüğü', onClick: () => setPage('match-log') },
      { icon: homeAssets.menu.newdino, label: 'Yeni Dinozor', onClick: () => setPage('dino-form') },
    ]

    return (
      <div
        className="w-full min-h-screen flex flex-col items-center justify-center p-4 relative overflow-y-auto"
        style={{
          backgroundImage: `url('${homeAssets.background}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#2a1c0e',
        }}
      >
        {/* Top bar — pinned to the top of the screen */}
        <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between gap-2 px-3 py-2 flex-wrap">
          <div
            className="rounded-full px-3 h-8 flex items-center"
            style={{ background: 'linear-gradient(180deg,#3a2a16,#241608)', border: '2px solid #d4af37' }}
          >
            <p className="text-xs font-bold text-amber-200">v{APP_VERSION}</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-end">
            <DinoCoinsDisplay coins={userCoins} size="md" />

            {/* User card */}
            <div
              className="relative inline-flex items-center rounded-full h-10 sm:h-11 pl-10 sm:pl-11 pr-4"
              style={{
                background: 'linear-gradient(180deg, #efe1c2 0%, #d6c49e 100%)',
                border: '2px solid #b8860b',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.45), 0 2px 5px rgba(0,0,0,0.5)',
              }}
            >
              <span
                className="absolute -left-1 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base"
                style={{ background: 'radial-gradient(circle at 35% 30%, #5a4326, #2a1c0e)', border: '2px solid #d4af37', boxShadow: '0 2px 4px rgba(0,0,0,0.6)' }}
              >
                👤
              </span>
              <p className="text-sm font-black text-amber-950 max-w-[8rem] truncate">
                {user?.username || user?.email?.split('@')[0]}
              </p>
            </div>

            {/* Settings (gear) with logout popover */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setShowSettings((s) => !s)}
                title="Ayarlar"
                className="w-14 h-14 lg:w-24 xl:w-28"
              >
                <img src={homeAssets.menu.settings} alt="Ayarlar" className="w-full h-full object-contain drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)]" draggable={false} />
              </motion.button>

              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 z-30 rounded-lg p-2"
                  style={{ background: 'linear-gradient(180deg,#3a2a16,#241608)', border: '2px solid #d4af37' }}
                >
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-black/30 transition-colors w-full"
                  >
                    <img src={homeAssets.menu.logout} alt="" className="w-7 h-7 object-contain" draggable={false} />
                    <span className="text-sm font-bold text-amber-200 whitespace-nowrap">Çıkış</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Main buttons — centered on the disc (larger on big screens) */}
        <div className="w-full max-w-[15rem] sm:max-w-[17rem] lg:max-w-[22rem] xl:max-w-[26rem] flex flex-col items-center gap-2 lg:gap-3 z-10 mt-14">
          {mainItems.map((item) => (
            <PremiumButton
              key={item.label}
              onClick={item.onClick}
              iconSrc={item.icon}
              className="w-full"
              contentClassName="text-sm sm:text-base lg:text-lg"
            >
              {item.label}
            </PremiumButton>
          ))}

          {/* Secondary — stacked under the main buttons on mobile */}
          <div className="w-[86%] flex flex-col items-center gap-1.5 mt-1 lg:hidden">
            {secondaryItems.map((item) => (
              <PremiumButton
                key={item.label}
                onClick={item.onClick}
                iconSrc={item.icon}
                className="w-full"
                contentClassName="text-[11px] sm:text-xs"
              >
                {item.label}
              </PremiumButton>
            ))}
          </div>
        </div>

        {/* Secondary — left column on desktop */}
        <div className="hidden lg:flex flex-col gap-2.5 absolute left-6 xl:left-10 top-1/2 -translate-y-1/2 w-[15rem] xl:w-[17rem] z-10">
          {secondaryItems.map((item) => (
            <PremiumButton
              key={item.label}
              onClick={item.onClick}
              iconSrc={item.icon}
              className="w-full"
              contentClassName="text-xs xl:text-sm"
            >
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
    <div className="w-full min-h-screen flex flex-col items-center justify-start md:justify-center p-4 gap-4 relative overflow-y-auto" style={{ backgroundImage: `url('${homeAssets.background}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#2a1c0e' }}>
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      <div className="absolute top-4 left-4 z-20">
        <PremiumButton onClick={onBack} className="w-28" contentClassName="text-sm">← Geri</PremiumButton>
      </div>

      <div className="text-center mb-2 relative z-10 mt-16 md:mt-6">
        <div className="text-6xl mb-2 float-animation">⚔️</div>
        <h1 className="text-4xl font-black text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Düello VS</h1>
        <p className="text-base font-bold text-amber-300/90 drop-shadow">Dinozorunu seç</p>
      </div>

      {dinos.length === 0 ? (
        <div className="text-center relative z-10">
          <p className="text-xl font-bold text-amber-100 mb-4 drop-shadow">Dinozor yok!</p>
          <PremiumButton onClick={onBack} className="w-40 mx-auto" contentClassName="text-sm">Geri Dön</PremiumButton>
        </div>
      ) : (
        <div className="w-full relative z-10 pb-8">
          <DinoCarousel dinos={dinos} onSelect={onSelect} />
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
    <div className="w-full min-h-screen flex flex-col items-center justify-start md:justify-center p-4 gap-4 relative overflow-y-auto" style={{ backgroundImage: `url('${homeAssets.background}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#2a1c0e' }}>
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      <div className="absolute top-4 left-4 z-20">
        <PremiumButton onClick={onBack} className="w-28" contentClassName="text-sm">← Geri</PremiumButton>
      </div>

      <div className="text-center mb-2 relative z-10 mt-16 md:mt-6">
        <div className="text-6xl mb-2 float-animation">🎲</div>
        <h1 className="text-4xl font-black text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Masada Oyna</h1>
        <p className="text-base font-bold text-amber-300/90 drop-shadow">Dinozorunu seç</p>
      </div>

      {dinos.length === 0 ? (
        <div className="text-center relative z-10">
          <p className="text-xl font-bold text-amber-100 mb-4 drop-shadow">Dinozor yok!</p>
          <PremiumButton onClick={onBack} className="w-40 mx-auto" contentClassName="text-sm">Geri Dön</PremiumButton>
        </div>
      ) : (
        <div className="w-full relative z-10 pb-8">
          <DinoCarousel dinos={dinos} onSelect={onSelect} />
        </div>
      )}
    </div>
  )
}

