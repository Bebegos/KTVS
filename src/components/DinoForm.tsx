import { useState } from 'react'
import { Dino, DinoAbility } from '../game/types'
import { createDino, getDinos } from '../lib/supabase'

interface DinoFormProps {
  onBack: () => void
  onRefresh: (dinos: Dino[]) => void
}

const DEFAULT_ABILITIES: DinoAbility[] = [
  { name: 'Pençe Saldırısı', cd: 0, kind: 'debuff', effect: 'none' },
  { name: 'Zehirli Isırık', cd: 2, kind: 'debuff', effect: 'poison' },
  { name: 'Güçlendirme', cd: 3, kind: 'buff', effect: 'power' },
  { name: 'Hızlı Koşu', cd: 2, kind: 'buff', effect: 'speed' },
  { name: 'ULTI: Meteor', cd: 4, kind: 'debuff', effect: 'stop' },
]

export default function DinoForm({ onBack, onRefresh }: DinoFormProps) {
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
      })

      const updated = await getDinos()
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
    <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
      <button
        onClick={onBack}
        className="self-start px-4 py-2 bg-gray-500 text-white rounded font-bold"
      >
        ← Geri
      </button>

      <h1 className="text-3xl font-bold text-dino-700 text-center">✨ Yeni Dinozor</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto w-full flex flex-col gap-4">
        {/* Temel Bilgiler */}
        <div className="bg-white border-2 border-dino-300 rounded-lg p-4">
          <h2 className="text-xl font-bold text-dino-700 mb-3">Temel Bilgiler</h2>

          <div className="mb-3">
            <label className="block font-bold text-dino-700 mb-1">Ad *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border-2 border-dino-300 rounded text-lg font-bold"
              placeholder="Dinozor adı"
            />
          </div>

          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <label className="block font-bold text-dino-700 mb-1">Element</label>
              <select
                value={form.element}
                onChange={e => setForm({ ...form, element: e.target.value })}
                className="w-full px-3 py-2 border-2 border-dino-300 rounded font-bold"
              >
                <option>Yeşil</option>
                <option>Kırmızı</option>
                <option>Mavi</option>
                <option>Sarı</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="block font-bold text-dino-700 mb-1">Pasif Yetenek (İsteğe bağlı)</label>
            <input
              type="text"
              value={form.passive}
              onChange={e => setForm({ ...form, passive: e.target.value })}
              className="w-full px-3 py-2 border-2 border-dino-300 rounded text-sm"
              placeholder="Örn: Her tur sonu can kazanır"
            />
          </div>
        </div>

        {/* İstatistikler */}
        <div className="bg-white border-2 border-dino-300 rounded-lg p-4">
          <h2 className="text-xl font-bold text-dino-700 mb-3">İstatistikler</h2>

          <div className="grid grid-cols-2 gap-3">
            {(['maxHp', 'atk', 'def', 'spd'] as const).map(stat => (
              <div key={stat}>
                <label className="block font-bold text-dino-700 mb-1">
                  {stat === 'maxHp' ? '❤️ HP' : stat === 'atk' ? '⚔️ ATK' : stat === 'def' ? '🛡️ DEF' : '⚡ SPD'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={form[stat]}
                  onChange={e => setForm({ ...form, [stat]: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border-2 border-dino-300 rounded font-bold text-lg"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Yetenekler */}
        <div className="bg-white border-2 border-dino-300 rounded-lg p-4">
          <h2 className="text-xl font-bold text-dino-700 mb-3">Yetenekler (maksimum 5)</h2>

          <div className="flex flex-col gap-3">
            {form.abilities.map((ability, idx) => (
              <div key={idx} className="border-2 border-dino-200 rounded p-3">
                {editingAbility === idx ? (
                  <>
                    <div className="mb-2">
                      <label className="block text-sm font-bold text-dino-700 mb-1">Ad</label>
                      <input
                        type="text"
                        value={ability.name}
                        onChange={e => updateAbility(idx, 'name', e.target.value)}
                        className="w-full px-2 py-1 border border-dino-300 rounded text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div>
                        <label className="block text-xs font-bold text-dino-700 mb-1">CD</label>
                        <input
                          type="number"
                          min="0"
                          value={ability.cd}
                          onChange={e => updateAbility(idx, 'cd', parseInt(e.target.value))}
                          className="w-full px-2 py-1 border border-dino-300 rounded text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-dino-700 mb-1">Tür</label>
                        <select
                          value={ability.kind}
                          onChange={e => updateAbility(idx, 'kind', e.target.value)}
                          className="w-full px-2 py-1 border border-dino-300 rounded text-sm"
                        >
                          <option value="buff">Buff</option>
                          <option value="debuff">Debuff</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-dino-700 mb-1">Efekt</label>
                        <select
                          value={ability.effect}
                          onChange={e => updateAbility(idx, 'effect', e.target.value)}
                          className="w-full px-2 py-1 border border-dino-300 rounded text-sm"
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

                    <button
                      type="button"
                      onClick={() => setEditingAbility(null)}
                      className="w-full px-2 py-1 bg-dino-500 text-white rounded text-sm font-bold"
                    >
                      Tamam
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingAbility(idx)}
                    className="w-full text-left p-2 hover:bg-dino-50 rounded"
                  >
                    <p className="font-bold text-dino-700">{ability.name}</p>
                    <p className="text-xs text-dino-600">
                      CD: {ability.cd} • {ability.kind} • {ability.effect}
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
          className="w-full px-6 py-4 bg-purple-500 text-white rounded-lg font-bold text-lg hover:bg-purple-600 disabled:bg-gray-400"
        >
          {loading ? '⏳ Kaydediliyor...' : '✨ Dinozoru Kaydet'}
        </button>
      </form>
    </div>
  )
}
