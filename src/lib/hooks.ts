import { useEffect, useState, type RefObject } from 'react'

export function hasWebGL() {
  // Append ?no3d to any URL to preview the static fallback.
  if (new URLSearchParams(window.location.search).has('no3d')) return false
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}

/** True while the element is (nearly) on screen. Used to pause offscreen 3D rendering. */
export function useOnScreen(ref: RefObject<Element | null>, rootMargin = '100px') {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin])
  return visible
}

export function useFinePointer() {
  const [fine, setFine] = useState(() => window.matchMedia('(hover: hover) and (pointer: fine)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const on = () => setFine(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return fine
}

/** Becomes true the first time the element nears the viewport, then stays true (for lazy mounting). */
export function useSeenOnce(ref: RefObject<Element | null>, rootMargin = '300px') {
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    if (!('IntersectionObserver' in window)) {
      setSeen(true)
      return
    }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin, seen])
  return seen
}
