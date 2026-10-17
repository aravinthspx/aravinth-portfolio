import { useEffect, useRef } from 'react'
import { useMotionPref } from '../lib/motion'
import { pointer, installPointer, onPointerDown, isInteractiveTarget } from '../lib/pointer'

/*
 * Lightweight 2D-canvas starfield behind the whole site (no WebGL needed).
 * Stars twinkle, drift with depth parallax as you scroll and move the cursor,
 * part gently around the cursor, and a click on empty space sends out a soft ring.
 * Occasional shooting stars cross the sky. Reduced motion draws one still frame.
 */

type Star = { x: number; y: number; z: number; r: number; a: number; tw: number; ph: number; c: string; ox: number; oy: number }
type Shot = { x: number; y: number; vx: number; vy: number; life: number; max: number }
type Ring = { x: number; y: number; t: number }

const COLORS = [
  ['#ffffff', 0.68],
  ['#a2eef7', 0.18],
  ['#c6eda8', 0.09],
  ['#f1d39a', 0.05],
] as const

function pickColor(r: number) {
  let acc = 0
  for (const [c, p] of COLORS) {
    acc += p
    if (r <= acc) return c
  }
  return '#ffffff'
}

export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null)
  const { reduced } = useMotionPref()

  useEffect(() => {
    installPointer()
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let w = 0
    let h = 0
    let dpr = 1
    let stars: Star[] = []
    const shots: Shot[] = []
    const rings: Ring[] = []
    let raf = 0
    let nextShot = performance.now() + 2500
    let last = performance.now()
    let px = 0
    let py = 0

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round(Math.min(520, (w * h) / (w < 768 ? 3400 : 2400)))
      stars = Array.from({ length: count }, () => {
        const z = Math.random() ** 1.6 * 0.9 + 0.1 // more far stars than near ones
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          r: 0.35 + z * 1.25,
          a: 0.25 + z * 0.65,
          tw: 0.6 + Math.random() * 1.8,
          ph: Math.random() * Math.PI * 2,
          c: pickColor(Math.random()),
          ox: 0,
          oy: 0,
        }
      })
    }

    const draw = (now: number, animate: boolean) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      ctx.clearRect(0, 0, w, h)

      // Ease the parallax offset toward the pointer.
      const fine = pointer.inside && pointer.type === 'mouse'
      const tx = animate && fine ? pointer.x : 0
      const ty = animate && fine ? pointer.y : 0
      px += (tx - px) * Math.min(1, dt * 3)
      py += (ty - py) * Math.min(1, dt * 3)
      const scroll = animate ? window.scrollY : 0

      for (const s of stars) {
        let x = s.x - px * 18 * s.z
        let y = (((s.y - scroll * 0.06 * s.z + py * 12 * s.z) % h) + h) % h

        // Stars part softly around the cursor and drift back.
        if (animate && fine) {
          const dx = x - pointer.px
          const dy = y - pointer.py
          const d = Math.hypot(dx, dy)
          if (d < 130 && d > 0.01) {
            const f = (1 - d / 130) * 14 * s.z
            s.ox += ((dx / d) * f - s.ox) * 0.12
            s.oy += ((dy / d) * f - s.oy) * 0.12
          } else {
            s.ox *= 0.92
            s.oy *= 0.92
          }
        }
        x += s.ox
        y += s.oy

        const twinkle = animate ? 0.65 + 0.35 * Math.sin(now / 1000 * s.tw + s.ph) : 0.85
        const near = fine && animate ? Math.max(0, 1 - Math.hypot(x - pointer.px, y - pointer.py) / 160) : 0
        ctx.globalAlpha = Math.min(1, s.a * twinkle + near * 0.5)
        ctx.fillStyle = s.c
        ctx.beginPath()
        ctx.arc(x, y, s.r + near * 0.8, 0, Math.PI * 2)
        ctx.fill()
      }

      if (animate) {
        // Shooting stars
        if (now > nextShot) {
          const fromLeft = Math.random() < 0.5
          shots.push({
            x: fromLeft ? Math.random() * w * 0.5 : w * 0.5 + Math.random() * w * 0.5,
            y: Math.random() * h * 0.35,
            vx: (fromLeft ? 1 : -1) * (520 + Math.random() * 280),
            vy: 220 + Math.random() * 140,
            life: 0,
            max: 0.9 + Math.random() * 0.5,
          })
          nextShot = now + 5000 + Math.random() * 6000
        }
        for (let i = shots.length - 1; i >= 0; i--) {
          const s = shots[i]
          s.life += dt
          s.x += s.vx * dt
          s.y += s.vy * dt
          const k = 1 - s.life / s.max
          if (k <= 0) {
            shots.splice(i, 1)
            continue
          }
          const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 0.12, s.y - s.vy * 0.12)
          g.addColorStop(0, `rgba(210,248,255,${0.85 * k})`)
          g.addColorStop(1, 'rgba(210,248,255,0)')
          ctx.globalAlpha = 1
          ctx.strokeStyle = g
          ctx.lineWidth = 1.4
          ctx.beginPath()
          ctx.moveTo(s.x, s.y)
          ctx.lineTo(s.x - s.vx * 0.12, s.y - s.vy * 0.12)
          ctx.stroke()
        }
        // Click rings
        for (let i = rings.length - 1; i >= 0; i--) {
          const r = rings[i]
          r.t += dt * 1.6
          if (r.t >= 1) {
            rings.splice(i, 1)
            continue
          }
          ctx.globalAlpha = (1 - r.t) * 0.55
          ctx.strokeStyle = '#4fd9ea'
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.arc(r.x, r.y, 8 + r.t * 70, 0, Math.PI * 2)
          ctx.stroke()
        }
      }
      ctx.globalAlpha = 1
    }

    const loop = (now: number) => {
      draw(now, true)
      raf = requestAnimationFrame(loop)
    }

    build()
    if (reduced) draw(performance.now(), false)
    else raf = requestAnimationFrame(loop)

    const onResize = () => {
      build()
      if (reduced) draw(performance.now(), false)
    }
    window.addEventListener('resize', onResize)
    const offDown = onPointerDown((e) => {
      if (reduced || isInteractiveTarget(e.target)) return
      rings.push({ x: e.clientX, y: e.clientY, t: 0 })
      for (const s of stars) {
        const d = Math.hypot(s.x - e.clientX, s.y - e.clientY)
        if (d < 120) s.a = Math.min(1, s.a + 0.3)
      }
    })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      offDown()
    }
  }, [reduced])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      {/* deep-space wash: faint nebula glows under the stars */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(79,217,234,0.07),transparent_70%),radial-gradient(40%_40%_at_85%_70%,rgba(159,220,116,0.05),transparent_70%),radial-gradient(50%_50%_at_10%_80%,rgba(79,217,234,0.04),transparent_70%)]" />
      <canvas ref={ref} className="absolute inset-0 size-full" />
    </div>
  )
}
