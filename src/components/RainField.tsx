import { useEffect, useRef } from 'react'
import { useMotionPref } from '../lib/motion'

type Streak = { x: number; y: number; len: number; speed: number; alpha: number; width: number; land: number }
type Drop = { x: number; y: number; r: number; run: boolean; v: number; seed: number; trail: number; stick: number }
type Ring = { x: number; y: number; t: number; size: number }

const BASE_WIND = 0.12 // resting slant: horizontal drift per unit of fall
const MAX_DROPS = 260
const SPRITE = 64 // drop sprite size (px); drawn scaled to each drop

/** Pre-renders one water drop on glass: soft shadow, refracted dark rim, light body, caustic and highlight. */
function makeDropSprite() {
  const s = document.createElement('canvas')
  s.width = s.height = SPRITE
  const g = s.getContext('2d')!
  const c = SPRITE / 2
  const R = SPRITE * 0.36
  g.filter = 'blur(3px)'
  g.fillStyle = 'rgba(0,0,0,0.25)'
  g.beginPath()
  g.ellipse(c + R * 0.18, c + R * 0.3, R * 0.95, R * 0.9, 0, 0, Math.PI * 2)
  g.fill()
  g.filter = 'none'
  const body = g.createRadialGradient(c - R * 0.15, c - R * 0.2, R * 0.1, c, c, R)
  body.addColorStop(0, 'rgba(255,255,255,0.12)')
  body.addColorStop(0.5, 'rgba(30,30,30,0.12)')
  body.addColorStop(0.8, 'rgba(10,10,10,0.5)')
  body.addColorStop(1, 'rgba(10,10,10,0.8)')
  g.fillStyle = body
  g.beginPath()
  g.arc(c, c, R, 0, Math.PI * 2)
  g.fill()
  g.strokeStyle = 'rgba(255,255,255,0.6)'
  g.lineWidth = R * 0.14
  g.beginPath()
  g.arc(c, c, R * 0.7, Math.PI * 0.18, Math.PI * 0.82)
  g.stroke()
  const hl = g.createRadialGradient(c - R * 0.38, c - R * 0.42, 0, c - R * 0.38, c - R * 0.42, R * 0.34)
  hl.addColorStop(0, 'rgba(255,255,255,1)')
  hl.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = hl
  g.beginPath()
  g.arc(c - R * 0.38, c - R * 0.42, R * 0.34, 0, Math.PI * 2)
  g.fill()
  return { canvas: s, R }
}

/**
 * Page background: a rainstorm against a mirror.
 * - Fast rain falls as motion-blurred streaks; some strike the glass with a splash ring.
 * - Drops sit on the glass like small lenses; heavy ones run down in stick-slip bursts,
 *   swallowing others and clearing a wet trail through a faint mist.
 * - Your cursor is the wind: moving sideways bends the whole storm, then it eases back.
 * - Brushing drops sets them running; a click bursts a splash.
 * A still frame with reduced motion; pauses while the tab is hidden.
 */
export function RainField() {
  const ref = useRef<HTMLCanvasElement>(null)
  const { reduced } = useMotionPref()

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')!
    const sprite = makeDropSprite()
    const mist = document.createElement('canvas')
    const mctx = mist.getContext('2d')!
    let w = 0
    let h = 0
    let raf = 0
    let last = performance.now()
    let evap = 0
    let wind = BASE_WIND
    let gust = 0 // extra wind from the pointer, decays back to calm
    let rain: Streak[] = []
    let drops: Drop[] = []
    const rings: Ring[] = []
    const cur = { x: -9999, y: -9999, px: -9999, py: -9999, on: false }

    const sprinkle = (n: number) => {
      for (let i = 0; i < n; i++) {
        mctx.fillStyle = `rgba(10,10,10,${(0.04 + Math.random() * 0.07).toFixed(3)})`
        mctx.beginPath()
        mctx.arc(Math.random() * w, Math.random() * h, 0.3 + Math.random() * 0.6, 0, Math.PI * 2)
        mctx.fill()
      }
    }
    const clearMist = (x1: number, y1: number, x2: number, y2: number, width: number, strength = 1) => {
      mctx.save()
      mctx.globalCompositeOperation = 'destination-out'
      mctx.strokeStyle = `rgba(0,0,0,${strength})`
      mctx.lineWidth = width
      mctx.lineCap = 'round'
      mctx.beginPath()
      mctx.moveTo(x1, y1)
      mctx.lineTo(x2, y2)
      mctx.stroke()
      mctx.restore()
    }

    const streak = (y = Math.random() * h): Streak => {
      const depth = Math.random() // 0 far … 1 near
      return {
        x: Math.random() * (w + h * 1.2) - h * 0.6,
        y,
        len: 18 + depth * 34,
        speed: 1300 + depth * 1400,
        alpha: 0.1 + depth * 0.32,
        width: 0.8 + depth * 0.9,
        land: depth > 0.7 ? h * (0.05 + Math.random() * 0.95) : Infinity,
      }
    }
    const drop = (x: number, y: number, r: number): Drop => ({ x, y, r, run: false, v: 0, seed: Math.random() * 100, trail: 0, stick: 0 })
    const splash = (x: number, y: number, size: number) => rings.push({ x, y, t: 0, size })

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      for (const cv of [c, mist]) {
        cv.width = Math.round(w * dpr)
        cv.height = Math.round(h * dpr)
      }
      c.style.width = `${w}px`
      c.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      mctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sprinkle(Math.round((w * h) / 650))
      rain = Array.from({ length: Math.round((w * h) / 3800) }, () => streak())
      if (!drops.length) drops = Array.from({ length: Math.round((w * h) / 7000) }, () => drop(Math.random() * w, Math.random() * h, 1.4 + Math.random() ** 2.5 * 6))
    }

    const drawDrop = (d: Drop) => {
      const size = SPRITE * (d.r / sprite.R)
      if (d.run) {
        const stretch = 1.25 + Math.min(0.4, d.v / 800)
        ctx.drawImage(sprite.canvas, d.x - size / 2, d.y - (size * stretch) / 2, size, size * stretch)
        ctx.fillStyle = 'rgba(10,10,10,0.3)'
        ctx.beginPath()
        ctx.moveTo(d.x - d.r * 0.55, d.y - d.r * 0.7)
        ctx.quadraticCurveTo(d.x, d.y - d.r * 2.8, d.x + d.r * 0.55, d.y - d.r * 0.7)
        ctx.fill()
      } else ctx.drawImage(sprite.canvas, d.x - size / 2, d.y - size / 2, size, size)
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      // falling rain: each streak fades from a solid head to a clear tail (motion blur)
      ctx.lineCap = 'round'
      for (const s of rain) {
        const tx = s.x - s.len * wind
        const ty = s.y - s.len
        const g = ctx.createLinearGradient(s.x, s.y, tx, ty)
        g.addColorStop(0, `rgba(10,10,10,${s.alpha.toFixed(3)})`)
        g.addColorStop(1, 'rgba(10,10,10,0)')
        ctx.strokeStyle = g
        ctx.lineWidth = s.width
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(tx, ty)
        ctx.stroke()
      }
      ctx.drawImage(mist, 0, 0, w, h)
      // splash rings where rain strikes the glass
      ctx.lineWidth = 1
      for (const r of rings) {
        const k = r.t / 0.4
        ctx.strokeStyle = `rgba(10,10,10,${(0.45 * (1 - k)).toFixed(3)})`
        ctx.beginPath()
        ctx.ellipse(r.x, r.y, 1 + k * r.size, (1 + k * r.size) * 0.55, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
      for (const d of drops) drawDrop(d)
    }

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      // wind: pointer gusts decay back to the resting slant
      gust *= Math.pow(0.12, dt)
      wind += (BASE_WIND + gust - wind) * Math.min(1, dt * 6)

      for (const s of rain) {
        s.y += s.speed * dt
        s.x += s.speed * dt * wind
        if (s.y >= s.land) {
          splash(s.x, s.y, 5 + Math.random() * 8)
          if (drops.length < MAX_DROPS) drops.push(drop(s.x, s.y, 1.2 + Math.random() ** 2 * 3.2))
          else {
            const t = drops[Math.floor(Math.random() * drops.length)]
            if (!t.run) t.r = Math.min(7, Math.sqrt(t.r * t.r + 0.8))
          }
          Object.assign(s, streak(-Math.random() * 100))
        } else if (s.y - s.len > h || s.x < -h || s.x > w + h) Object.assign(s, streak(-Math.random() * 100))
      }

      // faint mist: a little more condenses as some evaporates (stays at a steady level)
      sprinkle(Math.round(((w * h) / 650) * dt * 0.24))
      evap += dt
      if (evap >= 0.5) {
        evap = 0
        mctx.save()
        mctx.globalCompositeOperation = 'destination-out'
        mctx.fillStyle = 'rgba(0,0,0,0.12)'
        mctx.fillRect(0, 0, w, h)
        mctx.restore()
      }

      // brushing the glass sets nearby drops running
      if (cur.on && cur.px > -9000 && Math.hypot(cur.x - cur.px, cur.y - cur.py) > 0.5) {
        for (const d of drops) {
          if (!d.run && Math.hypot(d.x - cur.x, d.y - cur.y) < 32 + d.r) {
            d.run = true
            d.v = 80 + Math.random() * 80
            d.r = Math.max(d.r, 2.6)
          }
        }
      }
      cur.px = cur.x
      cur.py = cur.y

      // runners: stick-slip, wobble, clear a trail, leave droplets, swallow others
      const born: Drop[] = []
      for (const d of drops) {
        if (!d.run && d.r > 4.2 && Math.random() < dt * 0.4) {
          d.run = true
          d.v = 30
        }
        if (!d.run) continue
        if (d.stick > 0) {
          d.stick -= dt
          d.v *= 0.8
        } else {
          d.v += (50 + d.r * 42 - d.v) * dt * 2.2
          if (Math.random() < dt * 1.1) d.stick = 0.08 + Math.random() * 0.3
        }
        const ox = d.x
        const oy = d.y
        d.y += d.v * dt
        d.x += Math.sin(now / 260 + d.seed) * 0.35 * Math.min(1, d.v / 80)
        clearMist(ox, oy, d.x, d.y, d.r * 1.8)
        d.trail += d.y - oy
        if (d.trail > 14 + Math.random() * 18 && d.r > 2.2) {
          d.trail = 0
          born.push(drop(d.x + (Math.random() - 0.5) * 1.2, d.y - d.r * 2.4, d.r * (0.22 + Math.random() * 0.12)))
          d.r *= 0.982
        }
        if (d.r < 1.8) d.run = false
      }
      const runners = drops.filter((d) => d.run)
      if (runners.length) {
        const eaten = new Set<Drop>()
        for (const s of runners) {
          for (const b of drops) {
            if (b === s || b.run || eaten.has(b)) continue
            if (Math.abs(b.y - s.y) < s.r + b.r && Math.abs(b.x - s.x) < s.r * 0.9 + b.r) {
              eaten.add(b)
              s.r = Math.min(8, Math.sqrt(s.r * s.r + b.r * b.r * 0.8))
            }
          }
        }
        if (eaten.size) drops = drops.filter((d) => !eaten.has(d))
      }
      drops = drops.filter((d) => d.y - d.r < h + 14)
      drops.push(...born)
      if (drops.length > MAX_DROPS + 80) drops.splice(0, drops.length - MAX_DROPS - 80)

      for (let i = rings.length - 1; i >= 0; i--) if ((rings[i].t += dt) > 0.4) rings.splice(i, 1)
      if (rings.length > 120) rings.splice(0, rings.length - 120)

      draw()
      raf = requestAnimationFrame(step)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' && !(e.buttons & 1)) return
      if (cur.px > -9000) {
        // sideways pointer speed becomes a gust (clamped so rain never goes flat)
        gust = Math.max(-0.9, Math.min(0.9, gust + (e.clientX - cur.x) * 0.006))
      }
      cur.x = e.clientX
      cur.y = e.clientY
      cur.on = true
    }
    const onDown = (e: PointerEvent) => {
      onMove(e)
      for (let i = 0; i < 4; i++) splash(e.clientX + (Math.random() - 0.5) * 30, e.clientY + (Math.random() - 0.5) * 20, 14 + Math.random() * 18)
      for (const d of drops) {
        if (Math.hypot(d.x - e.clientX, d.y - e.clientY) < 90) {
          d.run = true
          d.v = 130
          d.r = Math.max(d.r, 2.8)
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
      <div className="absolute inset-0 bg-[linear-gradient(155deg,rgba(255,255,255,0)_30%,rgba(0,0,0,0.03)_50%,rgba(255,255,255,0)_70%)]" />
      <canvas ref={ref} className="absolute inset-0" />
    </div>
  )
}
