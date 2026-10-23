import { useEffect, useRef } from 'react'
import { useMotionPref } from '../lib/motion'

type Streak = { x: number; y: number; len: number; speed: number; alpha: number; width: number; land: number }
type Bead = { x: number; y: number; r: number; slide: boolean; v: number; seed: number; trail: number }
type Ring = { x: number; y: number; t: number; size: number }
type Spray = { x: number; y: number; vx: number; vy: number; life: number; r: number }

const SLANT = 0.16 // wind: horizontal drift per unit of fall
const UMBRELLA = 74 // dry radius around the cursor (px)
const MAX_BEADS = 650

/**
 * Page background: rain pouring onto a mirror.
 * - Fast drizzle falls; near drops hit the glass with a splash ring and spray, leaving beads.
 * - Beads merge; heavy ones slide down, swallowing others and leaving a trail.
 * - The cursor is an umbrella: rain reaching it splashes off, keeping a dry spot.
 * - Moving across the glass sets the beads you brush past running; a click bursts a splash.
 * Still beads and streaks with reduced motion; pauses while the tab is hidden.
 */
export function RainField() {
  const ref = useRef<HTMLCanvasElement>(null)
  const { reduced } = useMotionPref()

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')!
    let w = 0
    let h = 0
    let raf = 0
    let last = performance.now()
    let rain: Streak[] = []
    let beads: Bead[] = []
    const rings: Ring[] = []
    const spray: Spray[] = []
    const cur = { x: -9999, y: -9999, px: -9999, py: -9999, on: false }

    const streak = (y = Math.random() * h): Streak => {
      const depth = Math.random() // 0 far … 1 near
      return {
        x: Math.random() * (w + h * SLANT) - h * SLANT,
        y,
        len: 10 + depth * 22,
        speed: 1100 + depth * 1300,
        alpha: 0.08 + depth * 0.22,
        width: depth > 0.75 ? 1.4 : 1,
        // only nearer drops strike the glass, somewhere down the screen
        land: depth > 0.45 ? h * (0.05 + Math.random() * 0.95) : Infinity,
      }
    }
    const bead = (x: number, y: number, r: number): Bead => ({ x, y, r, slide: false, v: 0, seed: Math.random() * 100, trail: 0 })
    const splash = (x: number, y: number, power = 1, up = false) => {
      rings.push({ x, y, t: 0, size: 6 + power * 10 })
      const n = 2 + Math.round(Math.random() * 2 * power)
      for (let i = 0; i < n; i++) {
        const a = up ? -Math.PI / 2 + (Math.random() - 0.5) * 2.2 : Math.random() * Math.PI * 2
        const sp = (60 + Math.random() * 140) * power
        spray.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.35 + Math.random() * 0.25, r: 0.6 + Math.random() * 0.9 })
      }
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      c.width = Math.round(w * dpr)
      c.height = Math.round(h * dpr)
      c.style.width = `${w}px`
      c.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      rain = Array.from({ length: Math.round((w * h) / 5600) }, () => streak())
      if (!beads.length) beads = Array.from({ length: Math.round((w * h) / 6000) }, () => bead(Math.random() * w, Math.random() * h, 0.7 + Math.random() ** 3 * 3))
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.lineCap = 'round'
      // falling rain
      for (const s of rain) {
        ctx.strokeStyle = `rgba(10,10,10,${s.alpha.toFixed(3)})`
        ctx.lineWidth = s.width
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(s.x - s.len * SLANT, s.y - s.len)
        ctx.stroke()
      }
      // beads on the glass, with a small glint
      for (const b of beads) {
        const st = b.slide ? 1.35 : 1
        ctx.fillStyle = `rgba(10,10,10,${Math.min(0.7, 0.28 + b.r * 0.09).toFixed(3)})`
        ctx.beginPath()
        ctx.ellipse(b.x, b.y, b.r, b.r * st, 0, 0, Math.PI * 2)
        ctx.fill()
        if (b.r > 1.6) {
          ctx.fillStyle = 'rgba(255,255,255,0.7)'
          ctx.beginPath()
          ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.4 * st, b.r * 0.28, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      // splash rings
      ctx.lineWidth = 1
      for (const r of rings) {
        const k = r.t / 0.45
        ctx.strokeStyle = `rgba(10,10,10,${(0.35 * (1 - k)).toFixed(3)})`
        ctx.beginPath()
        ctx.ellipse(r.x, r.y, 1 + k * r.size, (1 + k * r.size) * 0.45, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
      // spray
      for (const p of spray) {
        ctx.fillStyle = `rgba(10,10,10,${Math.min(0.5, p.life * 1.2).toFixed(3)})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      // rain falls; it lands on the glass or splashes off the cursor's umbrella
      for (const s of rain) {
        s.y += s.speed * dt
        s.x += s.speed * dt * SLANT
        if (cur.on) {
          const dx = s.x - cur.x
          const dy = s.y - cur.y
          if (dy < 8 && dx * dx + dy * dy < UMBRELLA * UMBRELLA) {
            if (Math.random() < 0.55) splash(s.x, s.y, 0.7, true)
            Object.assign(s, streak(-Math.random() * 80))
            continue
          }
        }
        if (s.y >= s.land) {
          splash(s.x, s.y, 0.6 + Math.random() * 0.5)
          if (beads.length < MAX_BEADS || Math.random() < 0.5) beads.push(bead(s.x, s.y, 0.6 + Math.random() ** 2 * 2.4))
          Object.assign(s, streak(-Math.random() * 80))
        } else if (s.y - s.len > h || s.x - s.len * SLANT > w) Object.assign(s, streak(-Math.random() * 80))
      }
      if (beads.length > MAX_BEADS) beads.splice(0, beads.length - MAX_BEADS)

      // neighbouring beads merge into bigger ones
      if (Math.random() < 0.3) {
        for (let i = 0; i < 40 && beads.length > 2; i++) {
          const a = beads[Math.floor(Math.random() * beads.length)]
          const b = beads[Math.floor(Math.random() * beads.length)]
          if (a !== b && Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r) {
            a.r = Math.min(6, Math.sqrt(a.r * a.r + b.r * b.r))
            beads.splice(beads.indexOf(b), 1)
          }
        }
      }

      // the cursor disturbs the glass: beads it brushes past start to run
      if (cur.on && cur.px > -9000) {
        const moved = Math.hypot(cur.x - cur.px, cur.y - cur.py)
        if (moved > 1) {
          for (const b of beads) {
            if (!b.slide && b.r > 1 && Math.hypot(b.x - cur.x, b.y - cur.y) < UMBRELLA * 0.9) {
              b.slide = true
              b.v = 60 + Math.random() * 60
              b.r = Math.max(b.r, 1.9)
            }
          }
        }
      }
      cur.px = cur.x
      cur.py = cur.y

      // heavy beads break loose and slide, swallowing others and leaving a trail
      const born: Bead[] = []
      for (const b of beads) {
        if (!b.slide && b.r > 2.7 && Math.random() < dt * 0.3) {
          b.slide = true
          b.v = 25
        }
        if (!b.slide) continue
        b.v += (40 + b.r * 36 - b.v) * dt * 2
        const dy = b.v * dt
        b.y += dy
        b.x += Math.sin(now / 280 + b.seed) * 0.25
        b.trail += dy
        if (b.trail > 10 + Math.random() * 14 && b.r > 1.7) {
          b.trail = 0
          born.push(bead(b.x + (Math.random() - 0.5) * 1.5, b.y - b.r * 1.6, b.r * (0.22 + Math.random() * 0.15)))
          b.r *= 0.985
        }
        if (b.r < 1.3) b.slide = false
      }
      const runners = beads.filter((b) => b.slide)
      if (runners.length) {
        const eaten = new Set<Bead>()
        for (const s of runners) {
          for (const b of beads) {
            if (b === s || b.slide || eaten.has(b)) continue
            if (Math.abs(b.y - s.y) < s.r + b.r && Math.abs(b.x - s.x) < s.r + b.r) {
              eaten.add(b)
              s.r = Math.min(6.5, Math.sqrt(s.r * s.r + b.r * b.r * 0.7))
            }
          }
        }
        if (eaten.size) beads = beads.filter((b) => !eaten.has(b))
      }
      beads = beads.filter((b) => b.y - b.r < h + 10)
      beads.push(...born)

      // rings and spray age out
      for (let i = rings.length - 1; i >= 0; i--) if ((rings[i].t += dt) > 0.45) rings.splice(i, 1)
      for (let i = spray.length - 1; i >= 0; i--) {
        const p = spray[i]
        p.vy += 900 * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        if ((p.life -= dt) <= 0) spray.splice(i, 1)
      }
      if (rings.length > 160) rings.splice(0, rings.length - 160)
      if (spray.length > 400) spray.splice(0, spray.length - 400)

      draw()
      raf = requestAnimationFrame(step)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' && !(e.buttons & 1)) return
      cur.x = e.clientX
      cur.y = e.clientY
      cur.on = true
    }
    const onDown = (e: PointerEvent) => {
      onMove(e)
      // a click bursts a splash and knocks nearby beads loose
      for (let i = 0; i < 3; i++) splash(e.clientX + (Math.random() - 0.5) * 20, e.clientY + (Math.random() - 0.5) * 20, 1.6)
      for (const b of beads) {
        if (Math.hypot(b.x - e.clientX, b.y - e.clientY) < 110 && b.r > 0.9) {
          b.slide = true
          b.v = 120
          b.r = Math.max(b.r, 2)
        }
      }
    }
    const onEnd = (e: PointerEvent) => {
      if (e.pointerType === 'touch') cur.on = false
    }
    const onLeave = () => (cur.on = false)
    const onVis = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden && !reduced) {
        last = performance.now()
        raf = requestAnimationFrame(step)
      }
    }
    const onResize = () => {
      resize()
      if (reduced) draw()
    }

    resize()
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVis)
    if (reduced) draw()
    else {
      raf = requestAnimationFrame(step)
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerdown', onDown, { passive: true })
      window.addEventListener('pointerup', onEnd, { passive: true })
      window.addEventListener('pointercancel', onEnd, { passive: true })
      document.documentElement.addEventListener('pointerleave', onLeave)
    }
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onEnd)
      window.removeEventListener('pointercancel', onEnd)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [reduced])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      {/* faint mirror sheen */}
      <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0)_35%,rgba(0,0,0,0.02)_55%,rgba(255,255,255,0)_75%)]" />
      <canvas ref={ref} className="absolute inset-0" />
    </div>
  )
}
