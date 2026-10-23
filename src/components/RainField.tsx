import { useEffect, useRef } from 'react'
import { useMotionPref } from '../lib/motion'

type Streak = { x: number; y: number; len: number; speed: number; alpha: number; width: number }

const SLANT = 0.18 // horizontal drift per unit of fall (wind)

/**
 * Page background: fast drizzle. Thin dark streaks fall at full speed with a slight slant,
 * in depth layers (near = longer, darker, faster). Faint and behind the content.
 * A still scatter of streaks with reduced motion; pauses while the tab is hidden.
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

    const make = (y = Math.random() * h): Streak => {
      const depth = Math.random() // 0 = far, 1 = near
      return {
        x: Math.random() * (w + h * SLANT) - h * SLANT,
        y,
        len: 10 + depth * 22,
        speed: 1100 + depth * 1300, // px per second
        alpha: 0.08 + depth * 0.22,
        width: depth > 0.75 ? 1.4 : 1,
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
      rain = Array.from({ length: Math.round((w * h) / 5200) }, () => make())
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.lineCap = 'round'
      for (const s of rain) {
        ctx.strokeStyle = `rgba(10,10,10,${s.alpha.toFixed(3)})`
        ctx.lineWidth = s.width
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(s.x - s.len * SLANT, s.y - s.len)
        ctx.stroke()
      }
    }

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      for (const s of rain) {
        s.y += s.speed * dt
        s.x += s.speed * dt * SLANT
        if (s.y - s.len > h || s.x - s.len * SLANT > w) Object.assign(s, make(-Math.random() * 60))
      }
      draw()
      raf = requestAnimationFrame(step)
    }

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
    else raf = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [reduced])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <canvas ref={ref} className="absolute inset-0" />
    </div>
  )
}
