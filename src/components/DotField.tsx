import { useEffect, useRef } from 'react'
import { useMotionPref } from '../lib/motion'

const GAP = 26 // grid spacing (px)
const LENS = 170 // cursor influence radius (px)

type Ripple = { x: number; y: number; t0: number }

/**
 * Page background: a quiet dot grid that breathes with a slow diagonal wave, swells and parts
 * around the cursor like a lens, and sends a ripple across the page on click.
 * Static when reduced motion is on; pauses while the tab is hidden.
 */
export function DotField() {
  const ref = useRef<HTMLCanvasElement>(null)
  const { reduced } = useMotionPref()

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')!
    let w = 0
    let h = 0
    let raf = 0
    const mouse = { x: -9999, y: -9999, sx: -9999, sy: -9999, k: 0 } // sx/sy: eased position, k: presence 0..1
    const ripples: Ripple[] = []

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

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h)
      const t = time / 1000
      // ease the lens toward the pointer, fade it in/out
      mouse.sx += (mouse.x - mouse.sx) * 0.12
      mouse.sy += (mouse.y - mouse.sy) * 0.12
      mouse.k += ((mouse.x > -999 ? 1 : 0) - mouse.k) * 0.08
      for (let i = ripples.length - 1; i >= 0; i--) if (t - ripples[i].t0 > 2.2) ripples.splice(i, 1)

      const ox = (w % GAP) / 2
      const oy = (h % GAP) / 2
      for (let y = oy; y < h + GAP; y += GAP) {
        for (let x = ox; x < w + GAP; x += GAP) {
          // ambient breathing wave
          const wave = reduced ? 0 : (Math.sin(x * 0.012 + y * 0.009 - t * 0.8) + 1) / 2
          let r = 0.9 + wave * 0.35
          let a = 0.1 + wave * 0.06
          let px = x
          let py = y
          // cursor lens: grow, darken and push dots outward
          const dx = x - mouse.sx
          const dy = y - mouse.sy
          const d = Math.hypot(dx, dy)
          if (d < LENS && mouse.k > 0.01) {
            const f = (1 - d / LENS) ** 2 * mouse.k
            r += f * 2.4
            a += f * 0.55
            const push = f * 10
            px += (dx / (d || 1)) * push
            py += (dy / (d || 1)) * push
          }
          // click ripples: a ring that swells dots as it passes
          for (const rp of ripples) {
            const age = t - rp.t0
            const ring = age * 520
            const dd = Math.abs(Math.hypot(x - rp.x, y - rp.y) - ring)
            if (dd < 40) {
              const g = (1 - dd / 40) * (1 - age / 2.2)
              r += g * 2
              a += g * 0.45
            }
          }
          ctx.fillStyle = `rgba(10,10,10,${Math.min(a, 0.85).toFixed(3)})`
          ctx.beginPath()
          ctx.arc(px, py, r, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    const loop = (time: number) => {
      draw(time)
      raf = requestAnimationFrame(loop)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      mouse.x = e.clientX
      mouse.y = e.clientY
      if (mouse.sx < -999) {
        mouse.sx = e.clientX
        mouse.sy = e.clientY
      }
    }
    const onLeave = () => {
      mouse.x = mouse.y = -9999
    }
    const onDown = (e: PointerEvent) => {
      ripples.push({ x: e.clientX, y: e.clientY, t0: performance.now() / 1000 })
      if (ripples.length > 4) ripples.shift()
    }
    const onVis = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden && !reduced) raf = requestAnimationFrame(loop)
    }

    const onResize = () => {
      resize()
      if (reduced) draw(0)
    }
    resize()
    window.addEventListener('resize', onResize)
    if (reduced) draw(0)
    else {
      raf = requestAnimationFrame(loop)
      window.addEventListener('pointermove', onMove, { passive: true })
      document.documentElement.addEventListener('pointerleave', onLeave)
      window.addEventListener('pointerdown', onDown, { passive: true })
      document.addEventListener('visibilitychange', onVis)
    }
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('pointerdown', onDown)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [reduced])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      {/* soft light from the top so the grid fades toward the edges */}
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(0,0,0,0.035),transparent_70%)]" />
      <canvas ref={ref} className="absolute inset-0 [mask-image:radial-gradient(120%_90%_at_50%_40%,black_45%,transparent_100%)]" />
    </div>
  )
}
