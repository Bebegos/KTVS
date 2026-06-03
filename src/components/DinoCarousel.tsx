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
      setW(vw < 480 ? 172 : vw < 768 ? 204 : vw < 1280 ? 236 : 276)
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])
  return w
}

/** Shortest signed ring distance of x in (-n/2, n/2]. */
function wrap(x: number, n: number) {
  let m = ((x % n) + n) % n
  if (m > n / 2) m -= n
  return m
}

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
        <div className="absolute -inset-1 rounded-2xl pointer-events-none" style={{ boxShadow: '0 0 24px 5px rgba(212,175,55,0.6)' }} />
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
 * 3D coverflow carousel: the center card faces the viewer; neighbours recede
 * and rotate away in 3D. Drag / swipe (or tap a side card) to turn it. Highest
 * level first. Works the same on mobile (1 centered card) and desktop.
 */
export default function DinoCarousel({ dinos, onSelect }: DinoCarouselProps) {
  const ordered = useMemo(() => [...dinos].sort((a, b) => b.level - a.level), [dinos])
  const cardW = useResponsiveCardWidth()
  const cardH = Math.round((cardW * 7) / 5)

  const [current, setCurrent] = useState(0)
  const [dragFrac, setDragFrac] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)
  const moved = useRef(false)

  const n = ordered.length
  const eff = current + dragFrac

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
    setDragFrac(-dx / (cardW * 0.72)) // drag left → advance
  }
  const endDrag = () => {
    if (!dragging) return
    setCurrent((c) => (((Math.round(c + dragFrac) % n) + n) % n))
    setDragFrac(0)
    setDragging(false)
  }

  const frontDino = ordered[((Math.round(eff) % n) + n) % n]
  if (n === 0) return null

  return (
    <div className="w-full flex flex-col items-center gap-4 select-none">
      <div
        className="relative w-full max-w-3xl overflow-hidden"
        style={{ height: cardH + 48, perspective: '1000px', touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        {ordered.map((dino, i) => {
          const offset = wrap(i - eff, n)
          const abs = Math.abs(offset)
          const hidden = abs > 2.4
          const rotateY = Math.max(-62, Math.min(62, -offset * 48))
          const tx = offset * cardW * 0.58
          const tz = -abs * 130
          const scale = Math.max(0.62, 1 - abs * 0.16)
          return (
            <div
              key={dino.id}
              className="absolute left-1/2 top-1/2"
              style={{
                width: cardW,
                height: cardH,
                transform: `translate(-50%, -50%) translateX(${tx}px) translateZ(${tz}px) rotateY(${rotateY}deg) scale(${scale})`,
                transformStyle: 'preserve-3d',
                transition: dragging ? 'none' : 'transform 0.5s cubic-bezier(0.22,0.61,0.36,1), opacity 0.4s',
                opacity: hidden ? 0 : Math.max(0.18, 1 - abs * 0.33),
                zIndex: 100 - Math.round(abs * 10),
                pointerEvents: hidden ? 'none' : 'auto',
              }}
            >
              <DinoCardFace
                dino={dino}
                active={abs < 0.5}
                width={cardW}
                height={cardH}
                onClick={() => {
                  if (moved.current) return
                  abs < 0.5 ? onSelect(dino) : setCurrent(i)
                }}
              />
            </div>
          )
        })}
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
