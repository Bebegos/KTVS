import { useState } from 'react'
import { useAuth } from '../lib/auth-context'
import { Dino, DinoAbility } from '../game/types'
import { createDino, getDinos } from '../lib/supabase'

interface DinoFormProps {
  onBack: () => void
  onRefresh: (dinos: Dino[]) => void
}

const DEFAULT_ABILITIES: DinoAbility[] = [
  { name: 'Pençe Saldırısı', cd: 0, kind: 'debuff', effect: 'none', multiplier: 1 },
  { name: 'Zehirli Isırık', cd: 2, kind: 'debuff', effect: 'poison', multiplier: 1 },
  { name: 'Güçlendirme', cd: 3, kind: 'buff', effect: 'power', multiplier: 1 },
  { name: 'Hızlı Koşu', cd: 2, kind: 'buff', effect: 'speed', multiplier: 1 },
  { name: 'ULTI: Meteor', cd: 4, kind: 'debuff', effect: 'stop', multiplier: 2 },
]

export default function DinoForm({ onBack, onRefresh }: DinoFormProps) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: '',
    element: 'Yeşil',
    passive: '',
    maxHp: 30,
    atk: 5,
    def: 5,
    spd: 5,
    abilities: DEFAULT_ABILITIES,
  })

  const [loading, setLoading] = useState(false)
  const [editingAbility, setEditingAbility] = useState<number | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      alert('Dinozor adını gir!')
      return
    }

    setLoading(true)
    try {
      await createDino({
        name: form.name,
        element: form.element,
        passive: form.passive,
        max_hp: form.maxHp,
        atk: form.atk,
        def: form.def,
        spd: form.spd,
        level: 1,
        xp: 0,
        abilities: form.abilities,
        owner_id: user?.id,
      })

      const updated = await getDinos(user?.id)
      onRefresh(updated as Dino[])
      onBack()
    } catch (err) {
      console.error('Kayıt hatası:', err)
      alert('Dinozor kaydedilemedi!')
    } finally {
      setLoading(false)
    }
  }

  function updateAbility(idx: number, field: string, value: any) {
    const newAbilities = [...form.abilities]
    ;(newAbilities[idx] as any)[field] = value
    setForm({ ...form, abilities: newAbilities })
  }

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto relative">
      {/* Arka plan efekti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-96 h-96 bg-neon-purple opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-neon-cyan opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <button
          onClick={onBack}
          className="px-4 py-2 glass-dark neon-border-cyan rounded-lg font-bold text-neon-cyan hover:shadow-neon-cyan transition"
        >
          ← Geri
        </button>

        <h1 className="text-4xl font-black text-center mt-4 text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink">✨ Yeni Dinozor</h1>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto w-full flex flex-col gap-4 mt-6">
          {/* Temel Bilgiler */}
          <div className="glass-dark neon-border-cyan rounded-lg p-4">
            <h2 className="text-xl font-bold text-neon-cyan mb-3">Temel Bilgiler</h2>

            <div className="mb-3">
              <label className="block font-bold text-neon-cyan mb-1">Ad *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-neon-cyan/30 rounded text-lg font-bold text-neon-cyan placeholder-neon-cyan/40"
                placeholder="Dinozor adı"
              />
            </div>

            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label className="block font-bold text-neon-cyan mb-1">Element</label>
                <select
                  value={form.element}
                  onChange={e => setForm({ ...form, element: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-neon-cyan/30 rounded font-bold text-neon-cyan"
                >
                  <option>Yeşil</option>
                  <option>Kırmızı</option>
                  <option>Mavi</option>
                  <option>Sarı</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="block font-bold text-neon-cyan mb-1">Pasif Yetenek (İsteğe bağlı)</label>
              <input
                type="text"
                value={form.passive}
                onChange={e => setForm({ ...form, passive: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-neon-cyan/30 rounded text-sm text-neon-cyan placeholder-neon-cyan/40"
                placeholder="Örn: Her tur sonu can kazanır"
              />
            </div>
          </div>

          {/* İstatistikler */}
          <div className="glass-dark neon-border-purple rounded-lg p-4">
            <h2 className="text-xl font-bold text-neon-purple mb-3">İstatistikler</h2>

            <div className="grid grid-cols-2 gap-3">
              {(['maxHp', 'atk', 'def', 'spd'] as const).map(stat => (
                <div key={stat}>
                  <label className="block font-bold text-neon-purple mb-1">
                    {stat === 'maxHp' ? '❤️ HP' : stat === 'atk' ? '⚔️ ATK' : stat === 'def' ? '🛡️ DEF' : '⚡ SPD'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form[stat]}
                    onChange={e => setForm({ ...form, [stat]: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-neon-purple/30 rounded font-bold text-lg text-neon-purple"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Yetenekler */}
          <div className="glass-dark neon-border-cyan rounded-lg p-4">
            <h2 className="text-xl font-bold text-neon-cyan mb-3">Yetenekler (maksimum 5)</h2>

            <div className="flex flex-col gap-3">
              {form.abilities.map((ability, idx) => (
                <div key={idx} className="glass border border-neon-cyan/30 rounded p-3">
                  {editingAbility === idx ? (
                    <>
                      <div className="mb-2">
                        <label className="block text-sm font-bold text-neon-cyan mb-1">Ad</label>
                        <input
                          type="text"
                          value={ability.name}
                          onChange={e => updateAbility(idx, 'name', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-800 border border-neon-cyan/30 rounded text-sm text-neon-cyan placeholder-neon-cyan/40"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div>
                          <label className="block text-xs font-bold text-neon-cyan mb-1">CD</label>
                          <input
                            type="number"
                            min="0"
                            value={ability.cd}
                            onChange={e => updateAbility(idx, 'cd', parseInt(e.target.value))}
                            className="w-full px-2 py-1 bg-slate-800 border border-neon-cyan/30 rounded text-sm text-neon-cyan"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-neon-cyan mb-1">Tür</label>
                          <select
                            value={ability.kind}
                            onChange={e => updateAbility(idx, 'kind', e.target.value)}
                            className="w-full px-2 py-1 bg-slate-800 border border-neon-cyan/30 rounded text-sm text-neon-cyan"
                          >
                            <option value="buff">Buff</option>
                            <option value="debuff">Debuff</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-neon-cyan mb-1">Efekt</label>
                          <select
                            value={ability.effect}
                            onChange={e => updateAbility(idx, 'effect', e.target.value)}
                            className="w-full px-2 py-1 bg-slate-800 border border-neon-cyan/30 rounded text-sm text-neon-cyan"
                          >
                            <option value="none">Yok</option>
                            <option value="poison">Zehir</option>
                            <option value="stun">Sersem</option>
                            <option value="stop">Dur</option>
                            <option value="power">Güç+</option>
                            <option value="speed">Hız+</option>
                            <option value="shield">Kalkan+</option>
                          </select>
                        </div>
                      </div>

                      <div className="mb-2">
                        <label className="block text-xs font-bold text-neon-purple mb-1">Hasar Çarpanı (×)</label>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={ability.multiplier || 1}
                          onChange={e => updateAbility(idx, 'multiplier', parseFloat(e.target.value))}
                          className="w-full px-2 py-1 bg-slate-800 border border-neon-purple/30 rounded text-sm text-neon-purple"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setEditingAbility(null)}
                        className="w-full px-2 py-1 glass-dark neon-border-purple rounded text-sm font-bold text-neon-purple hover:shadow-neon-purple transition"
                      >
                        Tamam
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingAbility(idx)}
                      className="w-full text-left p-2 hover:bg-slate-700/50 rounded transition"
                    >
                      <p className="font-bold text-neon-cyan">{ability.name}</p>
                      <p className="text-xs text-neon-cyan/70">
                        CD: {ability.cd} • {ability.kind} • {ability.effect} • ×{ability.multiplier || 1}
                      </p>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !form.name}
            className="w-full px-6 py-4 glass-dark neon-border-purple rounded-lg font-bold text-lg text-neon-purple hover:shadow-neon-purple disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition"
          >
            {loading ? '⏳ Kaydediliyor...' : '✨ Dinozoru Kaydet'}
          </button>
        </form>
      </div>
    </div>
  )
}
