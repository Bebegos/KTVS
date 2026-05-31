import { Dino, ActiveEffect } from '../game/types'
import { abilityDefinitionService } from '../lib/services'
import HearthstoneCard from './HearthstoneCard'
import HealthBar from './HealthBar'
import EffectsDisplay from './EffectsDisplay'
import MedallionIcon from './MedallionIcon'
import { getClassIcon, getSpecIcon } from '../lib/icons'

interface BattleDinoCardProps {
  dino: Dino
  currentHp: number
  side: 'player' | 'opponent'
  effects?: ActiveEffect[]
  abilities?: any[]
  selectedAbilityIdx?: number | null
  onAbilitySelect?: (index: number) => void
  abilityDisabledCheck?: (index: number) => boolean
  roundInProgress?: boolean
}

export default function BattleDinoCard({
  dino,
  currentHp,
  side,
  effects = [],
  abilities = [],
  selectedAbilityIdx = null,
  onAbilitySelect,
  abilityDisabledCheck,
  roundInProgress = false,
}: BattleDinoCardProps) {
  const isSidePlayer = side === 'player'
  const textColor = isSidePlayer ? 'text-neon-cyan' : 'text-neon-purple'
  const titleBg = isSidePlayer ? 'from-neon-cyan' : 'from-neon-purple'

  return (
    <HearthstoneCard
      title={isSidePlayer ? 'OYUNCU' : 'RAKİP'}
      subtitle={`${dino.element || 'Normal'} • Level ${dino.level}`}
      className={`battle-dino-card battle-dino-${side}`}
    >
      {/* Dinosaur Name */}
      <div className={`battle-dino-header ${textColor}`}>
        <h2 className="text-2xl font-black">{dino.name}</h2>
      </div>

      {/* Health Bar */}
      <div className="battle-dino-health-section">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold uppercase">HP</span>
          <span className={`font-bold ${currentHp <= dino.maxHp * 0.25 ? 'text-red-500' : textColor}`}>
            {currentHp}/{dino.maxHp}
          </span>
        </div>
        <HealthBar
          current={currentHp}
          max={dino.maxHp}
          variant={side === 'player' ? 'player' : 'enemy'}
        />
      </div>

      {/* Class & Spec */}
      {(dino.class || dino.spec) && (
        <div className="battle-dino-badges">
          {dino.class && (
            <div className="battle-dino-badge class-badge">
              <MedallionIcon id={dino.class} type="class" size="xs" />
              <span>{getClassIcon(dino.class)?.label || 'Unknown'}</span>
            </div>
          )}
          {dino.spec && (
            <div className="battle-dino-badge spec-badge">
              <MedallionIcon id={dino.spec} type="spec" size="xs" />
              <span>{getSpecIcon(dino.spec)?.label || 'Unknown'}</span>
            </div>
          )}
        </div>
      )}

      {/* Effects Display */}
      {effects.length > 0 && (
        <div className="battle-dino-effects">
          <p className="text-xs font-bold text-gold-light uppercase mb-2">Efektler</p>
          <EffectsDisplay effects={effects} />
        </div>
      )}

      {/* Stats Grid */}
      <div className="battle-dino-stats">
        <div className="battle-stat-item">
          <span className="stat-label">ATK</span>
          <span className="stat-value">{dino.atk}</span>
        </div>
        <div className="battle-stat-item">
          <span className="stat-label">DEF</span>
          <span className="stat-value">{dino.def}</span>
        </div>
        <div className="battle-stat-item">
          <span className="stat-label">SPD</span>
          <span className="stat-value">{dino.spd}</span>
        </div>
      </div>

      {/* Abilities List - Only show if provided */}
      {abilities.length > 0 && onAbilitySelect && (
        <div className="battle-dino-abilities">
          <p className="text-xs font-bold text-gold-light uppercase mb-2">Yetenekler</p>
          <div className="battle-abilities-grid">
            {abilities.map((ability, idx) => {
              const isDisabled = abilityDisabledCheck ? abilityDisabledCheck(idx) : false
              const isSelected = selectedAbilityIdx === idx

              return (
                <button
                  key={idx}
                  onClick={() => onAbilitySelect(idx)}
                  disabled={isDisabled || roundInProgress}
                  className={`battle-ability-btn ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                >
                  <div className="ability-name">{ability.name}</div>
                  <div className="ability-cd">CD: {ability.cd}/3</div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </HearthstoneCard>
  )
}
