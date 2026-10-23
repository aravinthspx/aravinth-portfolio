import { useEffect, useRef, useState } from 'react'
import { Btn, Count, DemoShell, INK, Metric, Slider, Stage, gauss, prepare, seeded, unit, useBoxSize, useStamp } from './shared'

type Pt = { x: number; y: number; c: 0 | 1 } // x, y in -1..1
type Dataset = 'circle' | 'xor' | 'spiral' | 'blobs'

function makeData(kind: Dataset, seed: number): Pt[] {
  const rnd = seeded(seed)
  const out: Pt[] = []
  const N = 160
  for (let i = 0; i < N; i++) {
    let x = rnd() * 2 - 1
    let y = rnd() * 2 - 1
    let c: 0 | 1 = 0
    if (kind === 'circle') c = Math.hypot(x, y) < 0.5 ? 1 : 0
    else if (kind === 'xor') {
      if (Math.abs(x) < 0.08 || Math.abs(y) < 0.08) { i--; continue } // keep a small gap at the axes
      c = x * y > 0 ? 1 : 0
    } else if (kind === 'blobs') {
      c = i % 2 ? 1 : 0
      x = (c ? 0.4 : -0.4) + gauss(rnd) * 0.22
      y = (c ? 0.35 : -0.35) + gauss(rnd) * 0.22
    } else {
      c = i % 2 ? 1 : 0
      const t = (Math.floor(i / 2) / (N / 2)) * 2.6 * Math.PI
      const r = 0.08 + (t / (2.6 * Math.PI)) * 0.82
      const a = t + (c ? Math.PI : 0)
      x = r * Math.cos(a) + gauss(rnd) * 0.03
      y = r * Math.sin(a) + gauss(rnd) * 0.03
    }
    out.push({ x: Math.max(-0.98, Math.min(0.98, x)), y: Math.max(-0.98, Math.min(0.98, y)), c })
  }
  return out
}

/**
 * Tiny multilayer perceptron: 2 inputs → hidden (tanh) → hidden (tanh) → 1 output (sigmoid),
 * trained with plain stochastic gradient descent on binary cross-entropy. No libraries.
 */
class MLP {
  W: number[][][] = []
  B: number[][] = []
  private a: number[][] = []
  sizes: number[]
  constructor(sizes: number[], seed: number) {
    this.sizes = sizes
    const rnd = seeded(seed)
    for (let l = 1; l < sizes.length; l++) {
      const lim = Math.sqrt(6 / (sizes[l - 1] + sizes[l])) // Xavier init
      this.W.push(Array.from({ length: sizes[l] }, () => Array.from({ length: sizes[l - 1] }, () => (rnd() * 2 - 1) * lim)))
      this.B.push(Array(sizes[l]).fill(0))
    }
  }
  forward(x: number, y: number) {
    this.a = [[x, y]]
    for (let l = 0; l < this.W.length; l++) {
      const prev = this.a[l]
      const last = l === this.W.length - 1
      this.a.push(
        this.W[l].map((row, j) => {
          let z = this.B[l][j]
          for (let i = 0; i < row.length; i++) z += row[i] * prev[i]
          return last ? 1 / (1 + Math.exp(-z)) : Math.tanh(z)
        }),
      )
    }
    return this.a[this.a.length - 1][0]
  }
  /** Every layer's activations for one input (for the network diagram). */
  activations(x: number, y: number) {
    this.forward(x, y)
    return this.a.map((l) => [...l])
  }
  /** One SGD update on a single example; returns its loss. */
  learn(p: Pt, lr: number) {
    const out = this.forward(p.x, p.y)
    let delta = [out - p.c] // dLoss/dz for sigmoid + cross-entropy
    for (let l = this.W.length - 1; l >= 0; l--) {
      const prev = this.a[l]
      const nextDelta = l > 0 ? prev.map((av, i) => (1 - av * av) * this.W[l].reduce((s, row, j) => s + row[i] * delta[j], 0)) : []
      this.W[l].forEach((row, j) => {
        for (let i = 0; i < row.length; i++) row[i] -= lr * delta[j] * prev[i]
        this.B[l][j] -= lr * delta[j]
      })
      delta = nextDelta
    }
    const q = Math.min(Math.max(out, 1e-7), 1 - 1e-7)
    return -(p.c * Math.log(q) + (1 - p.c) * Math.log(1 - q))
  }
}

const RES = 46 // decision-map resolution

/**
 * Live diagram of the network. Edge thickness = weight strength (solid positive, dashed negative);
 * neuron shading = its activation for the probe point under the cursor. Edges flow while training.
 */
function NetworkDiagram({ net, probe, running }: { net: MLP; probe: { x: number; y: number }; running: boolean }) {
  const acts = net.activations(probe.x, probe.y)
  const sizes = net.sizes
  const Wd = 320
  const Hd = 190
  const col = (l: number) => 26 + (l / (sizes.length - 1)) * (Wd - 52)
  const row = (n: number, i: number) => (Hd / 2) + (i - (n - 1) / 2) * Math.min(22, (Hd - 30) / Math.max(n - 1, 1))
  const maxW = Math.max(0.5, ...net.W.flat(2).map(Math.abs))
  const label = (l: number, i: number) => (l === 0 ? (i ? 'y' : 'x') : l === sizes.length - 1 ? 'p' : '')
  return (
    <figure className="rounded-2xl border border-line bg-ink-2 p-3">
      <figcaption className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        <span>Inside the network</span>
        <span>
          probe ({probe.x.toFixed(2)}, {probe.y.toFixed(2)}) → <span className="text-cream">{(acts[acts.length - 1][0] * 100).toFixed(0)}% dark</span>
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${Wd} ${Hd}`} className="w-full" role="img" aria-label="Diagram of the neural network's weights and activations">
        {net.W.map((layer, l) =>
          layer.map((rowW, j) =>
            rowW.map((wt, i) => (
              <line
                key={`${l}-${j}-${i}`}
                x1={col(l)}
                y1={row(sizes[l], i)}
                x2={col(l + 1)}
                y2={row(sizes[l + 1], j)}
                stroke="#0a0a0a"
                strokeOpacity={0.15 + (Math.abs(wt) / maxW) * 0.75}
                strokeWidth={0.4 + (Math.abs(wt) / maxW) * 3}
                strokeDasharray={wt < 0 ? '3 3' : undefined}
                className={running && wt >= 0 ? 'nn-flow' : undefined}
              />
            )),
          ),
        )}
        {acts.map((layer, l) =>
          layer.map((v, i) => {
            const t = l === acts.length - 1 ? v : (v + 1) / 2 // tanh is −1..1, sigmoid 0..1
            const r = l === 0 || l === acts.length - 1 ? 9 : 7
            return (
              <g key={`n-${l}-${i}`}>
                <circle cx={col(l)} cy={row(sizes[l], i)} r={r} fill={`rgb(${Math.round(255 - t * 245)},${Math.round(255 - t * 245)},${Math.round(255 - t * 245)})`} stroke="#0a0a0a" strokeWidth="1.5" />
                {label(l, i) && (
                  <text x={col(l) + (l === 0 ? -16 : 15)} y={row(sizes[l], i) + 3.5} fontSize="10" fontFamily="JetBrains Mono, monospace" fill="#737373" textAnchor="middle">
                    {label(l, i)}
                  </text>
                )}
              </g>
            )
          }),
        )}
      </svg>
    </figure>
  )
}

export function NeuralNetDemo() {
  const box = useRef<HTMLDivElement>(null)
  const cv = useRef<HTMLCanvasElement>(null)
  const { w: W, h: H } = useBoxSize(box)
  const [dataset, setDataset] = useState<Dataset>('circle')
  const [hidden, setHidden] = useState(6)
  const [lr, setLr] = useState(0.05)
  const [running, setRunning] = useState(false)
  const [brush, setBrush] = useState<0 | 1>(1)
  const [stats, setStats] = useState({ epoch: 0, loss: 0, acc: 0 })
  const [count, setCount] = useState(160)
  const [probe, setProbe] = useState({ x: 0.3, y: 0.3 })
  const [solvedFlag, setSolvedFlag] = useState(false)
  const solved = useStamp(solvedFlag, 'Solved')
  const data = useRef<Pt[]>(makeData('circle', 11))
  const net = useRef(new MLP([2, 6, 6, 1], 5))
  const seed = useRef(5)
  const lrRef = useRef(lr)
  useEffect(() => {
    lrRef.current = lr
  }, [lr])

  const evaluate = (epoch: number) => {
    const D = data.current
    let loss = 0
    let ok = 0
    for (const p of D) {
      const o = net.current.forward(p.x, p.y)
      const q = Math.min(Math.max(o, 1e-7), 1 - 1e-7)
      loss -= p.c * Math.log(q) + (1 - p.c) * Math.log(1 - q)
      if ((o > 0.5 ? 1 : 0) === p.c) ok++
    }
    setStats({ epoch, loss: D.length ? loss / D.length : 0, acc: D.length ? ok / D.length : 0 })
    if (epoch > 0 && D.length && ok === D.length) setSolvedFlag(true)
  }

  const newNet = (h = hidden) => {
    seed.current += 1
    net.current = new MLP([2, h, h, 1], seed.current)
    setSolvedFlag(false)
    evaluate(0)
  }

  // Training loop: a few shuffled passes over the data per frame.
  useEffect(() => {
    if (!running) return
    let raf = 0
    let epoch = stats.epoch
    const rnd = seeded(epoch + 1)
    const tick = () => {
      const D = data.current
      if (D.length) {
        for (let e = 0; e < 3; e++) {
          const order = D.map((_, i) => i).sort(() => rnd() - 0.5)
          for (const i of order) net.current.learn(D[i], lrRef.current)
          epoch++
        }
        evaluate(epoch)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  // Draw the decision map and the points after every update.
  useEffect(() => {
    const c = cv.current
    if (!c || !W) return
    const ctx = prepare(c, W, H)
    const cw = W / RES
    const ch = H / RES
    for (let gy = 0; gy < RES; gy++) {
      for (let gx = 0; gx < RES; gx++) {
        const x = ((gx + 0.5) / RES) * 2 - 1
        const y = 1 - ((gy + 0.5) / RES) * 2
        const p = net.current.forward(x, y)
        ctx.fillStyle = `rgba(10,10,10,${(p * 0.42).toFixed(3)})`
        ctx.fillRect(gx * cw, gy * ch, cw + 0.6, ch + 0.6)
      }
    }
    // 0.5 contour, traced on the grid
    ctx.strokeStyle = INK
    ctx.lineWidth = 1.5
    ctx.beginPath()
    for (let gy = 0; gy < RES; gy++) {
      for (let gx = 0; gx < RES; gx++) {
        const v = net.current.forward(((gx + 0.5) / RES) * 2 - 1, 1 - ((gy + 0.5) / RES) * 2) > 0.5
        if (gx + 1 < RES && v !== net.current.forward(((gx + 1.5) / RES) * 2 - 1, 1 - ((gy + 0.5) / RES) * 2) > 0.5) {
          ctx.moveTo((gx + 1) * cw, gy * ch)
          ctx.lineTo((gx + 1) * cw, (gy + 1) * ch)
        }
        if (gy + 1 < RES && v !== net.current.forward(((gx + 0.5) / RES) * 2 - 1, 1 - ((gy + 1.5) / RES) * 2) > 0.5) {
          ctx.moveTo(gx * cw, (gy + 1) * ch)
          ctx.lineTo((gx + 1) * cw, (gy + 1) * ch)
        }
      }
    }
    ctx.stroke()
    for (const p of data.current) {
      const x = ((p.x + 1) / 2) * W
      const y = ((1 - p.y) / 2) * H
      ctx.beginPath()
      ctx.arc(x, y, 4.2, 0, Math.PI * 2)
      ctx.fillStyle = p.c ? INK : '#ffffff'
      ctx.strokeStyle = p.c ? '#ffffff' : INK
      ctx.lineWidth = 1.6
      ctx.fill()
      ctx.stroke()
    }
  }, [stats, W, H, count])

  const pick = (d: Dataset) => {
    setRunning(false)
    setDataset(d)
    data.current = makeData(d, 11)
    setCount(data.current.length)
    newNet()
  }

  const add = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const p = unit(e)
    data.current = [...data.current, { x: p.x * 2 - 1, y: 1 - p.y * 2, c: brush }]
    setCount(data.current.length)
    evaluate(stats.epoch)
  }

  return (
    <DemoShell
      id="neural-net"
      index="03"
      kicker="Deep learning · from scratch"
      title="A neural network learns a boundary"
      summary="A small network sorts dark points from light ones. Shading shows how sure it is; the line is where it flips. Try the spiral — a straight line can’t solve it, but hidden layers can."
      canvas={
        <Stage boxRef={box} stamp={solved} caption={`Click to add a ${brush ? 'dark ●' : 'light ○'} point · darker shading = more confident “dark”`}>
          <canvas ref={cv} onPointerDown={add} onPointerMove={(e) => { const p = unit(e); setProbe({ x: p.x * 2 - 1, y: 1 - p.y * 2 }) }} className="absolute inset-0 size-full cursor-crosshair touch-none" role="img" aria-label={`Neural network decision map on the ${dataset} dataset, accuracy ${(stats.acc * 100).toFixed(0)} percent`} />
        </Stage>
      }
      controls={
        <>
          <div className="flex w-full flex-wrap gap-2" role="group" aria-label="Dataset">
            {(['circle', 'xor', 'spiral', 'blobs'] as const).map((d) => (
              <Btn key={d} pressed={dataset === d} onClick={() => pick(d)}>
                {d === 'xor' ? 'XOR' : d[0].toUpperCase() + d.slice(1)}
              </Btn>
            ))}
          </div>
          <Btn primary onClick={() => setRunning((r) => !r)}>{running ? 'Pause' : 'Train'}</Btn>
          <Btn onClick={() => { setRunning(false); newNet() }}>Reset weights</Btn>
          <Btn pressed={brush === 1} onClick={() => setBrush(1)}>Add ●</Btn>
          <Btn pressed={brush === 0} onClick={() => setBrush(0)}>Add ○</Btn>
          <Btn onClick={() => { setRunning(false); data.current = []; setCount(0); evaluate(0) }}>Clear</Btn>
          <div className="grid w-full gap-4 pt-2 sm:grid-cols-2">
            <Slider label="Neurons per layer" min={2} max={10} step={1} value={hidden} onChange={(v) => { setHidden(v); setRunning(false); newNet(v) }} />
            <Slider label="Learning rate" min={0.005} max={0.3} step={0.005} value={lr} onChange={setLr} format={(v) => v.toFixed(3)} />
          </div>
        </>
      }
      metrics={
        <>
          <Metric label="Epoch" value={<Count value={stats.epoch} />} />
          <Metric label="Loss" value={<Count value={stats.loss} decimals={3} />} />
          <Metric label="Accuracy" value={<Count value={stats.acc * 100} suffix="%" />} />
        </>
      }
      extra={<NetworkDiagram net={net.current} probe={probe} running={running} />}
      how={
        <p>
          Each point’s x and y go in; two hidden layers of <code className="text-cream">tanh</code> neurons bend the space; a sigmoid gives the probability of “dark”.
          Training runs <strong className="text-cream">backpropagation</strong> — the chain rule pushes each error back through the layers — and updates every weight
          by stochastic gradient descent. Hover the plot to send that point through the diagram. Accuracy is measured on the points shown, so it shows fit, not generalisation.
        </p>
      }
    />
  )
}
