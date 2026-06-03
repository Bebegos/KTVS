import { Dino } from '../game/types'
import { abilityCalculationService } from '../lib/services/abilityCalculationService'
import { abilityDefinitionService } from '../lib/services/abilityDefinitionService'
import AbilityIcon from './AbilityIcon'
import EffectIcon from './EffectIcon'
import PremiumModal from './PremiumModal'
import PremiumButton from './PremiumButton'
import { getEffectNameTR } from '../lib/effect-translations'

interface AbilityInfoModalProps {
  abilityId: string
  dino: Dino
  cooldown: number
  isOpen: boolean
  onClose: () => void
}

const kindLabel: Record<string, string> = {
  heal: 'İyileştirme', buff: 'Buff', debuff: 'Debuff', ultimate: 'Ultimate',
  attack: 'Saldırı', passive: 'Pasif', utility: 'Yardımcı',
}

export default function AbilityInfoModal({ abilityId, dino, cooldown, isOpen, onClose }: AbilityInfoModalProps) {
  if (!isOpen) return null

  const ability = abilityDefinitionService.getAbility(abilityId)
  if (!ability) return null

  const isCooling = cooldown > 0

  let baseValue = 0
  let valueType: 'dmg' | 'heal' = 'dmg'
  if (ability.kind === 'heal') {
    baseValue = abilityCalculationService.calculateAbilityHealing(abilityId, dino)
    valueType = 'heal'
  } else if (ability.kind === 'attack' || ability.kind === 'debuff') {
    baseValue = abilityCalculationService.calculateAbilityBaseDamage(abilityId, dino)
  }

  return (
    <PremiumModal onClose={onClose} zIndex={300}>
      <div className="px-4 sm:px-5 pt-0 pb-4 sm:pb-5 -mt-3 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-14 h-14 rounded-full flex-shrink-0 bg-amber-900/10 border-[1.5px] border-amber-700/50">
            <AbilityIcon iconId={ability.icon} size="lg" />
          </span>
          <div>
            <h2 className="text-2xl font-black text-amber-950 leading-tight">{ability.name}</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-800/80">
              {kindLabel[ability.kind] || ability.kind}
            </p>
          </div>
        </div>

        {/* Gold hairline separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-amber-700/55 to-transparent" />

        {/* Cooldown */}
        {ability.cooldown > 0 && (
          <div
            className="p-3 rounded-lg font-black text-sm"
            style={isCooling ? { background: 'rgba(185,28,28,0.12)', border: '1.5px solid rgba(185,28,28,0.4)', color: '#991b1b' } : { background: 'rgba(21,128,61,0.12)', border: '1.5px solid rgba(21,128,61,0.4)', color: '#15803d' }}
          >
            {isCooling ? `Hazırlanıyor: ${cooldown} tur` : 'Hazır'}
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-amber-900/8 border border-amber-900/25 rounded-lg p-3 text-center">
            <p className="text-[11px] font-black uppercase tracking-wide text-amber-800/80 mb-1">Hasar Çarpanı</p>
            <p className="text-xl font-black text-amber-950">×{ability.damageMultiplier || 1}</p>
          </div>
          <div className="bg-amber-900/8 border border-amber-900/25 rounded-lg p-3 text-center">
            <p className="text-[11px] font-black uppercase tracking-wide text-amber-800/80 mb-1">Bekleme</p>
            <p className="text-xl font-black text-amber-950">{ability.cooldown}T</p>
          </div>
        </div>

        {/* Value */}
        {baseValue > 0 && (
          <div className="bg-amber-900/8 border border-amber-900/25 rounded-lg p-3">
            <p className="text-[11px] font-black uppercase tracking-wide text-amber-800/80 mb-1">
              {valueType === 'heal' ? 'İyileştirme Miktarı' : 'Hasar Miktarı'}
            </p>
            <p className="text-2xl font-black" style={{ color: valueType === 'heal' ? '#15803d' : '#c2410c' }}>{baseValue}</p>
            <p className="text-[11px] text-amber-800/70 mt-0.5">{dino.name} için şu anki statlarla</p>
          </div>
        )}

        {/* Effects */}
        {ability.effects && ability.effects.length > 0 && (
          <div className="bg-amber-900/8 border border-amber-900/25 rounded-lg p-3">
            <p className="text-[11px] font-black uppercase tracking-wide text-amber-800/80 mb-2">Efektler</p>
            <div className="flex flex-wrap gap-2">
              {ability.effects.map((effectId, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-amber-900/12 border border-amber-900/30 rounded px-2.5 py-1">
                  <EffectIcon effect={effectId as any} size="sm" />
                  <span className="text-xs font-bold text-amber-900">{getEffectNameTR(effectId)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {ability.description && (
          <div className="bg-amber-900/10 border border-amber-900/25 rounded-lg p-3">
            <p className="text-sm font-semibold text-amber-950/90 leading-relaxed">{ability.description}</p>
          </div>
        )}

        <PremiumButton onClick={onClose} className="w-full" contentClassName="text-sm">Kapat</PremiumButton>
      </div>
    </PremiumModal>
  )
}
