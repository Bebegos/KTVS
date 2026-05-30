import { useState } from 'react'
import { Dino } from '../game/types'
import DinoList from '../components/DinoList'
import DinoForm from '../components/DinoForm'
import BattleScreen from '../components/BattleScreen'
import MatchLog from '../components/MatchLog'

type PageName = 'home' | 'dino-list' | 'battle' | 'match-log' | 'dino-form' | 'battle-select'

interface HomeProps {
  state: {
    page: string
    dinos: Dino[]
    selectedDino1?: Dino
    selectedDino2?: Dino
  }
  setState: (fn: (s: any) => any) => void
}

export default function Home({ state, setState }: HomeProps) {
  const [page, setPage] = useState<PageName>('home')
  const [selectedDino1, setSelectedDino1] = useState<Dino | undefined>()
  const [selectedDino2, setSelectedDino2] = useState<Dino | undefined>()
  const [dinos, setDinos] = useState<Dino[]>(state.dinos)

  function goHome() {
    setPage('home')
  }

  function startBattle(dino1: Dino, dino2: Dino) {
    setSelectedDino1(dino1)
    setSelectedDino2(dino2)
    setPage('battle')
  }

  function goToHome() {
    setPage('home')
    setState((s: any) => ({ ...s, dinos: dinos }))
  }

  function refreshDinos(newDinos: Dino[]) {
    setDinos(newDinos)
  }

  if (page === 'home') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        <div className="text-center mb-8">
          <div className="text-8xl mb-2">🦖</div>
          <h1 className="text-4xl font-bold text-dino-700">Dino-RP</h1>
          <p className="text-lg text-dino-600 mt-2">Dinozor Savaş ve Gelişim Oyunu</p>
        </div>

        <button
          onClick={() => setPage('dino-list')}
          className="w-full max-w-sm px-6 py-4 bg-dino-500 text-white rounded-lg font-bold text-lg hover:bg-dino-600 active:bg-dino-700 shadow-lg"
        >
          🦖 Dinozorlarım
        </button>

        <button
          onClick={() => setPage('battle-select')}
          className="w-full max-w-sm px-6 py-4 bg-red-500 text-white rounded-lg font-bold text-lg hover:bg-red-600 active:bg-red-700 shadow-lg"
        >
          ⚔️ Yeni Savaş
        </button>

        <button
          onClick={() => setPage('match-log')}
          className="w-full max-w-sm px-6 py-4 bg-blue-500 text-white rounded-lg font-bold text-lg hover:bg-blue-600 active:bg-blue-700 shadow-lg"
        >
          📋 Maç Günlüğü
        </button>

        <button
          onClick={() => setPage('dino-form')}
          className="w-full max-w-sm px-6 py-4 bg-purple-500 text-white rounded-lg font-bold text-lg hover:bg-purple-600 active:bg-purple-700 shadow-lg"
        >
          ✨ Yeni Dinozor
        </button>
      </div>
    )
  }

  if (page === 'dino-list') {
    return <DinoList dinos={dinos} onBack={goHome} onRefresh={refreshDinos} />
  }

  if (page === 'dino-form') {
    return <DinoForm onBack={goHome} onRefresh={refreshDinos} />
  }

  if (page === 'match-log') {
    return <MatchLog onBack={goHome} />
  }

  if (page === 'battle-select') {
    return (
      <BattleSelect
        dinos={dinos}
        onSelectBattle={(d1, d2) => startBattle(d1, d2)}
        onBack={goHome}
      />
    )
  }

  if (page === 'battle' && selectedDino1 && selectedDino2) {
    return (
      <BattleScreen
        dino1={selectedDino1}
        dino2={selectedDino2}
        onBack={goHome}
        onRefresh={refreshDinos}
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
    <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
      <button
        onClick={onBack}
        className="self-start px-4 py-2 bg-gray-500 text-white rounded font-bold"
      >
        ← Geri
      </button>

      <h1 className="text-3xl font-bold text-dino-700 text-center">Savaş Oyuncuları Seç</h1>

      <div className="flex-1 flex flex-col lg:flex-row gap-4">
        <div className="flex-1 flex flex-col gap-2">
          <p className="font-bold text-lg text-dino-700">1. Oyuncu:</p>
          <div className="flex flex-col gap-2">
            {dinos.map(d => (
              <button
                key={d.id}
                onClick={() => setSelected1(d)}
                className={`p-3 rounded text-left ${
                  selected1?.id === d.id
                    ? 'bg-dino-500 text-white font-bold'
                    : 'bg-white border-2 border-dino-300 text-dino-700'
                }`}
              >
                🦖 {d.name} - Lvl {d.level}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <p className="font-bold text-lg text-dino-700">2. Oyuncu:</p>
          <div className="flex flex-col gap-2">
            {dinos.map(d => (
              <button
                key={d.id}
                onClick={() => setSelected2(d)}
                className={`p-3 rounded text-left ${
                  selected2?.id === d.id
                    ? 'bg-red-500 text-white font-bold'
                    : 'bg-white border-2 border-red-300 text-dino-700'
                }`}
              >
                🦖 {d.name} - Lvl {d.level}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleStart}
        disabled={!selected1 || !selected2 || selected1.id === selected2.id}
        className="w-full px-6 py-4 bg-red-500 text-white rounded-lg font-bold text-lg hover:bg-red-600 disabled:bg-gray-400 active:bg-red-700 shadow-lg"
      >
        ⚔️ Savaşı Başlat
      </button>
    </div>
  )
}
