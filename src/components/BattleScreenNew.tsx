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
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4 relative overflow-hidden">
        {/* Arka plan */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-neon-cyan opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-neon-purple opacity-5 rounded-full blur-3xl"></div>
        </div>

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="text-8xl relative z-10"
        >
          🏆
        </motion.div>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-pink text-center relative z-10">
          {winner} Kazandı!
        </h1>
        <div className="text-center glass-dark neon-border-cyan rounded-xl p-6 relative z-10">
          <p className="text-2xl font-bold text-neon-cyan mb-2">{battleState.round} tur sürdü</p>
          <p className="text-lg text-neon-cyan/80">
            {battleState.winner === 'p1' ? dino1.name : dino2.name} {calculateXpReward('normal')} XP kazandı!
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-6 py-4 glass-dark neon-border-purple rounded-xl font-bold text-lg text-neon-purple hover:shadow-neon-purple active:scale-95 transition relative z-10"
        >
          ← Ana Menüye Dön
        </button>
      </div>
    )
  }

  const p1 = battleState.p1
  const p2 = battleState.p2

  return (
    <div className="w-screen h-screen flex flex-col relative overflow-hidden">
      {/* Arka plan blur efektleri */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-20 w-96 h-96 bg-neon-cyan opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-20 w-96 h-96 bg-neon-pink opacity-5 rounded-full blur-3xl"></div>
      </div>

      {/* Üst Bar */}
      <div className="relative z-10 flex justify-between items-center p-4 glass-dark neon-border-cyan border-b">
        <button
          onClick={onBack}
          className="px-4 py-2 glass-dark neon-border-pink rounded-lg font-bold text-neon-pink hover:shadow-neon-pink transition"
        >
          🚪 Çık
        </button>
        <p className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">
          ⚔️ TUR {battleState.round}
        </p>
        <div className="px-4 py-2 glass-dark neon-border-cyan rounded-lg">
          <p className="font-black text-neon-cyan">SAVAŞ</p>
        </div>
      </div>

      {/* Ana Savaş Alanı */}
      <div className="relative z-10 flex-1 flex gap-3 overflow-hidden p-3">
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
        <div className="flex flex-col gap-3 items-center justify-center w-40">
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
            className="w-full px-3 py-4 glass-dark neon-border-cyan rounded-xl font-black text-lg text-neon-cyan hover:shadow-neon-cyan disabled:opacity-50 transition"
          >
            ✅ TUR BITIR
          </motion.button>

          {/* Savaş Günlüğü */}
          <div className="flex-1 w-full glass-dark neon-border-purple rounded-lg p-3 overflow-y-auto text-xs">
            <p className="font-black text-neon-purple mb-2 sticky top-0">📋 LOG</p>
            {battleLog.map((log, idx) => (
              <p key={idx} className="text-neon-purple/80 font-bold mb-1">
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
    <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4 relative overflow-hidden">
      {/* Arka plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-neon-purple opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-neon-cyan opacity-5 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-8xl relative z-10"
      >
        ⭐
      </motion.div>

      <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-pink text-center relative z-10">
        {dino.name} Level Atladı!
      </h1>

      <p className="text-2xl font-bold text-neon-cyan relative z-10">
        Yeni Seviye: {dino.level}
      </p>

      <div className="glass-dark neon-border-purple rounded-xl p-8 max-w-md w-full relative z-10">
        <p className="font-black text-lg text-neon-purple mb-6 text-center">
          {points} PUAN DAĞIT
        </p>

        <div className="flex flex-col gap-4 mb-6">
          {(['atk', 'def', 'spd'] as const).map(stat => (
            <div key={stat} className="flex items-center gap-3">
              <span className="font-black text-sm min-w-24 text-neon-cyan">
                {stat === 'atk' ? '⚔️ ATK' : stat === 'def' ? '🛡️ DEF' : '⚡ SPD'}
              </span>
              <button
                onClick={() =>
                  setAllocations(s => ({
                    ...s,
                    [stat]: Math.max(0, s[stat] - 1),
                  }))
                }
                className="px-3 py-1 glass-dark border border-red-500/50 text-red-400 rounded font-black hover:border-red-500/80 transition"
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
                className="w-12 text-center px-2 py-1 bg-slate-800 border border-neon-purple rounded font-black text-lg text-neon-purple"
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
                className="px-3 py-1 glass-dark border border-green-500/50 text-green-400 rounded font-black hover:border-green-500/80 disabled:opacity-50 transition"
              >
                +
              </button>
            </div>
          ))}
        </div>

        <p className={`text-lg font-black mb-6 text-center ${remainingPoints === 0 ? 'text-neon-cyan' : 'text-red-400'}`}>
          Kalan: {remainingPoints} puan
        </p>

        <button
          onClick={handleSubmit}
          disabled={remainingPoints !== 0}
          className={`w-full px-6 py-3 glass-dark rounded-lg font-black text-lg transition ${
            remainingPoints === 0
              ? 'neon-border-cyan text-neon-cyan hover:shadow-neon-cyan'
              : 'border border-gray-600/50 text-gray-500 cursor-not-allowed opacity-50'
          }`}
        >
          ✅ ONAYLA
        </button>
      </div>
    </div>
  )
}
