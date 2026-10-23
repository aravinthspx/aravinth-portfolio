import { useEffect, useRef } from 'react'
import { useMotionPref } from '../../lib/motion'

type Dot = { x: number; y: number; vx: number; vy: number; tx: number; ty: number; r: number }

/**
 * Title drawn as thousands of dots — "data points" that fly in and settle into the words,
 * then scatter away from the cursor and spring back. Static (but still dotted) with reduced motion.
 * The real heading text is provided separately for screen readers.
 */
export function ParticleTitle({ lines }: { lines: string[] }) {
  const box = useRef<HTMLDivElement>(null)
  const cv = useRef<HTMLCanvasElement>(null)
  const { reduced } = useMotionPref()

  useEffect(() => {
    const el = box.current
    const c = cv.current
    if (!el || !c) return
    const ctx = c.getContext('2d')!
    let dots: Dot[] = []
    let w = 0
    let h = 0
    let raf = 0
    let alive = true
    let visible = true
    let io: IntersectionObserver | null = null
    const mouse = { x: -9999, y: -9999, down: false }

    const build = () => {
      const r = el.getBoundingClientRect()
      w = r.width
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      // Font size: as large as fits the longest line.
      const longest = lines.reduce((a, b) => (b.length > a.length ? b : a), '')
      const off = document.createElement('canvas').getContext('2d')!
      let size = Math.min(150, w / 6)
      off.font = `700 ${size}px "Space Grotesk", sans-serif`
      const tw = off.measureText(longest).width
      size = Math.min(150, (size * (w * 0.98)) / tw)
      const lh = size * 1.02
      h = Math.ceil(lh * lines.length + size * 0.25)
      el.style.height = `${h}px`
      c.width = Math.round(w * dpr)
      c.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Rasterise the text off-screen, then sample it on a grid.
      const o = document.createElement('canvas')
      o.width = Math.ceil(w)
      o.height = h
      const octx = o.getContext('2d')!
      octx.fillStyle = '#000'
      octx.font = `700 ${size}px "Space Grotesk", sans-serif`
      octx.textBaseline = 'top'
      lines.forEach((t, i) => octx.fillText(t, 0, i * lh + size * 0.05))
      const data = octx.getImageData(0, 0, o.width, o.height).data
      const gap = Math.max(3, Math.round(size / 26))
      const targets: { x: number; y: number }[] = []
      for (let y = 0; y < o.height; y += gap) {
        for (let x = 0; x < o.width; x += gap) {
          if (data[(y * o.width + x) * 4 + 3] > 128) targets.push({ x, y })
        }
      }
      const prev = dots
      dots = targets.map((t, i) => {
        const p = prev[i]
        const fromX = p ? p.x : Math.random() * w
        const fromY = p ? p.y : h + Math.random() * h * 1.5
        return { x: reduced ? t.x : fromX, y: reduced ? t.y : fromY, vx: 0, vy: 0, tx: t.x, ty: t.y, r: gap * 0.42 }
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = '#0a0a0a'
      ctx.beginPath()
      for (const d of dots) {
        ctx.moveTo(d.x + d.r, d.y)
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
      }
      ctx.fill()
    }

    const step = () => {
      const R = mouse.down ? 150 : 90
      for (const d of dots) {
        const dx = d.x - mouse.x
        const dy = d.y - mouse.y
        const dist2 = dx * dx + dy * dy
        if (dist2 < R * R) {
          const dist = Math.sqrt(dist2) || 1
          const f = (1 - dist / R) * (mouse.down ? 9 : 4.5)
          d.vx += (dx / dist) * f
          d.vy += (dy / dist) * f
        }
        d.vx += (d.tx - d.x) * 0.045
        d.vy += (d.ty - d.y) * 0.045
        d.vx *= 0.82
        d.vy *= 0.82
        d.x += d.vx
        d.y += d.vy
      }
      draw()
      raf = alive && visible ? requestAnimationFrame(step) : 0
    }

    const toLocal = (e: PointerEvent) => {
      const r = c.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    }
    const onMove = (e: PointerEvent) => toLocal(e)
    const onLeave = () => {
      mouse.x = mouse.y = -9999
      mouse.down = false
    }
    const onDown = (e: PointerEvent) => {
      toLocal(e)
      mouse.down = true
    }
    const onUp = () => (mouse.down = false)

    let ro: ResizeObserver | null = null
    document.fonts.ready.then(() => {
      if (!alive) return
      build()
      if (reduced) draw()
      else {
        raf = requestAnimationFrame(step)
        // Pause the simulation while the title is off-screen.
        io = new IntersectionObserver(([e]) => {
          visible = e.isIntersecting
          if (visible && !raf) raf = requestAnimationFrame(step)
        })
        io.observe(el)
        c.addEventListener('pointermove', onMove)
        c.addEventListener('pointerleave', onLeave)
        c.addEventListener('pointerdown', onDown)
        window.addEventListener('pointerup', onUp)
      }
      let lastW = w
      ro = new ResizeObserver(() => {
        if (Math.abs(el.getBoundingClientRect().width - lastW) < 2) return
        lastW = el.getBoundingClientRect().width
        build()
        if (reduced) draw()
      })
      ro.observe(el)
    })

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      ro?.disconnect()
      io?.disconnect()
      c.removeEventListener('pointermove', onMove)
      c.removeEventListener('pointerleave', onLeave)
      c.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [lines, reduced])

  return (
    <div ref={box} className="relative w-full" aria-hidden="true">
      <canvas ref={cv} className="absolute inset-0 size-full touch-pan-y" />
    </div>
  )
}
