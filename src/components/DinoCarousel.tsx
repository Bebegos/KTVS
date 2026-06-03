import { useEffect, useMemo, useRef, useState } from 'react'
import { Dino } from '../game/types'
import { getClassIcon, getSpecIcon } from '../lib/icons'
import MedallionIcon from './MedallionIcon'
import { cardAssets } from '../lib/gameAssets'

interface DinoCarouselProps {
  dinos: Dino[]
  onSelect: (dino: Dino) => void
}

function xpFor(level: number) {
  return Math.floor(100 * Math.pow(level, 1.5))
}

function useResponsiveCardWidth() {
  const [w, setW] = useState(200)
  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth
      setW(vw < 480 ? 168 : vw < 768 ? 200 : vw < 1280 ? 232 : 272)
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])
  return w
}

/** A single 5:7 dino card face (frame art with parchment fallback). */
function DinoCardFace({
  dino,
  active,
  width,
  height,
  onClick,
}: {
  dino: Dino
  active: boolean
  width: number
  height: number
  onClick: () => void
}) {
  const [frameFailed, setFrameFailed] = useState(false)
  const maxXp = xpFor(dino.level)
  const xpPct = Math.min(100, (dino.xp / maxXp) * 100)

  return (
    <button onClick={onClick} className="relative block" style={{ width, height, backfaceVisibility: 'hidden' }}>
      {!frameFailed ? (
        <img
          src={cardAssets.dinoFrame}
          alt=""
          aria-hidden
          onError={() => setFrameFailed(true)}
          className="absolute inset-0 w-full h-full object-fill pointer-events-none"
          draggable={false}
        />
      ) : (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, #efe1c2 0%, #d6c49e 100%)',
            border: '3px solid #b8860b',
            boxShadow: 'inset 0 0 0 1.5px rgba(176,138,58,0.5), 0 6px 16px rgba(0,0,0,0.5)',
          }}
        />
      )}

      {active && (
        <div className="absolute -inset-1 rounded-2xl pointer-events-none" style={{ boxShadow: '0 0 22px 4px rgba(212,175,55,0.6)' }} />
      )}

      <div className="absolute inset-0 flex flex-col items-center justify-between px-[12%] py-[11%] text-center pointer-events-none">
        <div className="flex flex-col items-center gap-1 w-full">
          <MedallionIcon id={dino.class} type="class" size="xl" />
          <h3 className="text-base font-black text-amber-950 truncate w-full leading-tight">{dino.name}</h3>
          <span
            className="px-3 py-0.5 rounded-full text-[11px] font-black text-amber-50"
            style={{ background: 'linear-gradient(180deg,#b8860b,#8a6310)', border: '1.5px solid #d4af37' }}
          >
            Seviye {dino.level}
          </span>
        </div>

        <div className="w-full space-y-1.5">
          <div>
            <div className="flex justify-between text-[9px] font-black text-amber-800/80 mb-0.5">
              <span>DENEYİM</span>
              <span>{dino.xp}/{maxXp}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-amber-950/30 border border-amber-900/40">
              <div className="h-full" style={{ width: `${xpPct}%`, background: 'linear-gradient(90deg,#f4d27a,#c79a3a)' }} />
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            {dino.class && (
              <span className="flex items-center gap-1 bg-amber-900/10 border border-amber-900/25 rounded-md px-1.5 py-0.5 min-w-0">
                <MedallionIcon id={dino.class} type="class" size="sm" />
                <span className="text-[9px] font-black text-amber-950 truncate max-w-[3.5rem]">{getClassIcon(dino.class)?.label}</span>
              </span>
            )}
            {dino.spec && (
              <span className="flex items-center gap-1 bg-amber-900/10 border border-amber-900/25 rounded-md px-1.5 py-0.5 min-w-0">
                <MedallionIcon id={dino.spec} type="spec" size="sm" />
                <span className="text-[9px] font-black text-amber-950 truncate max-w-[3.5rem]">{getSpecIcon(dino.spec)?.label}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

/**
 * 3D ring carousel: dino cards on a rotating cylinder. Front card is the active
 * pick (highest level first). Turn with arrows, by tapping a side card, or by
 * dragging/swiping. Tap the front card (or "Başla") to choose it.
 */
export default function DinoCarousel({ dinos, onSelect }: DinoCarouselProps) {
  const ordered = useMemo(() => [...dinos].sort((a, b) => b.level - a.level), [dinos])
  const cardW = useResponsiveCardWidth()
  const cardH = Math.round((cardW * 7) / 5)

  const [current, setCurrent] = useState(0)
  const [dragDeg, setDragDeg] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)
  const moved = useRef(false)

  const n = ordered.length
  const theta = n > 0 ? 360 / n : 0
  const radius = n <= 1 ? 0 : Math.max(Math.round((cardW / 2) / Math.tan(Math.PI / n)), Math.round(cardW * 0.85))

  const go = (dir: 1 | -1) => setCurrent((c) => (c + dir + n) % n)

  const onPointerDown = (e: React.PointerEvent) => {
    if (n <= 1) return
    setDragging(true)
    moved.current = false
    startX.current = e.clientX
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    const dx = e.clientX - startX.current
    if (Math.abs(dx) > 6) moved.current = true
    // One card width of drag ≈ one card step.
    setDragDeg((dx / cardW) * theta)
  }
  const endDrag = () => {
    if (!dragging) return
    const steps = Math.round(dragDeg / theta)
    if (steps !== 0) setCurrent((c) => (((c - steps) % n) + n) % n)
    setDragDeg(0)
    setDragging(false)
  }

  const frontDino = ordered[current]
  if (n === 0) return null

  return (
    <div className="w-full flex flex-col items-center gap-4 select-none">
      <div
        className="relative w-full max-w-3xl"
        style={{ height: cardH + 60, perspective: '1100px', touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        {n > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Önceki"
              className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full flex items-center justify-center text-2xl font-black text-amber-950 bg-amber-100/90 border-2 border-amber-700 shadow-lg hover:bg-amber-50 transition-colors"
            >
              ‹
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Sonraki"
              className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full flex items-center justify-center text-2xl font-black text-amber-950 bg-amber-100/90 border-2 border-amber-700 shadow-lg hover:bg-amber-50 transition-colors"
            >
              ›
            </button>
          </>
        )}

        <div
          className="absolute left-1/2 top-1/2"
          style={{
            transformStyle: 'preserve-3d',
            transform: `translate(-50%, -50%) translateZ(-${radius}px) rotateY(${-current * theta + dragDeg}deg)`,
            transition: dragging ? 'none' : 'transform 0.55s cubic-bezier(0.22,0.61,0.36,1)',
            width: cardW,
            height: cardH,
          }}
        >
          {ordered.map((dino, i) => (
            <div
              key={dino.id}
              className="absolute left-0 top-0"
              style={{
                width: cardW,
                height: cardH,
                transform: `rotateY(${i * theta}deg) translateZ(${radius}px)`,
                opacity: i === current ? 1 : 0.82,
                transition: 'opacity 0.4s',
              }}
            >
              <DinoCardFace
                dino={dino}
                active={i === current}
                width={cardW}
                height={cardH}
                onClick={() => {
                  if (moved.current) return // ignore clicks that were drags
                  i === current ? onSelect(dino) : setCurrent(i)
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => frontDino && onSelect(frontDino)}
        className="px-6 py-2 rounded-lg font-black text-amber-50 bg-amber-700/95 border-2 border-amber-300/70 hover:bg-amber-600 transition-colors shadow-lg"
      >
        {frontDino?.name} ile Başla →
      </button>
    </div>
  )
}
