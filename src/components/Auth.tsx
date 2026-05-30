import { useState } from 'react'
import { useAuth } from '../lib/auth-context'

type AuthMode = 'login' | 'register'

export default function Auth() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        if (!username) {
          setError('Kullanıcı adı gerekli')
          setLoading(false)
          return
        }
        await signUp(email, password, username)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-dino-100 via-purple-100 to-blue-100">
      {/* Başlık */}
      <div className="text-center mb-8">
        <div className="text-8xl mb-2">🦖</div>
        <h1 className="text-4xl font-bold text-dino-700 mb-2">Dino-RP</h1>
        <p className="text-lg text-dino-600">Dinozor Savaş ve Gelişim Oyunu</p>
      </div>

      {/* Form Kartı */}
      <div className="w-full max-w-md bg-white border-4 border-dino-300 rounded-xl shadow-xl p-6">
        {/* Tab */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setMode('login')
              setError(null)
            }}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-lg transition ${
              mode === 'login'
                ? 'bg-dino-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🔓 Giriş Yap
          </button>
          <button
            onClick={() => {
              setMode('register')
              setError(null)
            }}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-lg transition ${
              mode === 'register'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ✨ Kaydol
          </button>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 rounded-lg text-red-700 font-bold text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Kullanıcı Adı (sadece register'da) */}
          {mode === 'register' && (
            <div>
              <label className="block font-bold text-dino-700 mb-2">👤 Kullanıcı Adı</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Örn: Dinozor123"
                className="w-full px-4 py-3 border-2 border-dino-300 rounded-lg text-lg font-bold focus:outline-none focus:border-dino-500"
                required
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block font-bold text-dino-700 mb-2">📧 E-posta</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="örnek@email.com"
              className="w-full px-4 py-3 border-2 border-dino-300 rounded-lg text-lg font-bold focus:outline-none focus:border-dino-500"
              required
            />
          </div>

          {/* Şifre */}
          <div>
            <label className="block font-bold text-dino-700 mb-2">🔐 Şifre</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border-2 border-dino-300 rounded-lg text-lg font-bold focus:outline-none focus:border-dino-500"
              required
            />
            {mode === 'register' && (
              <p className="text-xs text-dino-600 mt-1">Minimum 6 karakter</p>
            )}
          </div>

          {/* Submit Butonu */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-6 rounded-lg font-bold text-lg text-white transition ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : mode === 'login'
                ? 'bg-dino-500 hover:bg-dino-600 active:bg-dino-700'
                : 'bg-purple-500 hover:bg-purple-600 active:bg-purple-700'
            }`}
          >
            {loading ? '⏳ Yükleniyor...' : mode === 'login' ? '🔓 Giriş Yap' : '✨ Kaydol'}
          </button>
        </form>

        {/* Bilgi */}
        <div className="mt-4 p-3 bg-dino-50 border-2 border-dino-200 rounded-lg text-sm text-dino-700">
          <p className="font-bold mb-1">💡 İpucu:</p>
          <p>
            {mode === 'login'
              ? 'Hesabın yok mu? Kaydol sekmesini tıkla!'
              : 'Zaten hesabın var mı? Giriş Yap sekmesini tıkla!'}
          </p>
        </div>
      </div>
    </div>
  )
}
