import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino, Ability, ActiveEffect } from '../game/types'
import { rollDice, calculateDamage } from '../game/engine'
import { abilityDefinitionService } from '../lib/services/abilityDefinitionService'

interface BattleTableModeProps {
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

export default function BattleTableMode({ dino, onBack, onRefresh }: BattleTableModeProps) {
  const abilities = dino.abilityIds
    .map((abilityId) => {
      if (!abilityId) return null
      const def = abilityDefinitionService.getAbility(abilityId)
      if (!def) return null
      return {
        id: abilityId,
        name: def.name,
        cd: 0,
        maxCd: def.cooldown || 0,
        kind: def.kind,
        effects: def.effects || [],
      }
    })
    .filter((a): a is Ability => a !== null)

  const [character, setCharacter] = useState<BattleChar>({
    dino,
    currentHp: dino.maxHp,
    effects: [],
    abilities,
  })

  const [selectedAbility, setSelectedAbility] = useState<number | null>(null)
  const [diceRolling, setDiceRolling] = useState(false)
  const [lastDiceResult, setLastDiceResult] = useState<number | null>(null)
  const [lastDamage, setLastDamage] = useState<number | null>(null)
  const [battleLog, setBattleLog] = useState<string[]>([])

  function handleAttack(abilityIdx: number) {
    if (diceRolling || character.abilities[abilityIdx].cd > 0) return

    setSelectedAbility(abilityIdx)
    setDiceRolling(true)

    const ability = character.abilities[abilityIdx]
    const diceResult = rollDice()
    setLastDiceResult(diceResult.value)

    setTimeout(() => {
      // Hasar hesapla (basit formül: zar + STR)
      const baseDamage = diceResult.value + character.dino.atk
      let damage = baseDamage

      if (diceResult.isCrit) {
        damage *= 2
      } else if (diceResult.isMiss) {
        damage = 0
      }

      setLastDamage(damage)

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
      setSelectedAbility(null)
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
    // CD'leri azalt
    const newAbilities = character.abilities.map(a => ({
      ...a,
      cd: Math.max(0, a.cd - 1),
    }))

    // Efektlerin sürelerini azalt
    let newEffects = character.effects.map(e => ({
      ...e,
      duration: e.duration - 1,
    })).filter(e => e.duration > 0)

    // Zehir hasarı
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
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-dino-50 via-blue-50 to-purple-50 overflow-hidden">
      {/* Üst Bar */}
      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-dino-500 to-blue-500 text-white shadow-lg">
        <button
          onClick={onBack}
          className="hs-btn hs-btn-red hs-btn-sm"
        >
          🚪 Çık
        </button>
        <h1 className="font-black text-lg">🎲 MASADA OYN</h1>
        <div className="w-24 text-right">
          <p className="font-black text-sm">Lvl {character.dino.level}</p>
        </div>
      </div>

      {/* Ana İçerik */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Karakter Kartı (Büyük) */}
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-gradient-to-b from-dino-50 to-dino-100 border-6 border-dino-500 rounded-2xl p-6 shadow-2xl"
          >
            {/* Başlık */}
            <div className="text-center mb-4 pb-4 border-b-4 border-dino-400">
              <p className="text-6xl mb-2">🦖</p>
              <h2 className="text-3xl font-black text-dino-700">{character.dino.name}</h2>
              <p className="text-sm text-dino-600 font-bold">Seviye {character.dino.level}</p>
            </div>

            {/* HP */}
            <div className="mb-4 bg-white border-3 border-red-400 rounded-lg p-3">
              <div className="flex justify-between mb-1">
                <span className="font-black text-red-700">❤️ CAN</span>
                <span className="font-bold text-red-700">{Math.round(character.currentHp)}/{character.dino.maxHp}</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-8 overflow-hidden border-2 border-red-400">
                <motion.div
                  className={`h-full ${hpColor}`}
                  animate={{ width: `${hpPercent}%` }}
                  transition={{ type: 'spring' }}
                />
              </div>
              {/* HP Kontrol */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => updateHp(-5)}
                  className="hs-btn hs-btn-red hs-btn-sm flex-1"
                >
                  -5
                </button>
                <button
                  onClick={() => updateHp(-10)}
                  className="hs-btn hs-btn-red hs-btn-sm flex-1"
                >
                  -10
                </button>
                <button
                  onClick={() => updateHp(5)}
                  className="hs-btn hs-btn-green hs-btn-sm flex-1"
                >
                  +5
                </button>
                <button
                  onClick={() => updateHp(10)}
                  className="hs-btn hs-btn-green hs-btn-sm flex-1"
                >
                  +10
                </button>
              </div>
            </div>

            {/* Statlar */}
            <div className="grid grid-cols-3 gap-2 mb-4 bg-white border-3 border-dino-300 rounded-lg p-2">
              <div className="text-center">
                <p className="text-xs font-bold text-orange-700">⚔️</p>
                <p className="text-2xl font-black text-orange-700">{character.dino.atk}</p>
              </div>
              <div className="text-center border-x-2 border-dino-300">
                <p className="text-xs font-bold text-blue-700">🛡️</p>
                <p className="text-2xl font-black text-blue-700">{character.dino.def}</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-purple-700">⚡</p>
                <p className="text-2xl font-black text-purple-700">{character.dino.spd}</p>
              </div>
            </div>

            {/* Aktif Efektler */}
            <div className="mb-4 bg-white border-3 border-purple-300 rounded-lg p-2">
              <p className="text-xs font-bold text-purple-700 mb-1">AKTIF EFEKTLER ({character.effects.length}/5)</p>
              <div className="flex gap-2 min-h-16 overflow-x-auto">
                {[0, 1, 2, 3, 4].map(idx => (
                  <div key={idx} className="flex-1 relative">
                    {character.effects[idx] ? (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        onClick={() => removeEffect(idx)}
                        className={`w-full aspect-square rounded-xl border-4 flex flex-col items-center justify-center font-black text-lg cursor-pointer hover:opacity-80 transition ${getEffectBg(
                          character.effects[idx].type
                        )}`}
                      >
                        <p className="text-2xl">{getEffectEmoji(character.effects[idx].type)}</p>
                        <p className="text-xs">{character.effects[idx].duration} tur</p>
                      </motion.button>
                    ) : (
                      <div className="w-full aspect-square rounded-xl border-4 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                        <span className="text-gray-400 text-xs font-bold">Boş</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Alt Kontrol Paneli */}
        <div className="bg-white border-t-4 border-dino-500 p-4 shadow-lg overflow-y-auto max-h-48">
          {/* Saldırı Seçimi */}
          <div className="mb-3">
            <p className="font-black text-dino-700 mb-1 text-xs">⚔️ SALDIRI SEÇ:</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-1">
              {character.abilities.map((ability, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => handleAttack(idx)}
                  disabled={diceRolling || ability.cd > 0}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hs-btn hs-btn-green hs-btn-sm"
                >
                  <div>{ability.name}</div>
                  {ability.cd > 0 && <div className="text-xs">CD:{ability.cd}</div>}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Zar Widgeti */}
          <div className="mb-3 flex items-center justify-center gap-3">
            <motion.div
              animate={diceRolling ? { rotateX: 360, rotateY: 360 } : {}}
              transition={{ duration: 0.6 }}
              className="w-16 h-16 flex items-center justify-center text-4xl font-black bg-gradient-to-br from-yellow-300 to-yellow-500 border-4 border-yellow-600 rounded-lg shadow-lg cursor-pointer"
            >
              {diceRolling ? '🎲' : lastDiceResult || '?'}
            </motion.div>

            {lastDamage !== null && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <p className={`text-2xl font-black ${lastDamage === 0 ? 'text-gray-600' : 'text-red-600'}`}>
                  {lastDamage === 0 ? '❌' : `💥 ${lastDamage}`}
                </p>
              </motion.div>
            )}
          </div>

          {/* Efekt + Tur */}
          <div className="flex gap-2">
            <div className="flex-1">
              <p className="font-black text-purple-700 text-xs mb-1">✨ BUFF/DEBUFF:</p>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { type: 'poison', emoji: '☠️' },
                  { type: 'power', emoji: '⚔️' },
                  { type: 'shield', emoji: '🛡️' },
                ].map(e => (
                  <button
                    key={e.type}
                    onClick={() => addEffect(e.type)}
                    className={`p-2 rounded text-sm font-black border-2 ${getEffectBg(e.type)}`}
                  >
                    {e.emoji}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={endTurn}
              className="hs-btn hs-btn-green"
            >
              ✅<br />TURU<br />BITIR
            </button>
          </div>
        </div>
      </div>
    </div>
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
    poison: 'bg-purple-200 border-purple-600 text-purple-900',
    stun: 'bg-yellow-200 border-yellow-600 text-yellow-900',
    stop: 'bg-red-200 border-red-600 text-red-900',
    power: 'bg-green-200 border-green-600 text-green-900',
    speed: 'bg-blue-200 border-blue-600 text-blue-900',
    shield: 'bg-cyan-200 border-cyan-600 text-cyan-900',
  }
  return styles[type] || 'bg-gray-200 border-gray-600'
}
