import { useEffect, useRef, useState } from 'react'

const LINKS = 'a, button, [role="button"], [role="option"], [role="tab"], select, label, summary'
const TEXT = 'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, [contenteditable="true"]'

type Kind = 'arrow' | 'hand' | 'text'

/** Shapes drawn white; mix-blend difference turns them black on white and white on black. */
const SHAPES: Record<Kind, { path: string; w: number; h: number; hot: [number, number] }> = {
  // classic pointer arrow, tip at (1,1)
  arrow: { path: 'M1 1 L1 18 L5.6 13.6 L8.6 20.6 L11.4 19.4 L8.4 12.4 L14.4 12.4 Z', w: 16, h: 22, hot: [1, 1] },
  // pointing hand, fingertip at (7,1)
  hand: {
    path: 'M7 1.5c-1 0-1.8.8-1.8 1.8v8.4l-1.3-1.4c-.7-.8-1.9-.8-2.6 0-.6.6-.6 1.6 0 2.3l4.4 5.3c1 1.2 2.4 1.9 4 1.9h3.1c2.6 0 4.7-2.1 4.7-4.7V10c0-.9-.8-1.7-1.7-1.7s-1.6.8-1.6 1.7V9.3c0-.9-.8-1.7-1.7-1.7s-1.7.8-1.7 1.7v-.6c0-.9-.7-1.7-1.6-1.7s-1.6.8-1.6 1.7V3.3C8.8 2.3 8 1.5 7 1.5Z',
    w: 19,
    h: 22,
    hot: [7, 1.5],
  },
  // text I-beam, centred
  text: { path: 'M3 1h6v1.6H6.8v14.8H9V19H3v-1.6h2.2V2.6H3Z', w: 12, h: 20, hot: [6, 10] },
}

/**
 * Custom system-style cursor that inverts what's under it: an arrow (hand over links,
 * I-beam over text fields) that is black on white areas and white on black ones.
 * Follows the pointer exactly, like the normal cursor. Mouse/trackpad only.
 */
export function Cursor() {
  const el = useRef<HTMLDivElement>(null)
  const [kind, setKind] = useState<Kind>('arrow')

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const node = el.current
    if (!fine.matches || !node) return
    document.documentElement.classList.add('has-custom-cursor')

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
      node.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
      node.style.opacity = '1'
    }
    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null
      setKind(t?.closest?.(TEXT) ? 'text' : t?.closest?.(LINKS) ? 'hand' : 'arrow')
    }
    const onLeave = () => (node.style.opacity = '0')

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [])

  const s = SHAPES[kind]
  return (
    <div ref={el} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[100] opacity-0 mix-blend-difference">
      <svg width={s.w} height={s.h} viewBox={`0 0 ${s.w} ${s.h}`} className="block" style={{ transform: `translate(${-s.hot[0]}px, ${-s.hot[1]}px)` }}>
        <path d={s.path} fill="#ffffff" />
      </svg>
    </div>
  )
}
