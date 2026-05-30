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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Arka plan efekti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-neon-cyan opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-purple opacity-5 rounded-full blur-3xl"></div>
      </div>

      {/* Başlık */}
      <div className="text-center mb-8 relative z-10">
        <div className="text-8xl mb-4 float-animation">🦖</div>
        <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink mb-2">
          Dino-RP
        </h1>
        <p className="text-lg text-neon-cyan opacity-80">Dinozor Savaş ve Gelişim Oyunu</p>
      </div>

      {/* Form Kartı */}
      <div className="w-full max-w-md glass-dark neon-border-cyan rounded-2xl p-8 relative z-10">
        {/* Tab */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setMode('login')
              setError(null)
            }}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-lg transition ${
              mode === 'login'
                ? 'glass-dark neon-border-cyan text-neon-cyan shadow-neon-cyan'
                : 'glass border border-neon-cyan/20 text-neon-cyan/60 hover:border-neon-cyan/40'
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
                ? 'glass-dark neon-border-purple text-neon-purple shadow-neon-purple'
                : 'glass border border-neon-purple/20 text-neon-purple/60 hover:border-neon-purple/40'
            }`}
          >
            ✨ Kaydol
          </button>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="mb-4 p-3 glass border border-red-500/50 rounded-lg text-red-400 font-bold text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Kullanıcı Adı (sadece register'da) */}
          {mode === 'register' && (
            <div>
              <label className="block font-bold text-neon-cyan mb-2">👤 Kullanıcı Adı</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Örn: Dinozor123"
                className="w-full px-4 py-3 bg-slate-800 border border-neon-cyan/30 rounded-lg text-lg font-bold text-neon-cyan placeholder-neon-cyan/40 focus:outline-none focus:border-neon-cyan focus:shadow-neon-cyan transition"
                required
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block font-bold text-neon-cyan mb-2">📧 E-posta</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="örnek@email.com"
              className="w-full px-4 py-3 bg-slate-800 border border-neon-cyan/30 rounded-lg text-lg font-bold text-neon-cyan placeholder-neon-cyan/40 focus:outline-none focus:border-neon-cyan focus:shadow-neon-cyan transition"
              required
            />
          </div>

          {/* Şifre */}
          <div>
            <label className="block font-bold text-neon-cyan mb-2">🔐 Şifre</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-800 border border-neon-cyan/30 rounded-lg text-lg font-bold text-neon-cyan placeholder-neon-cyan/40 focus:outline-none focus:border-neon-cyan focus:shadow-neon-cyan transition"
              required
            />
            {mode === 'register' && (
              <p className="text-xs text-neon-cyan/70 mt-1">Minimum 6 karakter</p>
            )}
          </div>

          {/* Submit Butonu */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition ${
              loading
                ? 'glass opacity-50 cursor-not-allowed text-neon-cyan/50'
                : mode === 'login'
                ? 'glass-dark neon-border-cyan text-neon-cyan hover:shadow-neon-cyan active:scale-95'
                : 'glass-dark neon-border-purple text-neon-purple hover:shadow-neon-purple active:scale-95'
            }`}
          >
            {loading ? '⏳ Yükleniyor...' : mode === 'login' ? '🔓 Giriş Yap' : '✨ Kaydol'}
          </button>
        </form>

        {/* Bilgi */}
        <div className="mt-4 p-3 glass border border-neon-cyan/20 rounded-lg text-sm text-neon-cyan/80">
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
