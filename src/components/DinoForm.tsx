import { useState } from 'react'
import { useAuth } from '../lib/auth-context'
import { Dino } from '../game/types'
import { createDino, getDinos } from '../lib/supabase'

interface DinoFormProps {
  onBack: () => void
  onRefresh: (dinos: Dino[]) => void
}

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
  })

  const [loading, setLoading] = useState(false)

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
        ability_ids: [], // Start with no abilities, they're earned through leveling
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
          className="hs-btn"
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

          {/* Note about abilities */}
          <div className="glass-dark neon-border-cyan rounded-lg p-4">
            <p className="text-sm text-neon-cyan/80">
              💡 Yetenekler dinozor seviyelendirildiğinde kazanılır. Seviyelendir ve yeni yetenekleri kilit aç!
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !form.name}
            className="hs-btn hs-btn-purple hs-btn-lg hs-btn-block"
          >
            {loading ? '⏳ Kaydediliyor...' : '✨ Dinozoru Kaydet'}
          </button>
        </form>
      </div>
    </div>
  )
}
