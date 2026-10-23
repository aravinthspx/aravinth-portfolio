import { Suspense, lazy, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { hasWebGL, useFinePointer, useOnScreen } from '../lib/hooks'
import { useMotionPref } from '../lib/motion'
import { SceneBoundary } from '../three/SceneBoundary'
import type { MoonTarget } from '../three/HeroOrbit'

const HeroOrbit = lazy(() => import('../three/HeroOrbit'))

/** CSS-only orbit rings: shown while the 3D scene loads and whenever WebGL is unavailable. */
function OrbitFallback({ framed }: { framed: boolean }) {
  return (
    <div className={`pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2 ${framed ? 'top-1/2' : 'top-[44%]'}`} aria-hidden="true">
      <div className={`orbit-slow relative rounded-full border border-accent/10 ${framed ? 'size-[min(80vw,30rem)]' : 'size-[44rem] max-w-[160vw]'}`}>
        <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_14px_rgba(0,0,0,0.27)]" />
      </div>
      <div className="absolute inset-[18%] rounded-full border border-leaf/10" />
      <div className="glow-accent absolute inset-[25%] rounded-full blur-2xl" />
    </div>
  )
}

/** Interactive 3D layer: full-bleed behind content, or `framed` to fit inside a panel. */
export function HeroStage({ onLive, framed = false }: { onLive?: (live: boolean) => void; framed?: boolean }) {
  const { reduced } = useMotionPref()
  const fine = useFinePointer()
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement>(null)
  const onScreen = useOnScreen(ref)
  const [webgl] = useState(hasWebGL)
  const [live, setLive] = useState(false)
  const mobile = !fine || window.innerWidth < 768

  const moons = useMemo<MoonTarget[]>(
    () => [
      { id: 'agri', label: 'Agri-Yield Pro', sub: 'Case study · click to open', onSelect: () => navigate('/work/agri-yield-pro') },
      { id: 'sitto', label: 'SITTO', sub: 'Case study · click to open', onSelect: () => navigate('/work/sitto') },
      { id: 'learning', label: 'Certificates', sub: '4 completed · click to view', onSelect: () => document.getElementById('certificates')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }) },
    ],
    [navigate, reduced],
  )

  return (
    <div ref={ref} className="absolute inset-0" aria-hidden="true">
      <div className={`transition-opacity duration-700 ${live ? 'opacity-0' : 'opacity-100'}`}>
        <OrbitFallback framed={framed} />
      </div>
      {webgl && (
        <SceneBoundary fallback={null}>
          <Suspense fallback={null}>
            <div className={`absolute inset-0 transition-opacity duration-1000 ${live ? 'opacity-100' : 'opacity-0'}`}>
              <HeroOrbit
                active={onScreen}
                reduced={reduced}
                mobile={mobile}
                moons={moons}
                framed={framed}
                onReady={() => {
                  setLive(true)
                  onLive?.(true)
                }}
              />
            </div>
          </Suspense>
        </SceneBoundary>
      )}
    </div>
  )
}

/** Tilts its children in 3D toward the cursor with a spring (disabled for touch and reduced motion). */
export function Tilt3D({ children, className = '', max = 8 }: { children: ReactNode; className?: string; max?: number }) {
  const { reduced } = useMotionPref()
  const fine = useFinePointer()
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 120, damping: 14 })
  const sry = useSpring(ry, { stiffness: 120, damping: 14 })

  useEffect(() => {
    if (reduced || !fine) {
      rx.set(0)
      ry.set(0)
      return
    }
    const on = (e: PointerEvent) => {
      ry.set(((e.clientX / window.innerWidth) * 2 - 1) * max)
      rx.set(-((e.clientY / window.innerHeight) * 2 - 1) * max * 0.6)
    }
    window.addEventListener('pointermove', on, { passive: true })
    return () => window.removeEventListener('pointermove', on)
  }, [reduced, fine, max, rx, ry])

  return (
    <div className={className} style={{ perspective: 900 }}>
      <motion.div style={{ rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d' }}>{children}</motion.div>
    </div>
  )
}
