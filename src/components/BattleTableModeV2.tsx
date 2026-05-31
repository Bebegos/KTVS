import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino } from '../game/types'
import { BattleEngine } from '../lib/battleEngine'
import { getEffectNameTR, getEffectEmoji, isBuffEffect } from '../lib/effect-translations'
import AbilityIcon from './AbilityIcon'
import BattleEffectVisuals from './BattleEffectVisuals'
import HealthBar from './HealthBar'
import SvgIcon from './SvgIcon'

interface BattleTableModeV2Props {
  dino: Dino
  onBack: () => void
  onRefresh: (dinos: Dino[]) => void
}

export default function BattleTableModeV2({ dino, onBack, onRefresh }: BattleTableModeV2Props) {
  const maxHp = dino?.maxHp ?? 30

  // Create a simple opponent for training mode
  const opponentDino: Dino = {
    id: 'training-dummy-' + Date.now(),
    name: 'Eğitim Kukası',
    familyCode: '',
    class: 'big_carnivore',
    spec: 'armored',
    level: dino.level,
    xp: 0,
    maxHp: Math.floor(maxHp * 0.8),
    atk: Math.floor((dino.atk ?? 5) * 0.7),
    def: Math.floor((dino.def ?? 5) * 0.7),
    spd: Math.floor((dino.spd ?? 5) * 0.9),
    element: dino.element,
    abilities: dino.abilities,
  }

  const [engine] = useState(() => new BattleEngine(dino, opponentDino))
  const [battleState, setBattleState] = useState(engine.getState())
  const [currentEffectVisual, setCurrentEffectVisual] = useState<'buff' | 'debuff' | 'damage' | null>(null)
  const [showEffectVisual, setShowEffectVisual] = useState(false)
  const [showSkipTurnModal, setShowSkipTurnModal] = useState(false)
  const [abilityUsedThisTurn, setAbilityUsedThisTurn] = useState(false)

  function executeAbility(abilityIdx: number) {
    if (!engine.canUseAbility('player', abilityIdx)) return

    // Player attacks
    const playerResult = engine.executeAbility('player', abilityIdx)

    setCurrentEffectVisual('damage')
    setShowEffectVisual(true)
    setTimeout(() => setShowEffectVisual(false), 1500)

    if (playerResult.effectApplied) {
      setCurrentEffectVisual('debuff')
      setShowEffectVisual(true)
      setTimeout(() => setShowEffectVisual(false), 1500)
    }

    // Check if opponent died
    if (playerResult.targetDied) {
      setBattleState(engine.getState())
      setAbilityUsedThisTurn(true)
      return
    }

    // Opponent counter-attack after delay
    setTimeout(() => {
      let opponentAbilityIdx = Math.floor(Math.random() * engine.getState().opponent.abilities.length)

      // Try to find an available ability
      let attempts = 0
      while (!engine.canUseAbility('opponent', opponentAbilityIdx) && attempts < 5) {
        opponentAbilityIdx = Math.floor(Math.random() * engine.getState().opponent.abilities.length)
        attempts++
      }

      if (engine.canUseAbility('opponent', opponentAbilityIdx)) {
        const opponentResult = engine.executeAbility('opponent', opponentAbilityIdx)

        if (!opponentResult.targetDied) {
          setCurrentEffectVisual('damage')
          setShowEffectVisual(true)
          setTimeout(() => setShowEffectVisual(false), 1500)
        }

        if (opponentResult.effectApplied) {
          setCurrentEffectVisual('debuff')
          setShowEffectVisual(true)
          setTimeout(() => setShowEffectVisual(false), 1500)
        }
      }

      // Apply effects and decrement cooldowns
      engine.applyEffectDamageAndDecrement('player')
      engine.applyEffectDamageAndDecrement('opponent')
      engine.decrementCooldowns('player')
      engine.decrementCooldowns('opponent')

      setBattleState(engine.getState())
      setAbilityUsedThisTurn(true)
    }, 1500)
  }

  function endTurn() {
    if (!abilityUsedThisTurn) {
      setShowSkipTurnModal(true)
      return
    }

    engine.applyEffectDamageAndDecrement('player')
    engine.applyEffectDamageAndDecrement('opponent')
    engine.decrementCooldowns('player')
    engine.decrementCooldowns('opponent')

    setBattleState(engine.getState())
    setAbilityUsedThisTurn(false)
  }

  function confirmSkipTurn() {
    setShowSkipTurnModal(false)
    endTurn()
  }


  return (
    <div className="w-screen h-screen flex flex-col relative overflow-hidden">
      <BattleEffectVisuals effectType={currentEffectVisual} isVisible={showEffectVisual} />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-20 w-96 h-96 bg-neon-cyan opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-20 w-96 h-96 bg-neon-purple opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex justify-between items-center p-4 glass-dark neon-border-cyan border-b">
        <button
          onClick={onBack}
          className="px-4 py-2 glass-dark neon-border-pink rounded-lg font-bold text-neon-pink hover:shadow-neon-pink transition"
        >
          🚪 Çık
        </button>
        <h1 className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">
          🎲 MASADA OYN - {battleState.player.dino.name}
        </h1>
        <div className="text-right">
          <p className="font-black text-lg text-neon-cyan">Lvl {battleState.player.dino.level}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-6 relative z-10">
        <div className="max-w-7xl mx-auto h-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark neon-border-cyan rounded-2xl p-6 md:p-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - HP & Stats */}
              <div className="space-y-4">
                <div className="glass-dark neon-border-purple rounded-xl p-4 text-center">
                  <p className="text-4xl mb-2">🦖</p>
                  <h2 className="font-black text-2xl text-neon-purple">{battleState.player.dino.name}</h2>
                  <p className="text-sm font-bold text-neon-purple/80">Seviye {battleState.player.dino.level}</p>
                </div>

                <div className="glass-dark rounded-xl p-4">
                  <p className="font-black text-gold-light text-sm mb-3">CAN</p>
                  <HealthBar current={battleState.player.currentHp} max={maxHp} variant="player" />
                </div>

                <div className="glass-dark neon-border-purple rounded-xl p-4">
                  <p className="font-black text-neon-purple text-xs mb-3 text-center">STATLAR</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center glass border border-orange-500/20 p-2 rounded">
                      <span className="font-bold text-orange-400">⚔️ ATK:</span>
                      <span className="text-xl font-black text-orange-400">{battleState.player.dino.atk}</span>
                    </div>
                    <div className="flex justify-between items-center glass border border-blue-500/20 p-2 rounded">
                      <span className="font-bold text-blue-400">🛡️ DEF:</span>
                      <span className="text-xl font-black text-blue-400">{battleState.player.dino.def}</span>
                    </div>
                    <div className="flex justify-between items-center glass border border-yellow-500/20 p-2 rounded">
                      <span className="font-bold text-yellow-400">⚡ SPD:</span>
                      <span className="text-xl font-black text-yellow-400">{battleState.player.dino.spd}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-dark neon-border-pink rounded-xl p-4">
                  <p className="text-xs font-black text-neon-pink mb-3 text-center">AKTIF EFEKTLER ({battleState.player.effects.length}/2)</p>
                  <div className="flex gap-2">
                    {[0, 1].map(idx => (
                      <div key={idx} className="flex-1">
                        {battleState.player.effects[idx] ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center font-black ${
                              isBuffEffect(battleState.player.effects[idx].type)
                                ? 'glass-dark border-2 border-green-500 text-green-400'
                                : 'glass-dark border-2 border-red-500 text-red-400'
                            }`}
                          >
                            <SvgIcon id={battleState.player.effects[idx].type} type="effect" size="md" fallback={getEffectEmoji(battleState.player.effects[idx].type)} />
                            <p className="text-xs font-black">{battleState.player.effects[idx].duration}</p>
                          </motion.div>
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

              {/* Middle/Right Column - Abilities & Opponent */}
              <div className="lg:col-span-2 space-y-4">
                {/* Opponent Display */}
                <div className="glass-dark neon-border-purple rounded-xl p-4">
                  <p className="font-black text-neon-purple text-sm mb-4 text-center">👹 RAKIP</p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center">
                      <p className="text-4xl mb-2">🦖</p>
                      <h3 className="font-black text-neon-purple text-sm mb-1">{battleState.opponent.dino.name}</h3>
                      <p className="text-xs text-neon-purple/70">Lvl {battleState.opponent.dino.level}</p>
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-xs font-bold text-gold-light mb-2">CAN</p>
                      <HealthBar current={battleState.opponent.currentHp} max={opponentDino.maxHp} variant="enemy" size="sm" />
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    {[0, 1].map(idx => (
                      <div key={idx} className="flex-1">
                        {battleState.opponent.effects[idx] ? (
                          <div className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center font-black text-sm ${
                            isBuffEffect(battleState.opponent.effects[idx].type)
                              ? 'glass-dark border-2 border-green-500 text-green-400'
                              : 'glass-dark border-2 border-red-500 text-red-400'
                          }`}>
                            <SvgIcon id={battleState.opponent.effects[idx].type} type="effect" size="md" fallback={getEffectEmoji(battleState.opponent.effects[idx].type)} />
                            <p className="text-xs">{battleState.opponent.effects[idx].duration}</p>
                          </div>
                        ) : (
                          <div className="w-full aspect-square rounded-lg border-2 border-dashed border-neon-purple/30 glass flex items-center justify-center">
                            <span className="text-neon-purple/50 text-xs font-bold">Boş</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Abilities Grid */}
                <div className="glass-dark neon-border-cyan rounded-xl p-4">
                  <p className="font-black text-neon-cyan text-sm mb-4 text-center">⚡ YETENEKLER</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {[0, 1, 2, 3].map((idx) => {
                      const ability = battleState.player.abilities[idx]
                      return ability ? (
                        <AbilityButton
                          key={idx}
                          ability={ability}
                          idx={idx}
                          disabled={!engine.canUseAbility('player', idx) || abilityUsedThisTurn}
                          onClick={() => executeAbility(idx)}
                          cooldown={battleState.player.cooldowns[idx]}
                        />
                      ) : (
                        <div
                          key={idx}
                          className="p-4 rounded-lg glass-dark neon-border-cyan border-2 flex flex-col items-center justify-center gap-2 opacity-60 cursor-not-allowed"
                        >
                          <span className="text-2xl">🔒</span>
                          <p className="text-xs font-bold text-neon-cyan">Boş Slot</p>
                          <p className="text-xs text-neon-cyan/70">Seviye {(idx + 1) * 3} açılır</p>
                        </div>
                      )
                    })}
                  </div>

                  {/* Ultimate Slot - Legendary Card Design */}
                  {battleState.player.abilities[4] ? (
                    <div className="mb-4 relative">
                      {/* Hearthstone Legendary Card Frame */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-b from-yellow-600/40 via-purple-500/30 to-yellow-700/40 border-4 border-yellow-500/80 shadow-[0_0_30px_rgba(234,179,8,0.4)]"
                      >
                        {/* Legendary Crown */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-4xl drop-shadow-lg">
                          👑
                        </div>

                        {/* Golden sparkles */}
                        <div className="absolute inset-0 opacity-30 pointer-events-none">
                          <div className="absolute top-2 right-4 text-xl animate-pulse">✨</div>
                          <div className="absolute bottom-3 left-3 text-lg animate-pulse animation-delay-500">✨</div>
                        </div>

                        {/* Content */}
                        <div className="relative flex gap-3">
                          <div className="flex-shrink-0 pt-2">
                            <AbilityIcon iconId={battleState.player.abilities[4].icon} size="lg" />
                          </div>
                          <div className="text-left flex-1">
                            <p className="text-sm font-black text-yellow-300 drop-shadow-lg">
                              {battleState.player.abilities[4].name}
                            </p>
                            <p className="text-xs text-yellow-200/80 font-bold mt-1">ULTIMATE</p>
                            <div className="text-xs space-y-1 mt-2">
                              {battleState.player.abilities[4].effect === 'none' ? (
                                <p className="text-yellow-100/70 font-bold">Saldırı • ×{battleState.player.abilities[4].multiplier || 1}</p>
                              ) : (
                                <p className="text-yellow-100 font-bold">
                                  ⚡ Efekt • ×{battleState.player.abilities[4].multiplier || 1}
                                </p>
                              )}
                              {battleState.player.cooldowns[4] > 0 && (
                                <p className="text-red-400 font-bold">CD: {battleState.player.cooldowns[4]} tur</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Button overlay */}
                        <button
                          onClick={() => executeAbility(4)}
                          disabled={!engine.canUseAbility('player', 4) || abilityUsedThisTurn}
                          className={`absolute inset-0 rounded-xl transition ${
                            !engine.canUseAbility('player', 4) || abilityUsedThisTurn
                              ? 'opacity-0 cursor-not-allowed'
                              : 'opacity-0 hover:opacity-20 bg-yellow-400 cursor-pointer'
                          }`}
                        />
                      </motion.div>
                    </div>
                  ) : (
                    <div className="mb-4 relative overflow-hidden rounded-xl p-4 bg-gradient-to-b from-slate-700/30 via-purple-900/30 to-slate-800/30 border-4 border-dashed border-yellow-600/40 shadow-[0_0_20px_rgba(107,114,128,0.3)]">
                      {/* Locked Ultimate Slot */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 text-5xl opacity-50">
                        🔐
                      </div>
                      <div className="relative flex flex-col items-center justify-center gap-2 py-8 text-center opacity-60">
                        <p className="text-sm font-black text-yellow-400">ULTIMATE SLOT</p>
                        <p className="text-xs text-yellow-300/70">Seviye 15 açılır</p>
                        <p className="text-xs text-purple-300/50 mt-2">Efsanevi yeteneğini keşfet!</p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={endTurn}
                    className="w-full px-4 py-3 glass-dark neon-border-cyan rounded-lg font-black text-lg text-neon-cyan hover:shadow-neon-cyan active:scale-95 transition"
                  >
                    ✅ TURU BITIR
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

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
  cooldown,
  isUlti = false,
}: {
  ability: any
  idx: number
  disabled: boolean
  onClick: () => void
  cooldown: number
  isUlti?: boolean
}) {
  // Safety check: don't render if ability doesn't exist
  if (!ability) return null

  return (
    <motion.button
      onClick={() => {
        if (!disabled && ability) onClick()
      }}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`relative w-full p-4 rounded-lg font-bold transition flex items-start gap-3 ${
        isUlti
          ? 'glass-dark neon-border-purple border-2'
          : 'glass-dark neon-border-cyan border-2'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}`}
    >
      <div className="flex-shrink-0 pt-1">
        <AbilityIcon iconId={ability?.icon} size="md" />
      </div>

      <div className="text-left flex-1">
        <p className={`text-sm font-black ${isUlti ? 'text-neon-purple' : 'text-neon-cyan'}`}>
          {ability?.name || 'Bilinmiyor'}
        </p>
        <div className="text-xs space-y-1 mt-1">
          {ability?.effect === 'none' ? (
            <p className="text-neon-cyan/70 font-bold">Saldırı • ×{ability?.multiplier || 1}</p>
          ) : (
            <p className={isUlti ? 'text-purple-400 font-bold' : 'text-red-400 font-bold'}>
              ⬇️ Efekt • ×{ability?.multiplier || 1}
            </p>
          )}
          {cooldown > 0 && <p className="text-red-400 font-bold">CD: {cooldown} tur</p>}
        </div>
      </div>
    </motion.button>
  )
}
