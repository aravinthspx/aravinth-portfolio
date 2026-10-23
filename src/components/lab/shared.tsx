import { useEffect, useState, type ReactNode, type RefObject } from 'react'

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

/** Layout shared by every demo: numbered header, canvas on the left, controls and explanation on the right. */
export function DemoShell({
  id,
  index,
  kicker,
  title,
  summary,
  canvas,
  controls,
  metrics,
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
  how: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 border-t border-line py-16 md:py-24">
      <div className="grid gap-x-12 gap-y-4 md:grid-cols-[auto_1fr] md:items-end">
        <p className="font-display text-6xl font-bold leading-none text-transparent [-webkit-text-stroke:1.5px_#0a0a0a] md:text-8xl" aria-hidden="true">
          {index}
        </p>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{kicker}</p>
          <h2 id={`${id}-title`} className="mt-2 font-display text-3xl font-bold tracking-tight text-cream md:text-4xl">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-cream-2">{summary}</p>
        </div>
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_1fr]">
        <div className="min-w-0">{canvas}</div>
        <div className="min-w-0 space-y-6">
          <div className="flex flex-wrap gap-2">{controls}</div>
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">{metrics}</dl>
          <div className="rounded-2xl border border-line bg-ink-2 p-5 text-sm leading-relaxed text-cream-2">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">How it works</p>
            {how}
          </div>
        </div>
      </div>
    </section>
  )
}

/** Canvas wrapper with a square aspect, border and an instruction caption. */
export function Stage({ boxRef, children, caption }: { boxRef: RefObject<HTMLDivElement | null>; children: ReactNode; caption: string }) {
  return (
    <figure>
      <div ref={boxRef} className="relative aspect-square w-full overflow-hidden rounded-3xl border border-line bg-ink shadow-[0_24px_60px_-40px_rgba(0,0,0,0.35)]">
        {children}
      </div>
      <figcaption className="mt-2 font-mono text-[11px] text-muted">{caption}</figcaption>
    </figure>
  )
}
