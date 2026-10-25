import { useEffect, useRef, useState } from 'react'
import type { MouseEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'motion/react'
import { SMOOTH, spring, useMotionPref } from '../lib/motion'

/**
 * Hero visual: real screenshots of the two projects as a 3D desk of windows.
 * - The whole stage tilts towards the pointer; windows, phone and chips sit at different depths.
 * - The windows swap places every few seconds (paused while hovered); click the back one to bring it forward.
 * - The front window carries a glare that follows the pointer and opens its case study on click.
 */

type Key = 'agri' | 'sitto'

const WINDOWS: Record<Key, { src: string; w: number; h: number; name: string; url: string; to: string; alt: string; dot: string }> = {
  agri: {
    src: '/images/agri/v2-dashboard-800.webp', w: 800, h: 364, name: 'Agri-Yield Pro', url: 'agri-yield-pro / dashboard', to: '/work/agri-yield-pro', dot: 'text-leaf',
    alt: 'Agri-Yield Pro dashboard with crop progress, estimated yield and the daily task list',
  },
  sitto: {
    src: '/images/sitto/home-800.webp', w: 800, h: 369, name: 'SITTO', url: 'sitto / home', to: '/work/sitto', dot: 'text-accent',
    alt: 'SITTO campus space-booking home screen screenshot',
  },
}

const CYCLE = 5 // seconds between swaps

// Back slot: top-left, small and pushed away. Front slot: bottom-right, full size and close.
const SLOT = {
  back: { left: '0%', top: '3%', scale: 0.94, rotate: -3, z: 0, zIndex: 1 },
  front: { left: '22%', top: '41%', scale: 1, rotate: 1.5, z: 60, zIndex: 3 },
}

function Window({ k, front, onPick }: { k: Key; front: boolean; onPick: (k: Key) => void }) {
  const w = WINDOWS[k]
  const navigate = useNavigate()
  const gx = useMotionValue(50)
  const gy = useMotionValue(50)
  const glare = useMotionTemplate`radial-gradient(420px circle at ${gx}% ${gy}%, rgba(255,255,255,0.55), transparent 45%)`

  const move = (e: ReactPointerEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    gx.set(((e.clientX - r.left) / r.width) * 100)
    gy.set(((e.clientY - r.top) / r.height) * 100)
  }
  const click = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (front) navigate(w.to)
    else onPick(k)
  }

  return (
    <a
      href={w.to}
      onClick={click}
      onPointerMove={move}
      className="group/win relative block overflow-hidden rounded-xl border border-line bg-ink-2 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.55)] focus-visible:outline-2"
      aria-label={front ? `${w.name} case study` : `Bring ${w.name} to the front`}
    >
      <div className="flex items-center gap-2 border-b border-line bg-ink-3/80 px-3 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-cream/20" />
          <span className="size-2 rounded-full bg-cream/20" />
          <span className="size-2 rounded-full bg-cream/20" />
        </span>
        <span className="mx-auto truncate rounded-md bg-ink/70 px-3 py-0.5 font-mono text-[10px] text-muted">{w.url}</span>
      </div>
      <img
        src={w.src}
        width={w.w}
        height={w.h}
        alt={w.alt}
        className="block h-auto w-full transition-[filter,transform] duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover/win:scale-[1.03]"
        style={{ filter: front ? 'none' : 'grayscale(0.6) brightness(0.96)' }}
      />
      {/* glare that follows the pointer (front window only) */}
      {front && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-500 group-hover/win:opacity-100"
          style={{ background: glare }}
        />
      )}
      {/* hover hint */}
      <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-2 whitespace-nowrap rounded-full bg-cream px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink opacity-0 shadow-lg transition-all duration-300 group-hover/win:translate-y-0 group-hover/win:opacity-100 group-focus-visible/win:opacity-100">
        {front ? 'Open case study →' : 'Bring to front'}
      </span>
    </a>
  )
}

function Chip({ children, className, z, delay, reduced }: { children: ReactNode; className: string; z: number; delay: number; reduced: boolean }) {
  return (
    <motion.div
      className={`pointer-events-none absolute z-[5] hidden items-center gap-2 whitespace-nowrap rounded-full border border-line bg-ink/90 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-cream-2 shadow-[0_14px_30px_-14px_rgba(0,0,0,0.5)] backdrop-blur sm:flex ${className}`}
      style={{ z }}
      initial={{ opacity: 0, y: 12 }}
      animate={reduced ? { opacity: 1, y: 0 } : { opacity: 1, y: [0, -6, 0] }}
      transition={reduced ? { duration: 0.4 } : { opacity: { duration: 0.6, delay }, y: { duration: 5, delay, repeat: Infinity, ease: 'easeInOut' } }}
      aria-hidden="true"
    >
      {children}
    </motion.div>
  )
}

export function HeroShowcase() {
  const { reduced } = useMotionPref()
  const [front, setFront] = useState<Key>('sitto')
  const [hover, setHover] = useState(false)
  const stage = useRef<HTMLDivElement>(null)

  // pointer → tilt
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 120, damping: 20, mass: 0.6 })
  const sy = useSpring(py, { stiffness: 120, damping: 20, mass: 0.6 })
  const rotateY = useTransform(sx, [-1, 1], [-14, 14])
  const rotateX = useTransform(sy, [-1, 1], [10, -10])

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType === 'touch' || !stage.current) return
    const r = stage.current.getBoundingClientRect()
    px.set(((e.clientX - r.left) / r.width) * 2 - 1)
    py.set(((e.clientY - r.top) / r.height) * 2 - 1)
  }
  const onLeave = () => {
    setHover(false)
    px.set(0)
    py.set(0)
  }

  // auto-swap while idle
  const paused = hover || reduced
  useEffect(() => {
    if (paused) return
    const t = window.setTimeout(() => setFront((f) => (f === 'agri' ? 'sitto' : 'agri')), CYCLE * 1000)
    return () => window.clearTimeout(t)
  }, [front, paused])

  return (
    <div className="relative mx-auto w-full max-w-[36rem] [perspective:1400px]">
      <motion.div
        ref={stage}
        className="relative aspect-[5/4] w-full [transform-style:preserve-3d]"
        style={{ rotateX, rotateY }}
        onPointerEnter={() => setHover(true)}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
      >
        <div className="glow-accent pointer-events-none absolute inset-[12%] rounded-full blur-3xl" style={{ transform: 'translateZ(-80px)' }} aria-hidden="true" />

        {(Object.keys(WINDOWS) as Key[]).map((k, i) => {
          const s = k === front ? SLOT.front : SLOT.back
          return (
            <motion.div
              key={k}
              className="absolute w-[78%] origin-center"
              style={{ zIndex: s.zIndex }}
              initial={reduced ? false : { opacity: 0, z: -200, y: 40 }}
              animate={{ opacity: 1, left: s.left, top: s.top, scale: s.scale, rotate: s.rotate, z: s.z, y: 0 }}
              transition={{ ...spring, opacity: { duration: 0.8, delay: 0.15 * i, ease: SMOOTH }, y: { duration: 0.9, delay: 0.15 * i, ease: SMOOTH } }}
            >
              <Window k={k} front={k === front} onPick={setFront} />
            </motion.div>
          )
        })}

        {/* Phone: SITTO QR pass, closest to the viewer */}
        <motion.div
          className="pointer-events-none absolute bottom-[-2%] left-[5%] z-[4] w-[22%] overflow-hidden rounded-[1.1rem] border-4 border-ink-3 bg-ink-2 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.6)]"
          initial={reduced ? false : { opacity: 0, y: 60, rotate: -12 }}
          animate={{ opacity: 1, y: 0, rotate: front === 'sitto' ? -4 : -8, z: 110 }}
          transition={{ ...spring, opacity: { duration: 0.8, delay: 0.4 } }}
          aria-hidden="true"
        >
          <img src="/images/sitto/qr-pass-800.webp" width={585} height={783} alt="" className="block h-auto w-full" />
        </motion.div>

        {/* Floating feature chips (what each app really does) */}
        <Chip className="right-[-2%] top-[6%]" z={140} delay={0.6} reduced={reduced}>
          <span className="relative flex size-1.5"><span className="absolute inset-0 animate-ping rounded-full bg-cream/60" /><span className="relative size-1.5 rounded-full bg-cream" /></span>
          Live mandi prices
        </Chip>
        <Chip className="left-[-4%] top-[44%]" z={160} delay={0.8} reduced={reduced}>
          அ · తె · ಕ · EN — Krishi Mitra
        </Chip>
        <Chip className="bottom-[2%] right-[4%]" z={150} delay={1} reduced={reduced}>
          ▣ QR check-in pass
        </Chip>
      </motion.div>

      {/* Project switcher with a timer bar for the next swap */}
      <div className="relative z-10 mt-6 flex justify-center gap-2" role="group" aria-label="Show project">
        {(Object.keys(WINDOWS) as Key[]).map((k) => {
          const on = k === front
          return (
            <button
              key={k}
              type="button"
              onClick={() => setFront(k)}
              aria-pressed={on}
              className={`relative overflow-hidden rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${on ? 'border-cream text-cream' : 'border-line text-muted hover:text-cream'}`}
            >
              <span className={WINDOWS[k].dot}>●</span> {WINDOWS[k].name}
              <AnimatePresence>
                {on && !paused && (
                  <motion.span
                    key={front}
                    className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-cream"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1, transition: { duration: CYCLE, ease: 'linear' } }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    aria-hidden="true"
                  />
                )}
              </AnimatePresence>
            </button>
          )
        })}
      </div>
    </div>
  )
}
