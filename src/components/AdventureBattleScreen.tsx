import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino, ActiveEffect, BattleVisualEffects } from '../game/types'
import { Adventure, AdventureEnemy } from '../lib/adventures'
import { BattleEngine } from '../lib/battleEngine'
import { supabase, addXpToDino, addCoinsToUser } from '../lib/supabase'
import { useAuth } from '../lib/auth-context'
import { slotService, battleVisualService } from '../lib/services'
import HealthBar from './HealthBar'
import EffectInfoModal from './EffectInfoModal'
import PremiumCard from './PremiumCard'
import PremiumButton from './PremiumButton'
import { homeAssets } from '../lib/gameAssets'
import BattleArena, { BattleArenaSlot } from './battle/BattleArena'

const PAGE_BG = {
  backgroundImage: `url('${homeAssets.background}')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundColor: '#2a1c0e',
} as const

interface AdventureBattleScreenProps {
  playerDino: Dino
  adventure: Adventure
  onComplete: (won: boolean, xpGained: number) => void
  onBack: () => void
}

export default function AdventureBattleScreen({
  playerDino,
  adventure,
  onComplete,
  onBack,
}: AdventureBattleScreenProps) {
  const { user } = useAuth()
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0)
  const [currentEnemyIdx, setCurrentEnemyIdx] = useState(0)
  const [inBattle, setInBattle] = useState(false)
  const [playerCurrentHp, setPlayerCurrentHp] = useState(playerDino.maxHp)
  const [battleEngine, setBattleEngine] = useState<BattleEngine | null>(null)
  const [battleState, setBattleState] = useState<any>(null)
  const [selectedAbility, setSelectedAbility] = useState<number | null>(null)
  const [roundInProgress, setRoundInProgress] = useState(false)
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [adventureEnded, setAdventureEnded] = useState(false)
  const [adventureWon, setAdventureWon] = useState(false)
  const [totalXpGained, setTotalXpGained] = useState(0)
  const [totalCoinsGained, setTotalCoinsGained] = useState(0)
  const [effectInfoOpen, setEffectInfoOpen] = useState(false)
  const [selectedEffectInfo, setSelectedEffectInfo] = useState<ActiveEffect | null>(null)

  // Immersive battle effect system
  const [activeEffectOverlay, setActiveEffectOverlay] = useState(false)
  const [currentVisualEffects, setCurrentVisualEffects] = useState<BattleVisualEffects | null>(null)
  const [castIconId, setCastIconId] = useState<string | undefined>(undefined)
  const [floatingDamages, setFloatingDamages] = useState<
    Array<{ id: string; damage: number; isCritical: boolean; isHealing: boolean; x: number; y: number }>
  >([])

  const currentScene = adventure.scenes[currentSceneIdx]
  const currentEnemyData = currentScene?.enemies[currentEnemyIdx]

  const openEffectInfo = (effect: ActiveEffect) => {
    setSelectedEffectInfo(effect)
    setEffectInfoOpen(true)
  }

  // Create battle engine when entering battle
  useEffect(() => {
    if (inBattle && currentEnemyData && !battleEngine) {
      const opponentDino = generateOpponentFromData(playerDino, currentEnemyData)
      const engine = new BattleEngine(playerDino, opponentDino)

      const state = engine.getState()
      state.player.currentHp = playerCurrentHp

      setBattleEngine(engine)
      setBattleState(state)
      setBattleLog(state.battleLog)
    }
  }, [inBattle, currentEnemyData, playerDino, playerCurrentHp, battleEngine])

  function startBattle() {
    setInBattle(true)
    setSelectedAbility(null)
    setRoundInProgress(false)
  }

  function selectAbility(abilityIdx: number) {
    if (roundInProgress || selectedAbility !== null || !battleEngine) return

    if (slotService.isSlotLocked(playerDino, abilityIdx)) {
      const requiredLevel = slotService.getSlotRequiredLevel(abilityIdx)
      console.warn(`Slot ${abilityIdx} is locked. Requires level ${requiredLevel}`)
      return
    }

    if (!battleEngine.canUseAbility('player', abilityIdx)) return

    setSelectedAbility(abilityIdx)

    setTimeout(() => {
      executeRound(abilityIdx)
    }, 500)
  }

  function executeRound(playerAbilityIdx: number) {
    if (!battleEngine) return

    let availableAbilities = battleState.opponent.abilities
      .map((_: any, idx: number) => idx)
      .filter((idx: number) => battleEngine.canUseAbility('opponent', idx))

    // In adventures up to level 10, enemies cannot use abilities with effects
    if (currentScene && adventure.minLevel <= 10) {
      availableAbilities = availableAbilities.filter((idx: number) => {
        const ability = battleState.opponent.abilities[idx]
        return !ability.effects || ability.effects.length === 0
      })
    }

    const opponentAbilityIdx =
      availableAbilities.length > 0
        ? availableAbilities[Math.floor(Math.random() * availableAbilities.length)]
        : 0

    setRoundInProgress(true)

    setTimeout(() => {
      const result = battleEngine.executeRound(playerAbilityIdx, opponentAbilityIdx)
      const playerAbility = battleState.player.abilities[playerAbilityIdx]
      const opponentAbility = battleState.opponent.abilities[opponentAbilityIdx]

      const playerVisuals = battleVisualService.getVisualEffects(playerAbility)
      const opponentVisuals = battleVisualService.getVisualEffects(opponentAbility)

      setBattleLog(prev => [result.playerAction.message, ...prev.slice(0, 14)])

      setCurrentVisualEffects(playerVisuals)
      setCastIconId(playerAbility?.icon)
      setActiveEffectOverlay(true)

      if (result.playerAction.damage > 0) {
        setFloatingDamages(prev => [...prev, {
          id: `${Date.now()}-player`,
          damage: result.playerAction.damage,
          isCritical: false,
          isHealing: false,
          x: window.innerWidth * 0.75,
          y: window.innerHeight * 0.3,
        }])
      }

      setTimeout(() => {
        setActiveEffectOverlay(false)

        if (!result.playerAction.targetDied) {
          setBattleLog(prev => [result.opponentAction.message, ...prev.slice(0, 14)])

          setTimeout(() => {
            setCurrentVisualEffects(opponentVisuals)
            setCastIconId(opponentAbility?.icon)
            setActiveEffectOverlay(true)

            if (result.opponentAction.damage > 0) {
              setFloatingDamages(prev => [...prev, {
                id: `${Date.now()}-opponent`,
                damage: result.opponentAction.damage,
                isCritical: false,
                isHealing: false,
                x: window.innerWidth * 0.25,
                y: window.innerHeight * 0.3,
              }])
            }
          }, playerVisuals.animationDuration + 200)

          setTimeout(() => {
            setActiveEffectOverlay(false)
          }, playerVisuals.animationDuration + 200 + opponentVisuals.animationDuration)
        }

        setTimeout(() => {
          setBattleState(battleEngine.getState())
          setPlayerCurrentHp(battleEngine.getState().player.currentHp)

          if (result.battleEnded) {
            handleBattleEnd(result.winner === 'player')
          }

          setSelectedAbility(null)
          setRoundInProgress(false)
          setFloatingDamages([])
        }, result.playerAction.targetDied ? playerVisuals.animationDuration + 300 : playerVisuals.animationDuration + opponentVisuals.animationDuration + 500)
      }, playerVisuals.animationDuration)
    }, 800)
  }

  async function handleBattleEnd(playerWon: boolean) {
    if (!battleEngine) return

    if (!playerWon) {
      setAdventureEnded(true)
      setAdventureWon(false)
      return
    }

    const enemyXpReward = Math.floor(adventure.xpReward / adventure.scenes.length)
    const enemyCoinReward = Math.floor(adventure.coinReward / adventure.scenes.length)

    try {
      await addXpToDino(playerDino.id, enemyXpReward)
      if (user?.id) {
        await addCoinsToUser(user.id, enemyCoinReward)
      }
      setTotalXpGained(prev => prev + enemyXpReward)
      setTotalCoinsGained(prev => prev + enemyCoinReward)
    } catch (err) {
      console.error('Error giving rewards:', err)
    }

    const newHp = battleEngine.getState().player.currentHp
    setPlayerCurrentHp(newHp)

    if (currentEnemyIdx < currentScene.enemies.length - 1) {
      setCurrentEnemyIdx(currentEnemyIdx + 1)
      setInBattle(false)
      setBattleEngine(null)
      setBattleState(null)
      setBattleLog([])
    } else if (currentSceneIdx < adventure.scenes.length - 1) {
      setCurrentSceneIdx(currentSceneIdx + 1)
      setCurrentEnemyIdx(0)
      setInBattle(false)
      setBattleEngine(null)
      setBattleState(null)
      setBattleLog([])
    } else {
      setAdventureEnded(true)
      setAdventureWon(true)
      const finalXpBonus = adventure.xpReward - totalXpGained
      const finalCoinBonus = adventure.coinReward - totalCoinsGained
      try {
        if (finalXpBonus > 0) {
          await addXpToDino(playerDino.id, finalXpBonus)
          setTotalXpGained(prev => prev + finalXpBonus)
        }
        if (finalCoinBonus > 0 && user?.id) {
          await addCoinsToUser(user.id, finalCoinBonus)
          setTotalCoinsGained(prev => prev + finalCoinBonus)
        }
      } catch (err) {
        console.error('Error giving final rewards:', err)
      }
    }
  }

  // ADVENTURE COMPLETE SCREEN
  if (adventureEnded) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 relative overflow-y-auto" style={PAGE_BG}>
        <div className="absolute inset-0 bg-black/35 pointer-events-none" />
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 w-full max-w-md">
          <PremiumCard variant="frame">
            <div className="p-5 text-center space-y-4">
              <div className="text-8xl">{adventureWon ? '🎉' : '💀'}</div>
              <h1 className="text-3xl font-black text-amber-950">
                {adventureWon ? 'MACERA TAMAMLANDI!' : 'MACERAYI KAYBETTİN!'}
              </h1>

              {adventureWon ? (
                <div className="space-y-2 bg-amber-900/10 border border-amber-900/25 rounded-lg p-4">
                  <p className="text-lg font-black text-green-800">✅ {totalXpGained} XP Kazandı</p>
                  <p className="text-lg font-black text-amber-800">✨ {totalCoinsGained} DinoCoin Kazandı</p>
                </div>
              ) : (
                <p className="text-base font-bold text-red-800">😔 Maceradan Başarısız Oldun</p>
              )}

              <PremiumButton onClick={() => onComplete(adventureWon, totalXpGained)} className="w-full" contentClassName="text-sm">
                {adventureWon ? 'Sonraki Macera' : 'Geri Dön'}
              </PremiumButton>
            </div>
          </PremiumCard>
        </motion.div>
      </div>
    )
  }

  // IN BATTLE — unified WoW-style arena
  if (inBattle && battleState) {
    const slots: BattleArenaSlot[] = [0, 1, 2, 3, 4, 5].map((idx) => {
      const ability = battleState.player.abilities[idx] || null
      const isLocked = slotService.isSlotLocked(playerDino, idx)
      const canUse = !isLocked && !!battleEngine?.canUseAbility('player', idx)
      return {
        ability,
        index: idx,
        isUltimate: idx === 5,
        isSelected: selectedAbility === idx,
        isLocked,
        canUse,
        cooldown: battleState.player.cooldowns[idx] || 0,
        maxCooldown: ability?.maxCd || 0,
        disabled: selectedAbility !== null || !canUse || roundInProgress,
        lockedLevel: isLocked ? slotService.getSlotRequiredLevel(idx) : undefined,
      }
    })

    return (
      <>
        <BattleArena
          player={{
            name: playerDino.name,
            level: playerDino.level,
            currentHp: battleState.player.currentHp,
            maxHp: playerDino.maxHp,
            effects: battleState.player.effects,
            specId: playerDino.spec,
            classId: playerDino.class,
          }}
          opponent={{
            name: battleState.opponent.dino.name,
            level: battleState.opponent.dino.level,
            currentHp: battleState.opponent.currentHp,
            maxHp: battleState.opponent.dino.maxHp,
            effects: battleState.opponent.effects,
            specId: battleState.opponent.dino.spec,
            classId: battleState.opponent.dino.class,
          }}
          playerAtk={battleState.player.dino.atk}
          round={battleState.round}
          battleLog={battleLog}
          slots={slots}
          onSelectAbility={selectAbility}
          onEffectClick={openEffectInfo}
          activeEffectOverlay={activeEffectOverlay}
          currentVisualEffects={currentVisualEffects}
          onEffectOverlayComplete={() => setActiveEffectOverlay(false)}
          floatingDamages={floatingDamages}
          castIconId={castIconId}
        />

        <AnimatePresence>
          {effectInfoOpen && selectedEffectInfo && (
            <EffectInfoModal
              effect={selectedEffectInfo}
              battleCharacterMaxHp={playerDino.maxHp}
              isOpen={effectInfoOpen}
              onClose={() => setEffectInfoOpen(false)}
            />
          )}
        </AnimatePresence>
      </>
    )
  }

  // STORY VIEW
  return (
    <div className="w-full min-h-screen flex flex-col p-4 gap-4 relative overflow-y-auto" style={PAGE_BG}>
      <div className="absolute inset-0 bg-black/35 pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col gap-4">
        <PremiumButton onClick={onBack} className="w-28" contentClassName="text-sm">← Geri</PremiumButton>

        {/* Adventure header */}
        <PremiumCard variant="frame">
          <div className="p-4 text-center">
            <h1 className="text-2xl sm:text-3xl font-black text-amber-950">{adventure.name}</h1>
            <p className="text-sm font-bold text-amber-800">Sahne {currentSceneIdx + 1}/{adventure.scenes.length}</p>
          </div>
        </PremiumCard>

        {/* Illustration */}
        <div className="text-7xl text-center animate-bounce">{currentScene.illustration}</div>

        {/* Story */}
        <PremiumCard variant="frame">
          <div className="p-4 sm:p-5 text-center space-y-3">
            <h2 className="text-xl font-black text-amber-950">{currentScene.title}</h2>
            <p className="text-amber-900/90 leading-relaxed">{currentScene.story}</p>

            {currentEnemyData && (
              <div className="mt-3 pt-3 border-t border-amber-900/25">
                <p className="text-xs font-black text-amber-800/80 uppercase tracking-wide mb-2">Karşılaşacağın Düşman</p>
                <div className="bg-red-900/10 border border-red-800/30 rounded-lg p-3">
                  <p className="text-xl font-black text-red-800">{currentEnemyData.name}</p>
                  <p className="text-sm text-red-700/80">Seviye {currentEnemyData.level}</p>
                </div>
              </div>
            )}
          </div>
        </PremiumCard>

        {/* Player status */}
        <PremiumCard variant="panel">
          <div className="p-4">
            <p className="text-xs font-black text-amber-900 uppercase tracking-wide mb-2">Senin Durumun</p>
            <HealthBar current={playerCurrentHp} max={playerDino.maxHp} variant="player" />
          </div>
        </PremiumCard>

        <div className="flex justify-center">
          <PremiumButton onClick={startBattle} className="w-full max-w-xs" contentClassName="text-base">
            {currentScene.actionText || 'İlerle'}
          </PremiumButton>
        </div>
      </div>
    </div>
  )
}

function generateOpponentFromData(playerDino: Dino, enemyData: AdventureEnemy): Dino {
  return {
    id: 'adventure-enemy-' + Date.now(),
    name: enemyData.name,
    familyCode: '',
    level: enemyData.level,
    xp: 0,
    maxHp: Math.floor((playerDino.maxHp ?? 30) * enemyData.hpMultiplier),
    atk: Math.floor((playerDino.atk ?? 5) * enemyData.atkMultiplier),
    def: Math.floor((playerDino.def ?? 5) * enemyData.defMultiplier),
    spd: Math.floor((playerDino.spd ?? 5) * enemyData.spdMultiplier),
    element: playerDino.element,
    abilityIds: enemyData.abilityIds || playerDino.abilityIds,
  }
}
