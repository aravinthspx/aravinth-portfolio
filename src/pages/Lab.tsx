import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { SITE_TITLE } from '../lib/meta'
import { spring } from '../lib/motion'
import { KMeansDemo } from '../components/lab/KMeans'
import { RegressionDemo } from '../components/lab/Regression'
import { NeuralNetDemo } from '../components/lab/NeuralNet'
import { ParticleTitle } from '../components/lab/ParticleTitle'
import { ArrowIcon } from '../components/ui'

const demos = [
  { id: 'kmeans', n: '01', label: 'K-means', long: 'K-means clustering', El: KMeansDemo },
  { id: 'regression', n: '02', label: 'Regression', long: 'Linear regression', El: RegressionDemo },
  { id: 'neural-net', n: '03', label: 'Neural net', long: 'Neural network', El: NeuralNetDemo },
] as const

const TITLE = ['Machine learning,', 'you can touch.']
const TERMS = ['Gradient descent', 'Backpropagation', 'K-means++', 'Loss landscape', 'Decision boundary', 'Sigmoid', 'tanh', 'Least squares', 'Centroids', 'Epochs', 'Learning rate', 'Inertia']

/** Content wipes in from the side you're heading towards. */
const wipe = {
  enter: (dir: number) => ({ clipPath: dir > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)', x: dir * 40 }),
  center: { clipPath: 'inset(0 0% 0 0%)', x: 0, transition: { duration: 0.65, ease: [0.76, 0, 0.24, 1] as const } },
  exit: (dir: number) => ({ clipPath: dir > 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)', x: dir * -40, transition: { duration: 0.45, ease: [0.76, 0, 0.24, 1] as const } }),
}

/** /lab — interactive machine-learning experiments, written from scratch, running entirely in the browser. */
export default function Lab() {
  const { hash } = useLocation()
  const fromHash = demos.findIndex((d) => `#${d.id}` === hash)
  const [active, setActive] = useState(fromHash >= 0 ? fromHash : 0)
  const [dir, setDir] = useState(1)
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = 'ML Playground | Aravinth M'
    return () => {
      document.title = SITE_TITLE
    }
  }, [])

  // Deep links like /lab#regression open that experiment.
  useEffect(() => {
    if (fromHash >= 0) setActive(fromHash)
  }, [fromHash])

  const go = useCallback(
    (i: number, scroll = false) => {
      const next = (i + demos.length) % demos.length
      if (next === active) return
      setDir(next > active ? 1 : -1)
      setActive(next)
      window.history.replaceState(null, '', `#${demos[next].id}`)
      if (scroll && bar.current) window.scrollTo({ top: bar.current.getBoundingClientRect().top + window.scrollY - 64, behavior: 'smooth' })
    },
    [active],
  )

  // Keyboard: 1 / 2 / 3 or ← → to switch experiments (ignored while typing or on a slider).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (e.ctrlKey || e.metaKey || e.altKey || t.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]')) return
      if (['1', '2', '3'].includes(e.key)) go(Number(e.key) - 1)
      else if (e.key === 'ArrowRight') go(active + 1)
      else if (e.key === 'ArrowLeft') go(active - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, active])

  const Current = demos[active].El
  const next = demos[(active + 1) % demos.length]

  return (
    <article className="pb-24 pt-28 md:pt-36">
      {/* Hero */}
      <header className="container-x">
        <motion.p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-muted" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <span className="relative flex size-2" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-cream opacity-50 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2 rounded-full bg-cream" />
          </span>
          ML Playground · live in your browser
        </motion.p>
        <h1 className="sr-only">{TITLE.join(' ')}</h1>
        <div className="mt-6">
          <ParticleTitle lines={TITLE} />
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <motion.p className="max-w-xl text-lg leading-relaxed text-cream-2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            Three classic algorithms I wrote from scratch in TypeScript — no ML libraries. Add data, press train, and watch them learn. <span className="text-cream">Move your cursor through the title.</span>
          </motion.p>
          <motion.p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
            Keys <kbd className="rounded border border-line px-1">1</kbd> <kbd className="rounded border border-line px-1">2</kbd> <kbd className="rounded border border-line px-1">3</kbd> or <kbd className="rounded border border-line px-1">←</kbd> <kbd className="rounded border border-line px-1">→</kbd> switch
          </motion.p>
        </div>
      </header>

      {/* Marquee band */}
      <div className="mt-14 -rotate-1 overflow-hidden bg-cream py-3 text-ink" aria-hidden="true">
        <div className="marquee flex w-max gap-8 whitespace-nowrap font-display text-xl font-bold uppercase tracking-tight md:text-2xl">
          {[...TERMS, ...TERMS].map((t, i) => (
            <span key={i} className="flex items-center gap-8">
              {t}
              <span className="text-transparent [-webkit-text-stroke:1px_#ffffff]">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Experiment switcher */}
      <div ref={bar} className="sticky top-16 z-30 mt-14 border-y border-line bg-ink/85 backdrop-blur-xl md:top-20">
        <div className="container-x flex items-center gap-2 overflow-x-auto py-3" role="tablist" aria-label="Experiments">
          {demos.map((d, i) => {
            const on = i === active
            return (
              <button
                key={d.id}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls="lab-panel"
                onClick={() => go(i)}
                className={`relative flex shrink-0 items-center gap-3 rounded-full px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${on ? 'text-ink' : 'text-cream-2 hover:text-cream'}`}
              >
                {on && <motion.span layoutId="lab-tab" className="absolute inset-0 rounded-full bg-cream" transition={spring} aria-hidden="true" />}
                <span className={`relative font-mono text-[11px] ${on ? 'text-ink/60' : 'text-muted'}`}>{d.n}</span>
                <span className="relative">{d.label}</span>
              </button>
            )
          })}
          <div className="ml-auto hidden h-1 w-40 overflow-hidden rounded-full bg-ink-3 sm:block" aria-hidden="true">
            <motion.div className="h-full bg-cream" animate={{ width: `${((active + 1) / demos.length) * 100}%` }} transition={spring} />
          </div>
        </div>
      </div>

      <div className="container-x overflow-x-clip" id="lab-panel" role="tabpanel" aria-label={demos[active].long}>
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div key={demos[active].id} custom={dir} variants={wipe} initial="enter" animate="center" exit="exit">
            <Current />
          </motion.div>
        </AnimatePresence>

        {/* Next experiment */}
        <motion.button
          type="button"
          onClick={() => go(active + 1, true)}
          className="group mt-4 flex w-full items-center justify-between gap-6 rounded-3xl border border-line px-6 py-8 text-left transition-colors hover:bg-cream hover:text-ink md:px-10 cursor-pointer"
          whileTap={{ scale: 0.99 }}
        >
          <span>
            <span className="block font-mono text-[11px] uppercase tracking-[0.2em] text-muted group-hover:text-ink/60">Next experiment · {next.n}</span>
            <span className="mt-2 block font-display text-3xl font-bold tracking-tight md:text-5xl">{next.long}</span>
          </span>
          <span className="grid size-14 shrink-0 place-items-center rounded-full border border-current transition-transform duration-300 group-hover:translate-x-2 md:size-20">
            <ArrowIcon className="size-6" />
          </span>
        </motion.button>

        <footer className="mt-6 grid gap-6 rounded-3xl bg-cream p-8 text-ink md:grid-cols-[1fr_auto] md:items-center md:p-12">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/60">Honest note</p>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed">
              These are teaching-sized demos on toy data, built to show how the algorithms work — not production models. Nothing you add leaves your browser.
            </p>
          </div>
          <Link to={{ pathname: '/', hash: '#projects' }} className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-ink-3">
            See my real projects <ArrowIcon />
          </Link>
        </footer>
      </div>
    </article>
  )
}
