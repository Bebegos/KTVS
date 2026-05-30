import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino, Ability, ActiveEffect } from '../game/types'
import { rollDice } from '../game/engine'
import AbilityIcon from './AbilityIcon'
import BattleEffectVisuals from './BattleEffectVisuals'
import { getEffectNameTR, getEffectEmoji, isBuffEffect } from '../lib/effect-translations'

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
  // Dino'nun maxHp'sini kontrol et ve fallback sağla
  const maxHp = dino?.maxHp ?? 30

  const [character, setCharacter] = useState<BattleChar>({
    dino,
    currentHp: maxHp,
    effects: [],
    abilities: (dino?.abilities ?? []).map((a, idx) => ({
      id: `${dino.id}-${idx}`,
      name: a.name,
      cd: 0,
      maxCd: a.cd,
      kind: a.kind,
      effect: a.effect,
      multiplier: a.multiplier,
    })),
  })

  const [diceRolling, setDiceRolling] = useState(false)
  const [lastDiceResult, setLastDiceResult] = useState<number | null>(null)
  const [lastDamageAbility, setLastDamageAbility] = useState<{ abilityIdx: number; damage: number } | null>(null)
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [currentEffectVisual, setCurrentEffectVisual] = useState<'buff' | 'debuff' | 'damage' | null>(null)
  const [showEffectVisual, setShowEffectVisual] = useState(false)
  const [abilityUsedThisTurn, setAbilityUsedThisTurn] = useState(false)
  const [showSkipTurnModal, setShowSkipTurnModal] = useState(false)

  function rollDiceForAttack(abilityIdx: number) {
    if (diceRolling || character.abilities[abilityIdx].cd > 0) return

    setDiceRolling(true)
    const ability = character.abilities[abilityIdx]
    const diceResult = rollDice()
    setLastDiceResult(diceResult.value)

    setTimeout(() => {
      // Hasar hesapla
      const baseDamage = diceResult.value + character.dino.atk
      let damage = baseDamage * (ability.multiplier || 1)

      if (diceResult.isCrit) {
        damage *= 2
      } else if (diceResult.isMiss) {
        damage = 0
      }

      setLastDamageAbility({ abilityIdx, damage })

      // Show damage effect visual
      setCurrentEffectVisual('damage')
      setShowEffectVisual(true)
      setTimeout(() => setShowEffectVisual(false), 1500)

      // Log
      const logMsg = `${ability.name} [Zar: ${diceResult.value}] → ${Math.round(damage)} hasar${
        diceResult.isCrit ? ' 🌟 KRİTİK!' : diceResult.isMiss ? ' ❌ IŞKA!' : ''
      }`
      setBattleLog(prev => [logMsg, ...prev.slice(0, 5)])

      // CD başlat
      const newAbilities = [...character.abilities]
      newAbilities[abilityIdx].cd = ability.maxCd
      setCharacter(c => ({ ...c, abilities: newAbilities }))

      // Mark ability as used this turn
      setAbilityUsedThisTurn(true)
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
    const isBuff = ['power', 'speed', 'shield'].includes(effectType)

    // Show effect visual
    setCurrentEffectVisual(isBuff ? 'buff' : 'debuff')
    setShowEffectVisual(true)
    setTimeout(() => setShowEffectVisual(false), 1500)

    const newEffects = [...character.effects]
    const existing = newEffects.findIndex(e => e.type === effectType)

    if (existing !== -1) {
      // Efekt zaten var, süresi resetle
      newEffects[existing].duration = 2
      setBattleLog(prev => [`${getEffectName(effectType)} yenilendi!`, ...prev.slice(0, 5)])
    } else if (newEffects.length < 2) {
      // Slot boş, direkt ekle
      newEffects.push({ type: effectType as any, duration: 2 })
      setBattleLog(prev => [`${getEffectName(effectType)} eklendi!`, ...prev.slice(0, 5)])
    } else {
      // 2 efekt zaten var, en eskisini çıkar
      newEffects.shift() // En eski olanı sil
      newEffects.push({ type: effectType as any, duration: 2 })
      setBattleLog(prev => [`${getEffectName(effectType)} eklendi! (Eski efekt çıkarıldı)`, ...prev.slice(0, 5)])
    }

    setCharacter(c => ({ ...c, effects: newEffects }))
  }

  function removeEffect(idx: number) {
    const newEffects = character.effects.filter((_, i) => i !== idx)
    setCharacter(c => ({ ...c, effects: newEffects }))
    setBattleLog(prev => [`Efekt çıkarıldı`, ...prev.slice(0, 5)])
  }

  function updateHp(amount: number) {
    const newHp = Math.max(0, Math.min(maxHp, character.currentHp + amount))
    setCharacter(c => ({ ...c, currentHp: newHp }))
  }

  function endTurn() {
    // Check if ability was used this turn
    if (!abilityUsedThisTurn) {
      setShowSkipTurnModal(true)
      return
    }

    const newAbilities = character.abilities.map(a => ({
      ...a,
      cd: Math.max(0, a.cd - 1),
    }))

    let newEffects = character.effects.map(e => ({
      ...e,
      duration: e.duration - 1,
    })).filter(e => e.duration > 0)

    // Apply effect damages
    if (character.effects.some(e => e.type === 'poison')) {
      updateHp(-3)
      setBattleLog(prev => ['☠️ Zehir hasarı: -3', ...prev.slice(0, 5)])
    }

    if (character.effects.some(e => e.type === 'stun')) {
      setBattleLog(prev => ['🌀 Sersem durumdan işlem yapılamıyor!', ...prev.slice(0, 5)])
    }

    if (character.effects.some(e => e.type === 'stop')) {
      setBattleLog(prev => ['🛑 Durdurulmuş durumdan işlem yapılamıyor!', ...prev.slice(0, 5)])
    }

    setCharacter(c => ({
      ...c,
      abilities: newAbilities,
      effects: newEffects,
    }))

    // Reset ability used flag for next turn
    setAbilityUsedThisTurn(false)
  }

  function confirmSkipTurn() {
    setShowSkipTurnModal(false)
    setAbilityUsedThisTurn(false)
    endTurn()
  }

  const hpPercent = (character.currentHp / maxHp) * 100

  return (
    <div className="w-screen h-screen flex flex-col relative overflow-hidden">
      {/* Battle effect visuals */}
      <BattleEffectVisuals effectType={currentEffectVisual} isVisible={showEffectVisual} />

      {/* Arka plan blur efektleri */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-20 w-96 h-96 bg-neon-cyan opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-20 w-96 h-96 bg-neon-purple opacity-5 rounded-full blur-3xl"></div>
      </div>

      {/* Üst Bar */}
      <div className="relative z-10 flex justify-between items-center p-4 glass-dark neon-border-cyan border-b">
        <button
          onClick={onBack}
          className="px-4 py-2 glass-dark neon-border-pink rounded-lg font-bold text-neon-pink hover:shadow-neon-pink transition"
        >
          🚪 Çık
        </button>
        <h1 className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">
          🎲 MASADA OYN - {character.dino.name}
        </h1>
        <div className="text-right">
          <p className="font-black text-lg text-neon-cyan">Lvl {character.dino.level}</p>
        </div>
      </div>

      {/* Ana İçerik */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-6 relative z-10">
        <div className="max-w-7xl mx-auto h-full">
          {/* Ana Kart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark neon-border-cyan rounded-2xl p-6 md:p-8"
          >
            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sol Sütun - HP & Statlar */}
              <div className="space-y-4">
                {/* Başlık */}
                <div className="glass-dark neon-border-purple rounded-xl p-4 text-center">
                  <p className="text-4xl mb-2">🦖</p>
                  <h2 className="font-black text-2xl text-neon-purple">{character.dino.name}</h2>
                  <p className="text-sm font-bold text-neon-purple/80">Seviye {character.dino.level}</p>
                </div>

                {/* HP Slider */}
                <div className="glass border border-red-500/30 rounded-xl p-4">
                  <div className="flex justify-between mb-3">
                    <span className="font-black text-red-400">❤️ CAN</span>
                    <span className="font-bold text-red-400">{Math.round(character.currentHp)}/{maxHp}</span>
                  </div>

                  {/* Slider */}
                  <input
                    type="range"
                    min="0"
                    max={maxHp}
                    value={character.currentHp}
                    onChange={e => updateHp(parseFloat(e.target.value) - character.currentHp)}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-700"
                    style={{
                      background: `linear-gradient(to right, #00f3ff 0%, #d946ef ${hpPercent}%, #334155 ${hpPercent}%, #334155 100%)`,
                    }}
                  />

                  {/* HP Kontrol */}
                  <div className="grid grid-cols-4 gap-1 mt-3">
                    <button
                      onClick={() => updateHp(-10)}
                      className="px-2 py-1 glass-dark border border-red-500/50 rounded text-red-400 font-bold text-xs hover:shadow-red-500/50 transition"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => updateHp(-5)}
                      className="px-2 py-1 glass-dark border border-red-500/30 rounded text-red-400 font-bold text-xs hover:shadow-red-500/30 transition"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => updateHp(5)}
                      className="px-2 py-1 glass-dark border border-green-500/30 rounded text-green-400 font-bold text-xs hover:shadow-green-500/30 transition"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => updateHp(10)}
                      className="px-2 py-1 glass-dark border border-green-500/50 rounded text-green-400 font-bold text-xs hover:shadow-green-500/50 transition"
                    >
                      +10
                    </button>
                  </div>
                </div>

                {/* Statlar */}
                <div className="glass-dark neon-border-purple rounded-xl p-4">
                  <p className="font-black text-neon-purple text-xs mb-3 text-center">STATLAR</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center glass border border-orange-500/20 p-2 rounded">
                      <span className="font-bold text-orange-400">⚔️ ATK:</span>
                      <span className="text-xl font-black text-orange-400">{character.dino.atk}</span>
                    </div>
                    <div className="flex justify-between items-center glass border border-blue-500/20 p-2 rounded">
                      <span className="font-bold text-blue-400">🛡️ DEF:</span>
                      <span className="text-xl font-black text-blue-400">{character.dino.def}</span>
                    </div>
                    <div className="flex justify-between items-center glass border border-yellow-500/20 p-2 rounded">
                      <span className="font-bold text-yellow-400">⚡ SPD:</span>
                      <span className="text-xl font-black text-yellow-400">{character.dino.spd}</span>
                    </div>
                  </div>
                </div>

                {/* Efektler */}
                <div className="glass-dark neon-border-pink rounded-xl p-4">
                  <p className="text-xs font-black text-neon-pink mb-3 text-center">AKTIF EFEKTLER ({character.effects.length}/2)</p>
                  <div className="flex gap-2">
                    {[0, 1].map(idx => (
                      <div key={idx} className="flex-1">
                        {character.effects[idx] ? (
                          <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            onClick={() => removeEffect(idx)}
                            className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center font-black cursor-pointer hover:opacity-80 transition ${
                              isBuffEffect(character.effects[idx].type)
                                ? 'glass-dark border-2 border-green-500 text-green-400'
                                : 'glass-dark border-2 border-red-500 text-red-400'
                            }`}
                          >
                            <p className="text-2xl">{getEffectEmoji(character.effects[idx].type)}</p>
                            <p className="text-xs font-black">{character.effects[idx].duration}</p>
                          </motion.button>
                        ) : (
                          <div className="w-full aspect-square rounded-lg border-2 border-dashed border-neon-cyan/30 glass flex items-center justify-center">
                            <span className="text-neon-cyan/50 text-xs font-bold">Boş</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Orta/Sağ Sütun - Yetenekler & Zar */}
              <div className="lg:col-span-2 space-y-4">
                {/* Yetenekler Grid */}
                <div className="glass-dark neon-border-cyan rounded-xl p-4">
                  <p className="font-black text-neon-cyan text-sm mb-4 text-center">⚡ YETENEKLER</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {/* 1-4 Normal Yetenekler */}
                    {character.abilities.slice(0, 4).map((ability, idx) => (
                      <AbilityButton
                        key={idx}
                        ability={ability}
                        idx={idx}
                        disabled={character.abilities[idx].cd > 0 || diceRolling || abilityUsedThisTurn}
                        onClick={() => rollDiceForAttack(idx)}
                        damage={lastDamageAbility?.abilityIdx === idx ? lastDamageAbility.damage : null}
                      />
                    ))}
                  </div>

                  {/* 5. ULTI */}
                  {character.abilities[4] && (
                    <div className="mb-4">
                      <AbilityButton
                        ability={character.abilities[4]}
                        idx={4}
                        disabled={character.abilities[4].cd > 0 || diceRolling || abilityUsedThisTurn}
                        onClick={() => rollDiceForAttack(4)}
                        damage={lastDamageAbility?.abilityIdx === 4 ? lastDamageAbility.damage : null}
                        isUlti
                      />
                    </div>
                  )}

                  {/* Zar Widget */}
                  <div className="glass-dark neon-border-purple rounded-xl p-4 text-center mb-4">
                    <p className="font-black text-neon-purple text-xs mb-3">🎲 ZAR WIDGET</p>
                    <motion.div
                      animate={diceRolling ? { rotateX: 360, rotateY: 360 } : {}}
                      transition={{ duration: 0.6 }}
                      className="text-6xl font-black mb-4 cursor-pointer hover:scale-110 transition text-neon-cyan"
                      onClick={rollDiceManual}
                    >
                      {diceRolling ? '🎲' : lastDiceResult || '?'}
                    </motion.div>
                    <button
                      onClick={rollDiceManual}
                      disabled={diceRolling}
                      className="w-full px-4 py-2 glass-dark neon-border-purple rounded-lg font-black text-neon-purple hover:shadow-neon-purple disabled:opacity-50 transition"
                    >
                      🎲 ZAR AT
                    </button>
                  </div>

                  {/* Efekt Ekleme */}
                  <div className="pt-3 border-t border-neon-cyan/30">
                    <p className="font-black text-neon-cyan text-xs mb-2">BUFF/DEBUFF EKLE:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { type: 'poison', emoji: '☠️', name: 'Zehir', isBuff: false },
                        { type: 'stun', emoji: '🌀', name: 'Sersem', isBuff: false },
                        { type: 'stop', emoji: '🛑', name: 'Dur', isBuff: false },
                        { type: 'power', emoji: '⚔️', name: 'Güç+', isBuff: true },
                        { type: 'speed', emoji: '⚡', name: 'Hız+', isBuff: true },
                        { type: 'shield', emoji: '🛡️', name: 'Kalkan+', isBuff: true },
                      ].map(e => (
                        <button
                          key={e.type}
                          onClick={() => addEffect(e.type)}
                          className={`p-2 glass-dark rounded-lg font-bold text-xs transition ${
                            e.isBuff
                              ? 'border-2 border-green-500 text-green-400 hover:shadow-lg hover:shadow-green-500/50'
                              : 'border-2 border-red-500 text-red-400 hover:shadow-lg hover:shadow-red-500/50'
                          }`}
                        >
                          {e.emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tur Sonlandır */}
                  <button
                    onClick={endTurn}
                    className="w-full mt-4 px-4 py-3 glass-dark neon-border-cyan rounded-lg font-black text-lg text-neon-cyan hover:shadow-neon-cyan active:scale-95 transition"
                  >
                    ✅ TURU BITIR
                  </button>
                </div>

                {/* Savaş Günlüğü */}
                <div className="glass-dark neon-border-purple rounded-xl p-4 max-h-48 overflow-y-auto">
                  <p className="font-black text-neon-purple text-xs mb-3">📋 SAVAŞ GÜNLÜĞÜ:</p>
                  <div className="space-y-1">
                    {battleLog.map((log, idx) => (
                      <p key={idx} className="text-neon-purple/80 font-bold text-xs">
                        {log}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Skip Turn Confirmation Modal */}
      {showSkipTurnModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="glass-dark neon-border-purple rounded-xl p-8 max-w-md text-center"
          >
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-black text-neon-purple mb-3">Yetenek Kullanmadan Tur Geç?</h2>
            <p className="text-sm text-neon-purple/80 mb-6">
              Herhangi bir yetenek kullanmadan tur geçmek üzeresin. Devam etmek istiyor musun?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSkipTurnModal(false)}
                className="flex-1 px-4 py-3 glass-dark neon-border-cyan rounded-lg font-bold text-neon-cyan hover:shadow-neon-cyan transition"
              >
                ← Geri
              </button>
              <button
                onClick={confirmSkipTurn}
                className="flex-1 px-4 py-3 glass-dark neon-border-purple rounded-lg font-bold text-neon-purple hover:shadow-neon-purple transition"
              >
                ✓ Devam Et
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
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
      className={`relative w-full p-4 rounded-lg font-bold transition flex items-start gap-3 ${
        isUlti
          ? 'glass-dark neon-border-purple border-2'
          : 'glass-dark neon-border-cyan border-2'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}`}
    >
      {/* Icon */}
      <div className="flex-shrink-0 pt-1">
        <AbilityIcon iconId={ability.icon} size="md" />
      </div>

      {/* Details */}
      <div className="text-left flex-1">
        <p className={`text-sm font-black ${isUlti ? 'text-neon-purple' : 'text-neon-cyan'}`}>{ability.name}</p>
        <div className="text-xs space-y-1 mt-1">
          {ability.effect === 'none' ? (
            <p className="text-neon-cyan/70 font-bold">Saldırı • ×{ability.multiplier || 1}</p>
          ) : (
            <p className={isBuffEffect(ability.effect) ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
              {isBuffEffect(ability.effect) ? '⬆️ Buff' : '⬇️ Debuff'} • ×{ability.multiplier || 1}
            </p>
          )}
          {ability.effect !== 'none' && (
            <p className="text-neon-purple/70">
              {getEffectEmoji(ability.effect)} {getEffectNameTR(ability.effect)}
            </p>
          )}
          {ability.cd > 0 && <p className="text-red-400 font-bold">CD: {ability.cd} tur</p>}
        </div>
      </div>

      {/* Damage display */}
      {damage !== null && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex-shrink-0 text-right">
          <p className="text-2xl font-black text-neon-pink">💥</p>
          <p className="text-xs font-black text-neon-pink">{Math.round(damage)}</p>
        </motion.div>
      )}
    </motion.button>
  )
}

