import { useState, useEffect } from 'react'
import { Dino } from './game/types'
import Home from './pages/Home'
import { getDinos } from './lib/supabase'

type PageName = 'home' | 'dino-list' | 'battle' | 'match-log' | 'dino-form' | 'battle-result'

interface AppState {
  page: PageName
  dinos: Dino[]
  selectedDino1?: Dino
  selectedDino2?: Dino
  loading: boolean
}

export default function App() {
  const [state, setState] = useState<AppState>({
    page: 'home',
    dinos: [],
    loading: true,
  })

  useEffect(() => {
    loadDinos()
  }, [])

  async function loadDinos() {
    try {
      const data = await getDinos()
      setState(s => ({ ...s, dinos: data as Dino[], loading: false }))
    } catch (err) {
      console.error('Dinozorlar yüklenemedi:', err)
      setState(s => ({ ...s, loading: false }))
    }
  }

  const pageProps = { state, setState }

  if (state.loading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-dino-100 to-blue-100">
        <div className="text-center">
          <div className="text-6xl mb-4">🦖</div>
          <p className="text-xl font-bold text-dino-700">Dinozorlar yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-dino-100 to-blue-100">
      <Home {...pageProps} />
    </div>
  )
}
