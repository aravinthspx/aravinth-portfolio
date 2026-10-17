import { Suspense, lazy, useRef, useState } from 'react'
import { hasWebGL, useOnScreen } from '../lib/hooks'
import { useMotionPref } from '../lib/motion'
import { SceneBoundary } from '../three/SceneBoundary'
import { profile } from '../content/profile'

const HeroScene = lazy(() => import('./HeroScene'))

// Fade the bottom of the cut-out (the photo crops the legs). The cropped knee edge is feathered in the image file.
const FADE = 'linear-gradient(to bottom, #000 72%, transparent 98%)'

/**
 * Black-and-white cut-out portrait (background removed) standing in the hero, with the
 * 3D composition floating around it. The image sits centred in a 4:5 stage so the
 * corner objects land beside the figure rather than over it.
 */
export function HeroVisual() {
  const { reduced } = useMotionPref()
  const wrap = useRef<HTMLDivElement>(null)
  const onScreen = useOnScreen(wrap)
  const [webgl] = useState(hasWebGL)
  const [live, setLive] = useState(false)
  const p = profile.portrait

  return (
    <div ref={wrap} data-interactive className="relative mx-auto aspect-[4/5] w-full max-w-[360px] sm:max-w-[460px] lg:max-w-[560px]">
      {/* soft light behind the figure */}
      <div className="glow-accent pointer-events-none absolute inset-[-10%] rounded-full blur-2xl" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-[18%] top-[14%] bottom-[10%] rounded-full bg-[radial-gradient(closest-side,rgba(241,238,231,0.07),transparent)]" aria-hidden="true" />

      {p && (
        <img
          src={p.src}
          srcSet={p.srcSet}
          sizes="(min-width: 1024px) 560px, (min-width: 640px) 460px, 360px"
          width={p.width}
          height={p.height}
          alt={p.alt}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 size-full object-contain object-bottom contrast-[1.08] grayscale"
          // Soft bottom edge instead of a hard crop line.
          style={{ maskImage: FADE, WebkitMaskImage: FADE }}
        />
      )}

      {webgl && (
        <div className="pointer-events-none absolute inset-[-12%]" aria-hidden="true">
          <SceneBoundary fallback={null}>
            <Suspense fallback={null}>
              <div className={`absolute inset-0 transition-opacity duration-700 ${live ? 'opacity-100' : 'opacity-0'}`}>
                <HeroScene active={onScreen} reduced={reduced} onReady={() => setLive(true)} />
              </div>
            </Suspense>
          </SceneBoundary>
        </div>
      )}
    </div>
  )
}
