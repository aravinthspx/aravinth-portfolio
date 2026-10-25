import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { hasWebGL, useOnScreen, useSeenOnce } from '../lib/hooks'
import { SMOOTH, useMotionPref } from '../lib/motion'
import { SceneBoundary } from '../three/SceneBoundary'

const ProjectScene = lazy(() => import('../three/ProjectScene'))

/** Static SVG dioramas: shown while loading and whenever WebGL is unavailable. */
function Fallback({ slug }: { slug: string }) {
  if (slug === 'agri-yield-pro')
    return (
      <svg viewBox="0 0 400 300" className="size-full" aria-hidden="true">
        <path d="M40 190 L200 110 L360 190 L200 270 Z" fill="#64794f" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M${110 + i * 15} ${175 - i * 7.5} l90 45 l-12 6 l-90 -45 z`} fill={i % 2 ? '#8fa874' : '#6b5642'} />
        ))}
        <path d="M250 160 l40 -30 l50 40 l-40 22 z" fill="#e6dfcc" opacity="0.85" />
        {[[80, 185], [96, 200], [300, 205], [318, 192]].map(([x, y], i) => (
          <path key={i} d={`M${x} ${y} l9 -24 l9 24 z`} fill="#4f6040" />
        ))}
      </svg>
    )
  return (
    <svg viewBox="0 0 400 300" className="size-full" aria-hidden="true">
      <path d="M40 180 L200 100 L360 180 L200 260 Z" fill="#1d1d1b" stroke="#3a3934" />
      <path d="M120 140 L280 220 M200 100 L200 260" stroke="#c6c2b8" strokeOpacity="0.4" strokeWidth="2" />
      {(
        [
          [130, 150, 36, '#d9a95b'],
          [205, 120, 60, '#ece6d8'],
          [255, 160, 44, '#2c2c29'],
          [165, 195, 50, '#ece6d8'],
          [240, 205, 30, '#ece6d8'],
        ] as [number, number, number, string][]
      ).map(([x, y, h, c], i) => (
        <g key={i} fill={c}>
          <path d={`M${x} ${y} l24 12 l0 ${-h} l-24 -12 z`} opacity="0.85" />
          <path d={`M${x + 24} ${y + 12} l20 -10 l0 ${-h} l-20 10 z`} opacity="0.6" />
          <path d={`M${x} ${y - h} l24 12 l20 -10 l-24 -12 z`} />
        </g>
      ))}
    </svg>
  )
}

/** The real workflow each scene stands for, told one step at a time over the diorama. */
const STEPS: Record<string, string[]> = {
  'agri-yield-pro': ['Live weather for the farm', 'Crop plan → daily tasks', 'Harvest → live mandi price'],
  sitto: ['Find a free study seat', 'Reserve it in a tap', 'Check in with a QR pass'],
}

function SceneCaption({ slug, run }: { slug: string; run: boolean }) {
  const steps = STEPS[slug] ?? []
  const [i, setI] = useState(0)
  useEffect(() => {
    if (!run || steps.length < 2) return
    const t = window.setInterval(() => setI((n) => (n + 1) % steps.length), 2800)
    return () => window.clearInterval(t)
  }, [run, steps.length])
  if (!steps.length) return null
  return (
    <div className="pointer-events-none absolute inset-x-4 top-4 z-10 flex items-start justify-between gap-3">
      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/35 py-1.5 pl-3 pr-4 backdrop-blur-md">
        <span className="font-mono text-[10px] text-white/50">0{i + 1}</span>
        <span className="relative h-4 overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={i}
              className="block whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.14em] text-white/90"
              initial={{ y: '110%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={{ y: '-110%', opacity: 0 }}
              transition={{ duration: 0.45, ease: SMOOTH }}
            >
              {steps[i]}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="flex gap-1">
          {steps.map((_, n) => (
            <span key={n} className={`h-1 rounded-full transition-all duration-500 ${n === i ? 'w-4 bg-white/90' : 'w-1 bg-white/30'}`} />
          ))}
        </span>
      </div>
      <span className="hidden rounded-full border border-white/10 bg-black/25 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/45 backdrop-blur-md sm:block">
        Illustrative 3D
      </span>
    </div>
  )
}

export function ProjectVisual({ slug }: { slug: string }) {
  const { reduced } = useMotionPref()
  const ref = useRef<HTMLDivElement>(null)
  const seen = useSeenOnce(ref)
  const onScreen = useOnScreen(ref, '0px')
  const [webgl] = useState(hasWebGL)
  const [hovered, setHovered] = useState(false)
  const green = slug === 'agri-yield-pro'

  return (
    <div
      ref={ref}
      aria-hidden="true"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={`relative aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] ${green ? 'bg-[radial-gradient(120%_90%_at_50%_10%,#16261d_0%,#080d17_72%)]' : 'bg-[radial-gradient(120%_90%_at_50%_10%,#0f2733_0%,#080d17_72%)]'}`}
    >
      <SceneCaption slug={slug} run={onScreen && !reduced} />
      {webgl && seen ? (
        <SceneBoundary fallback={<Fallback slug={slug} />}>
          <Suspense fallback={<Fallback slug={slug} />}>
            <ProjectScene slug={slug} active={onScreen} reduced={reduced} hovered={hovered} />
          </Suspense>
        </SceneBoundary>
      ) : (
        <Fallback slug={slug} />
      )}
    </div>
  )
}
