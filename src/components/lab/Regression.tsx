import { useEffect, useRef, useState } from 'react'
import { Btn, Count, DemoShell, INK, Metric, SOFT, Slider, Stage, drawGrid, gauss, prepare, seeded, unit, useBoxSize, useStamp } from './shared'

type P = { x: number; y: number } // both in 0–1, y measured upward

function noisyLine(seed: number): P[] {
  const rnd = seeded(seed)
  const slope = 0.3 + rnd() * 0.8 * (rnd() > 0.3 ? 1 : -1)
  const icpt = slope > 0 ? 0.15 + rnd() * 0.2 : 0.65 + rnd() * 0.2
  return Array.from({ length: 26 }, () => {
    const x = 0.06 + rnd() * 0.88
    return { x, y: Math.min(0.97, Math.max(0.03, icpt + slope * x + gauss(rnd) * 0.06)) }
  })
}

const mse = (pts: P[], w: number, b: number) => (pts.length ? pts.reduce((a, p) => a + (w * p.x + b - p.y) ** 2, 0) / pts.length : 0)

/** Exact least-squares fit, for comparison with gradient descent. */
function exactFit(pts: P[]) {
  const n = pts.length
  if (n < 2) return null
  const mx = pts.reduce((a, p) => a + p.x, 0) / n
  const my = pts.reduce((a, p) => a + p.y, 0) / n
  const sxx = pts.reduce((a, p) => a + (p.x - mx) ** 2, 0)
  if (sxx < 1e-9) return null
  const w = pts.reduce((a, p) => a + (p.x - mx) * (p.y - my), 0) / sxx
  return { w, b: my - w * mx }
}

const WR = [-2.5, 2.5] as const // slope range shown on the landscape
const BR = [-1.5, 2] as const // intercept range

/**
 * Loss landscape: error (MSE) for every slope/intercept pair, as grey bands with contour lines.
 * The dot is the current model; its trail is the path gradient descent took downhill.
 */
function LossLandscape({ pts, version, path, model }: { pts: P[]; version: number; path: { w: number; b: number }[]; model: { w: number; b: number } }) {
  const box = useRef<HTMLDivElement>(null)
  const cv = useRef<HTMLCanvasElement>(null)
  const map = useRef<HTMLCanvasElement | null>(null)
  const { w: W, h: H } = useBoxSize(box)

  // Recompute the surface only when the data changes.
  useEffect(() => {
    const N = 110
    const o = document.createElement('canvas')
    o.width = N
    o.height = N
    const g = o.getContext('2d')!
    const img = g.createImageData(N, N)
    const vals: number[] = []
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const w = WR[0] + ((i + 0.5) / N) * (WR[1] - WR[0])
        const b = BR[1] - ((j + 0.5) / N) * (BR[1] - BR[0])
        vals.push(Math.log(mse(pts, w, b) + 1e-4))
      }
    }
    const lo = Math.min(...vals)
    const hi = Math.max(...vals)
    const band = (v: number) => Math.floor(((v - lo) / (hi - lo || 1)) * 14)
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const k = j * N + i
        const t = (vals[k] - lo) / (hi - lo || 1)
        const edge = (i + 1 < N && band(vals[k]) !== band(vals[k + 1])) || (j + 1 < N && band(vals[k]) !== band(vals[k + N]))
        const grey = edge ? 120 : Math.round(255 - (1 - t) * 70)
        img.data.set([grey, grey, grey, 255], k * 4)
      }
    }
    g.putImageData(img, 0, 0)
    map.current = o
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version])

  useEffect(() => {
    const c = cv.current
    if (!c || !W || !map.current) return
    const ctx = prepare(c, W, H)
    ctx.imageSmoothingEnabled = true
    ctx.drawImage(map.current, 0, 0, W, H)
    const X = (w: number) => ((w - WR[0]) / (WR[1] - WR[0])) * W
    const Y = (b: number) => ((BR[1] - b) / (BR[1] - BR[0])) * H
    const ex = exactFit(pts)
    if (ex) {
      ctx.strokeStyle = INK
      ctx.lineWidth = 1.5
      const x = X(ex.w)
      const y = Y(ex.b)
      ctx.beginPath()
      ctx.moveTo(x - 6, y - 6)
      ctx.lineTo(x + 6, y + 6)
      ctx.moveTo(x + 6, y - 6)
      ctx.lineTo(x - 6, y + 6)
      ctx.stroke()
    }
    if (path.length > 1) {
      ctx.strokeStyle = INK
      ctx.lineWidth = 2
      ctx.beginPath()
      path.forEach((p, i) => (i ? ctx.lineTo(X(p.w), Y(p.b)) : ctx.moveTo(X(p.w), Y(p.b))))
      ctx.stroke()
    }
    ctx.fillStyle = INK
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(X(model.w), Y(model.b), 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  })

  return (
    <figure className="rounded-2xl border border-line bg-ink-2 p-3">
      <figcaption className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        <span>Loss landscape</span>
        <span>● model · ✕ minimum</span>
      </figcaption>
      <div ref={box} className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
        <canvas ref={cv} className="absolute inset-0 size-full" role="img" aria-label="Map of the error for every slope and intercept, with the path gradient descent has taken" />
        <span className="absolute bottom-1 right-2 font-mono text-[9px] text-muted">slope →</span>
        <span className="absolute left-2 top-1 font-mono text-[9px] text-muted">↑ intercept</span>
      </div>
    </figure>
  )
}

export function RegressionDemo() {
  const box = useRef<HTMLDivElement>(null)
  const cv = useRef<HTMLCanvasElement>(null)
  const { w: W, h: H } = useBoxSize(box)
  const [seed, setSeed] = useState(3)
  const pts = useRef<P[]>(noisyLine(3))
  const model = useRef({ w: 0, b: 0.5 })
  const [lr, setLr] = useState(0.5)
  const [running, setRunning] = useState(false)
  const [showExact, setShowExact] = useState(false)
  const [epoch, setEpoch] = useState(0)
  const [history, setHistory] = useState<number[]>([mse(pts.current, 0, 0.5)])
  const [count, setCount] = useState(pts.current.length)
  const [version, setVersion] = useState(0)
  const path = useRef<{ w: number; b: number }[]>([{ w: 0, b: 0.5 }])
  const [diverged, setDiverged] = useState(false)
  const [fittedFlag, setFittedFlag] = useState(false)
  const fittedStamp = useStamp(fittedFlag, 'Fitted')
  const divergedStamp = useStamp(diverged, 'Diverged!', 2200)
  const lrRef = useRef(lr)
  useEffect(() => {
    lrRef.current = lr
  }, [lr])

  const restart = (data?: P[]) => {
    if (data) pts.current = data
    model.current = { w: 0, b: 0.5 }
    path.current = [{ w: 0, b: 0.5 }]
    setVersion((v) => v + 1)
    setDiverged(false)
    setFittedFlag(false)
    setEpoch(0)
    setHistory([mse(pts.current, 0, 0.5)])
    setCount(pts.current.length)
  }

  // Training: a few batch gradient-descent steps per frame while running.
  useEffect(() => {
    if (!running) return
    let raf = 0
    const tick = () => {
      const P = pts.current
      if (P.length) {
        for (let s = 0; s < 3; s++) {
          let gw = 0
          let gb = 0
          for (const p of P) {
            const err = model.current.w * p.x + model.current.b - p.y
            gw += err * p.x
            gb += err
          }
          model.current.w -= (lrRef.current * 2 * gw) / P.length
          model.current.b -= (lrRef.current * 2 * gb) / P.length
        }
        const loss = mse(P, model.current.w, model.current.b)
        const last = path.current[path.current.length - 1]
        if (Math.hypot(last.w - model.current.w, last.b - model.current.b) > 0.004) path.current.push({ ...model.current })
        if (path.current.length > 600) path.current.shift()
        const ex = exactFit(P)
        if (ex && Math.abs(loss - mse(P, ex.w, ex.b)) < 2e-6) setFittedFlag(true)
        setEpoch((e) => e + 3)
        setHistory((h) => (h.length > 240 ? [...h.slice(1), loss] : [...h, loss]))
        if (!Number.isFinite(loss) || loss > 1e6) {
          setRunning(false)
          setDiverged(true)
          return
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running])

  // Draw every render (the model changes each frame while training).
  useEffect(() => {
    const c = cv.current
    if (!c || !W) return
    const ctx = prepare(c, W, H)
    drawGrid(ctx, W, H)
    const X = (x: number) => x * W
    const Y = (y: number) => (1 - y) * H
    const { w, b } = model.current
    // residuals
    ctx.strokeStyle = 'rgba(10,10,10,0.28)'
    ctx.setLineDash([3, 4])
    ctx.beginPath()
    pts.current.forEach((p) => {
      ctx.moveTo(X(p.x), Y(p.y))
      ctx.lineTo(X(p.x), Y(w * p.x + b))
    })
    ctx.stroke()
    ctx.setLineDash([])
    // exact fit
    const ex = exactFit(pts.current)
    if (showExact && ex) {
      ctx.strokeStyle = SOFT
      ctx.lineWidth = 2
      ctx.setLineDash([8, 6])
      ctx.beginPath()
      ctx.moveTo(X(0), Y(ex.b))
      ctx.lineTo(X(1), Y(ex.w + ex.b))
      ctx.stroke()
      ctx.setLineDash([])
    }
    // model line
    ctx.strokeStyle = INK
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(X(0), Y(b))
    ctx.lineTo(X(1), Y(w + b))
    ctx.stroke()
    // points
    pts.current.forEach((p) => {
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = INK
      ctx.lineWidth = 1.8
      ctx.beginPath()
      ctx.arc(X(p.x), Y(p.y), 4.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    })
  })

  const add = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const p = unit(e)
    pts.current = [...pts.current, { x: p.x, y: 1 - p.y }]
    setCount(pts.current.length)
    setVersion((v) => v + 1)
    setFittedFlag(false)
    setHistory((h) => [...h, mse(pts.current, model.current.w, model.current.b)])
  }

  const loss = history[history.length - 1] ?? 0
  const max = Math.max(...history, 1e-6)
  const spark = history.map((v, i) => `${(i / Math.max(history.length - 1, 1)) * 100},${30 - (v / max) * 28}`).join(' ')
  const ex = exactFit(pts.current)

  return (
    <DemoShell
      id="regression"
      index="02"
      kicker="Supervised learning · optimisation"
      title="Linear regression, trained live"
      summary="Fit a straight line with gradient descent — the same optimiser behind most neural networks. Add points, press Train, and watch the error shrink. Push the learning rate too high and it diverges."
      canvas={
        <Stage boxRef={box} stamp={divergedStamp ?? fittedStamp} caption="Click to add points · dashed ticks are errors (residuals) · solid line is the model">
          <canvas ref={cv} onPointerDown={add} className="absolute inset-0 size-full cursor-crosshair touch-none" role="img" aria-label={`Regression plot with ${count} points; current line y = ${model.current.w.toFixed(2)}x + ${model.current.b.toFixed(2)}`} />
        </Stage>
      }
      controls={
        <>
          <Btn primary onClick={() => setRunning((r) => !r)}>{running ? 'Pause' : 'Train'}</Btn>
          <Btn onClick={() => { setRunning(false); restart() }}>Reset weights</Btn>
          <Btn onClick={() => { const s = seed + 1; setSeed(s); setRunning(false); restart(noisyLine(s)) }}>New data</Btn>
          <Btn onClick={() => { setRunning(false); restart([]) }}>Clear</Btn>
          <Btn pressed={showExact} onClick={() => setShowExact((v) => !v)}>Exact fit</Btn>
          <div className="w-full pt-2">
            <Slider label="Learning rate" min={0.05} max={2.2} step={0.05} value={lr} onChange={setLr} format={(v) => v.toFixed(2)} />
          </div>
        </>
      }
      metrics={
        <>
          <Metric label="Epoch" value={<Count value={epoch} />} />
          <Metric label="MSE" value={<Count value={loss} decimals={4} />} />
          <Metric label="Model" value={<span className="text-sm">y = {model.current.w.toFixed(2)}x {model.current.b < 0 ? '−' : '+'} {Math.abs(model.current.b).toFixed(2)}</span>} />
          <div className="col-span-2 rounded-xl border border-line bg-ink-2 px-3 py-2 sm:col-span-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Loss over time</p>
            <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="mt-1 h-10 w-full" aria-hidden="true">
              <polyline points={spark} fill="none" stroke="#0a0a0a" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
            </svg>
            {ex && <p className="font-mono text-[10px] text-muted">Exact answer: y = {ex.w.toFixed(2)}x {ex.b < 0 ? '−' : '+'} {Math.abs(ex.b).toFixed(2)}</p>}
          </div>
        </>
      }
      extra={<LossLandscape pts={pts.current} version={version} path={path.current} model={model.current} />}
      how={
        <p>
          The model is <code className="text-cream">y = w·x + b</code>. Each step measures the mean squared error, computes how it changes with{' '}
          <code className="text-cream">w</code> and <code className="text-cream">b</code> (the gradient), and nudges both downhill by the learning rate.
          The <strong className="text-cream">loss landscape</strong> maps the error of every possible line — watch the dot roll downhill to the ✕. Toggle <strong className="text-cream">Exact fit</strong> to compare with the closed-form answer.
        </p>
      }
    />
  )
}
