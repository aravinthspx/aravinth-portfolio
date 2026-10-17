import { Suspense, lazy, useRef, useState } from 'react'
import { hasWebGL, useOnScreen } from '../lib/hooks'
import { useMotionPref } from '../lib/motion'
import { SceneBoundary } from '../three/SceneBoundary'

const HeroScene = lazy(() => import('./HeroScene'))

/** Pure SVG composition used before WebGL loads, or when it is unavailable. */
export function StaticHeroArt() {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="hb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a2a27" />
          <stop offset="1" stopColor="#141412" />
        </linearGradient>
        <radialGradient id="hg" cx="35%" cy="30%" r="70%">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#e9efe4" stopOpacity="0.12" />
          <stop offset="1" stopColor="#e9efe4" stopOpacity="0.04" />
        </radialGradient>
        <linearGradient id="hc" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8d8c87" />
          <stop offset="0.5" stopColor="#f4f3ef" />
          <stop offset="1" stopColor="#7a7974" />
        </linearGradient>
      </defs>
      <rect x="120" y="105" width="150" height="150" rx="30" fill="url(#hb)" transform="rotate(18 195 180)" />
      <ellipse cx="205" cy="190" rx="150" ry="44" fill="none" stroke="url(#hc)" strokeWidth="6" transform="rotate(-14 205 190)" />
      <circle cx="268" cy="238" r="64" fill="url(#hg)" stroke="rgba(255,255,255,0.25)" />
      <rect x="282" y="78" width="20" height="58" rx="10" fill="#ece6d8" transform="rotate(40 292 107)" />
      <circle cx="96" cy="292" r="28" fill="#8fa874" />
    </svg>
  )
}

export function HeroVisual() {
  const { reduced } = useMotionPref()
  const wrap = useRef<HTMLDivElement>(null)
  const onScreen = useOnScreen(wrap)
  const [webgl] = useState(hasWebGL)
  const [live, setLive] = useState(false)

  return (
    <div ref={wrap} className="relative mx-auto aspect-square w-full max-w-[540px]">
      <div className="glow-accent absolute inset-[-8%] rounded-full blur-2xl" aria-hidden="true" />
      <div className="absolute inset-0" aria-hidden="true">
        {/* Static art stays underneath until the first 3D frame is ready, then cross-fades out. */}
        <div className={`absolute inset-0 transition-opacity duration-700 ${live ? 'opacity-0' : 'opacity-100'}`}>
          <StaticHeroArt />
        </div>
        {webgl && (
          <SceneBoundary fallback={null}>
            <Suspense fallback={null}>
              <div className={`absolute inset-0 transition-opacity duration-700 ${live ? 'opacity-100' : 'opacity-0'}`}>
                <HeroScene active={onScreen} reduced={reduced} onReady={() => setLive(true)} />
              </div>
            </Suspense>
          </SceneBoundary>
        )}
      </div>
    </div>
  )
}
