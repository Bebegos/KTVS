import { motion } from 'framer-motion'
import { Dino } from '../game/types'
import HearthstoneCard from './HearthstoneCard'
import MedallionIcon from './MedallionIcon'
import StatDisplay from './StatDisplay'
import { getClassIcon, getSpecIcon } from '../lib/icons'

interface DinoBattlePreviewCardProps {
  dino: Dino
  label?: string
  className?: string
}

export default function DinoBattlePreviewCard({
  dino,
  label = 'OYUNCU',
  className = '',
}: DinoBattlePreviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`battle-preview-card-wrapper ${className}`}
    >
      <HearthstoneCard
        title={label}
        subtitle={`${dino.element || 'Normal'} • Level ${dino.level}`}
        className="battle-preview-card"
      >
        {/* Dinosaur Name */}
        <h2 className="battle-preview-name">{dino.name}</h2>

        {/* Class & Spec Badges */}
        {(dino.class || dino.spec) && (
          <div className="battle-preview-badges">
            {dino.class && (
              <div className="battle-preview-badge class-badge">
                <MedallionIcon id={dino.class} type="class" size="sm" />
                <span>{getClassIcon(dino.class)?.label || 'Class'}</span>
              </div>
            )}
            {dino.spec && (
              <div className="battle-preview-badge spec-badge">
                <MedallionIcon id={dino.spec} type="spec" size="sm" />
                <span>{getSpecIcon(dino.spec)?.label || 'Spec'}</span>
              </div>
            )}
          </div>
        )}

        {/* Stats Grid - 4 columns */}
        <div className="battle-preview-stats">
          <StatDisplay
            stat="sta"
            dino={dino}
            value={dino.sta || 0}
            size="sm"
            showDetailButton={false}
          />
          <StatDisplay
            stat="atk"
            dino={dino}
            value={dino.atk}
            size="sm"
            showDetailButton={false}
          />
          <StatDisplay
            stat="def"
            dino={dino}
            value={dino.def}
            size="sm"
            showDetailButton={false}
          />
          <StatDisplay
            stat="spd"
            dino={dino}
            value={dino.spd}
            size="sm"
            showDetailButton={false}
          />
        </div>

        {/* XP Bar */}
        <div className="battle-preview-xp-section">
          <div className="battle-preview-xp-label">
            <span>DENEYIM</span>
            <span className="battle-preview-xp-value">{dino.xp}/100</span>
          </div>
          <div className="battle-preview-xp-bar">
            <div
              className="battle-preview-xp-fill"
              style={{ width: `${(dino.xp / 100) * 100}%` }}
            />
          </div>
        </div>

        {/* Brief Abilities List */}
        {dino.abilityIds && dino.abilityIds.length > 0 && (
          <div className="battle-preview-abilities">
            <p className="battle-preview-abilities-label">
              YETENEKLER ({dino.abilityIds.filter(id => id).length})
            </p>
            <div className="battle-preview-abilities-tags">
              {dino.abilityIds.filter(id => id).map((abilityId, idx) => (
                <div key={idx} className="ability-tag">
                  #{idx + 1}
                </div>
              ))}
            </div>
          </div>
        )}
      </HearthstoneCard>
    </motion.div>
  )
}
