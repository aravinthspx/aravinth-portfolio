import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { profile } from '../content/profile'
import { useMotionPref } from '../lib/motion'

const KEY = 'aravinth-intro-seen'
/** Length of the intro reel, in ms. */
const REEL_MS = 7200

/** True the first time the home page is opened in this browser session. */
export function shouldShowIntro(pathname: string) {
  if (pathname !== '/') return false
  try {
    return sessionStorage.getItem(KEY) !== '1'
  } catch {
    return false
  }
}

// Lines revealed during the reel, each at its own moment (ms). Everything here is verified content.
const lines = [
  { at: 1700, label: 'Role', text: 'AI/ML Engineering Student' },
  { at: 2500, label: 'Studying', text: 'B.Tech CSE (AI & ML) · SRM IST Ramapuram' },
  { at: 3300, label: 'Building', text: 'Agri-Yield Pro · SITTO' },
  { at: 4100, label: 'Aiming for', text: 'Machine Learning Engineer' },
]
const TAGLINE_AT = 5000
const WELCOME_AT = 6200

/** Launch orb: monogram inside rotating rings. The thing you click to start. */
function LaunchOrb({ onLaunch, btnRef }: { onLaunch: () => void; btnRef: React.RefObject<HTMLButtonElement | null> }) {
  return (
    <motion.button
      ref={btnRef}
      type="button"
      onClick={onLaunch}
      aria-label="Launch the intro"
      className="group relative grid size-44 place-items-center rounded-full outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-accent sm:size-52"
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
    >
      {/* pulse rings */}
      {[0, 1].map((i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full border border-accent/40"
          animate={{ scale: [1, 1.55], opacity: [0.6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 1.2, ease: 'easeOut' }}
          aria-hidden="true"
        />
      ))}
      {/* rotating arcs */}
      <span className="absolute inset-0 animate-[spin_9s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(79,217,234,0.9)_70deg,transparent_140deg,transparent_200deg,rgba(159,220,116,0.8)_260deg,transparent_330deg)] p-[2px] [mask:radial-gradient(farthest-side,transparent_calc(100%-2px),black_calc(100%-2px))]" aria-hidden="true" />
      <span className="absolute inset-4 animate-[spin_14s_linear_infinite_reverse] rounded-full border border-dashed border-cream/15" aria-hidden="true" />
      {/* core */}
      <span className="absolute inset-8 rounded-full bg-[radial-gradient(circle_at_35%_30%,#16323d,#070c15_70%)] shadow-[0_0_60px_-8px_rgba(79,217,234,0.7),inset_0_0_30px_rgba(79,217,234,0.15)] transition-shadow duration-300 group-hover:shadow-[0_0_80px_-4px_rgba(79,217,234,0.95),inset_0_0_30px_rgba(79,217,234,0.25)]" aria-hidden="true" />
      <span className="relative flex flex-col items-center">
        <span className="bg-gradient-to-br from-accent-2 via-accent to-leaf bg-clip-text font-display text-4xl font-bold text-transparent sm:text-5xl">AM</span>
        <span className="mt-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-cream-2 transition-colors group-hover:text-accent">
          <svg viewBox="0 0 24 24" className="size-3" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
          Launch
        </span>
      </span>
    </motion.button>
  )
}

/** The reel: portrait zooms in, name and facts appear, a loader counts to 100, then the site opens. */
function Reel({ onDone }: { onDone: () => void }) {
  const [t, setT] = useState(0)
  const done = useRef(onDone)
  useEffect(() => {
    done.current = onDone
  }, [onDone])

  // One timeline for the whole reel; it runs once and ignores parent re-renders.
  useEffect(() => {
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const el = now - start
      setT(el)
      if (el >= REEL_MS) return done.current()
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const pct = Math.min(100, Math.round((t / REEL_MS) * 100))
  const portrait = profile.portrait

  return (
    <motion.div className="absolute inset-0 overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* light sweep */}
      <motion.div
        className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-accent/10 to-transparent blur-2xl"
        initial={{ x: '-100%' }}
        animate={{ x: '400%' }}
        transition={{ duration: 2.4, delay: 0.3, ease: 'easeInOut' }}
        aria-hidden="true"
      />

      {/* giant outlined name behind everything */}
      <motion.p
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center font-display text-[22vw] font-bold leading-none tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(79,217,234,0.18)] lg:text-[16vw]"
        initial={{ opacity: 0, scale: 1.25, letterSpacing: '0.2em' }}
        animate={{ opacity: 1, scale: 1, letterSpacing: '-0.02em' }}
        transition={{ duration: 2.2, ease: [0.2, 0.8, 0.2, 1] }}
        aria-hidden="true"
      >
        {profile.wordmark}
      </motion.p>

      <div className="container-x relative grid h-full items-center gap-6 lg:grid-cols-[1fr_1fr]">
        {/* portrait */}
        {portrait && (
          <motion.div
            className="relative order-1 mx-auto h-[30vh] sm:h-[38vh] lg:order-2 lg:h-[78vh]"
            initial={{ opacity: 0, scale: 1.35, y: 60, filter: 'blur(12px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.8, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="glow-accent absolute inset-[15%] rounded-full blur-3xl" aria-hidden="true" />
            <img
              src={portrait.src}
              srcSet={portrait.srcSet}
              sizes="(min-width: 1024px) 40vw, 60vw"
              width={portrait.width}
              height={portrait.height}
              alt={portrait.alt}
              className="relative h-full w-auto object-contain grayscale contrast-110 [mask-image:linear-gradient(to_bottom,black_78%,transparent)]"
            />
          </motion.div>
        )}

        {/* text */}
        <div className="relative order-2 text-center lg:order-1 lg:text-left">
          <motion.p
            className="font-mono text-xs uppercase tracking-[0.35em] text-accent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Hello, I’m
          </motion.p>
          <motion.h2
            className="mt-2 overflow-hidden font-display text-[clamp(2.4rem,7vw,5rem)] font-bold leading-[0.95] tracking-tight"
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: 'inset(0 0% 0 0)' }}
            transition={{ duration: 0.9, delay: 0.8, ease: [0.6, 0, 0.2, 1] }}
          >
            <span className="bg-gradient-to-r from-accent-2 via-accent to-leaf bg-clip-text text-transparent">{profile.shortName}</span> <span className="text-cream">M</span>
          </motion.h2>

          <ul className="mx-auto mt-6 max-w-md space-y-2.5 lg:mx-0">
            {lines.map((l) =>
              t >= l.at ? (
                <motion.li
                  key={l.label}
                  className="flex items-baseline justify-center gap-3 lg:justify-start"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45 }}
                >
                  <span className="w-20 shrink-0 text-right font-mono text-[10px] uppercase tracking-[0.18em] text-muted lg:text-left">{l.label}</span>
                  <span className="text-left text-sm text-cream sm:text-base">{l.text}</span>
                </motion.li>
              ) : null,
            )}
          </ul>

          <AnimatePresence>
            {t >= TAGLINE_AT && (
              <motion.p
                className="mx-auto mt-6 max-w-md border-l-2 border-leaf/60 pl-4 text-left text-sm italic leading-relaxed text-cream-2 lg:mx-0 [@media(max-height:700px)]:hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                “{profile.tagline}”
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* welcome flash */}
      <AnimatePresence>
        {t >= WELCOME_AT && (
          <motion.div
            className="pointer-events-none absolute inset-0 grid place-items-center bg-ink/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.p
              className="font-display text-3xl font-bold tracking-tight text-cream sm:text-5xl"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 16 }}
            >
              Welcome <span className="bg-gradient-to-r from-accent to-leaf bg-clip-text text-transparent">aboard.</span>
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* loader */}
      <div className="absolute inset-x-0 bottom-0 px-6 pb-6 sm:px-10">
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          <span>Loading portfolio</span>
          <span className="tabular-nums text-accent">{String(pct).padStart(3, '0')}%</span>
        </div>
        <div className="mt-2 h-px w-full bg-line">
          <div className="h-full bg-gradient-to-r from-accent to-leaf shadow-[0_0_10px_rgba(79,217,234,0.8)]" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Intro shown once per session on the home page: a launch orb, then a short skippable reel
 * introducing me before the site opens. Escape or "Skip intro" goes straight in at any point;
 * with reduced motion the orb opens the site directly.
 */
export function IntroGate({ open, onEnter }: { open: boolean; onEnter: () => void }) {
  const { reduced } = useMotionPref()
  const btn = useRef<HTMLButtonElement>(null)
  const [phase, setPhase] = useState<'gate' | 'reel'>('gate')

  const enter = useCallback(() => {
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {
      /* storage unavailable */
    }
    onEnter()
  }, [onEnter])

  const launch = () => (reduced ? enter() : setPhase('reel'))

  useEffect(() => {
    if (!open) return
    btn.current?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') enter()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, enter])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`${profile.name} — intro`}
          className="fixed inset-0 z-[70] bg-[radial-gradient(circle_at_50%_50%,rgba(6,10,19,0.35),rgba(6,10,19,0.92))]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: 'blur(6px)' }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <AnimatePresence mode="wait">
            {phase === 'gate' ? (
              <motion.div
                key="gate"
                className="absolute inset-0 grid place-items-center px-6"
                exit={{ opacity: 0, scale: 0.6, filter: 'blur(8px)' }}
                transition={{ duration: 0.45 }}
              >
                <div className="flex flex-col items-center text-center">
                  <motion.p
                    className="mb-10 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.35em] text-cream-2"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <span className="size-2 animate-pulse rounded-full bg-accent shadow-[0_0_12px_rgba(79,217,234,0.9)]" aria-hidden="true" />
                    {profile.name} · Portfolio
                  </motion.p>
                  <LaunchOrb onLaunch={launch} btnRef={btn} />
                  <motion.p className="mt-10 font-mono text-xs text-muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    Press the orb to meet me · <kbd className="text-cream-2">Esc</kbd> to skip
                  </motion.p>
                </div>
              </motion.div>
            ) : (
              <Reel key="reel" onDone={enter} />
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={enter}
            className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-line bg-ink-2/80 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-cream-2 backdrop-blur transition-colors hover:border-accent/50 hover:text-cream cursor-pointer sm:right-6 sm:top-6"
          >
            Skip intro
            <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden="true"><path d="M5 5v14l9-7zM15 5h3v14h-3z" /></svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
