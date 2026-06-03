import { useState } from 'react'
import { useAuth } from '../lib/auth-context'
import PremiumCard from './PremiumCard'
import PremiumButton from './PremiumButton'
import { homeAssets } from '../lib/gameAssets'

type AuthMode = 'login' | 'register'

const inputStyle = {
  background: 'linear-gradient(180deg, #efe0c0 0%, #d8c49e 100%)',
  border: '2px solid #a9853f',
}

export default function Auth() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
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
        const result = await signUp(email, password, username)
        if (result.needsEmailConfirmation) {
          setInfo('Kayıt başarılı! 📧 E-postana gönderilen onay linkine tıkla, sonra giriş yap.')
          setMode('login')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const tabClass = (active: boolean) =>
    `flex-1 py-2 rounded-lg text-sm font-black transition-colors ${
      active ? 'text-amber-50' : 'text-amber-900/70 hover:text-amber-900'
    }`
  const tabStyle = (active: boolean) =>
    active
      ? { background: 'linear-gradient(180deg,#b8860b,#8a6310)', border: '2px solid #d4af37' }
      : { background: 'rgba(120,80,30,0.12)', border: '2px solid rgba(120,80,30,0.3)' }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-y-auto"
      style={{ backgroundImage: `url('${homeAssets.background}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#2a1c0e' }}
    >
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      {/* Title */}
      <div className="text-center mb-5 relative z-10">
        <div className="text-7xl mb-2 float-animation">🦖</div>
        <h1 className="text-4xl font-black text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide">Dino-RP</h1>
        <p className="text-base text-amber-300/90 font-bold drop-shadow">Dinozor Savaş ve Gelişim Oyunu</p>
      </div>

      {/* Form card */}
      <div className="w-full max-w-md relative z-10">
        <PremiumCard variant="frame">
          <div className="p-4 sm:p-5 space-y-4">
            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => { setMode('login'); setError(null); setInfo(null) }}
                className={tabClass(mode === 'login')}
                style={tabStyle(mode === 'login')}
              >
                🔓 Giriş Yap
              </button>
              <button
                onClick={() => { setMode('register'); setError(null); setInfo(null) }}
                className={tabClass(mode === 'register')}
                style={tabStyle(mode === 'register')}
              >
                ✨ Kaydol
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg text-sm font-bold text-red-800" style={{ background: 'rgba(185,28,28,0.12)', border: '1.5px solid rgba(185,28,28,0.4)' }}>
                ⚠️ {error}
              </div>
            )}
            {info && (
              <div className="p-3 rounded-lg text-sm font-bold text-green-800" style={{ background: 'rgba(21,128,61,0.12)', border: '1.5px solid rgba(21,128,61,0.4)' }}>
                ✅ {info}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {mode === 'register' && (
                <div>
                  <label className="block font-black text-amber-900 mb-1 text-sm">👤 Kullanıcı Adı</label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Örn: Dinozor123"
                    className="w-full px-4 py-2.5 rounded-lg font-bold text-amber-950 placeholder-amber-800/40 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    style={inputStyle}
                    required
                  />
                </div>
              )}

              <div>
                <label className="block font-black text-amber-900 mb-1 text-sm">📧 E-posta</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="örnek@email.com"
                  className="w-full px-4 py-2.5 rounded-lg font-bold text-amber-950 placeholder-amber-800/40 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label className="block font-black text-amber-900 mb-1 text-sm">🔐 Şifre</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg font-bold text-amber-950 placeholder-amber-800/40 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  style={inputStyle}
                  required
                />
                {mode === 'register' && <p className="text-xs text-amber-800/80 mt-1">Minimum 6 karakter</p>}
              </div>

              <PremiumButton type="submit" disabled={loading} className="w-full mt-1" contentClassName="text-base">
                {loading ? '⏳ Yükleniyor...' : mode === 'login' ? '🔓 Giriş Yap' : '✨ Kaydol'}
              </PremiumButton>
            </form>

            <div className="p-3 rounded-lg text-sm text-amber-900/90 bg-amber-900/10 border border-amber-900/20">
              <p className="font-black mb-0.5">💡 İpucu:</p>
              <p>{mode === 'login' ? 'Hesabın yok mu? Kaydol sekmesini tıkla!' : 'Zaten hesabın var mı? Giriş Yap sekmesini tıkla!'}</p>
            </div>
          </div>
        </PremiumCard>
      </div>
    </div>
  )
}
