import { Dino } from '../game/types'
import { abilityDefinitionService, discoveryService } from '../lib/services'
import HearthstoneCard, { CardMode } from './HearthstoneCard'
import MedallionIcon from './MedallionIcon'
import AbilityIcon from './AbilityIcon'
import StatDisplay from './StatDisplay'
import { getClassIcon, getSpecIcon } from '../lib/icons'

interface DinoCardProps {
  dino: Dino
  mode?: CardMode
  selected?: boolean
  onClick?: () => void
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  deleting?: boolean
  className?: string
}

export default function DinoCard({
  dino,
  mode = 'display',
  selected = false,
  onClick,
  onView,
  onEdit,
  onDelete,
  deleting = false,
  className = '',
}: DinoCardProps) {
  const hasPendingRewards =
    dino.pendingRewards &&
    (dino.pendingRewards.unspentStatPoints > 0 ||
      discoveryService.getDiscoveries(dino).length > 0)

  // Determine button actions based on mode
  const actions = []
  if (mode === 'selection') {
    // In selection mode, just show a select button
    actions.push({
      label: 'Seç',
      onClick: () => onClick?.(),
      variant: 'parchment' as const,
    })
  } else {
    // In display/summary mode, show view, edit, delete
    if (onView) {
      actions.push({
        label: 'Detaylar',
        onClick: onView,
        variant: 'parchment' as const,
      })
    }
    if (onEdit) {
      actions.push({
        label: 'Düzen',
        onClick: onEdit,
        variant: 'purple' as const,
      })
    }
    if (onDelete) {
      actions.push({
        label: deleting ? 'Siliniyor...' : 'Sil',
        onClick: onDelete,
        variant: 'red' as const,
      })
    }
  }

  return (
    <HearthstoneCard
      title={dino.name}
      subtitle={`${dino.element || 'Normal'} • Level ${dino.level}`}
      mode={mode}
      selected={selected}
      onClick={onClick}
      actions={actions}
      className={`dino-card ${hasPendingRewards ? 'has-rewards' : ''} ${className}`}
    >
      {/* Class & Spec Medallions */}
      {(dino.class || dino.spec) && (
        <div className="dino-card-badges">
          {dino.class && (
            <div className="dino-card-badge class-badge">
              <MedallionIcon id={dino.class} type="class" size="sm" />
              <span className="badge-label">
                {getClassIcon(dino.class)?.label || 'Unknown'}
              </span>
            </div>
          )}
          {dino.spec && (
            <div className="dino-card-badge spec-badge">
              <MedallionIcon id={dino.spec} type="spec" size="sm" />
              <span className="badge-label">
                {getSpecIcon(dino.spec)?.label || 'Unknown'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      {mode !== 'summary' && (
        <div className="dino-card-stats">
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
      )}

      {/* XP Bar */}
      {mode !== 'summary' && (
        <div className="dino-card-xp-section">
          <div className="dino-card-xp-label">
            <span>DENEYIM</span>
            <span className="dino-card-xp-value">{dino.xp}/100</span>
          </div>
          <div className="dino-card-xp-bar">
            <div
              className="dino-card-xp-fill"
              style={{ width: `${(dino.xp / 100) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Abilities List - only in display mode */}
      {mode === 'display' && dino.abilityIds && dino.abilityIds.length > 0 && (
        <div className="dino-card-abilities-section">
          <p className="dino-card-abilities-label">
            YETENEKLER ({dino.abilityIds.filter((id) => id).length})
          </p>
          <div className="dino-card-abilities-list">
            {dino.abilityIds.map((abilityId: string, idx: number) => {
              if (!abilityId) return null
              const ability = abilityDefinitionService.getAbility(abilityId)
              if (!ability) return null

              return (
                <div key={idx} className="dino-card-ability-item">
                  <AbilityIcon iconId={ability.icon} size="md" />
                  <div className="dino-card-ability-info">
                    <p className="dino-card-ability-name">{ability.name}</p>
                    <div className="dino-card-ability-details">
                      <p>
                        {!ability.effects || ability.effects.length === 0
                          ? `Saldırı • ×${ability.damageMultiplier || 1}`
                          : `Etki • ×${ability.damageMultiplier || 1}`}
                      </p>
                      {ability.cooldown && ability.cooldown > 0 && (
                        <p>CD: {ability.cooldown} tur</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pending Rewards Badge */}
      {hasPendingRewards && (
        <div className="dino-card-rewards-badge">
          <span>⬆ Level Atladı!</span>
        </div>
      )}
    </HearthstoneCard>
  )
}
