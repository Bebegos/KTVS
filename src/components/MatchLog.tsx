import { useState, useEffect } from 'react'
import { getMatches, getDino } from '../lib/supabase'

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
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-xl font-bold text-dino-700">Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
      <button
        onClick={onBack}
        className="self-start px-4 py-2 bg-gray-500 text-white rounded font-bold"
      >
        ← Geri
      </button>

      <h1 className="text-3xl font-bold text-dino-700 text-center">📋 Maç Günlüğü</h1>

      {matches.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center">
          <p className="text-2xl text-dino-600">Henüz maç oynanmadı!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map(match => (
            <div
              key={match.id}
              className="bg-white border-2 border-dino-300 rounded-lg p-4 shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1 text-center">
                  <p className="font-bold text-lg text-dino-700">
                    {dinoNames[match.winner_dino_id] || 'Bilinmiyor'} 🏆
                  </p>
                </div>
                <div className="px-3 text-center">
                  <p className="font-bold text-dino-600">vs</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="font-bold text-lg text-gray-700">
                    {dinoNames[match.loser_dino_id] || 'Bilinmiyor'}
                  </p>
                </div>
              </div>

              <div className="flex justify-between text-sm text-dino-600 gap-2">
                <span>⏱️ {match.rounds} tur</span>
                <span>⭐ +{match.xp_awarded} XP</span>
                <span className="text-xs">📅 {new Date(match.created_at).toLocaleDateString('tr-TR')}</span>
              </div>

              {match.log && Array.isArray(match.log) && match.log.length > 0 && (
                <details className="mt-3 text-xs">
                  <summary className="font-bold text-dino-700 cursor-pointer">
                    Detaylar ({match.log.length} hamle)
                  </summary>
                  <div className="mt-2 space-y-1 text-dino-600">
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
  )
}
