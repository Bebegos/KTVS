import { useState } from 'react'
import { useAuth } from '../lib/auth-context'
import { Dino } from '../game/types'
import { deleteDino, getDinos } from '../lib/supabase'

interface DinoListProps {
  dinos: Dino[]
  onBack: () => void
  onRefresh: (dinos: Dino[]) => void
  onEdit?: (dino: Dino) => void
}

export default function DinoList({ dinos, onBack, onRefresh, onEdit }: DinoListProps) {
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
    <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto relative">
      {/* Arka plan efekti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-neon-cyan opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-neon-purple opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <button
          onClick={onBack}
          className="px-4 py-2 glass-dark neon-border-cyan rounded-lg font-bold text-neon-cyan hover:shadow-neon-cyan transition"
        >
          ← Geri
        </button>

        <h1 className="text-4xl font-black text-center mt-4 text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">🦖 Dinozorlarım</h1>

        {dinos.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center mt-8">
            <p className="text-2xl text-neon-cyan">Henüz dinozor yok. Yeni bir tane oluştur!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4 mt-6">
            {dinos.map(dino => (
              <div
                key={dino.id}
                className="glass-dark neon-border-cyan rounded-xl p-4"
              >
                <div className="text-4xl mb-2">🦖</div>
                <h2 className="text-2xl font-bold text-neon-cyan mb-1">{dino.name}</h2>
                <p className="text-sm text-neon-cyan/70 mb-3">
                  {dino.element && `${dino.element} • `}
                  Seviye {dino.level}
                </p>

                <div className="grid grid-cols-2 gap-2 mb-4 text-sm font-bold">
                  <div className="glass border border-red-500/30 p-2 rounded text-red-400">❤️ {dino.maxHp ?? 30}</div>
                  <div className="glass border border-orange-500/30 p-2 rounded text-orange-400">⚔️ {dino.atk ?? 5}</div>
                  <div className="glass border border-blue-500/30 p-2 rounded text-blue-400">🛡️ {dino.def ?? 5}</div>
                  <div className="glass border border-yellow-500/30 p-2 rounded text-yellow-400">⚡ {dino.spd ?? 5}</div>
                </div>

                <div className="mb-3">
                  <p className="text-xs font-bold text-neon-cyan/70 mb-1">XP:</p>
                  <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden border border-neon-cyan/20">
                    <div
                      className="bg-gradient-to-r from-neon-cyan to-neon-purple h-full"
                      style={{ width: `${(dino.xp / 100) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-neon-cyan/70 text-center mt-1">
                    {dino.xp}/100
                  </p>
                </div>

                {dino.abilities.length > 0 && (
                  <div className="mb-3 text-xs">
                    <p className="font-bold text-neon-cyan/70 mb-1">Yetenekler:</p>
                    <div className="flex flex-wrap gap-1">
                      {dino.abilities.map((a, idx) => (
                        <span
                          key={idx}
                          className="glass border border-neon-purple/30 text-neon-purple px-2 py-1 rounded text-xs font-bold"
                        >
                          {a.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(dino)}
                      className="flex-1 px-4 py-2 glass-dark neon-border-purple rounded font-bold text-neon-purple hover:shadow-neon-purple active:scale-95 transition"
                    >
                      ✏️ Düzenle
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(dino.id)}
                    disabled={deleting === dino.id}
                    className="flex-1 px-4 py-2 glass-dark border border-red-500/30 rounded font-bold text-red-400 hover:shadow-red-500/50 disabled:opacity-50 active:scale-95 transition"
                  >
                    {deleting === dino.id ? '⏳' : '🗑️'} Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
