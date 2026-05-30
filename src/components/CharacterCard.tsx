import { motion } from 'framer-motion'
import { Dino, Ability } from '../game/types'

interface CharacterCardProps {
  dino: Dino
  currentHp: number
  maxHp: number
  effects: Array<{ type: string; duration: number }>
  abilities: Ability[]
  onAbilityClick?: (index: number) => void
  disabled?: boolean
  side?: 'left' | 'right'
}

export default function CharacterCard({
  dino,
  currentHp,
  maxHp,
  effects,
  abilities,
  onAbilityClick,
  disabled = false,
  side = 'left',
}: CharacterCardProps) {
  const hpPercent = (currentHp / maxHp) * 100

  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -50 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex flex-col gap-3 p-4 rounded-xl glass-dark min-w-0 flex-1 ${
        side === 'left'
          ? 'neon-border-cyan'
          : 'neon-border-pink'
      }`}
    >
      {/* Başlık */}
      <div className={`border-b pb-2 ${
        side === 'left'
          ? 'border-neon-cyan/30'
          : 'border-neon-pink/30'
      }`}>
        <h2 className={`text-2xl font-black ${side === 'left' ? 'text-neon-cyan' : 'text-neon-pink'}`}>
          🦖 {dino.name}
        </h2>
        <p className="text-xs font-bold text-gray-400">
          {dino.element && `${dino.element} • `}
          Lvl {dino.level}
        </p>
      </div>

      {/* HP Çubuğu */}
      <div className="glass border border-red-500/30 rounded-lg p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="font-black text-red-400">❤️ CAN</span>
          <span className="font-bold text-red-400 text-sm">
            {Math.round(currentHp)}/{maxHp}
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3 border border-red-500/30 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-red-500 to-red-600"
            animate={{ width: `${hpPercent}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>
      </div>

      {/* XP Çubuğu */}
      <div className="glass border border-yellow-500/30 rounded-lg p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="font-black text-yellow-400">⭐ XP</span>
          <span className="font-bold text-yellow-400 text-sm">
            {dino.xp}/100
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3 border border-yellow-500/30 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
            animate={{ width: `${dino.xp}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>
      </div>

      {/* Statlar */}
      <div className="grid grid-cols-3 gap-2 glass border border-neon-cyan/30 rounded-lg p-3">
        <div className="text-center">
          <p className="text-xs font-bold text-orange-400">⚔️ ATK</p>
          <p className="text-xl font-black text-orange-400">{dino.atk}</p>
        </div>
        <div className="text-center border-x border-slate-600">
          <p className="text-xs font-bold text-blue-400">🛡️ DEF</p>
          <p className="text-xl font-black text-blue-400">{dino.def}</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-bold text-yellow-400">⚡ SPD</p>
          <p className="text-xl font-black text-yellow-400">{dino.spd}</p>
        </div>
      </div>

      {/* Aktif Efektler */}
      <div className="glass border border-neon-purple/30 rounded-lg p-3">
        <p className="text-xs font-bold text-neon-purple mb-2">AKTIF EFEKTLER</p>
        <div className="flex gap-2">
          {[0, 1].map(idx => (
            <div key={idx} className="flex-1">
              {effects[idx] ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`aspect-square rounded-full glass-dark border-2 flex items-center justify-center font-black text-lg neon-border-purple`}
                >
                  <div className="text-center">
                    <p className="text-2xl">{getEffectEmoji(effects[idx].type)}</p>
                    <p className="text-xs font-black text-neon-purple">{effects[idx].duration}</p>
                  </div>
                </motion.div>
              ) : (
                <div className="aspect-square rounded-full glass border-2 border-dashed border-neon-cyan/30 flex items-center justify-center">
                  <span className="text-neon-cyan/40 text-xs font-bold">Boş</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Yetenekler */}
      <div className="flex-1 flex flex-col gap-2 glass border border-neon-cyan/30 rounded-lg p-3 overflow-y-auto">
        <p className="text-xs font-bold text-neon-cyan mb-1">YETENEKLER</p>
        {abilities.map((ability, idx) => (
          <motion.button
            key={idx}
            onClick={() => onAbilityClick?.(idx)}
            disabled={disabled || ability.cd > 0}
            whileHover={{ scale: !disabled && ability.cd === 0 ? 1.02 : 1 }}
            whileTap={{ scale: !disabled && ability.cd === 0 ? 0.98 : 1 }}
            className={`p-2 rounded-lg text-xs font-bold text-left transition glass-dark border-2 ${
              idx === 4
                ? 'neon-border-purple text-neon-purple'
                : 'neon-border-cyan text-neon-cyan'
            } ${
              ability.cd > 0 || disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="flex-1 truncate">{ability.name}</span>
              {ability.cd > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-red-600/80 text-white rounded-full text-xs font-black">
                  {ability.cd}
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Pasif Yetenek */}
      {dino.passive && (
        <div className="glass-dark neon-border-purple rounded-lg p-3 text-xs">
          <p className="font-bold text-neon-purple mb-1">✨ PASİF:</p>
          <p className="text-neon-purple/80">{dino.passive}</p>
        </div>
      )}
    </motion.div>
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
