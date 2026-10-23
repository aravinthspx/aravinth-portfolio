import { useEffect, useRef } from 'react'
import { useMotionPref } from '../lib/motion'

const INTERACTIVE = 'a, button, [role="button"], [role="option"], [role="tab"], input, textarea, select, label, summary'

/**
 * Custom cursor that inverts what's under it (mix-blend difference): black on white
 * areas, white on black ones. A dot sits exactly on the pointer; a ring glides after it
 * and grows over links and buttons. Mouse/trackpad only — touch keeps its normal behaviour.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const { reduced } = useMotionPref()

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!fine.matches) return
    const d = dot.current
    const r = ring.current
    if (!d || !r) return
    document.documentElement.classList.add('has-custom-cursor')

    const pos = { x: -100, y: -100, rx: -100, ry: -100, scale: 1, target: 1, shown: 0, want: 0, down: 0 }
    let raf = 0

    const loop = () => {
      // ring follows with a soft lag (instant when motion is reduced)
      const k = reduced ? 1 : 0.18
      pos.rx += (pos.x - pos.rx) * k
      pos.ry += (pos.y - pos.ry) * k
      pos.scale += (pos.target - pos.scale) * (reduced ? 1 : 0.2)
      pos.shown += (pos.want - pos.shown) * 0.25
      pos.down += (0 - pos.down) * 0.2
      const s = pos.scale * (1 - pos.down * 0.25)
      d.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scale(${pos.target > 1 ? 0 : 1})`
      r.style.transform = `translate3d(${pos.rx}px, ${pos.ry}px, 0) translate(-50%, -50%) scale(${s})`
      d.style.opacity = r.style.opacity = String(pos.shown)
      raf = requestAnimationFrame(loop)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
      pos.x = e.clientX
      pos.y = e.clientY
      if (pos.want === 0) {
        pos.rx = pos.x
        pos.ry = pos.y
      }
      pos.want = 1
    }
    const onOver = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(INTERACTIVE)
      pos.target = el ? 2.2 : 1
    }
    const onDown = () => (pos.down = 1)
    const onLeave = () => (pos.want = 0)

    raf = requestAnimationFrame(loop)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerdown', onDown)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [reduced])

  return (
    <>
      <div ref={ring} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[100] size-8 rounded-full border-[1.5px] border-white opacity-0 mix-blend-difference" />
      <div ref={dot} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[100] size-2 rounded-full bg-white opacity-0 mix-blend-difference" />
    </>
  )
}
