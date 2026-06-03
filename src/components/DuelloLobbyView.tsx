import { motion } from 'framer-motion'
import { Dino } from '../game/types'
import DinoBattlePreviewCard from './DinoBattlePreviewCard'
import PremiumButton from './PremiumButton'
import { homeAssets } from '../lib/gameAssets'

interface DuelloLobbyViewProps {
  playerDino: Dino
  opponentDino?: Dino
  waiting?: boolean
  sessionId?: string
  onStartBattle?: () => void
  onBack?: () => void
}

export default function DuelloLobbyView({
  playerDino,
  opponentDino,
  waiting = false,
  sessionId,
  onStartBattle,
  onBack,
}: DuelloLobbyViewProps) {
  return (
    <div
      className="w-full min-h-screen flex flex-col items-center justify-center p-4 gap-6 relative overflow-hidden"
      style={{ backgroundImage: `url('${homeAssets.background}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#2a1c0e' }}
    >
      <div className="absolute inset-0 bg-black/45 pointer-events-none" />

      {/* Back Button */}
      {onBack && (
        <div className="absolute top-4 left-4 z-20">
          <PremiumButton onClick={onBack} className="w-28" contentClassName="text-sm">← Geri</PremiumButton>
        </div>
      )}

      {/* Header */}
      <div className="text-center relative z-10">
        <h1 className="text-4xl sm:text-5xl font-black text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-1">⚔️ DÜELLO VS</h1>
        <p className="text-base font-bold text-amber-300/90 drop-shadow">{waiting ? 'Rakip bekleniyor...' : 'Hazırsın!'}</p>
      </div>

      {/* Battle Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl relative z-10">
        {/* Player Dinosaur */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DinoBattlePreviewCard
            dino={playerDino}
            label="OYUNCU"
            className="battle-lobby-player-card"
          />
        </motion.div>

        {/* VS Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="hidden md:flex items-center justify-center"
        >
          <div className="bg-gradient-to-br from-neon-cyan to-neon-purple p-6 rounded-full text-center">
            <p className="text-3xl font-black text-white">VS</p>
          </div>
        </motion.div>

        {/* Opponent Dinosaur or Waiting */}
        {opponentDino ? (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DinoBattlePreviewCard
              dino={opponentDino}
              label="RAKİP"
              className="battle-lobby-opponent-card"
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="battle-lobby-waiting">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-6xl mb-4"
              >
                ⏳
              </motion.div>
              <p className="text-2xl font-black text-amber-100 mb-2 drop-shadow">Rakip Bekleniyor</p>
              <p className="text-sm font-bold text-amber-200/70">Oturum: {sessionId}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      {opponentDino && onStartBattle && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="relative z-10">
          <PremiumButton onClick={onStartBattle} className="w-56" contentClassName="text-base">Savaşa Başla!</PremiumButton>
        </motion.div>
      )}
    </div>
  )
}
