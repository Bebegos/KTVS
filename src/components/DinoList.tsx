import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from '../lib/auth-context'
import { Dino } from '../game/types'
import { deleteDino, getDinos } from '../lib/supabase'
import DinoDetailModal from './DinoDetailModal'
import DinoCard from './DinoCard'

interface DinoListProps {
  dinos: Dino[]
  onBack: () => void
  onRefresh: (dinos: Dino[]) => void
  onEdit?: (dino: Dino) => void
  onViewDetail?: (dino: Dino) => void
}

export default function DinoList({ dinos, onBack, onRefresh, onEdit, onViewDetail }: DinoListProps) {
  const { user } = useAuth()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [selectedDino, setSelectedDino] = useState<Dino | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  async function handleDelete(id: string) {
    if (!window.confirm('Silmek istediğine emin misin?')) return

    try {
      await deleteDino(id)
      const updated = await getDinos(user?.id)
      onRefresh(updated as Dino[])
    } catch (err) {
      console.error('Silme hatası:', err)
    } finally {
      setDeleting(null)
    }
  }

  function handleOpenDetail(dino: Dino) {
    if (onViewDetail) {
      onViewDetail(dino)
    } else {
      setSelectedDino(dino)
      setDetailModalOpen(true)
    }
  }

  function handleCloseDetail() {
    setDetailModalOpen(false)
    setSelectedDino(null)
  }

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto relative">
      {/* Arka plan efekti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-neon-cyan opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-neon-purple opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <button
          onClick={onBack}
          className="hs-btn"
        >
          <span>Geri</span>
        </button>

        <h1 className="text-4xl font-black text-center mt-4 text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">Dinozorlarım</h1>

        {dinos.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center mt-8">
            <p className="text-2xl text-neon-cyan">Henüz dinozor yok. Yeni bir tane oluştur!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-4 mt-6">
            {dinos.map((dino) => (
              <DinoCard
                key={dino.id}
                dino={dino}
                mode="display"
                onView={() => handleOpenDetail(dino)}
                onEdit={onEdit ? () => onEdit(dino) : undefined}
                onDelete={() => handleDelete(dino.id)}
                deleting={deleting === dino.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailModalOpen && selectedDino && (
          <DinoDetailModal
            dino={selectedDino}
            isOpen={detailModalOpen}
            onClose={handleCloseDetail}
            onEdit={onEdit ? () => { onEdit(selectedDino); handleCloseDetail() } : undefined}
            onSpendRewards={(updatedDino) => {
              const updatedList = dinos.map(d => d.id === updatedDino.id ? updatedDino : d)
              onRefresh(updatedList)
              handleCloseDetail()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
