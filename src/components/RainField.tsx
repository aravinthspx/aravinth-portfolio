import { useEffect, useRef } from 'react'
import { useMotionPref } from '../lib/motion'

type Drop = { x: number; y: number; r: number; slide: boolean; v: number; seed: number; trail: number }
type Streak = { x1: number; y1: number; x2: number; y2: number; a: number }

const BLADE = 120 // wiper blade length (px)
const MAX_DROPS = 900

/**
 * Page background: black rain on a mirror. Beads keep landing; larger drops slide down,
 * swallow the beads in their way and leave a trail. The cursor (or a finger) is a wiper
 * blade that clears every drop it sweeps over, leaving a brief wet streak.
 * Static beads with reduced motion; pauses while the tab is hidden.
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
    let drops: Drop[] = []
    const streaks: Streak[] = []
    // wiper state: target and eased position, eased blade angle, visibility
    const wiper = { x: -999, y: -999, px: -999, py: -999, ex: -999, ey: -999, angle: 0, on: 0, active: false }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      c.width = Math.round(w * dpr)
      c.height = Math.round(h * dpr)
      c.style.width = `${w}px`
      c.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const bead = (x = Math.random() * w, y = Math.random() * h, r = 0.8 + Math.random() ** 3 * 3.6): Drop => ({ x, y, r, slide: false, v: 0, seed: Math.random() * 100, trail: 0 })

    const drawDrop = (d: Drop) => {
      const stretch = d.slide ? 1.35 : 1
      // body: dark water bead
      ctx.fillStyle = `rgba(10,10,10,${Math.min(0.75, 0.32 + d.r * 0.08)})`
      ctx.beginPath()
      ctx.ellipse(d.x, d.y, d.r, d.r * stretch, 0, 0, Math.PI * 2)
      ctx.fill()
      // glint: tiny highlight so it reads as a lens of water
      if (d.r > 1.6) {
        ctx.fillStyle = 'rgba(255,255,255,0.75)'
        ctx.beginPath()
        ctx.arc(d.x - d.r * 0.35, d.y - d.r * 0.4 * stretch, d.r * 0.28, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    /** Distance from point (x,y) to the segment a→b. */
    const segDist = (x: number, y: number, ax: number, ay: number, bx: number, by: number) => {
      const dx = bx - ax
      const dy = by - ay
      const len2 = dx * dx + dy * dy || 1
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len2))
      return Math.hypot(x - (ax + t * dx), y - (ay + t * dy))
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      // wet streaks left by the wiper: one stroke per age band, so overlapping
      // pieces never stack into a dark smear; older bands are fainter.
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = BLADE * 0.85
      const bands = [0.022, 0.014, 0.008, 0.004]
      bands.forEach((alpha, k) => {
        const hi = 1 - k * 0.25
        const lo = hi - 0.25
        ctx.beginPath()
        let any = false
        for (const s of streaks) {
          if (s.a > lo && s.a <= hi) {
            ctx.moveTo(s.x1, s.y1)
            ctx.lineTo(s.x2, s.y2)
            any = true
          }
        }
        if (any) {
          ctx.strokeStyle = `rgba(10,10,10,${alpha})`
          ctx.stroke()
        }
      })
      for (const d of drops) drawDrop(d)
      // the wiper blade: a black rubber bar across the direction of travel
      if (wiper.on > 0.02) {
        ctx.save()
        ctx.translate(wiper.ex, wiper.ey)
        ctx.rotate(wiper.angle)
        ctx.globalAlpha = wiper.on
        ctx.fillStyle = '#0a0a0a'
        ctx.beginPath()
        ctx.roundRect(-BLADE / 2, -3, BLADE, 6, 3)
        ctx.fill()
        ctx.fillStyle = 'rgba(10,10,10,0.35)'
        ctx.beginPath()
        ctx.roundRect(-BLADE / 2 + 6, 3, BLADE - 12, 3, 1.5)
        ctx.fill()
        ctx.restore()
      }
    }

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      // rain: new beads land (rate scales with screen area)
      const rate = (w * h) / 80000
      for (let i = 0; i < rate * dt; i++) drops.push(bead())
      if (Math.random() < rate * dt - Math.floor(rate * dt)) drops.push(bead())
      if (drops.length > MAX_DROPS) drops.splice(0, drops.length - MAX_DROPS)

      // big beads occasionally break loose and slide
      for (const d of drops) {
        if (!d.slide && d.r > 2.6 && Math.random() < dt * 0.25) {
          d.slide = true
          d.v = 20
        }
      }

      // sliders: accelerate with size, wobble, swallow beads, leave a trail
      const born: Drop[] = []
      for (const d of drops) {
        if (!d.slide) continue
        const target = 40 + d.r * 34
        d.v += (target - d.v) * dt * 2
        const dy = d.v * dt
        d.y += dy
        d.x += Math.sin(now / 300 + d.seed) * 0.25
        d.trail += dy
        if (d.trail > 9 + Math.random() * 14 && d.r > 1.8) {
          d.trail = 0
          born.push(bead(d.x + (Math.random() - 0.5) * 1.5, d.y - d.r * 1.6, d.r * (0.22 + Math.random() * 0.15)))
          d.r *= 0.985 // loses a little water to the trail
        }
        if (d.r < 1.4) d.slide = false
      }
      const sliders = drops.filter((d) => d.slide)
      if (sliders.length) {
        const eaten = new Set<Drop>()
        for (const s of sliders) {
          for (const b of drops) {
            if (b === s || b.slide || eaten.has(b)) continue
            if (Math.abs(b.y - s.y) < s.r + b.r && Math.abs(b.x - s.x) < s.r + b.r) {
              eaten.add(b)
              s.r = Math.min(6.5, Math.sqrt(s.r * s.r + b.r * b.r * 0.7))
            }
          }
        }
        if (eaten.size) drops = drops.filter((d) => !eaten.has(d))
      }
      drops = drops.filter((d) => d.y - d.r < h + 10)
      drops.push(...born)

      // wiper: ease toward the pointer, turn the blade across the direction of travel
      if (wiper.active) {
        if (wiper.ex < -900) {
          wiper.ex = wiper.x
          wiper.ey = wiper.y
        }
        const nx = wiper.ex + (wiper.x - wiper.ex) * 0.35
        const ny = wiper.ey + (wiper.y - wiper.ey) * 0.35
        const mvx = nx - wiper.ex
        const mvy = ny - wiper.ey
        const speed = Math.hypot(mvx, mvy)
        if (speed > 0.6) {
          const want = Math.atan2(mvy, mvx) + Math.PI / 2
          let diff = want - wiper.angle
          // a blade has no front/back: take the shorter turn either way
          diff = ((((diff + Math.PI / 2) % Math.PI) + Math.PI) % Math.PI) - Math.PI / 2
          wiper.angle += diff * 0.25
          // clear every drop inside the area the blade swept this frame
          const half = BLADE / 2
          drops = drops.filter((d) => segDist(d.x, d.y, wiper.ex, wiper.ey, nx, ny) > half + d.r)
          streaks.push({ x1: wiper.ex, y1: wiper.ey, x2: nx, y2: ny, a: 1 })
        }
        wiper.ex = nx
        wiper.ey = ny
      }
      wiper.on += ((wiper.active ? 1 : 0) - wiper.on) * 0.12
      for (let i = streaks.length - 1; i >= 0; i--) {
        streaks[i].a -= dt * 0.7
        if (streaks[i].a <= 0) streaks.splice(i, 1)
      }
      if (streaks.length > 220) streaks.splice(0, streaks.length - 220)

      draw()
      raf = requestAnimationFrame(step)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' && !(e.buttons & 1)) return
      wiper.x = e.clientX
      wiper.y = e.clientY
      wiper.active = true
    }
    const onEnd = (e: PointerEvent) => {
      if (e.pointerType === 'touch') wiper.active = false
    }
    const onLeave = () => (wiper.active = false)
    const onVis = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden) {
        last = performance.now()
        raf = requestAnimationFrame(step)
      }
    }
    const onResize = () => {
      resize()
      if (reduced) draw()
    }

    resize()
    // start with a misted mirror already beaded with drops
    drops = Array.from({ length: Math.min(MAX_DROPS, Math.round((w * h) / 2600)) }, () => bead())
    window.addEventListener('resize', onResize)
    if (reduced) draw()
    else {
      raf = requestAnimationFrame(step)
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerdown', onMove, { passive: true })
      window.addEventListener('pointerup', onEnd, { passive: true })
      window.addEventListener('pointercancel', onEnd, { passive: true })
      document.documentElement.addEventListener('pointerleave', onLeave)
      document.addEventListener('visibilitychange', onVis)
    }
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onMove)
      window.removeEventListener('pointerup', onEnd)
      window.removeEventListener('pointercancel', onEnd)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [reduced])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      {/* faint mirror sheen */}
      <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0)_35%,rgba(0,0,0,0.025)_55%,rgba(255,255,255,0)_75%)]" />
      <canvas ref={ref} className="absolute inset-0" />
    </div>
  )
}
