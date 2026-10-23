import { useEffect, useRef } from 'react'
import { useMotionPref } from '../lib/motion'

/** Fine lines every 28px plus stronger "major" lines every 4 cells. */
const lines = (minor: string, major: string) =>
  [
    `linear-gradient(to right, ${major} 1px, transparent 1px)`,
    `linear-gradient(to bottom, ${major} 1px, transparent 1px)`,
    `linear-gradient(to right, ${minor} 1px, transparent 1px)`,
    `linear-gradient(to bottom, ${minor} 1px, transparent 1px)`,
  ].join(',')
const SIZE = '112px 112px, 112px 112px, 28px 28px, 28px 28px'

/**
 * Page background: a thin architectural grid that drifts slowly, with a soft spotlight that
 * follows the cursor and brings out a darker copy of the grid beneath it. A click pulses the
 * spotlight. Static (no drift, no spotlight) with reduced motion.
 */
export function GridField() {
  const spot = useRef<HTMLDivElement>(null)
  const { reduced } = useMotionPref()

  useEffect(() => {
    const el = spot.current
    if (!el || reduced) return
    const target = { x: window.innerWidth / 2, y: window.innerHeight * 0.3, on: 0 }
    const cur = { x: target.x, y: target.y, on: 0, r: 260 }
    let pulse = 0
    let raf = 0

    const loop = () => {
      // ease position, presence and radius so the light glides instead of snapping
      cur.x += (target.x - cur.x) * 0.1
      cur.y += (target.y - cur.y) * 0.1
      cur.on += (target.on - cur.on) * 0.06
      pulse *= 0.93
      cur.r = 260 + pulse * 160
      el.style.setProperty('--mx', `${cur.x}px`)
      el.style.setProperty('--my', `${cur.y}px`)
      el.style.setProperty('--r', `${cur.r}px`)
      el.style.opacity = String(cur.on)
      raf = requestAnimationFrame(loop)
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      target.x = e.clientX
      target.y = e.clientY
      target.on = 1
    }
    const onLeave = () => (target.on = 0)
    const onDown = () => (pulse = 1)
    const onVis = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden) raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('pointerdown', onDown, { passive: true })
    document.addEventListener('visibilitychange', onVis)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('pointerdown', onDown)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [reduced])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* base grid, faint, drifting */}
      <div
        className="grid-drift absolute -inset-[112px] [mask-image:radial-gradient(110%_85%_at_50%_35%,black_40%,transparent_100%)]"
        style={{ backgroundImage: lines('rgba(10,10,10,0.045)', 'rgba(10,10,10,0.08)'), backgroundSize: SIZE }}
      />
      {/* spotlight: the same grid, darker, visible only around the cursor */}
      <div
        ref={spot}
        className="absolute inset-0 opacity-0"
        style={{ maskImage: 'radial-gradient(var(--r, 260px) circle at var(--mx, 50%) var(--my, 30%), black, transparent 70%)', WebkitMaskImage: 'radial-gradient(var(--r, 260px) circle at var(--mx, 50%) var(--my, 30%), black, transparent 70%)' }}
      >
        <div className="grid-drift absolute -inset-[112px]" style={{ backgroundImage: lines('rgba(10,10,10,0.16)', 'rgba(10,10,10,0.3)'), backgroundSize: SIZE }} />
        <div className="absolute inset-0 bg-[radial-gradient(var(--r,260px)_circle_at_var(--mx,50%)_var(--my,30%),rgba(0,0,0,0.035),transparent_70%)]" />
      </div>
      {/* soft light from the top */}
      <div className="absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(255,255,255,0.9),transparent_70%)]" />
    </div>
  )
}
