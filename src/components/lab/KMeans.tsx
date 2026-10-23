import { useCallback, useEffect, useRef, useState } from 'react'
import { Btn, DemoShell, INK, Metric, SOFT, Slider, Stage, drawGrid, gauss, prepare, seeded, unit, useBoxSize } from './shared'

type P = { x: number; y: number }

/** Points scattered around `k` random centres. */
function blobs(k: number, seed: number): P[] {
  const rnd = seeded(seed)
  const pts: P[] = []
  for (let c = 0; c < k; c++) {
    const cx = 0.18 + rnd() * 0.64
    const cy = 0.18 + rnd() * 0.64
    for (let i = 0; i < 28; i++) pts.push({ x: clamp(cx + gauss(rnd) * 0.06), y: clamp(cy + gauss(rnd) * 0.06) })
  }
  return pts
}
const clamp = (v: number) => Math.min(0.97, Math.max(0.03, v))
const d2 = (a: P, b: P) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2

/** k-means++ start: spread the first centroids out so results are stable. */
function seedCentroids(pts: P[], k: number, rnd: () => number): P[] {
  if (!pts.length) return Array.from({ length: k }, () => ({ x: rnd(), y: rnd() }))
  const c: P[] = [{ ...pts[Math.floor(rnd() * pts.length)] }]
  while (c.length < k) {
    const w = pts.map((p) => Math.min(...c.map((q) => d2(p, q))))
    let r = rnd() * w.reduce((a, b) => a + b, 0)
    let i = 0
    while (i < w.length - 1 && (r -= w[i]) > 0) i++
    c.push({ ...pts[i] })
  }
  return c
}

/** Draws a cluster marker. Shapes, not colours, tell clusters apart in black and white. */
function marker(ctx: CanvasRenderingContext2D, shape: number, x: number, y: number, r: number) {
  ctx.beginPath()
  switch (shape % 6) {
    case 0:
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
      break
    case 1:
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.stroke()
      break
    case 2:
      ctx.rect(x - r, y - r, r * 2, r * 2)
      ctx.fill()
      break
    case 3:
      ctx.moveTo(x, y - r * 1.2)
      ctx.lineTo(x + r * 1.1, y + r * 0.9)
      ctx.lineTo(x - r * 1.1, y + r * 0.9)
      ctx.closePath()
      ctx.stroke()
      break
    case 4:
      ctx.moveTo(x, y - r * 1.3)
      ctx.lineTo(x + r * 1.3, y)
      ctx.lineTo(x, y + r * 1.3)
      ctx.lineTo(x - r * 1.3, y)
      ctx.closePath()
      ctx.fill()
      break
    default:
      ctx.moveTo(x - r, y - r)
      ctx.lineTo(x + r, y + r)
      ctx.moveTo(x + r, y - r)
      ctx.lineTo(x - r, y + r)
      ctx.stroke()
  }
}

export function KMeansDemo() {
  const box = useRef<HTMLDivElement>(null)
  const cv = useRef<HTMLCanvasElement>(null)
  const { w, h } = useBoxSize(box)
  const [k, setK] = useState(3)
  const [seed, setSeed] = useState(7)
  const pts = useRef<P[]>(blobs(3, 7))
  const cents = useRef<P[]>([])
  const shown = useRef<P[]>([]) // centroid positions on screen, eased toward `cents`
  const assign = useRef<number[]>([])
  const [iter, setIter] = useState(0)
  const [converged, setConverged] = useState(false)
  const [running, setRunning] = useState(false)
  const [inertia, setInertia] = useState<number | null>(null)
  const [count, setCount] = useState(pts.current.length)

  const reset = useCallback((kk: number, s: number, data?: P[]) => {
    if (data) pts.current = data
    cents.current = seedCentroids(pts.current, kk, seeded(s * 31 + kk))
    shown.current = cents.current.map((c) => ({ ...c }))
    assign.current = []
    setIter(0)
    setConverged(false)
    setInertia(null)
    setCount(pts.current.length)
  }, [])

  // First centroids for the starting data.
  useEffect(() => reset(3, 7), [reset])

  /** One Lloyd iteration: assign each point to its nearest centroid, then move centroids to the means. */
  const step = useCallback(() => {
    const P = pts.current
    const C = cents.current
    if (!P.length) return true
    let changed = false
    const next = P.map((p, i) => {
      let best = 0
      for (let j = 1; j < C.length; j++) if (d2(p, C[j]) < d2(p, C[best])) best = j
      if (assign.current[i] !== best) changed = true
      return best
    })
    assign.current = next
    cents.current = C.map((c, j) => {
      const mine = P.filter((_, i) => next[i] === j)
      return mine.length ? { x: mine.reduce((a, p) => a + p.x, 0) / mine.length, y: mine.reduce((a, p) => a + p.y, 0) / mine.length } : c
    })
    setInertia(P.reduce((a, p, i) => a + d2(p, cents.current[next[i]]), 0))
    setIter((n) => n + 1)
    if (!changed) setConverged(true)
    return !changed
  }, [])

  // Auto-run: one iteration every 650 ms until it converges.
  useEffect(() => {
    if (!running) return
    const t = window.setInterval(() => {
      if (step()) setRunning(false)
    }, 650)
    return () => window.clearInterval(t)
  }, [running, step])

  // Draw loop: eases centroids to their new spots so each update is visible.
  useEffect(() => {
    const c = cv.current
    if (!c || !w) return
    let raf = 0
    const frame = () => {
      const ctx = prepare(c, w, h)
      drawGrid(ctx, w, h)
      const S = shown.current
      cents.current.forEach((t, j) => {
        if (!S[j]) S[j] = { ...t }
        S[j].x += (t.x - S[j].x) * 0.18
        S[j].y += (t.y - S[j].y) * 0.18
      })
      const A = assign.current
      // spokes from points to their centroid
      if (A.length) {
        ctx.strokeStyle = 'rgba(10,10,10,0.08)'
        ctx.beginPath()
        pts.current.forEach((p, i) => {
          const s = S[A[i]]
          if (!s) return
          ctx.moveTo(p.x * w, p.y * h)
          ctx.lineTo(s.x * w, s.y * h)
        })
        ctx.stroke()
      }
      ctx.fillStyle = INK
      ctx.strokeStyle = INK
      ctx.lineWidth = 1.6
      pts.current.forEach((p, i) => {
        if (A[i] === undefined) {
          ctx.fillStyle = SOFT
          ctx.beginPath()
          ctx.arc(p.x * w, p.y * h, 3.2, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = INK
        } else marker(ctx, A[i], p.x * w, p.y * h, 3.6)
      })
      // centroids: crosshair + label
      S.forEach((s, j) => {
        const x = s.x * w
        const y = s.y * h
        ctx.fillStyle = '#ffffff'
        ctx.strokeStyle = INK
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(x, y, 11, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x - 17, y)
        ctx.lineTo(x + 17, y)
        ctx.moveTo(x, y - 17)
        ctx.lineTo(x, y + 17)
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.fillStyle = INK
        marker(ctx, j, x, y, 4)
      })
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [w, h])

  const addPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const p = unit(e)
    pts.current = [...pts.current, { x: clamp(p.x), y: clamp(p.y) }]
    assign.current = []
    setConverged(false)
    setCount(pts.current.length)
  }

  return (
    <DemoShell
      id="kmeans"
      index="01"
      kicker="Unsupervised learning"
      title="K-means clustering"
      summary="Group unlabelled points into k clusters. Click the canvas to add points, then step through the algorithm and watch each centroid move to the middle of its group."
      canvas={
        <Stage boxRef={box} caption="Click to add points · each shape is one cluster · crosshairs are centroids">
          <canvas ref={cv} onPointerDown={addPoint} className="absolute inset-0 size-full cursor-crosshair touch-none" role="img" aria-label={`K-means plot with ${count} points and ${k} centroids`} />
        </Stage>
      }
      controls={
        <>
          <Btn primary onClick={() => (converged ? reset(k, seed) : setRunning((r) => !r))}>{running ? 'Pause' : converged ? 'Restart' : 'Run'}</Btn>
          <Btn onClick={() => step()} disabled={running || converged}>Step</Btn>
          <Btn
            onClick={() => {
              const s = seed + 1
              setSeed(s)
              setRunning(false)
              reset(k, s, blobs(k, s))
            }}
          >
            New data
          </Btn>
          <Btn onClick={() => { setRunning(false); reset(k, seed + 100 + iter) }}>New centroids</Btn>
          <Btn onClick={() => { setRunning(false); reset(k, seed, []) }}>Clear</Btn>
          <div className="w-full pt-2">
            <Slider label="Clusters (k)" min={2} max={6} step={1} value={k} onChange={(v) => { setK(v); setRunning(false); reset(v, seed) }} />
          </div>
        </>
      }
      metrics={
        <>
          <Metric label="Points" value={count} />
          <Metric label="Iteration" value={iter} />
          <Metric label="Status" value={converged ? 'Converged' : running ? 'Running' : iter ? 'Paused' : 'Ready'} />
          <Metric label="Inertia" value={inertia === null ? '—' : inertia.toFixed(3)} />
        </>
      }
      how={
        <ol className="list-decimal space-y-1.5 pl-4">
          <li>Place k centroids (k-means++ spreads them out).</li>
          <li><strong className="text-cream">Assign</strong> every point to its nearest centroid.</li>
          <li><strong className="text-cream">Update</strong> each centroid to the average of its points.</li>
          <li>Repeat until no point changes cluster. <em>Inertia</em> — the summed squared distance to centroids — falls each step.</li>
        </ol>
      }
    />
  )
}
