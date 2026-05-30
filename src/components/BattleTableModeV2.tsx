import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino, Ability, ActiveEffect } from '../game/types'
import { rollDice } from '../game/engine'

interface BattleTableModeV2Props {
  dino: Dino
  onBack: () => void
  onRefresh: (dinos: Dino[]) => void
}

interface BattleChar {
  dino: Dino
  currentHp: number
  effects: ActiveEffect[]
  abilities: Ability[]
}

export default function BattleTableModeV2({ dino, onBack, onRefresh }: BattleTableModeV2Props) {
  const [character, setCharacter] = useState<BattleChar>({
    dino,
    currentHp: dino.maxHp,
    effects: [],
    abilities: dino.abilities.map((a, idx) => ({
      id: `${dino.id}-${idx}`,
      name: a.name,
      cd: 0,
      maxCd: a.cd,
      kind: a.kind,
      effect: a.effect,
    })),
  })

  const [diceRolling, setDiceRolling] = useState(false)
  const [lastDiceResult, setLastDiceResult] = useState<number | null>(null)
  const [lastDamageAbility, setLastDamageAbility] = useState<{ abilityIdx: number; damage: number } | null>(null)
  const [battleLog, setBattleLog] = useState<string[]>([])

  function rollDiceForAttack(abilityIdx: number) {
    if (diceRolling || character.abilities[abilityIdx].cd > 0) return

    setDiceRolling(true)
    const ability = character.abilities[abilityIdx]
    const diceResult = rollDice()
    setLastDiceResult(diceResult.value)

    setTimeout(() => {
      // Hasar hesapla
      const baseDamage = diceResult.value + character.dino.atk
      let damage = baseDamage

      if (diceResult.isCrit) {
        damage *= 2
      } else if (diceResult.isMiss) {
        damage = 0
      }

      setLastDamageAbility({ abilityIdx, damage })

      // Log
      const logMsg = `${ability.name} [Zar: ${diceResult.value}] → ${damage} hasar${
        diceResult.isCrit ? ' 🌟 KRİTİK!' : diceResult.isMiss ? ' ❌ IŞKA!' : ''
      }`
      setBattleLog(prev => [logMsg, ...prev.slice(0, 5)])

      // CD başlat
      const newAbilities = [...character.abilities]
      newAbilities[abilityIdx].cd = ability.maxCd
      setCharacter(c => ({ ...c, abilities: newAbilities }))

      setDiceRolling(false)
    }, 800)
  }

  function rollDiceManual() {
    if (diceRolling) return
    setDiceRolling(true)
    const diceResult = rollDice()
    setLastDiceResult(diceResult.value)
    setBattleLog(prev => [`Zar: ${diceResult.value}`, ...prev.slice(0, 5)])

    setTimeout(() => {
      setDiceRolling(false)
    }, 800)
  }

  function addEffect(effectType: string) {
    const newEffects = [...character.effects]
    const existing = newEffects.find(e => e.type === effectType)

    if (existing) {
      existing.duration = 2
    } else if (newEffects.length < 2) {
      newEffects.push({ type: effectType as any, duration: 2 })
    } else {
      alert('Maksimum 2 efekt aynı anda!')
      return
    }

    setCharacter(c => ({ ...c, effects: newEffects }))
    setBattleLog(prev => [`${getEffectName(effectType)} eklendi!`, ...prev.slice(0, 5)])
  }

  function removeEffect(idx: number) {
    const newEffects = character.effects.filter((_, i) => i !== idx)
    setCharacter(c => ({ ...c, effects: newEffects }))
    setBattleLog(prev => [`Efekt çıkarıldı`, ...prev.slice(0, 5)])
  }

  function updateHp(amount: number) {
    const newHp = Math.max(0, Math.min(character.dino.maxHp, character.currentHp + amount))
    setCharacter(c => ({ ...c, currentHp: newHp }))
  }

  function endTurn() {
    const newAbilities = character.abilities.map(a => ({
      ...a,
      cd: Math.max(0, a.cd - 1),
    }))

    let newEffects = character.effects.map(e => ({
      ...e,
      duration: e.duration - 1,
    })).filter(e => e.duration > 0)

    if (character.effects.some(e => e.type === 'poison')) {
      updateHp(-3)
      setBattleLog(prev => ['☠️ Zehir hasarı: -3', ...prev.slice(0, 5)])
    }

    setCharacter(c => ({
      ...c,
      abilities: newAbilities,
      effects: newEffects,
    }))
  }

  const hpPercent = (character.currentHp / character.dino.maxHp) * 100
  const hpColor = hpPercent > 50 ? 'bg-green-500' : hpPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-100 overflow-hidden">
      {/* Üst Bar */}
      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-700 to-green-900 text-white shadow-lg border-b-4 border-green-900">
        <button
          onClick={onBack}
          className="px-3 py-1 bg-red-600 rounded-lg font-bold text-sm hover:bg-red-700"
        >
          🚪 Çık
        </button>
        <h1 className="font-black text-lg">🎲 MASADA OYN - {character.dino.name}</h1>
        <div className="w-20 text-right">
          <p className="font-black text-sm">Lvl {character.dino.level}</p>
        </div>
      </div>

      {/* Ana İçerik - Responsive Grid */}
      <div className="flex-1 overflow-auto p-3 md:p-4">
        <div className="max-w-6xl mx-auto">
          {/* Parşömen Kartı */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-green-50 via-yellow-50 to-yellow-100 border-6 border-green-700 rounded-2xl p-4 md:p-6 shadow-2xl"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="2" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.03"/%3E%3C/svg%3E")',
            }}
          >
            {/* Grid Layout - Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Sol Sütun - HP & Statlar */}
              <div className="space-y-4">
                {/* Başlık */}
                <div className="bg-green-700 text-white rounded-xl p-3 text-center">
                  <p className="text-3xl mb-1">🦖</p>
                  <h2 className="font-black text-xl">{character.dino.name}</h2>
                  <p className="text-sm font-bold">Seviye {character.dino.level}</p>
                </div>

                {/* HP Slider */}
                <div className="bg-white border-4 border-red-500 rounded-lg p-3">
                  <div className="flex justify-between mb-2">
                    <span className="font-black text-red-700">❤️ CAN</span>
                    <span className="font-bold text-red-700">{Math.round(character.currentHp)}/{character.dino.maxHp}</span>
                  </div>

                  {/* Görsel Slider */}
                  <input
                    type="range"
                    min="0"
                    max={character.dino.maxHp}
                    value={character.currentHp}
                    onChange={e => updateHp(parseFloat(e.target.value) - character.currentHp)}
                    className="w-full h-6 rounded-lg appearance-none bg-gray-300 cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${hpColor} 0%, ${hpColor} ${hpPercent}%, #d1d5db ${hpPercent}%, #d1d5db 100%)`,
                    }}
                  />

                  {/* HP Kontrol Butonları */}
                  <div className="grid grid-cols-4 gap-1 mt-2">
                    <button
                      onClick={() => updateHp(-10)}
                      className="px-1 py-1 bg-red-600 text-white rounded font-black text-xs hover:bg-red-700"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => updateHp(-5)}
                      className="px-1 py-1 bg-red-500 text-white rounded font-black text-xs hover:bg-red-600"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => updateHp(5)}
                      className="px-1 py-1 bg-green-500 text-white rounded font-black text-xs hover:bg-green-600"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => updateHp(10)}
                      className="px-1 py-1 bg-green-600 text-white rounded font-black text-xs hover:bg-green-700"
                    >
                      +10
                    </button>
                  </div>
                </div>

                {/* Statlar */}
                <div className="bg-green-100 border-3 border-green-600 rounded-lg p-3 text-center">
                  <p className="font-black text-green-700 text-xs mb-2">STATLAR</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-orange-700">⚔️ SALDIRI:</span>
                      <span className="text-2xl font-black text-orange-700">{character.dino.atk}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-blue-700">🛡️ SAVUNMA:</span>
                      <span className="text-2xl font-black text-blue-700">{character.dino.def}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-purple-700">⚡ HIZ:</span>
                      <span className="text-2xl font-black text-purple-700">{character.dino.spd}</span>
                    </div>
                  </div>
                </div>

                {/* Efektler */}
                <div className="bg-purple-100 border-3 border-purple-600 rounded-lg p-3">
                  <p className="text-xs font-black text-purple-700 mb-2">AKTIF EFEKTLER ({character.effects.length}/2)</p>
                  <div className="flex gap-2">
                    {[0, 1].map(idx => (
                      <div key={idx} className="flex-1">
                        {character.effects[idx] ? (
                          <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            onClick={() => removeEffect(idx)}
                            className={`w-full aspect-square rounded-lg border-3 flex flex-col items-center justify-center font-black cursor-pointer hover:opacity-80 transition ${getEffectBg(
                              character.effects[idx].type
                            )}`}
                          >
                            <p className="text-2xl">{getEffectEmoji(character.effects[idx].type)}</p>
                            <p className="text-xs font-black">{character.effects[idx].duration}</p>
                          </motion.button>
                        ) : (
                          <div className="w-full aspect-square rounded-lg border-3 border-dashed border-gray-400 bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-500 text-xs font-bold">Boş</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Orta/Sağ Sütun - Saldırılar & Zar */}
              <div className="lg:col-span-2 space-y-4">
                {/* Yetenekler Grid (1-5) */}
                <div className="bg-white border-4 border-green-600 rounded-lg p-4">
                  <p className="font-black text-green-700 text-sm mb-3 text-center">YETENEKLER</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {/* 1-4 Normal Yetenekler */}
                    {character.abilities.slice(0, 4).map((ability, idx) => (
                      <AbilityButton
                        key={idx}
                        ability={ability}
                        idx={idx}
                        disabled={character.abilities[idx].cd > 0 || diceRolling}
                        onClick={() => rollDiceForAttack(idx)}
                        damage={lastDamageAbility?.abilityIdx === idx ? lastDamageAbility.damage : null}
                      />
                    ))}
                  </div>

                  {/* 5. ULTI (Full Width) */}
                  {character.abilities[4] && (
                    <div className="mb-3">
                      <AbilityButton
                        ability={character.abilities[4]}
                        idx={4}
                        disabled={character.abilities[4].cd > 0 || diceRolling}
                        onClick={() => rollDiceForAttack(4)}
                        damage={lastDamageAbility?.abilityIdx === 4 ? lastDamageAbility.damage : null}
                        isUlti
                      />
                    </div>
                  )}

                  {/* Zar Widget (Orta) */}
                  <div className="bg-gradient-to-br from-yellow-300 to-yellow-500 border-4 border-yellow-600 rounded-xl p-4 text-center shadow-lg">
                    <p className="font-black text-yellow-900 text-xs mb-2">ZAR WIDGET</p>
                    <motion.div
                      animate={diceRolling ? { rotateX: 360, rotateY: 360 } : {}}
                      transition={{ duration: 0.6 }}
                      className="text-6xl font-black mb-3 cursor-pointer hover:scale-110 transition"
                      onClick={rollDiceManual}
                    >
                      {diceRolling ? '🎲' : lastDiceResult || '?'}
                    </motion.div>
                    <button
                      onClick={rollDiceManual}
                      disabled={diceRolling}
                      className="w-full px-3 py-2 bg-yellow-600 text-white rounded-lg font-black text-sm hover:bg-yellow-700 disabled:opacity-50"
                    >
                      🎲 ZAR AT
                    </button>
                  </div>

                  {/* Efekt Ekleme Butonları */}
                  <div className="mt-3 pt-3 border-t-3 border-green-600">
                    <p className="font-black text-green-700 text-xs mb-2">BUFF/DEBUFF EKLE:</p>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { type: 'poison', emoji: '☠️', name: 'Zehir' },
                        { type: 'power', emoji: '⚔️', name: 'Güç+' },
                        { type: 'shield', emoji: '🛡️', name: 'Kalkan+' },
                      ].map(e => (
                        <button
                          key={e.type}
                          onClick={() => addEffect(e.type)}
                          className={`p-2 rounded-lg font-bold text-xs border-2 ${getEffectBg(e.type)} hover:opacity-80 transition`}
                        >
                          {e.emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tur Sonlandır */}
                  <button
                    onClick={endTurn}
                    className="w-full mt-3 px-4 py-3 bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg font-black text-lg hover:shadow-lg active:scale-95 transition"
                  >
                    ✅ TURU BITIR
                  </button>
                </div>

                {/* Savaş Günlüğü */}
                <div className="bg-white border-3 border-purple-500 rounded-lg p-3 max-h-32 overflow-y-auto">
                  <p className="font-black text-purple-700 text-xs mb-2">📋 GÜNLÜK:</p>
                  {battleLog.map((log, idx) => (
                    <p key={idx} className="text-purple-700 font-bold text-xs mb-0.5">
                      {log}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function AbilityButton({
  ability,
  idx,
  disabled,
  onClick,
  damage,
  isUlti = false,
}: {
  ability: Ability
  idx: number
  disabled: boolean
  onClick: () => void
  damage: number | null
  isUlti?: boolean
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`relative p-3 rounded-lg font-bold border-3 transition flex items-center justify-between ${
        isUlti
          ? 'w-full bg-gradient-to-r from-yellow-300 to-orange-400 border-yellow-600'
          : 'bg-gradient-to-br from-green-400 to-green-500 border-green-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}`}
    >
      <div className="text-left">
        <p className="text-sm font-black text-gray-900">{ability.name}</p>
        {ability.cd > 0 && (
          <p className="text-xs font-bold text-red-700">CD: {ability.cd}</p>
        )}
      </div>

      {damage !== null && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-2xl font-black text-red-600 ml-2"
        >
          💥 {damage}
        </motion.div>
      )}
    </motion.button>
  )
}

function getEffectEmoji(type: string): string {
  const emojis: Record<string, string> = {
    poison: '☠️',
    stun: '🌀',
    stop: '🛑',
    power: '⚔️',
    speed: '⚡',
    shield: '🛡️',
  }
  return emojis[type] || '❓'
}

function getEffectName(type: string): string {
  const names: Record<string, string> = {
    poison: 'Zehir',
    stun: 'Sersem',
    stop: 'Dur',
    power: 'Güç+',
    speed: 'Hız+',
    shield: 'Kalkan+',
  }
  return names[type] || type
}

function getEffectBg(type: string): string {
  const styles: Record<string, string> = {
    poison: 'bg-purple-300 border-purple-700 text-purple-900',
    stun: 'bg-yellow-300 border-yellow-700 text-yellow-900',
    stop: 'bg-red-300 border-red-700 text-red-900',
    power: 'bg-green-300 border-green-700 text-green-900',
    speed: 'bg-blue-300 border-blue-700 text-blue-900',
    shield: 'bg-cyan-300 border-cyan-700 text-cyan-900',
  }
  return styles[type] || 'bg-gray-300 border-gray-700'
}
