import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMotionPref } from '../lib/motion'

/**
 * Hero panel: a small feed-forward network that flows from tools I use (top) to work they
 * produced (bottom). Signals fire through it; hover any node to trace its connections.
 * Drawn on a 2D canvas — no WebGL — and static when reduced motion is on.
 */

type Out = { label: string; to: string; color: string }
const inputs = ['Python', 'ML', 'React', 'FastAPI']
const outputs: Out[] = [
  { label: 'Agri-Yield Pro', to: '/work/agri-yield-pro', color: '#9fdc74' },
  { label: 'SITTO', to: '/work/sitto', color: '#4fd9ea' },
  { label: 'Certificates', to: '#certificates', color: '#e5b45f' },
]
const sizes = [inputs.length, 6, 5, outputs.length]
const layerY = [0.19, 0.41, 0.62, 0.82]
const CYAN = [79, 217, 234] as const

type Node = { l: number; i: number; x: number; y: number; glow: number }
type Pulse = { from: Node; to: Node; t: number; speed: number }

function buildNodes(): Node[] {
  const nodes: Node[] = []
  sizes.forEach((n, l) => {
    for (let i = 0; i < n; i++) nodes.push({ l, i, x: (i + 1) / (n + 1), y: layerY[l], glow: 0 })
  })
  return nodes
}

const hex = (h: string) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16)) as unknown as readonly [number, number, number]
const nodeColor = (n: Node) => (n.l === 3 ? hex(outputs[n.i].color) : CYAN)

export function NeuralPanel() {
  const { reduced } = useMotionPref()
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const hoverRef = useRef<Node | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const nodesRef = useRef<Node[]>(buildNodes())

  useEffect(() => {
    const cv = canvas.current
    const box = wrap.current
    if (!cv || !box) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const nodes = nodesRef.current
    const layer = (l: number) => nodes.filter((n) => n.l === l)
    let pulses: Pulse[] = []
    let w = 0
    let h = 0
    let raf = 0
    let visible = true
    let last = performance.now()
    let fireIn = 0

    const resize = () => {
      const r = box.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = r.width
      h = r.height
      cv.width = Math.round(w * dpr)
      cv.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw()
    }

    const fire = (from: Node) => {
      from.glow = 1
      if (from.l >= 3) return
      const next = layer(from.l + 1)
      // Each node passes the signal on to a couple of nodes in the next layer.
      const picks = next.filter(() => Math.random() < 0.45)
      ;(picks.length ? picks : [next[Math.floor(Math.random() * next.length)]]).forEach((to) =>
        pulses.push({ from, to, t: 0, speed: 0.9 + Math.random() * 0.6 }),
      )
    }

    const linked = (a: Node, b: Node, hv: Node | null) => !!hv && (a === hv || b === hv)

    function draw() {
      ctx!.clearRect(0, 0, w, h)
      const hv = hoverRef.current
      const P = (n: Node) => [n.x * w, n.y * h] as const

      // Edges
      for (let l = 0; l < 3; l++) {
        for (const a of layer(l)) {
          for (const b of layer(l + 1)) {
            const on = linked(a, b, hv)
            const [ax, ay] = P(a)
            const [bx, by] = P(b)
            const c = on ? nodeColor(hv!.l === 3 ? hv! : b) : CYAN
            ctx!.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${on ? 0.55 : hv ? 0.05 : 0.11})`
            ctx!.lineWidth = on ? 1.4 : 1
            ctx!.beginPath()
            ctx!.moveTo(ax, ay)
            ctx!.lineTo(bx, by)
            ctx!.stroke()
          }
        }
      }

      // Pulses
      for (const p of pulses) {
        const [ax, ay] = P(p.from)
        const [bx, by] = P(p.to)
        const x = ax + (bx - ax) * p.t
        const y = ay + (by - ay) * p.t
        const c = nodeColor(p.to)
        const g = ctx!.createRadialGradient(x, y, 0, x, y, 9)
        g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},0.95)`)
        g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`)
        ctx!.fillStyle = g
        ctx!.beginPath()
        ctx!.arc(x, y, 9, 0, Math.PI * 2)
        ctx!.fill()
      }

      // Nodes
      for (const n of nodes) {
        const [x, y] = P(n)
        const c = nodeColor(n)
        const big = n.l === 0 || n.l === 3
        const r = (big ? 7 : 4.5) * (1 + n.glow * 0.35) * (n === hv ? 1.3 : 1)
        if (n.glow > 0.02 || n === hv) {
          const k = Math.max(n.glow, n === hv ? 0.8 : 0)
          const g = ctx!.createRadialGradient(x, y, 0, x, y, r * 4)
          g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${0.45 * k})`)
          g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`)
          ctx!.fillStyle = g
          ctx!.beginPath()
          ctx!.arc(x, y, r * 4, 0, Math.PI * 2)
          ctx!.fill()
        }
        ctx!.fillStyle = '#0b111d'
        ctx!.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${big ? 0.95 : 0.6})`
        ctx!.lineWidth = big ? 2 : 1.4
        ctx!.beginPath()
        ctx!.arc(x, y, r, 0, Math.PI * 2)
        ctx!.fill()
        ctx!.stroke()
        if (big || n.glow > 0.3) {
          ctx!.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${big ? 0.9 : n.glow})`
          ctx!.beginPath()
          ctx!.arc(x, y, r * 0.42, 0, Math.PI * 2)
          ctx!.fill()
        }
      }
    }

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      fireIn -= dt
      if (fireIn <= 0) {
        const ins = layer(0)
        fire(ins[Math.floor(Math.random() * ins.length)])
        fireIn = 0.7 + Math.random() * 0.6
      }
      const arrived: Node[] = []
      pulses = pulses.filter((p) => {
        p.t += dt * p.speed
        if (p.t >= 1) {
          arrived.push(p.to)
          return false
        }
        return true
      })
      arrived.forEach(fire)
      if (pulses.length > 60) pulses = pulses.slice(-60)
      for (const n of nodes) n.glow = Math.max(0, n.glow - dt * 1.6)
      draw()
      raf = visible ? requestAnimationFrame(tick) : 0
    }

    const ro = new ResizeObserver(resize)
    ro.observe(box)
    resize()

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !reduced && !raf) {
        last = performance.now()
        raf = requestAnimationFrame(tick)
      }
    })
    if (!reduced) io.observe(box)

    const nearest = (ev: PointerEvent) => {
      const r = cv.getBoundingClientRect()
      const px = ev.clientX - r.left
      const py = ev.clientY - r.top
      let best: Node | null = null
      let bd = 22 * 22
      for (const n of nodes) {
        const d = (n.x * w - px) ** 2 + (n.y * h - py) ** 2
        if (d < bd) {
          bd = d
          best = n
        }
      }
      return best
    }
    const move = (ev: PointerEvent) => {
      const n = nearest(ev)
      if (n !== hoverRef.current) {
        hoverRef.current = n
        setHover(n ? `${n.l}-${n.i}` : null)
        cv.style.cursor = n ? 'pointer' : ''
        if (reduced) draw()
      }
    }
    const leave = () => {
      hoverRef.current = null
      setHover(null)
      if (reduced) draw()
    }
    const click = (ev: PointerEvent) => {
      const n = nearest(ev)
      if (n && !reduced) fire(n)
    }
    cv.addEventListener('pointermove', move)
    cv.addEventListener('pointerleave', leave)
    cv.addEventListener('pointerdown', click)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      cv.removeEventListener('pointermove', move)
      cv.removeEventListener('pointerleave', leave)
      cv.removeEventListener('pointerdown', click)
    }
  }, [reduced])

  // Hovering an HTML label should light the matching node too.
  const point = (key: string | null) => {
    hoverRef.current = key ? nodesRef.current.find((n) => `${n.l}-${n.i}` === key) ?? null : null
    setHover(key)
  }

  return (
    <div className="relative w-full">
      <div ref={wrap} className="relative aspect-square w-full overflow-hidden rounded-[2rem] border border-line bg-[radial-gradient(80%_60%_at_50%_45%,rgba(79,217,234,0.08),rgba(6,10,19,0.35)_75%)] backdrop-blur-[2px]">
        <canvas ref={canvas} className="absolute inset-0 size-full touch-none" aria-hidden="true" />

        {/* Input labels sit above their nodes */}
        {inputs.map((s, i) => (
          <span
            key={s}
            onPointerEnter={() => point(`0-${i}`)}
            onPointerLeave={() => point(null)}
            className={`absolute -translate-x-1/2 -translate-y-full whitespace-nowrap font-mono text-[10px] tracking-wider transition-colors sm:text-[11px] ${hover === `0-${i}` ? 'text-accent' : 'text-cream-2'}`}
            style={{ left: `${((i + 1) / (inputs.length + 1)) * 100}%`, top: `calc(${layerY[0] * 100}% - 14px)` }}
          >
            {s}
          </span>
        ))}

        {/* Output labels are real links */}
        {outputs.map((o, i) => {
          const cls = `absolute -translate-x-1/2 whitespace-nowrap rounded-full border bg-ink/80 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wide backdrop-blur transition-colors sm:text-[11px] ${hover === `3-${i}` ? 'text-ink' : 'text-cream'}`
          const style = { left: `${((i + 1) / (outputs.length + 1)) * 100}%`, top: `calc(${layerY[3] * 100}% + 14px)`, borderColor: `${o.color}80`, background: hover === `3-${i}` ? o.color : undefined }
          const events = { onPointerEnter: () => point(`3-${i}`), onPointerLeave: () => point(null), onFocus: () => point(`3-${i}`), onBlur: () => point(null) }
          return o.to.startsWith('#') ? (
            <a key={o.label} href={o.to} className={cls} style={style} {...events}>{o.label}</a>
          ) : (
            <Link key={o.label} to={o.to} className={cls} style={style} {...events}>{o.label}</Link>
          )
        })}

        <p className="pointer-events-none absolute left-6 top-5 hidden font-mono text-[10px] sm:block uppercase tracking-[0.2em] text-muted">
          <span className="text-accent">●</span> tools
        </p>
        <p className="pointer-events-none absolute bottom-5 left-6 hidden font-mono text-[10px] sm:block uppercase tracking-[0.2em] text-muted">
          <span className="text-leaf">●</span> work
        </p>
        <p className="pointer-events-none absolute bottom-5 right-6 hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted sm:block">
          {reduced ? 'hover a node' : 'hover · click a node'}
        </p>
      </div>
    </div>
  )
}
