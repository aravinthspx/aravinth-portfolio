/**
 * One shared window-level pointer tracker for every 3D scene. Canvases stay
 * `pointer-events: none` where they sit behind content, so scenes read the
 * pointer from here instead of from their own DOM events.
 */
export const pointer = {
  /** Normalised device coords, -1..1 (y up) */
  x: 0,
  y: 0,
  /** Client pixels */
  px: -9999,
  py: -9999,
  inside: false,
  type: 'mouse' as string,
}

type DownHandler = (e: PointerEvent) => void
const downHandlers = new Set<DownHandler>()
let installed = false

function update(e: PointerEvent) {
  pointer.px = e.clientX
  pointer.py = e.clientY
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1
  pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
  pointer.type = e.pointerType
  pointer.inside = true
}

export function installPointer() {
  if (installed || typeof window === 'undefined') return
  installed = true
  window.addEventListener('pointermove', update, { passive: true })
  window.addEventListener(
    'pointerdown',
    (e) => {
      update(e)
      downHandlers.forEach((fn) => fn(e))
    },
    { passive: true },
  )
  document.documentElement.addEventListener('pointerleave', () => {
    pointer.inside = false
    pointer.px = pointer.py = -9999
  })
  window.addEventListener('blur', () => (pointer.inside = false))
}

export function onPointerDown(fn: DownHandler) {
  installPointer()
  downHandlers.add(fn)
  return () => {
    downHandlers.delete(fn)
  }
}

/** Clicks on real controls should never also trigger background effects. */
export function isInteractiveTarget(t: EventTarget | null) {
  return t instanceof Element && !!t.closest('a,button,input,textarea,select,label,summary,dialog,[role="tab"],[role="button"],[data-interactive]')
}
