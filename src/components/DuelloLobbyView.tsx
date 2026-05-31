import { motion } from 'framer-motion'
import { Dino } from '../game/types'
import DinoBattlePreviewCard from './DinoBattlePreviewCard'

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
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 gap-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-neon-cyan opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-neon-purple opacity-5 rounded-full blur-3xl"></div>
      </div>

      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="hs-btn absolute top-4 left-4 z-10"
        >
          <span>Geri</span>
        </button>
      )}

      {/* Header */}
      <div className="text-center relative z-10">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan mb-2">
          ⚔️ DÜELLO VS
        </h1>
        <p className="text-lg text-neon-purple/80">
          {waiting ? 'Rakip bekleniyor...' : 'Hazırsın!'}
        </p>
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
              <p className="text-2xl font-bold text-neon-purple mb-4">Rakip Bekleniyor</p>
              <p className="text-sm text-neon-purple/70">Oturum: {sessionId}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      {opponentDino && onStartBattle && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={onStartBattle}
          className="hs-btn hs-btn-lg hs-btn-green relative z-10"
        >
          <span>Savaşa Başla!</span>
        </motion.button>
      )}
    </div>
  )
}
