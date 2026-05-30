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
  const hpColor = hpPercent > 50 ? 'bg-green-500' : hpPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -50 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex flex-col gap-3 p-4 rounded-xl border-4 ${
        side === 'left'
          ? 'border-dino-500 bg-gradient-to-b from-dino-50 to-dino-100'
          : 'border-red-500 bg-gradient-to-b from-red-50 to-red-100'
      } shadow-lg min-w-0 flex-1`}
    >
      {/* Başlık */}
      <div className="border-b-4 border-dashed pb-2" style={{
        borderColor: side === 'left' ? '#16a34a' : '#dc2626'
      }}>
        <h2 className={`text-2xl font-black ${side === 'left' ? 'text-dino-700' : 'text-red-700'}`}>
          🦖 {dino.name}
        </h2>
        <p className="text-xs font-bold text-gray-600">
          {dino.element && `${dino.element} • `}
          Lvl {dino.level}
        </p>
      </div>

      {/* HP Çubuğu */}
      <div className="bg-white border-3 border-red-400 rounded-lg p-2">
        <div className="flex justify-between items-center mb-1">
          <span className="font-black text-red-700">❤️ CAN</span>
          <span className="font-bold text-red-700 text-sm">
            {Math.round(currentHp)}/{maxHp}
          </span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-6 border-2 border-red-400 overflow-hidden">
          <motion.div
            className={`h-full ${hpColor}`}
            animate={{ width: `${hpPercent}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>
      </div>

      {/* XP Çubuğu */}
      <div className="bg-white border-3 border-yellow-400 rounded-lg p-2">
        <div className="flex justify-between items-center mb-1">
          <span className="font-black text-yellow-700">⭐ XP</span>
          <span className="font-bold text-yellow-700 text-sm">
            {dino.xp}/100
          </span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-4 border-2 border-yellow-400 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600"
            animate={{ width: `${dino.xp}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>
      </div>

      {/* Statlar */}
      <div className="grid grid-cols-3 gap-2 bg-white border-3 border-dino-300 rounded-lg p-2">
        <div className="text-center">
          <p className="text-xs font-bold text-orange-700">⚔️ SALDIRI</p>
          <p className="text-xl font-black text-orange-700">{dino.atk}</p>
        </div>
        <div className="text-center border-x-2 border-dino-300">
          <p className="text-xs font-bold text-blue-700">🛡️ SAVUNMA</p>
          <p className="text-xl font-black text-blue-700">{dino.def}</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-bold text-purple-700">⚡ HIZ</p>
          <p className="text-xl font-black text-purple-700">{dino.spd}</p>
        </div>
      </div>

      {/* Aktif Efektler (2 yuva) */}
      <div className="bg-white border-3 border-purple-300 rounded-lg p-2">
        <p className="text-xs font-bold text-purple-700 mb-2">AKTIF EFEKTLER</p>
        <div className="flex gap-2">
          {[0, 1].map(idx => (
            <div key={idx} className="flex-1">
              {effects[idx] ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`aspect-square rounded-full border-4 flex items-center justify-center font-black text-lg ${getEffectStyle(
                    effects[idx].type
                  )}`}
                >
                  <div className="text-center">
                    <p className="text-2xl">{getEffectEmoji(effects[idx].type)}</p>
                    <p className="text-xs font-black">{effects[idx].duration}</p>
                  </div>
                </motion.div>
              ) : (
                <div className="aspect-square rounded-full border-4 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                  <span className="text-gray-400 text-xs font-bold">Boş</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Yetenekler */}
      <div className="flex-1 flex flex-col gap-1 bg-white border-3 border-dino-400 rounded-lg p-2 overflow-y-auto">
        <p className="text-xs font-bold text-dino-700 mb-1">YETENEKLER</p>
        {abilities.map((ability, idx) => (
          <motion.button
            key={idx}
            onClick={() => onAbilityClick?.(idx)}
            disabled={disabled || ability.cd > 0}
            whileHover={{ scale: !disabled && ability.cd === 0 ? 1.02 : 1 }}
            whileTap={{ scale: !disabled && ability.cd === 0 ? 0.98 : 1 }}
            className={`p-2 rounded-lg text-xs font-bold text-left transition border-2 ${
              idx === 4 // ULTI
                ? 'border-yellow-400 bg-gradient-to-r from-yellow-200 to-orange-200'
                : 'border-dino-300 bg-dino-100'
            } ${
              ability.cd > 0
                ? 'opacity-50 cursor-not-allowed'
                : disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="flex-1 truncate">{ability.name}</span>
              {ability.cd > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-black">
                  {ability.cd}
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Pasif Yetenek */}
      {dino.passive && (
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-400 rounded-lg p-2 text-xs">
          <p className="font-bold text-purple-700 mb-0.5">✨ PASİF:</p>
          <p className="text-purple-700">{dino.passive}</p>
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

function getEffectStyle(type: string): string {
  const styles: Record<string, string> = {
    poison: 'bg-purple-200 border-purple-600 text-purple-900',
    stun: 'bg-yellow-200 border-yellow-600 text-yellow-900',
    stop: 'bg-red-200 border-red-600 text-red-900',
    power: 'bg-green-200 border-green-600 text-green-900',
    speed: 'bg-blue-200 border-blue-600 text-blue-900',
    shield: 'bg-cyan-200 border-cyan-600 text-cyan-900',
  }
  return styles[type] || 'bg-gray-200 border-gray-600'
}
