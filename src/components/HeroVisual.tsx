import { Component, Suspense, lazy, useRef, useState, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { hasWebGL, useOnScreen, useFinePointer } from '../lib/hooks'
import { useMotionPref } from '../lib/motion'
import { toolbox } from '../content/profile'

const HeroScene = lazy(() => import('./HeroScene'))

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/** Pure SVG/CSS composition used before WebGL loads, or when it is unavailable. */
export function StaticHeroArt() {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="core" cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#c4b5fd" />
          <stop offset="0.45" stopColor="#7c4dff" />
          <stop offset="1" stopColor="#2e1065" />
        </radialGradient>
        <linearGradient id="block" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fffaf2" />
          <stop offset="1" stopColor="#bdb5a8" />
        </linearGradient>
      </defs>
      <ellipse cx="200" cy="205" rx="150" ry="46" fill="none" stroke="#22d3ee" strokeWidth="2" opacity="0.8" transform="rotate(-12 200 205)" />
      <circle cx="200" cy="200" r="88" fill="url(#core)" />
      <rect x="292" y="96" width="34" height="56" rx="8" fill="url(#block)" transform="rotate(14 309 124)" />
      <rect x="326" y="160" width="24" height="36" rx="6" fill="url(#block)" opacity="0.8" />
      <path d="M78 262 l26 -26 26 26 -26 26z" fill="#a78bfa" />
      <circle cx="96" cy="112" r="11" fill="#22d3ee" />
      <circle cx="270" cy="302" r="16" fill="none" stroke="#f4efe6" strokeWidth="9" />
    </svg>
  )
}

export function HeroVisual() {
  const { reduced } = useMotionPref()
  const fine = useFinePointer()
  const wrap = useRef<HTMLDivElement>(null)
  const onScreen = useOnScreen(wrap)
  const [webgl] = useState(hasWebGL)

  // Pointer-driven parallax for the HTML chip layer (desktop only).
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 120, damping: 18 })
  const sy = useSpring(my, { stiffness: 120, damping: 18 })
  const tx = useTransform(sx, (v) => v * 18)
  const ty = useTransform(sy, (v) => v * 18)

  const onMove = (e: React.PointerEvent) => {
    if (!fine || reduced || !wrap.current) return
    const r = wrap.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }

  const chips = toolbox.slice(0, 6)
  const chipPos = ['left-[2%] top-[14%]', 'right-[4%] top-[6%]', 'left-[-2%] bottom-[22%]', 'right-[0%] bottom-[14%]', 'left-[30%] bottom-[2%]', 'right-[28%] top-[-2%]']

  return (
    <div ref={wrap} onPointerMove={onMove} onPointerLeave={() => { mx.set(0); my.set(0) }} className="relative aspect-square w-full max-w-[560px] mx-auto">
      <div className="glow-violet absolute inset-[-10%] rounded-full blur-2xl" aria-hidden="true" />
      <div className="glow-cyan absolute right-[-10%] bottom-[-5%] size-2/3 rounded-full blur-2xl" aria-hidden="true" />

      <div className="absolute inset-0">
        {webgl ? (
          <SceneBoundary fallback={<StaticHeroArt />}>
            <Suspense fallback={<StaticHeroArt />}>
              <HeroScene active={onScreen} reduced={reduced} />
            </Suspense>
          </SceneBoundary>
        ) : (
          <StaticHeroArt />
        )}
      </div>

      {/* Floating technology chips — tools used in the documented projects */}
      <motion.ul style={{ x: tx, y: ty }} className="pointer-events-none absolute inset-0" aria-label="Tools used in my projects">
        {chips.map((c, i) => (
          <li
            key={c}
            className={`float absolute rounded-full border border-line bg-ink-2/80 px-3 py-1.5 font-mono text-[11px] text-cream-2 shadow-lg backdrop-blur-md sm:text-xs ${chipPos[i]}`}
            style={{ animationDelay: `${i * -1.1}s`, ['--r' as string]: `${(i % 2 ? 1 : -1) * 4}deg` }}
          >
            {c}
          </li>
        ))}
      </motion.ul>
    </div>
  )
}
