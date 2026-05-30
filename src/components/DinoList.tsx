import { useState } from 'react'
import { useAuth } from '../lib/auth-context'
import { Dino } from '../game/types'
import { deleteDino, getDinos } from '../lib/supabase'

interface DinoListProps {
  dinos: Dino[]
  onBack: () => void
  onRefresh: (dinos: Dino[]) => void
}

export default function DinoList({ dinos, onBack, onRefresh }: DinoListProps) {
  const { user } = useAuth()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!window.confirm('Silmek istediğine emin misin?')) return

    try {
      await deleteDino(id)
      const updated = await getDinos(user?.id)
      onRefresh(updated as Dino[])
    } catch (err) {
      console.error('Silme hatası:', err)
    } finally {
      setDeleting(null)
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

      <h1 className="text-3xl font-bold text-dino-700 text-center">🦖 Dinozorlarım</h1>

      {dinos.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center">
          <p className="text-2xl text-dino-600">Henüz dinozor yok. Yeni bir tane oluştur!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
          {dinos.map(dino => (
            <div
              key={dino.id}
              className="bg-white border-4 border-dino-300 rounded-lg p-4 shadow-lg"
            >
              <div className="text-4xl mb-2">🦖</div>
              <h2 className="text-2xl font-bold text-dino-700 mb-1">{dino.name}</h2>
              <p className="text-sm text-dino-500 mb-3">
                {dino.element && `${dino.element} • `}
                Seviye {dino.level}
              </p>

              <div className="grid grid-cols-2 gap-2 mb-4 text-sm font-bold">
                <div className="bg-red-100 p-2 rounded">❤️ {dino.maxHp} HP</div>
                <div className="bg-orange-100 p-2 rounded">⚔️ {dino.atk} ATK</div>
                <div className="bg-blue-100 p-2 rounded">🛡️ {dino.def} DEF</div>
                <div className="bg-yellow-100 p-2 rounded">⚡ {dino.spd} SPD</div>
              </div>

              <div className="mb-3">
                <p className="text-xs font-bold text-dino-600 mb-1">XP:</p>
                <div className="w-full bg-dino-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-dino-500 h-full"
                    style={{ width: `${(dino.xp / 100) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-dino-600 text-center mt-1">
                  {dino.xp}/100
                </p>
              </div>

              {dino.abilities.length > 0 && (
                <div className="mb-3 text-xs">
                  <p className="font-bold text-dino-600 mb-1">Yetenekler:</p>
                  <div className="flex flex-wrap gap-1">
                    {dino.abilities.map((a, idx) => (
                      <span
                        key={idx}
                        className="bg-dino-200 text-dino-700 px-2 py-1 rounded text-xs font-bold"
                      >
                        {a.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => handleDelete(dino.id)}
                disabled={deleting === dino.id}
                className="w-full px-4 py-2 bg-red-500 text-white rounded font-bold hover:bg-red-600 disabled:bg-gray-400"
              >
                {deleting === dino.id ? '⏳' : '🗑️'} Sil
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
