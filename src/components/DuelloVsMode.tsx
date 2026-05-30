import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import jsQR from 'jsqr'
import { Dino } from '../game/types'
import { createDuelloSession, getDuelloSession, joinDuelloSession, subscribeToDuelloSession, getDino } from '../lib/supabase'
import { useAuth } from '../lib/auth-context'
import DuelloBattleScreen from './DuelloBattleScreen'

interface DuelloVsModeProps {
  selectedDino: Dino
  onBack: () => void
}

type DuelloScreen = 'options' | 'host' | 'join' | 'confirmation' | 'battle'

interface SessionData {
  session_id: string
  host_dino_id: string
  host_player_id: string
  guest_dino_id: string | null
  guest_player_id: string | null
  status: string
}

export default function DuelloVsMode({ selectedDino, onBack }: DuelloVsModeProps) {
  const { user } = useAuth()
  const [screen, setScreen] = useState<DuelloScreen>('options')
  const [sessionId] = useState(generateSessionId())
  const [joinCode, setJoinCode] = useState('')
  const [scannerActive, setScannerActive] = useState(false)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [opponentDino, setOpponentDino] = useState<Dino | null>(null)
  const [isHost, setIsHost] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const subscriptionRef = useRef<any>(null)

  const inviteUrl = `${window.location.origin}?duello=${sessionId}`

  function generateSessionId(): string {
    return Math.random().toString(36).substr(2, 9).toUpperCase()
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(inviteUrl)
    alert('Link kopyalandı!')
  }

  async function startScanner() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setScannerActive(true)
        scanQRCode()
      }
    } catch (err) {
      alert('Kamerayı açmak için izin gerekli!')
      console.error('Camera error:', err)
    }
  }

  function stopScanner() {
    setScannerActive(false)
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }
  }

  function scanQRCode() {
    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight
        ctx.drawImage(videoRef.current, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)

        if (code && code.data) {
          const url = new URL(code.data)
          const duelloCode = url.searchParams.get('duello')
          if (duelloCode) {
            setJoinCode(duelloCode.toUpperCase())
            stopScanner()
          }
        }
      }
    }, 200)
  }

  useEffect(() => {
    return () => {
      stopScanner()
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [])

  useEffect(() => {
    if (screen === 'confirmation' && sessionData && sessionData.guest_dino_id && !opponentDino) {
      loadOpponentDino(sessionData.guest_dino_id)
    } else if (screen === 'confirmation' && sessionData && sessionData.host_dino_id && !opponentDino && !isHost) {
      loadOpponentDino(sessionData.host_dino_id)
    }
  }, [screen, sessionData, isHost, opponentDino])

  async function loadOpponentDino(dinoId: string) {
    try {
      const dino = await getDino(dinoId)
      if (dino) {
        setOpponentDino(dino)
      }
    } catch (err) {
      console.error('Rakip dinozor yüklemesi hatası:', err)
    }
  }

  async function startHosting() {
    try {
      if (!user?.id) {
        alert('Kullanıcı kimliği bulunamadı')
        return
      }

      const session = await createDuelloSession(sessionId, selectedDino.id, user.id)
      setSessionData(session)
      setIsHost(true)

      // Subscribe to session updates
      subscriptionRef.current = await subscribeToDuelloSession(sessionId, (newSession: SessionData) => {
        setSessionData(newSession)
        if (newSession.status === 'ready' && newSession.guest_dino_id) {
          setScreen('confirmation')
        }
      })

      setScreen('host')
    } catch (err) {
      alert('Oturum oluşturulamadı: ' + (err as Error).message)
      console.error('Host error:', err)
    }
  }

  async function joinSession() {
    try {
      if (!user?.id) {
        alert('Kullanıcı kimliği bulunamadı')
        return
      }

      const session = await getDuelloSession(joinCode)
      if (!session) {
        alert('Oturum bulunamadı!')
        return
      }

      const updatedSession = await joinDuelloSession(joinCode, selectedDino.id, user.id)
      setSessionData(updatedSession)
      setIsHost(false)

      // Subscribe to session updates
      subscriptionRef.current = await subscribeToDuelloSession(joinCode, (newSession: SessionData) => {
        setSessionData(newSession)
        if (newSession.status === 'ready') {
          setScreen('confirmation')
        }
      })

      setScreen('confirmation')
    } catch (err) {
      alert('Oturuma katılınamadı: ' + (err as Error).message)
      console.error('Join error:', err)
    }
  }

  // Options Screen
  if (screen === 'options') {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Arka plan */}
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

        <div className="text-center mb-8 relative z-10">
          <div className="text-6xl mb-4">⚔️</div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-pink mb-2">
            Düello Vs
          </h1>
          <p className="text-lg text-neon-cyan/80">Seçiminizi yapın</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 relative z-10 max-w-2xl">
          {/* Davet Et (Host) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startHosting}
            className="flex-1 p-8 glass-dark neon-border-cyan rounded-2xl text-center hover:shadow-neon-cyan transition"
          >
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-2xl font-black text-neon-cyan mb-2">DAVET ET</h2>
            <p className="text-sm text-neon-cyan/70">Link paylaş ve bekle</p>
          </motion.button>

          {/* Katıl (Join) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setScreen('join')}
            className="flex-1 p-8 glass-dark neon-border-purple rounded-2xl text-center hover:shadow-neon-purple transition"
          >
            <div className="text-5xl mb-4">🔗</div>
            <h2 className="text-2xl font-black text-neon-purple mb-2">KATIL</h2>
            <p className="text-sm text-neon-purple/70">Kod gir veya QR tara</p>
          </motion.button>
        </div>
      </div>
    )
  }

  // Host Screen (Davet Et)
  if (screen === 'host') {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Arka plan */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 bg-neon-cyan opacity-5 rounded-full blur-3xl"></div>
        </div>

        <button
          onClick={() => setScreen('options')}
          className="absolute top-4 left-4 px-4 py-2 glass-dark neon-border-cyan rounded-lg font-bold text-neon-cyan hover:shadow-neon-cyan z-10 transition"
        >
          ← Geri
        </button>

        <div className="flex flex-col items-center gap-8 relative z-10 max-w-md">
          <h1 className="text-4xl font-black text-neon-cyan text-center">Davet Linki</h1>

          {/* Dinozor Info */}
          <div className="glass-dark neon-border-cyan rounded-xl p-6 w-full text-center">
            <p className="text-3xl mb-2">🦖</p>
            <h2 className="text-2xl font-black text-neon-cyan mb-1">{selectedDino.name}</h2>
            <p className="text-sm text-neon-cyan/80">Lvl {selectedDino.level}</p>
          </div>

          {/* QR Code */}
          <div className="glass-dark neon-border-purple rounded-xl p-6 bg-white">
            <QRCodeSVG value={inviteUrl} size={256} />
          </div>

          {/* URL Display */}
          <div className="glass-dark neon-border-cyan rounded-xl p-4 w-full">
            <p className="text-xs font-bold text-neon-cyan mb-2">KATılIM LİNKİ:</p>
            <p className="text-xs text-neon-cyan/70 break-all mb-3">{inviteUrl}</p>
            <button
              onClick={copyToClipboard}
              className="w-full px-4 py-2 glass-dark neon-border-cyan rounded-lg font-bold text-neon-cyan hover:shadow-neon-cyan transition"
            >
              📋 Kopyala
            </button>
          </div>

          {/* Session ID */}
          <div className="glass-dark neon-border-purple rounded-xl p-4 w-full text-center">
            <p className="text-xs font-bold text-neon-purple mb-2">KOD:</p>
            <p className="text-3xl font-black text-neon-purple tracking-widest">{sessionId}</p>
          </div>

          {/* Waiting */}
          <div className="glass-dark border border-neon-cyan/30 rounded-xl p-4 w-full text-center">
            <p className="text-sm text-neon-cyan mb-3">Arkadaş katılmasını bekliyor...</p>
            <div className="flex gap-2 justify-center">
              <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Join Screen (Katıl)
  if (screen === 'join') {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Arka plan */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-96 h-96 bg-neon-purple opacity-5 rounded-full blur-3xl"></div>
        </div>

        <button
          onClick={() => {
            setScreen('options')
            stopScanner()
          }}
          className="absolute top-4 left-4 px-4 py-2 glass-dark neon-border-cyan rounded-lg font-bold text-neon-cyan hover:shadow-neon-cyan z-10 transition"
        >
          ← Geri
        </button>

        <div className="flex flex-col items-center gap-8 relative z-10 max-w-md w-full">
          <h1 className="text-4xl font-black text-neon-purple text-center">Katıl</h1>

          {/* Dinozor Info */}
          <div className="glass-dark neon-border-purple rounded-xl p-6 w-full text-center">
            <p className="text-3xl mb-2">🦖</p>
            <h2 className="text-2xl font-black text-neon-purple mb-1">{selectedDino.name}</h2>
            <p className="text-sm text-neon-purple/80">Lvl {selectedDino.level}</p>
          </div>

          {!scannerActive ? (
            <>
              {/* Code Input */}
              <div className="glass-dark neon-border-purple rounded-xl p-4 w-full">
                <label className="block text-xs font-bold text-neon-purple mb-2">KOD GIRIN:</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Örn: ABC123XYZ"
                  maxLength={9}
                  className="w-full px-4 py-3 bg-slate-800 border border-neon-purple rounded-lg text-2xl font-black text-center text-neon-purple placeholder-neon-purple/40 focus:outline-none focus:border-neon-purple focus:shadow-neon-purple transition"
                />
              </div>

              {/* Or */}
              <div className="flex items-center w-full gap-4">
                <div className="flex-1 h-px bg-neon-purple/30"></div>
                <span className="text-neon-purple/70 text-sm font-bold">VEYA</span>
                <div className="flex-1 h-px bg-neon-purple/30"></div>
              </div>

              {/* QR Scanner Button */}
              <button
                onClick={startScanner}
                className="w-full px-6 py-4 glass-dark neon-border-purple rounded-lg font-bold text-lg text-neon-purple hover:shadow-neon-purple active:scale-95 transition"
              >
                📱 QR KOD TARA
              </button>
            </>
          ) : (
            <>
              {/* Camera View */}
              <div className="glass-dark neon-border-purple rounded-xl overflow-hidden w-full">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full aspect-square object-cover"
                />
              </div>
              <canvas ref={canvasRef} className="hidden" />

              {/* Stop Scanner Button */}
              <button
                onClick={stopScanner}
                className="w-full px-6 py-4 glass-dark neon-border-cyan rounded-lg font-bold text-lg text-neon-cyan hover:shadow-neon-cyan active:scale-95 transition"
              >
                ✋ DURDU
              </button>
            </>
          )}

          {/* Join Button */}
          <button
            onClick={joinSession}
            disabled={joinCode.length !== 9}
            className={`w-full px-6 py-4 glass-dark rounded-lg font-bold text-lg transition ${
              joinCode.length === 9
                ? 'neon-border-cyan text-neon-cyan hover:shadow-neon-cyan'
                : 'border border-gray-600/50 text-gray-500 cursor-not-allowed opacity-50'
            }`}
          >
            ✅ KATIL
          </button>
        </div>
      </div>
    )
  }

  // Battle Screen (Düello)
  if (screen === 'battle' && sessionData && opponentDino) {
    return (
      <DuelloBattleScreen
        playerDino={selectedDino}
        opponentDino={opponentDino}
        sessionId={sessionId}
        isHost={isHost}
        onBattleEnd={(winner) => {
          // Handle battle end
          setScreen('options')
          if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe()
          }
        }}
        onBack={() => {
          setScreen('options')
          if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe()
          }
        }}
      />
    )
  }

  // Confirmation Screen (Onay)
  if (screen === 'confirmation' && sessionData) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Arka plan */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 bg-neon-cyan opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-neon-purple opacity-5 rounded-full blur-3xl"></div>
        </div>

        <div className="flex flex-col items-center gap-8 relative z-10 w-full max-w-2xl">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple text-center">
            ⚔️ Düello Başlamak Üzere
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {/* Host Dino */}
            <div className="glass-dark neon-border-cyan rounded-xl p-6 text-center">
              <p className="text-xs font-bold text-neon-cyan mb-2">DAVET EDEN</p>
              <div className="text-5xl mb-3">🦖</div>
              <h2 className="text-2xl font-black text-neon-cyan mb-1">{selectedDino.name}</h2>
              <p className="text-sm text-neon-cyan/80 mb-4">Lvl {selectedDino.level}</p>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                <div className="glass border border-red-500/30 p-2 rounded text-red-400">❤️ {selectedDino.maxHp}</div>
                <div className="glass border border-orange-500/30 p-2 rounded text-orange-400">⚔️ {selectedDino.atk}</div>
                <div className="glass border border-blue-500/30 p-2 rounded text-blue-400">🛡️ {selectedDino.def}</div>
              </div>
              {isHost && (
                <p className="text-xs text-neon-cyan/60 mt-3">✓ Hazır</p>
              )}
            </div>

            {/* Guest Dino */}
            <div className="glass-dark neon-border-purple rounded-xl p-6 text-center">
              <p className="text-xs font-bold text-neon-purple mb-2">{isHost ? 'KATILAN' : 'DAVET EDEN'}</p>
              <div className="text-5xl mb-3">🦖</div>
              {opponentDino ? (
                <>
                  <h2 className="text-2xl font-black text-neon-purple mb-1">{opponentDino.name}</h2>
                  <p className="text-sm text-neon-purple/80 mb-4">Lvl {opponentDino.level}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                    <div className="glass border border-red-500/30 p-2 rounded text-red-400">❤️ {opponentDino.maxHp}</div>
                    <div className="glass border border-orange-500/30 p-2 rounded text-orange-400">⚔️ {opponentDino.atk}</div>
                    <div className="glass border border-blue-500/30 p-2 rounded text-blue-400">🛡️ {opponentDino.def}</div>
                  </div>
                  {sessionData.status === 'ready' && (
                    <p className="text-xs text-neon-purple/60 mt-3">✓ Hazır</p>
                  )}
                </>
              ) : (
                <p className="text-neon-purple/70 text-lg">Yükleniyor...</p>
              )}
            </div>
          </div>

          {/* VS */}
          <div className="text-4xl font-black text-neon-cyan">VS</div>

          {sessionData.status === 'ready' && sessionData.guest_dino_id && (
            <button
              onClick={() => setScreen('battle')}
              className="w-full px-6 py-4 glass-dark neon-border-cyan rounded-lg font-bold text-lg text-neon-cyan hover:shadow-neon-cyan transition"
            >
              ⚔️ DÜELLOYA BAŞLA
            </button>
          )}

          <button
            onClick={() => {
              setScreen('options')
              if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe()
              }
            }}
            className="w-full px-6 py-2 glass-dark neon-border-purple rounded-lg font-bold text-neon-purple hover:shadow-neon-purple transition"
          >
            ← Geri
          </button>
        </div>
      </div>
    )
  }

  return null
}
