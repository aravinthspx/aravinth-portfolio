import Lenis from 'lenis'

/** The active smooth-scroll instance (null when reduced motion is on or before start). */
let lenis: Lenis | null = null

/**
 * In-page links like href="#projects": cancel the browser's instant jump (it would desync the
 * smooth scroller), record the hash so the router sees it, and glide there once.
 */
function onAnchorClick(e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  const a = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
  if (!a || a.target === '_blank') return
  const hash = a.getAttribute('href')!
  const el = hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null
  if (!el) return
  e.preventDefault()
  if (window.location.hash !== hash) {
    window.history.pushState(null, '', hash)
    // Let the router know; its hash handler then scrolls (see HashScroller in App).
    window.dispatchEvent(new PopStateEvent('popstate'))
  } else scrollToTarget(el)
}

/**
 * Starts inertia ("smooth") scrolling for the whole page. Returns a cleanup function.
 * Pauses automatically whenever something locks the page (body overflow: hidden) —
 * dialogs, the command palette and the intro — so the page behind them can't drift.
 */
export function startSmoothScroll() {
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => 1 - Math.pow(1 - t, 4),
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.4,
  })
  let raf = requestAnimationFrame(function loop(time) {
    lenis?.raf(time)
    raf = requestAnimationFrame(loop)
  })
  const sync = () => (document.body.style.overflow === 'hidden' ? lenis?.stop() : lenis?.start())
  const mo = new MutationObserver(sync)
  mo.observe(document.body, { attributes: true, attributeFilter: ['style'] })
  sync()
  document.addEventListener('click', onAnchorClick)
  return () => {
    cancelAnimationFrame(raf)
    mo.disconnect()
    document.removeEventListener('click', onAnchorClick)
    lenis?.destroy()
    lenis = null
  }
}

/** Scrolls to an element (or the top), smoothly when smooth scrolling is active. */
export function scrollToTarget(target: HTMLElement | 0, opts: { immediate?: boolean } = {}) {
  if (lenis) {
    lenis.scrollTo(target, { offset: target === 0 ? 0 : -80, immediate: opts.immediate, duration: 1.3 })
    return
  }
  if (target === 0) window.scrollTo(0, 0)
  else target.scrollIntoView()
}
