import { useState, useEffect } from 'react'
import { getMatches, getDino } from '../lib/supabase'
import PremiumButton from './PremiumButton'
import { homeAssets } from '../lib/gameAssets'

const PAGE_BG = {
  backgroundImage: `url('${homeAssets.background}')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundColor: '#2a1c0e',
} as const

interface Match {
  id: string
  winner_dino_id: string
  loser_dino_id: string
  xp_awarded: number
  rounds: number
  log: any
  created_at: string
}

interface MatchLogProps {
  onBack: () => void
}

export default function MatchLog({ onBack }: MatchLogProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [dinoNames, setDinoNames] = useState<Record<string, string>>({})

  useEffect(() => {
    loadMatches()
  }, [])

  async function loadMatches() {
    try {
      const data = await getMatches()
      setMatches(data as Match[])

      // Dinozor adlarını yükle
      const names: Record<string, string> = {}
      for (const match of data as Match[]) {
        if (!names[match.winner_dino_id]) {
          const dino = await getDino(match.winner_dino_id)
          if (dino) names[dino.id] = dino.name
        }
        if (!names[match.loser_dino_id]) {
          const dino = await getDino(match.loser_dino_id)
          if (dino) names[dino.id] = dino.name
        }
      }
      setDinoNames(names)
    } catch (err) {
      console.error('Maç günlüğü yüklemesi hatası:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 relative" style={PAGE_BG}>
        <div className="absolute inset-0 bg-black/45 pointer-events-none" />
        <p className="text-xl font-black text-amber-100 relative z-10 drop-shadow">Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto relative" style={PAGE_BG}>
      <div className="absolute inset-0 bg-black/45 pointer-events-none" />

      <div className="relative z-10">
        <PremiumButton onClick={onBack} className="w-28" contentClassName="text-sm">← Geri</PremiumButton>

        <h1 className="text-3xl sm:text-4xl font-black text-center mt-4 mb-4 text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          📋 Maç Günlüğü
        </h1>

        {matches.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center py-8">
            <p className="text-2xl font-black text-amber-100 drop-shadow">Henüz maç oynanmadı!</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl mx-auto w-full">
            {matches.map(match => (
              <div
                key={match.id}
                className="rounded-lg p-4 border-2 border-amber-900/40"
                style={{ background: 'linear-gradient(180deg, rgba(232,220,192,0.97) 0%, rgba(214,196,158,0.97) 100%)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1 text-center">
                    <p className="font-black text-lg text-amber-950">
                      {dinoNames[match.winner_dino_id] || 'Bilinmiyor'} 🏆
                    </p>
                  </div>
                  <div className="px-3 text-center">
                    <p className="font-black text-amber-800/70">vs</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="font-black text-lg text-red-800">
                      {dinoNames[match.loser_dino_id] || 'Bilinmiyor'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between text-sm font-bold text-amber-900/80 gap-2">
                  <span>⏱️ {match.rounds} tur</span>
                  <span>⭐ +{match.xp_awarded} XP</span>
                  <span className="text-xs">📅 {new Date(match.created_at).toLocaleDateString('tr-TR')}</span>
                </div>

                {match.log && Array.isArray(match.log) && match.log.length > 0 && (
                  <details className="mt-3 text-xs">
                    <summary className="font-black text-amber-800 cursor-pointer hover:text-amber-950 transition">
                      Detaylar ({match.log.length} hamle)
                    </summary>
                    <div className="mt-2 space-y-1 text-amber-900/80">
                      {match.log.slice(0, 10).map((entry: any, idx: number) => (
                        <p key={idx} className="pl-2">
                          • {entry.action}
                          {entry.diceRoll && ` [Zar: ${entry.diceRoll}]`}
                          {entry.isCrit && ' 🌟'}
                        </p>
                      ))}
                      {match.log.length > 10 && (
                        <p className="pl-2 italic">... ve {match.log.length - 10} daha</p>
                      )}
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
