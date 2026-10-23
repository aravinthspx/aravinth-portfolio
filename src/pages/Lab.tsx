import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { SITE_TITLE } from '../lib/meta'
import { KMeansDemo } from '../components/lab/KMeans'
import { RegressionDemo } from '../components/lab/Regression'
import { NeuralNetDemo } from '../components/lab/NeuralNet'
import { ArrowIcon } from '../components/ui'

const demos = [
  { id: 'kmeans', n: '01', label: 'K-means clustering' },
  { id: 'regression', n: '02', label: 'Linear regression' },
  { id: 'neural-net', n: '03', label: 'Neural network' },
]

/** /lab — interactive machine-learning demos, written from scratch, running entirely in the browser. */
export default function Lab() {
  useEffect(() => {
    document.title = 'ML Playground | Aravinth M'
    return () => {
      document.title = SITE_TITLE
    }
  }, [])

  return (
    <article className="container-x pb-24 pt-28 md:pt-36">
      <header className="grid gap-10 border-b border-line pb-14 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div>
          <motion.p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            ML Playground · runs in your browser
          </motion.p>
          <motion.h1
            className="mt-4 font-display text-[clamp(2.6rem,7vw,5.5rem)] font-bold leading-[0.95] tracking-tight text-cream"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.2, 0.8, 0.2, 1] }}
          >
            Machine learning,
            <br />
            <span className="text-transparent [-webkit-text-stroke:2px_#0a0a0a]">you can touch.</span>
          </motion.h1>
          <motion.p className="mt-6 max-w-xl text-lg leading-relaxed text-cream-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
            Three classic algorithms I wrote from scratch in TypeScript — no ML libraries. Click to add data, press train, and watch them learn in real time.
          </motion.p>
        </div>
        <motion.nav aria-label="Demos on this page" className="grid gap-2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          {demos.map((d) => (
            <a key={d.id} href={`#${d.id}`} className="group flex items-center justify-between rounded-2xl border border-line px-5 py-4 transition-colors hover:border-cream hover:bg-cream hover:text-ink">
              <span className="flex items-baseline gap-4">
                <span className="font-mono text-xs text-muted group-hover:text-ink/60">{d.n}</span>
                <span className="font-display text-lg font-semibold">{d.label}</span>
              </span>
              <ArrowIcon className="size-4 rotate-90 transition-transform group-hover:translate-y-0.5" />
            </a>
          ))}
        </motion.nav>
      </header>

      <KMeansDemo />
      <RegressionDemo />
      <NeuralNetDemo />

      <footer className="mt-4 grid gap-6 rounded-3xl bg-cream p-8 text-ink md:grid-cols-[1fr_auto] md:items-center md:p-12">
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
    </article>
  )
}
