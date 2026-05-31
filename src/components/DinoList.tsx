import { useState } from 'react'
import { useAuth } from '../lib/auth-context'
import { Dino } from '../game/types'
import { deleteDino, getDinos } from '../lib/supabase'
import { abilityDefinitionService } from '../lib/services'
import AbilityIcon from './AbilityIcon'
import MedallionIcon from './MedallionIcon'
import SvgIcon from './SvgIcon'
import { getEffectNameTR, getEffectEmoji, isBuffEffect } from '../lib/effect-translations'
import { getClassIcon, getSpecIcon } from '../lib/icons'

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

                {/* Class & Spec Badges */}
                {(dino.class || dino.spec) && (
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {dino.class && (
                      <div className="glass-dark border border-neon-cyan/30 rounded-lg px-2 py-1 flex items-center gap-2">
                        <MedallionIcon id={dino.class} type="class" size="sm" />
                        <span className="text-xs font-bold text-neon-cyan">{getClassIcon(dino.class)?.label || 'Unknown'}</span>
                      </div>
                    )}
                    {dino.spec && (
                      <div className="glass-dark border border-neon-purple/30 rounded-lg px-2 py-1 flex items-center gap-2">
                        <MedallionIcon id={dino.spec} type="spec" size="sm" />
                        <span className="text-xs font-bold text-neon-purple">{getSpecIcon(dino.spec)?.label || 'Unknown'}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mb-4 text-sm font-bold">
                  <div className="glass border border-red-500/30 p-2 rounded text-red-400 flex items-center gap-1"><SvgIcon id="hp" type="stat" size="xs" /> {dino.maxHp ?? 30}</div>
                  <div className="glass border border-orange-500/30 p-2 rounded text-orange-400 flex items-center gap-1"><SvgIcon id="atk" type="stat" size="xs" /> {dino.atk ?? 5}</div>
                  <div className="glass border border-blue-500/30 p-2 rounded text-blue-400 flex items-center gap-1"><SvgIcon id="def" type="stat" size="xs" /> {dino.def ?? 5}</div>
                  <div className="glass border border-yellow-500/30 p-2 rounded text-yellow-400 flex items-center gap-1"><SvgIcon id="spd" type="stat" size="xs" /> {dino.spd ?? 5}</div>
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

                {dino.abilityIds && dino.abilityIds.length > 0 && (
                  <div className="mb-3">
                    <p className="font-bold text-neon-cyan/70 mb-2 text-xs">⚡ Yetenekler:</p>
                    <div className="space-y-2">
                      {dino.abilityIds.map((abilityId: string, idx: number) => {
                        if (!abilityId) return null
                        const ability = abilityDefinitionService.getAbility(abilityId)
                        if (!ability) return null

                        return (
                          <div
                            key={idx}
                            className="glass-dark border border-neon-purple/30 rounded-lg p-2 flex items-start gap-2"
                          >
                            <AbilityIcon iconId={ability.icon} size="md" className="flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-neon-purple text-sm">{ability.name}</p>
                              <div className="text-xs text-neon-purple/70 space-y-0.5">
                                {!ability.effects || ability.effects.length === 0 ? (
                                  <p>Saldırı • ×{ability.damageMultiplier || 1}</p>
                                ) : (
                                  <p className={isBuffEffect((ability.effects[0] as any)) ? 'text-green-400' : 'text-red-400'}>
                                    {isBuffEffect((ability.effects[0] as any)) ? '⬆️ Buff' : '⬇️ Debuff'} • ×{ability.damageMultiplier || 1}
                                  </p>
                                )}
                                {ability.effects && ability.effects.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <SvgIcon id={ability.effects[0] as any} type="effect" size="xs" fallback={getEffectEmoji((ability.effects[0] as any))} />
                                    <span className="font-bold text-neon-cyan">{getEffectNameTR((ability.effects[0] as any))}</span>
                                  </span>
                                )}
                                {ability.cooldown && ability.cooldown > 0 && <p>CD: <span className="font-bold">{ability.cooldown}</span> tur</p>}
                              </div>
                            </div>
                          </div>
                        )
                      })}
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
