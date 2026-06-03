import { useRef } from 'react'
import { Dino } from '../game/types'
import { getClassIcon, getSpecIcon } from '../lib/icons'
import MedallionIcon from './MedallionIcon'
import PremiumCard from './PremiumCard'

interface DinoCarouselProps {
  dinos: Dino[]
  onSelect: (dino: Dino) => void
}

function xpFor(level: number) {
  return Math.floor(100 * Math.pow(level, 1.5))
}

/**
 * Horizontal Hearthstone-style dino picker. Cards snap; the front card(s)
 * (3 on desktop, 1 on mobile) sit ready to pick, and you turn the carousel
 * (swipe or arrows) to bring others forward.
 */
export default function DinoCarousel({ dinos, onSelect }: DinoCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector('[data-card]') as HTMLElement | null
    const step = card ? card.offsetWidth + 16 : 240
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Arrows */}
      <button
        onClick={() => scrollByCard(-1)}
        aria-label="Önceki"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center text-2xl font-black text-amber-950 bg-amber-100/90 border-2 border-amber-700 shadow-lg hover:bg-amber-50 transition-colors"
      >
        ‹
      </button>
      <button
        onClick={() => scrollByCard(1)}
        aria-label="Sonraki"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center text-2xl font-black text-amber-950 bg-amber-100/90 border-2 border-amber-700 shadow-lg hover:bg-amber-50 transition-colors"
      >
        ›
      </button>

      {/* Track */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth py-3 px-[calc(50%-7rem)] sm:px-12 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {dinos.map((dino) => {
          const maxXp = xpFor(dino.level)
          const xpPct = Math.min(100, (dino.xp / maxXp) * 100)
          return (
            <button
              key={dino.id}
              data-card
              onClick={() => onSelect(dino)}
              className="snap-center shrink-0 w-56 sm:w-60 transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              <PremiumCard variant="frame">
                <div className="flex flex-col items-center text-center p-2 gap-2">
                  {/* Class portrait */}
                  <MedallionIcon id={dino.class} type="class" size="xl" />

                  {/* Name + level */}
                  <h3 className="text-lg font-black text-amber-950 truncate w-full leading-tight">{dino.name}</h3>
                  <span
                    className="px-3 py-0.5 rounded-full text-xs font-black text-amber-50"
                    style={{ background: 'linear-gradient(180deg,#b8860b,#8a6310)', border: '1.5px solid #d4af37' }}
                  >
                    Seviye {dino.level}
                  </span>

                  {/* XP bar */}
                  <div className="w-full mt-0.5">
                    <div className="flex justify-between text-[10px] font-black text-amber-800/80 mb-0.5">
                      <span>DENEYİM</span>
                      <span>{dino.xp}/{maxXp}</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden bg-amber-950/30 border border-amber-900/40">
                      <div className="h-full transition-all" style={{ width: `${xpPct}%`, background: 'linear-gradient(90deg,#f4d27a,#c79a3a)' }} />
                    </div>
                  </div>

                  {/* Class + spec chips */}
                  <div className="flex items-center justify-center gap-2 w-full mt-1">
                    {dino.class && (
                      <span className="flex items-center gap-1 bg-amber-900/10 border border-amber-900/25 rounded-md px-2 py-1 min-w-0">
                        <MedallionIcon id={dino.class} type="class" size="sm" />
                        <span className="text-[10px] font-black text-amber-950 truncate">{getClassIcon(dino.class)?.label}</span>
                      </span>
                    )}
                    {dino.spec && (
                      <span className="flex items-center gap-1 bg-amber-900/10 border border-amber-900/25 rounded-md px-2 py-1 min-w-0">
                        <MedallionIcon id={dino.spec} type="spec" size="sm" />
                        <span className="text-[10px] font-black text-amber-950 truncate">{getSpecIcon(dino.spec)?.label}</span>
                      </span>
                    )}
                  </div>
                </div>
              </PremiumCard>
            </button>
          )
        })}
      </div>
    </div>
  )
}
