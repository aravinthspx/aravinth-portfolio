import { useEffect, useRef, useState } from 'react'
import { Btn, DemoShell, INK, Metric, SOFT, Slider, Stage, drawGrid, gauss, prepare, seeded, unit, useBoxSize } from './shared'

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
  const lrRef = useRef(lr)
  useEffect(() => {
    lrRef.current = lr
  }, [lr])

  const restart = (data?: P[]) => {
    if (data) pts.current = data
    model.current = { w: 0, b: 0.5 }
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
        setEpoch((e) => e + 3)
        setHistory((h) => (h.length > 240 ? [...h.slice(1), loss] : [...h, loss]))
        if (!Number.isFinite(loss) || loss > 1e6) {
          setRunning(false)
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
        <Stage boxRef={box} caption="Click to add points · dashed ticks are errors (residuals) · solid line is the model">
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
          <Metric label="Epoch" value={epoch} />
          <Metric label="MSE" value={Number.isFinite(loss) ? loss.toFixed(4) : '∞'} />
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
      how={
        <p>
          The model is <code className="text-cream">y = w·x + b</code>. Each step measures the mean squared error, computes how it changes with{' '}
          <code className="text-cream">w</code> and <code className="text-cream">b</code> (the gradient), and nudges both downhill by the learning rate.
          Toggle <strong className="text-cream">Exact fit</strong> to compare with the closed-form least-squares answer it converges to.
        </p>
      }
    />
  )
}
