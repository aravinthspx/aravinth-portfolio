import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { AnimatePresence, motion } from 'motion/react'

/** Drawing colours for the black-and-white canvases. */
export const INK = '#0a0a0a'
export const GRID = '#ececec'
export const SOFT = '#9a9a9a'

/** Small seeded random generator, so example datasets look the same on every visit. */
export function seeded(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Standard-normal sample (Box–Muller). */
export function gauss(rnd: () => number) {
  const u = Math.max(rnd(), 1e-9)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd())
}

/** Tracks a canvas wrapper's CSS size so drawing can match it. */
export function useBoxSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ w: 0, h: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return size
}

/** Sizes a canvas for the device pixel ratio and returns a context in CSS pixels. */
export function prepare(cv: HTMLCanvasElement, w: number, h: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
    cv.width = Math.round(w * dpr)
    cv.height = Math.round(h * dpr)
  }
  const ctx = cv.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)
  return ctx
}

/** Light square grid behind each plot. */
export function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number, step = 32) {
  ctx.strokeStyle = GRID
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = step; x < w; x += step) {
    ctx.moveTo(Math.round(x) + 0.5, 0)
    ctx.lineTo(Math.round(x) + 0.5, h)
  }
  for (let y = step; y < h; y += step) {
    ctx.moveTo(0, Math.round(y) + 0.5)
    ctx.lineTo(w, Math.round(y) + 0.5)
  }
  ctx.stroke()
}

/** Pointer position as 0–1 fractions of the canvas box. */
export function unit(e: React.PointerEvent<HTMLCanvasElement>) {
  const r = e.currentTarget.getBoundingClientRect()
  return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }
}

export function Btn({ onClick, children, primary = false, pressed, disabled = false }: { onClick: () => void; children: ReactNode; primary?: boolean; pressed?: boolean; disabled?: boolean }) {
  const on = primary || pressed
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer ${
        on ? 'border-accent bg-accent text-ink hover:bg-accent-2' : 'border-line bg-ink text-cream hover:border-cream-2'
      }`}
    >
      {children}
    </button>
  )
}

export function Slider({ label, min, max, step, value, onChange, format = String }: { label: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void; format?: (v: number) => string }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        {label}
        <span className="text-cream">{format(value)}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full accent-[#0a0a0a] cursor-pointer" />
    </label>
  )
}

export function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-ink-2 px-3 py-2">
      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{label}</dt>
      <dd className="mt-0.5 font-display text-lg font-bold tabular-nums text-cream">{value}</dd>
    </div>
  )
}

/** A number that rolls smoothly to its new value instead of jumping. */
export function Count({ value, decimals = 0, suffix = '' }: { value: number; decimals?: number; suffix?: string }) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    if (!Number.isFinite(value)) return
    const start = performance.now()
    const a = from.current
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 380)
      const v = a + (value - a) * (1 - (1 - t) ** 3)
      from.current = v
      setShown(v)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])
  if (!Number.isFinite(value)) return <>∞</>
  return (
    <>
      {shown.toFixed(decimals)}
      {suffix}
    </>
  )
}

const rise = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.2, 0.8, 0.2, 1] as const } } }

/** Layout shared by every demo: numbered header, canvas on the left, controls and explanation on the right. Children animate in, staggered. */
export function DemoShell({
  id,
  index,
  kicker,
  title,
  summary,
  canvas,
  controls,
  metrics,
  extra,
  how,
}: {
  id: string
  index: string
  kicker: string
  title: string
  summary: string
  canvas: ReactNode
  controls: ReactNode
  metrics: ReactNode
  extra?: ReactNode
  how: ReactNode
}) {
  return (
    <motion.section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-40 py-12 md:py-16"
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
    >
      <div className="grid gap-x-12 gap-y-4 md:grid-cols-[auto_1fr] md:items-end">
        <motion.p
          variants={{ hidden: { opacity: 0, x: -40, rotate: -6 }, show: { opacity: 1, x: 0, rotate: 0, transition: { type: 'spring', stiffness: 160, damping: 16 } } }}
          className="font-display text-6xl font-bold leading-none text-transparent [-webkit-text-stroke:1.5px_#0a0a0a] md:text-8xl"
          aria-hidden="true"
        >
          {index}
        </motion.p>
        <motion.div variants={rise}>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{kicker}</p>
          <h2 id={`${id}-title`} className="mt-2 font-display text-3xl font-bold tracking-tight text-cream md:text-4xl">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-cream-2">{summary}</p>
        </motion.div>
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_1fr]">
        <motion.div
          className="min-w-0"
          variants={{ hidden: { opacity: 0, scale: 0.94, clipPath: 'inset(8% 8% 8% 8% round 24px)' }, show: { opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0% round 24px)', transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] } } }}
        >
          {canvas}
        </motion.div>
        <div className="min-w-0 space-y-6">
          <motion.div variants={rise} className="flex flex-wrap gap-2">
            {controls}
          </motion.div>
          <motion.dl variants={rise} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {metrics}
          </motion.dl>
          {extra && <motion.div variants={rise}>{extra}</motion.div>}
          <motion.div variants={rise} className="rounded-2xl border border-line bg-ink-2 p-5 text-sm leading-relaxed text-cream-2">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">How it works</p>
            {how}
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

/**
 * Canvas wrapper: square plot with a live crosshair + coordinate readout that follows the pointer,
 * an optional celebratory stamp, and an instruction caption.
 */
export function Stage({ boxRef, children, caption, stamp }: { boxRef: RefObject<HTMLDivElement | null>; children: ReactNode; caption: string; stamp?: string | null }) {
  const [pt, setPt] = useState<{ x: number; y: number } | null>(null)
  return (
    <figure>
      <div
        ref={boxRef}
        onPointerMove={(e) => {
          if (e.pointerType !== 'mouse') return
          const r = e.currentTarget.getBoundingClientRect()
          setPt({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height })
        }}
        onPointerLeave={() => setPt(null)}
        className="relative aspect-square w-full overflow-hidden rounded-3xl border border-line bg-ink shadow-[0_24px_60px_-40px_rgba(0,0,0,0.35)]"
      >
        {children}
        {pt && (
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute inset-x-0 h-px bg-cream/25" style={{ top: `${pt.y * 100}%` }} />
            <div className="absolute inset-y-0 w-px bg-cream/25" style={{ left: `${pt.x * 100}%` }} />
            <div
              className="absolute whitespace-nowrap rounded-md bg-cream px-2 py-1 font-mono text-[10px] text-ink"
              style={{ left: `${pt.x * 100}%`, top: `${pt.y * 100}%`, transform: `translate(${pt.x > 0.75 ? 'calc(-100% - 10px)' : '10px'}, ${pt.y > 0.85 ? 'calc(-100% - 10px)' : '10px'})` }}
            >
              x {pt.x.toFixed(2)} · y {(1 - pt.y).toFixed(2)}
            </div>
          </div>
        )}
        <AnimatePresence>
          {stamp && (
            <motion.div
              key={stamp}
              className="pointer-events-none absolute inset-0 grid place-items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
            >
              <motion.span
                className="rounded-xl border-4 border-cream bg-ink/85 px-6 py-3 font-display text-3xl font-bold uppercase tracking-[0.12em] text-cream backdrop-blur-sm md:text-4xl"
                initial={{ scale: 2.4, rotate: -14, opacity: 0 }}
                animate={{ scale: 1, rotate: -8, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 380, damping: 15 }}
              >
                {stamp}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <figcaption className="mt-2 font-mono text-[11px] text-muted">{caption}</figcaption>
    </figure>
  )
}

/** Shows a stamp for a moment when `trigger` flips to true. */
export function useStamp(trigger: boolean, text: string, ms = 1600) {
  const [stamp, setStamp] = useState<string | null>(null)
  useEffect(() => {
    if (!trigger) return
    setStamp(text)
    const t = window.setTimeout(() => setStamp(null), ms)
    return () => window.clearTimeout(t)
  }, [trigger, text, ms])
  return stamp
}
