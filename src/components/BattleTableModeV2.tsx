import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dino, ActiveEffect } from '../game/types'
import { BattleEngine } from '../lib/battleEngine'
import { slotService } from '../lib/services'
import EffectInfoModal from './EffectInfoModal'
import BattleArena, { BattleArenaSlot } from './battle/BattleArena'

interface BattleTableModeV2Props {
  dino: Dino
  onBack: () => void
  onRefresh: (dinos: Dino[]) => void
}

export default function BattleTableModeV2({ dino, onBack }: BattleTableModeV2Props) {
  const maxHp = dino?.maxHp ?? 30

  // Simple training opponent
  const [opponentDino] = useState<Dino>(() => ({
    id: 'training-dummy-' + Date.now(),
    name: 'Eğitim Kuklası',
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
    abilityIds: dino.abilityIds,
  }))

  const [engine] = useState(() => new BattleEngine(dino, opponentDino))
  const [battleState, setBattleState] = useState(engine.getState())
  const [showSkipTurnModal, setShowSkipTurnModal] = useState(false)
  const [abilityUsedThisTurn, setAbilityUsedThisTurn] = useState(false)
  const [effectInfoOpen, setEffectInfoOpen] = useState(false)
  const [selectedEffectInfo, setSelectedEffectInfo] = useState<ActiveEffect | null>(null)

  const openEffectInfo = (effect: ActiveEffect) => {
    setSelectedEffectInfo(effect)
    setEffectInfoOpen(true)
  }

  function executeAbility(abilityIdx: number) {
    if (abilityUsedThisTurn || !engine.canUseAbility('player', abilityIdx)) return

    const playerResult = engine.executeAbility('player', abilityIdx)

    if (playerResult.targetDied) {
      setBattleState(engine.getState())
      setAbilityUsedThisTurn(true)
      return
    }

    setTimeout(() => {
      let opponentAbilityIdx = Math.floor(Math.random() * engine.getState().opponent.abilities.length)
      let attempts = 0
      while (!engine.canUseAbility('opponent', opponentAbilityIdx) && attempts < 5) {
        opponentAbilityIdx = Math.floor(Math.random() * engine.getState().opponent.abilities.length)
        attempts++
      }
      if (engine.canUseAbility('opponent', opponentAbilityIdx)) {
        engine.executeAbility('opponent', opponentAbilityIdx)
      }

      engine.applyEffectDamageAndDecrement('player')
      engine.applyEffectDamageAndDecrement('opponent')
      engine.decrementCooldowns('player')
      engine.decrementCooldowns('opponent')

      setBattleState(engine.getState())
      setAbilityUsedThisTurn(true)
    }, 700)
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
    engine.applyEffectDamageAndDecrement('player')
    engine.applyEffectDamageAndDecrement('opponent')
    engine.decrementCooldowns('player')
    engine.decrementCooldowns('opponent')
    setBattleState(engine.getState())
    setAbilityUsedThisTurn(false)
  }

  const slots: BattleArenaSlot[] = [0, 1, 2, 3, 4, 5].map((idx) => {
    const ability = battleState.player.abilities[idx] || null
    const isLocked = slotService.isSlotLocked(dino, idx)
    const canUse = !isLocked && engine.canUseAbility('player', idx)
    return {
      ability,
      index: idx,
      isUltimate: idx === 5,
      isSelected: false,
      isLocked,
      canUse,
      cooldown: battleState.player.cooldowns[idx] || 0,
      maxCooldown: ability?.maxCd || 0,
      disabled: isLocked || !canUse || abilityUsedThisTurn,
      lockedLevel: isLocked ? slotService.getSlotRequiredLevel(idx) : undefined,
    }
  })

  return (
    <>
      <BattleArena
        player={{
          name: battleState.player.dino.name,
          level: battleState.player.dino.level,
          currentHp: battleState.player.currentHp,
          maxHp,
          effects: battleState.player.effects,
          specId: dino.spec,
          classId: dino.class,
        }}
        opponent={{
          name: battleState.opponent.dino.name,
          level: battleState.opponent.dino.level,
          currentHp: battleState.opponent.currentHp,
          maxHp: opponentDino.maxHp,
          effects: battleState.opponent.effects,
          specId: opponentDino.spec,
          classId: opponentDino.class,
        }}
        playerAtk={battleState.player.dino.atk}
        round={battleState.round}
        battleLog={battleState.battleLog}
        slots={slots}
        onSelectAbility={executeAbility}
        onEffectClick={openEffectInfo}
        onAbandon={onBack}
        primaryAction={{ label: '✅ Turu Bitir', onClick: endTurn }}
        activeEffectOverlay={false}
        currentVisualEffects={null}
        onEffectOverlayComplete={() => {}}
        floatingDamages={[]}
      />

      <AnimatePresence>
        {effectInfoOpen && selectedEffectInfo && (
          <EffectInfoModal
            effect={selectedEffectInfo}
            battleCharacterMaxHp={maxHp}
            isOpen={effectInfoOpen}
            onClose={() => setEffectInfoOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Skip-turn confirmation */}
      <AnimatePresence>
        {showSkipTurnModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4"
            onClick={() => setShowSkipTurnModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-xl p-8 max-w-md text-center border-2 border-amber-700/60 bg-stone-900"
            >
              <div className="text-5xl mb-4">⚠️</div>
              <h2 className="text-2xl font-black text-amber-200 mb-3">Yetenek Kullanmadan Tur Geç?</h2>
              <p className="text-sm text-amber-100/80 mb-6">
                Herhangi bir yetenek kullanmadan tur geçmek üzeresin. Devam etmek istiyor musun?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowSkipTurnModal(false)} className="hs-btn flex-1">
                  ← Geri
                </button>
                <button onClick={confirmSkipTurn} className="hs-btn hs-btn-purple flex-1">
                  ✓ Devam Et
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
