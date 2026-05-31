import { motion } from 'framer-motion'
import { Dino } from '../game/types'
import HearthstoneCard from './HearthstoneCard'

interface BattleResult {
  winner: Dino
  loser: Dino
  winnerXp: number
  loserXp: number
  winnerCoins?: number
  loserCoins?: number
  duration?: number
}

interface BattleResultCardProps {
  result: BattleResult
  actions?: {
    label: string
    onClick: () => void
    variant?: 'parchment' | 'green' | 'red' | 'blue' | 'purple'
  }[]
}

export default function BattleResultCard({ result, actions }: BattleResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 15,
      }}
    >
      <HearthstoneCard
        title={result.winner === result.winner ? '⭐ ZAFER!' : '💀 YENİLGİ'}
        className="battle-result-card"
        actions={actions}
      >
        {/* Winner Section */}
        <div className="battle-result-winner">
          <div className="winner-badge">🥇</div>
          <div className="winner-info">
            <h3 className="winner-name">{result.winner.name}</h3>
            <div className="winner-stats">
              <span className="stat-badge xp-badge">
                +{result.winnerXp} XP
              </span>
              {result.winnerCoins && (
                <span className="stat-badge coin-badge">
                  +{result.winnerCoins} Coin
                </span>
              )}
            </div>
          </div>
        </div>

        {/* VS Divider */}
        <div className="battle-result-divider">VS</div>

        {/* Loser Section */}
        <div className="battle-result-loser">
          <div className="loser-badge">🔻</div>
          <div className="loser-info">
            <h3 className="loser-name">{result.loser.name}</h3>
            <div className="loser-stats">
              <span className="stat-badge xp-badge-small">
                +{result.loserXp} XP
              </span>
              {result.loserCoins && (
                <span className="stat-badge coin-badge-small">
                  +{result.loserCoins} Coin
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Duration */}
        {result.duration && (
          <div className="battle-result-duration">
            <span className="text-xs font-bold text-gold-light uppercase">
              ⏱️ {Math.floor(result.duration / 1000)}s
            </span>
          </div>
        )}
      </HearthstoneCard>
    </motion.div>
  )
}
