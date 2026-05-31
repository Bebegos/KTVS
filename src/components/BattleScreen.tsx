import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../lib/auth-context'
import { Dino, BattleState } from '../game/types'
import { initializeBattle, rollDice, applyAbility, endTurn, checkBattleEnd, addXpToDino, calculateXpReward } from '../game/engine'
import { updateDino, createMatch, getDinos } from '../lib/supabase'
import DiceRoller from './DiceRoller'

interface BattleScreenProps {
  dino1: Dino
  dino2: Dino
  onBack: () => void
  onRefresh: (dinos: Dino[]) => void
}

type Screen = 'battle' | 'level-up' | 'result'

export default function BattleScreen({ dino1, dino2, onBack, onRefresh }: BattleScreenProps) {
  const { user } = useAuth()
  const [battleState, setBattleState] = useState<BattleState>(() => initializeBattle(dino1, dino2))
  const [screen, setScreen] = useState<Screen>('battle')
  const [selectedAbility, setSelectedAbility] = useState<number | null>(null)
  const [diceRolling, setDiceRolling] = useState(false)
  const [lastDiceResult, setLastDiceResult] = useState<number | null>(null)
  const [levelUpDino, setLevelUpDino] = useState<Dino | null>(null)
  const [statPointsToAllocate, setStatPointsToAllocate] = useState(0)

  async function handleAbilityClick(idx: number) {
    if (diceRolling) return

    const char = battleState[battleState.currentTurn]
    const ability = char.abilities[idx]

    if (ability.cd > 0) {
      alert(`Bu yetenek ${ability.cd} tur sonra hazır olacak!`)
      return
    }

    setSelectedAbility(idx)
    setDiceRolling(true)

    const diceResult = rollDice()
    setLastDiceResult(diceResult.value)

    setTimeout(() => {
      const newState = applyAbility(battleState, battleState.currentTurn, idx, diceResult)
      const checkedState = checkBattleEnd(newState)
      setBattleState(checkedState)

      if (checkedState.finished) {
        handleBattleEnd(checkedState)
      }

      setDiceRolling(false)
      setSelectedAbility(null)
    }, 800)
  }

  function handleEndTurn() {
    if (diceRolling) return

    const newState = checkBattleEnd(endTurn(battleState))
    setBattleState(newState)

    if (newState.finished) {
      handleBattleEnd(newState)
    }
  }

  async function handleBattleEnd(finalState: BattleState) {
    const winner = finalState.winner === 'p1' ? dino1 : dino2
    const loser = finalState.winner === 'p1' ? dino2 : dino1

    const xpReward = calculateXpReward('normal')

    // Kazanan XP kazanır
    let updatedWinner = addXpToDino(winner, xpReward)

    // Level atlaması kontrol et
    if (updatedWinner.xp >= 100) {
      const levelGainCount = Math.floor(updatedWinner.xp / 100)
      updatedWinner.level += levelGainCount
      updatedWinner.xp %= 100
      setStatPointsToAllocate(5 * levelGainCount)
      setLevelUpDino(updatedWinner)
      setScreen('level-up')
    } else {
      // Level atlamadı, hemen sonuç
      setScreen('result')
      try {
        await updateDino(updatedWinner.id, {
          level: updatedWinner.level,
          xp: updatedWinner.xp,
        })
        const updated = await getDinos(user?.id)
        onRefresh(updated as Dino[])
      } catch (err) {
        console.error('Kayıt hatası:', err)
      }
    }

    // Maç günlüğü
    try {
      await createMatch({
        winner_dino_id: updatedWinner.id,
        loser_dino_id: loser.id,
        xp_awarded: xpReward,
        rounds: finalState.round,
        log: finalState.log,
      })
    } catch (err) {
      console.error('Maç günlüğü hatası:', err)
    }
  }

  async function handleStatAllocation(allocations: Record<string, number>) {
    if (!levelUpDino) return

    const updated = {
      ...levelUpDino,
      atk: levelUpDino.atk + (allocations.atk || 0),
      def: levelUpDino.def + (allocations.def || 0),
      spd: levelUpDino.spd + (allocations.spd || 0),
    }

    try {
      await updateDino(updated.id, {
        level: updated.level,
        xp: updated.xp,
        atk: updated.atk,
        def: updated.def,
        spd: updated.spd,
      })
      const updatedDinos = await getDinos(user?.id)
      onRefresh(updatedDinos as Dino[])
      setScreen('result')
      setLevelUpDino(null)
    } catch (err) {
      console.error('Stat güncellemesi hatası:', err)
    }
  }

  if (screen === 'level-up' && levelUpDino) {
    return (
      <LevelUpScreen
        dino={levelUpDino}
        points={statPointsToAllocate}
        onAllocate={handleStatAllocation}
      />
    )
  }

  if (screen === 'result') {
    const winner = battleState.winner === 'p1' ? dino1.name : dino2.name
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4 bg-gradient-to-br from-yellow-100 to-orange-100">
        <div className="text-8xl">🏆</div>
        <h1 className="text-4xl font-bold text-orange-700">
          {winner} Kazandı!
        </h1>
        <div className="text-center">
          <p className="text-xl text-orange-600 mb-2">{battleState.round} tur sürdü</p>
          <p className="text-lg text-orange-700">
            {battleState.winner === 'p1' ? dino1.name : dino2.name} {calculateXpReward('normal')} XP kazandı!
          </p>
        </div>
        <button
          onClick={onBack}
          className="hs-btn hs-btn-green hs-btn-lg"
        >
          ← Ana Menüye Dön
        </button>
      </div>
    )
  }

  const p1 = battleState.p1
  const p2 = battleState.p2
  const isP1Turn = battleState.currentTurn === 'p1'

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 bg-gradient-to-br from-dino-100 to-blue-100 overflow-hidden">
      {/* Üst Menü */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="hs-btn hs-btn-sm"
        >
          ← Çık
        </button>
        <p className="font-bold text-lg text-dino-700">Tur: {battleState.round}</p>
      </div>

      {/* Savaş Alanı */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* Oyuncu 1 */}
        <div
          className={`flex-1 flex flex-col gap-3 p-4 border-4 rounded-lg transition ${
            isP1Turn
              ? 'border-dino-500 bg-dino-50 shadow-lg'
              : 'border-dino-200 bg-white'
          }`}
        >
          <h2 className="text-2xl font-bold text-dino-700">{p1.name}</h2>

          {/* HP Çubuğu */}
          <div>
            <div className="flex justify-between text-sm font-bold text-dino-700 mb-1">
              <span>❤️ Can</span>
              <span>{p1.currentHp}/{p1.maxHp}</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-6 overflow-hidden">
              <motion.div
                className={`h-full ${
                  p1.currentHp > p1.maxHp * 0.5
                    ? 'bg-green-500'
                    : p1.currentHp > p1.maxHp * 0.25
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                animate={{ width: `${(p1.currentHp / p1.maxHp) * 100}%` }}
              />
            </div>
          </div>

          {/* Efektler */}
          {p1.effects.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {p1.effects.map((eff, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1 bg-red-300 text-red-900 rounded-full text-sm font-bold"
                >
                  {getEffectEmoji(eff.type)} {eff.duration}
                </motion.div>
              ))}
            </div>
          )}

          {/* Yetenekler */}
          <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
            {p1.abilities.map((ability, idx) => (
              <motion.button
                key={idx}
                onClick={() => isP1Turn && handleAbilityClick(idx)}
                disabled={!isP1Turn || diceRolling || ability.cd > 0}
                whileHover={{ scale: isP1Turn && ability.cd === 0 ? 1.05 : 1 }}
                whileTap={{ scale: isP1Turn && ability.cd === 0 ? 0.95 : 1 }}
                className="hs-btn hs-btn-green hs-btn-block"
              >
                <div className="flex justify-between items-center">
                  <span>{ability.name}</span>
                  {ability.cd > 0 && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {ability.cd}
                    </span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {isP1Turn && (
            <motion.button
              onClick={handleEndTurn}
              disabled={diceRolling}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hs-btn hs-btn-green hs-btn-block"
            >
              ✅ Turu Bitir
            </motion.button>
          )}
        </div>

        {/* Zar & Orta Alan */}
        <div className="flex flex-col gap-3 items-center justify-center flex-1">
          <DiceRoller rolling={diceRolling} lastValue={lastDiceResult} />
          <div className="text-center">
            {battleState.log.length > 0 && (
              <div className="text-sm text-dino-700 bg-white p-3 rounded border-2 border-dino-300">
                <p className="font-bold mb-1">Son Hamle:</p>
                <p>{battleState.log[battleState.log.length - 1].action}</p>
                {battleState.log[battleState.log.length - 1].isCrit && (
                  <p className="text-red-600 font-bold">🌟 KRİTİK!</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Oyuncu 2 */}
        <div
          className={`flex-1 flex flex-col gap-3 p-4 border-4 rounded-lg transition ${
            !isP1Turn
              ? 'border-red-500 bg-red-50 shadow-lg'
              : 'border-red-200 bg-white'
          }`}
        >
          <h2 className="text-2xl font-bold text-red-700">{p2.name}</h2>

          {/* HP Çubuğu */}
          <div>
            <div className="flex justify-between text-sm font-bold text-red-700 mb-1">
              <span>❤️ Can</span>
              <span>{p2.currentHp}/{p2.maxHp}</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-6 overflow-hidden">
              <motion.div
                className={`h-full ${
                  p2.currentHp > p2.maxHp * 0.5
                    ? 'bg-green-500'
                    : p2.currentHp > p2.maxHp * 0.25
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                animate={{ width: `${(p2.currentHp / p2.maxHp) * 100}%` }}
              />
            </div>
          </div>

          {/* Efektler */}
          {p2.effects.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {p2.effects.map((eff, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1 bg-red-300 text-red-900 rounded-full text-sm font-bold"
                >
                  {getEffectEmoji(eff.type)} {eff.duration}
                </motion.div>
              ))}
            </div>
          )}

          {/* Yetenekler */}
          <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
            {p2.abilities.map((ability, idx) => (
              <motion.button
                key={idx}
                onClick={() => !isP1Turn && handleAbilityClick(idx)}
                disabled={isP1Turn || diceRolling || ability.cd > 0}
                whileHover={{ scale: !isP1Turn && ability.cd === 0 ? 1.05 : 1 }}
                whileTap={{ scale: !isP1Turn && ability.cd === 0 ? 0.95 : 1 }}
                className="hs-btn hs-btn-red hs-btn-block"
              >
                <div className="flex justify-between items-center">
                  <span>{ability.name}</span>
                  {ability.cd > 0 && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {ability.cd}
                    </span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {!isP1Turn && (
            <motion.button
              onClick={handleEndTurn}
              disabled={diceRolling}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hs-btn hs-btn-red hs-btn-block"
            >
              ✅ Turu Bitir
            </motion.button>
          )}
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

function LevelUpScreen({
  dino,
  points,
  onAllocate,
}: {
  dino: Dino
  points: number
  onAllocate: (allocations: Record<string, number>) => void
}) {
  const [allocations, setAllocations] = useState({
    atk: 0,
    def: 0,
    spd: 0,
  })

  const remainingPoints = points - (allocations.atk + allocations.def + allocations.spd)

  function handleSubmit() {
    if (remainingPoints === 0) {
      onAllocate(allocations)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4 bg-gradient-to-br from-purple-100 to-pink-100">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-8xl"
      >
        ⭐
      </motion.div>

      <h1 className="text-4xl font-bold text-purple-700 text-center">
        {dino.name} Level Atladı!
      </h1>

      <p className="text-2xl font-bold text-purple-600">
        Yeni Seviye: {dino.level}
      </p>

      <div className="bg-white border-4 border-purple-300 rounded-lg p-6 max-w-md w-full">
        <p className="font-bold text-lg text-purple-700 mb-4">
          {points} Puan Dağıt
        </p>

        <div className="flex flex-col gap-4 mb-6">
          {(['atk', 'def', 'spd'] as const).map(stat => (
            <div key={stat} className="flex items-center gap-3">
              <span className="font-bold text-lg min-w-12">
                {stat === 'atk' ? '⚔️ ATK' : stat === 'def' ? '🛡️ DEF' : '⚡ SPD'}
              </span>
              <button
                onClick={() =>
                  setAllocations(s => ({
                    ...s,
                    [stat]: Math.max(0, s[stat] - 1),
                  }))
                }
                className="hs-btn hs-btn-red hs-btn-sm"
              >
                −
              </button>
              <input
                type="number"
                min="0"
                value={allocations[stat]}
                onChange={e =>
                  setAllocations(s => ({
                    ...s,
                    [stat]: Math.max(0, parseInt(e.target.value) || 0),
                  }))
                }
                className="w-12 text-center px-2 py-1 border-2 border-purple-300 rounded font-bold"
              />
              <button
                onClick={() =>
                  remainingPoints > 0 &&
                  setAllocations(s => ({
                    ...s,
                    [stat]: s[stat] + 1,
                  }))
                }
                disabled={remainingPoints <= 0}
                className="hs-btn hs-btn-green hs-btn-sm"
              >
                +
              </button>
            </div>
          ))}
        </div>

        <p className={`text-lg font-bold mb-4 text-center ${remainingPoints === 0 ? 'text-dino-600' : 'text-red-600'}`}>
          Kalan: {remainingPoints} puan
        </p>

        <button
          onClick={handleSubmit}
          disabled={remainingPoints !== 0}
          className="hs-btn hs-btn-purple hs-btn-lg hs-btn-block"
        >
          ✅ Onayla
        </button>
      </div>
    </div>
  )
}
