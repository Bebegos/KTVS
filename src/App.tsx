import { useAuth } from './lib/auth-context'
import Auth from './components/Auth'
import Home from './pages/Home'

export default function App() {
  const { session, loading } = useAuth()

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

  return session ? <Home /> : <Auth />
}
