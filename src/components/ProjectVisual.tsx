import { Suspense, lazy, useRef, useState } from 'react'
import { hasWebGL, useOnScreen, useSeenOnce } from '../lib/hooks'
import { useMotionPref } from '../lib/motion'
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
