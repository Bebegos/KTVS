import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../lib/auth-context'
import { Dino, BattleState } from '../game/types'
import { initializeBattle, rollDice, applyAbility, endTurn, checkBattleEnd, addXpToDino, calculateXpReward } from '../game/engine'
import { updateDino, createMatch, getDinos } from '../lib/supabase'
import CharacterCard from './CharacterCard'
import DiceRoller from './DiceRoller'

interface BattleScreenNewProps {
  dino1: Dino
  dino2: Dino
  onBack: () => void
  onRefresh: (dinos: Dino[]) => void
}

type Screen = 'battle' | 'level-up' | 'result'

export default function BattleScreenNew({ dino1, dino2, onBack, onRefresh }: BattleScreenNewProps) {
  const { user } = useAuth()
  const [battleState, setBattleState] = useState<BattleState>(() => initializeBattle(dino1, dino2))
  const [screen, setScreen] = useState<Screen>('battle')
  const [selectedDino, setSelectedDino] = useState<'p1' | 'p2'>('p1') // Kontrol edilen dinozor
  const [selectedAbility, setSelectedAbility] = useState<number | null>(null)
  const [diceRolling, setDiceRolling] = useState(false)
  const [lastDiceResult, setLastDiceResult] = useState<number | null>(null)
  const [levelUpDino, setLevelUpDino] = useState<Dino | null>(null)
  const [statPointsToAllocate, setStatPointsToAllocate] = useState(0)
  const [battleLog, setBattleLog] = useState<string[]>([])

  // Saldırı yap
  async function handleAttack(attacker: 'p1' | 'p2', abilityIdx: number) {
    if (diceRolling) return

    const attChar = battleState[attacker]
    const ability = attChar.abilities[abilityIdx]

    if (ability.cd > 0) {
      alert(`Bu yetenek ${ability.cd} tur sonra hazır!`)
      return
    }

    setDiceRolling(true)
    const diceResult = rollDice()
    setLastDiceResult(diceResult.value)

    setTimeout(() => {
      const newState = applyAbility(battleState, attacker, abilityIdx, diceResult)
      const checkedState = checkBattleEnd(newState)

      // Log mesajı
      const logMsg = `${attChar.name} ${ability.name} kullandı [Zar: ${diceResult.value}]${diceResult.isCrit ? ' 🌟 KRİTİK!' : ''}`
      setBattleLog(prev => [logMsg, ...prev.slice(0, 4)])

      setBattleState(checkedState)

      if (checkedState.finished) {
        handleBattleEnd(checkedState)
      } else {
        setSelectedAbility(null)
      }

      setDiceRolling(false)
    }, 800)
  }

  async function handleBattleEnd(finalState: BattleState) {
    const winner = finalState.winner === 'p1' ? dino1 : dino2
    const loser = finalState.winner === 'p1' ? dino2 : dino1

    const xpReward = calculateXpReward('normal')
    let updatedWinner = addXpToDino(winner, xpReward)

    if (updatedWinner.xp >= 100) {
      const levelGainCount = Math.floor(updatedWinner.xp / 100)
      updatedWinner.level += levelGainCount
      updatedWinner.xp %= 100
      setStatPointsToAllocate(5 * levelGainCount)
      setLevelUpDino(updatedWinner)
      setScreen('level-up')
    } else {
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
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="text-8xl"
        >
          🏆
        </motion.div>
        <h1 className="text-4xl font-black text-orange-700 text-center">
          {winner} Kazandı!
        </h1>
        <div className="text-center bg-white border-4 border-orange-500 rounded-xl p-4">
          <p className="text-2xl font-bold text-orange-600 mb-2">{battleState.round} tur sürdü</p>
          <p className="text-lg text-orange-700">
            {battleState.winner === 'p1' ? dino1.name : dino2.name} {calculateXpReward('normal')} XP kazandı!
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-6 py-4 bg-gradient-to-br from-dino-500 to-dino-700 text-white rounded-xl font-bold text-lg hover:shadow-lg active:scale-95 transition"
        >
          ← Ana Menüye Dön
        </button>
      </div>
    )
  }

  const p1 = battleState.p1
  const p2 = battleState.p2

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-dino-50 via-blue-50 to-purple-50 overflow-hidden">
      {/* Üst Bar */}
      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-dino-500 to-blue-500 text-white shadow-lg">
        <button
          onClick={onBack}
          className="px-3 py-1 bg-red-500 rounded font-bold text-sm hover:bg-red-600"
        >
          🚪 Çık
        </button>
        <p className="font-black text-lg">⚔️ TUR {battleState.round}</p>
        <div className="w-24 h-8 bg-white rounded-lg border-2 border-white flex items-center justify-center">
          <p className="font-black text-dino-700">SAVAŞ</p>
        </div>
      </div>

      {/* Ana Savaş Alanı (Landscape optimized) */}
      <div className="flex-1 flex gap-2 overflow-hidden p-2">
        {/* Dinozor 1 */}
        <CharacterCard
          dino={dino1}
          currentHp={p1.currentHp}
          maxHp={p1.maxHp}
          effects={p1.effects}
          abilities={p1.abilities}
          onAbilityClick={(idx) => {
            setSelectedDino('p1')
            handleAttack('p1', idx)
          }}
          disabled={diceRolling}
          side="left"
        />

        {/* Orta Alan: Zar + Kontroller */}
        <div className="flex flex-col gap-2 items-center justify-center w-32">
          {/* Zar */}
          <DiceRoller rolling={diceRolling} lastValue={lastDiceResult} />

          {/* Tur Sonlandır Butonu */}
          <motion.button
            onClick={() => {
              const newState = checkBattleEnd(endTurn(battleState))
              setBattleState(newState)
              if (newState.finished) {
                handleBattleEnd(newState)
              } else {
                setBattleLog(prev => [`${newState.currentTurn === 'p1' ? dino1.name : dino2.name}'ın sırası`, ...prev.slice(0, 4)])
              }
            }}
            disabled={diceRolling}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-full px-2 py-3 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-xl font-black text-sm hover:shadow-lg disabled:opacity-50 transition"
          >
            ✅<br />TUR<br />BITIR
          </motion.button>

          {/* Savaş Günlüğü */}
          <div className="flex-1 w-full bg-white border-3 border-purple-400 rounded-lg p-2 overflow-y-auto text-xs">
            <p className="font-black text-purple-700 mb-1 sticky top-0 bg-white">📋 LOG</p>
            {battleLog.map((log, idx) => (
              <p key={idx} className="text-purple-700 font-bold mb-0.5">
                {log}
              </p>
            ))}
          </div>
        </div>

        {/* Dinozor 2 */}
        <CharacterCard
          dino={dino2}
          currentHp={p2.currentHp}
          maxHp={p2.maxHp}
          effects={p2.effects}
          abilities={p2.abilities}
          onAbilityClick={(idx) => {
            setSelectedDino('p2')
            handleAttack('p2', idx)
          }}
          disabled={diceRolling}
          side="right"
        />
      </div>
    </div>
  )
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

      <h1 className="text-4xl font-black text-purple-700 text-center">
        {dino.name} Level Atladı!
      </h1>

      <p className="text-2xl font-bold text-purple-600">
        Yeni Seviye: {dino.level}
      </p>

      <div className="bg-white border-4 border-purple-300 rounded-xl p-6 max-w-md w-full">
        <p className="font-black text-lg text-purple-700 mb-4">
          {points} PUAN DAĞIT
        </p>

        <div className="flex flex-col gap-4 mb-6">
          {(['atk', 'def', 'spd'] as const).map(stat => (
            <div key={stat} className="flex items-center gap-3">
              <span className="font-black text-lg min-w-20">
                {stat === 'atk' ? '⚔️ SALDIRI' : stat === 'def' ? '🛡️ SAVUNMA' : '⚡ HIZ'}
              </span>
              <button
                onClick={() =>
                  setAllocations(s => ({
                    ...s,
                    [stat]: Math.max(0, s[stat] - 1),
                  }))
                }
                className="px-3 py-1 bg-red-500 text-white rounded font-black"
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
                className="w-12 text-center px-2 py-1 border-3 border-purple-300 rounded font-black text-lg"
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
                className="px-3 py-1 bg-dino-500 text-white rounded font-black disabled:bg-gray-400"
              >
                +
              </button>
            </div>
          ))}
        </div>

        <p className={`text-lg font-black mb-4 text-center ${remainingPoints === 0 ? 'text-dino-600' : 'text-red-600'}`}>
          Kalan: {remainingPoints} puan
        </p>

        <button
          onClick={handleSubmit}
          disabled={remainingPoints !== 0}
          className="w-full px-6 py-3 bg-purple-500 text-white rounded-lg font-black text-lg hover:bg-purple-600 disabled:bg-gray-400"
        >
          ✅ ONAYLA
        </button>
      </div>
    </div>
  )
}
