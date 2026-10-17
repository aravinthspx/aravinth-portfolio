import { Suspense, lazy, useEffect, useState } from 'react'
import { hasWebGL, useFinePointer } from '../lib/hooks'
import { useMotionPref } from '../lib/motion'
import { installPointer } from '../lib/pointer'
import { SceneBoundary } from '../three/SceneBoundary'

const BackgroundScene = lazy(() => import('../three/BackgroundScene'))

/** CSS-only backdrop used before the 3D scene loads, or when WebGL is unavailable. */
function StaticBackdrop() {
  return (
    <div className="absolute inset-0">
      <div className="absolute -left-24 top-24 size-72 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(241,238,231,0.10),rgba(241,238,231,0.02)_60%,transparent_70%)]" />
      <div className="absolute -right-16 top-[55%] size-56 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(185,215,122,0.08),transparent_70%)]" />
    </div>
  )
}

export function AmbientBackground() {
  const { reduced } = useMotionPref()
  const fine = useFinePointer()
  const [webgl] = useState(hasWebGL)
  const [ready, setReady] = useState(false)
  const [dim, setDim] = useState(false)
  const mobile = !fine || window.innerWidth < 768

  // Load the 3D scene after first paint so it never delays content.
  useEffect(() => {
    installPointer()
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }
    if (w.requestIdleCallback) w.requestIdleCallback(() => setReady(true), { timeout: 1500 })
    else setTimeout(() => setReady(true), 600)
  }, [])

  // Fade the background back once the visitor scrolls past the hero, protecting readability.
  useEffect(() => {
    const on = () => setDim(window.scrollY > window.innerHeight * 0.55)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-700"
      style={{ opacity: dim ? (mobile ? 0.35 : 0.6) : 1 }}
    >
      {webgl && ready ? (
        <SceneBoundary fallback={<StaticBackdrop />}>
          <Suspense fallback={<StaticBackdrop />}>
            <BackgroundScene reduced={reduced} mobile={mobile} />
          </Suspense>
        </SceneBoundary>
      ) : (
        <StaticBackdrop />
      )}
    </div>
  )
}
