import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowIcon, Reveal } from '../ui'
import { spring } from '../../lib/motion'

const demos = [
  { n: '01', title: 'K-means clustering', body: 'Watch centroids find groups in unlabelled data.' },
  { n: '02', title: 'Linear regression', body: 'Train a line with gradient descent, live.' },
  { n: '03', title: 'Neural network', body: 'See a network bend its decision boundary.' },
]

/** Home-page band that points to the ML Playground at /lab. */
export function LabTeaser() {
  return (
    <section aria-labelledby="lab-teaser-title" className="relative py-16 md:py-24">
      <div className="container-x">
        <Reveal className="overflow-hidden rounded-[2rem] bg-cream text-ink">
          <div className="grid gap-10 p-8 md:p-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/60">New · ML Playground</p>
              <h2 id="lab-teaser-title" className="mt-4 font-display text-4xl font-bold leading-[1] tracking-tight md:text-5xl">
                Don’t just read about it.
                <br />
                <span className="text-transparent [-webkit-text-stroke:1.5px_#ffffff]">Train a model.</span>
              </h2>
              <p className="mt-5 max-w-md text-ink/75">Three machine-learning algorithms I wrote from scratch, running live in your browser. Add data, press train, watch them learn.</p>
              <motion.span className="mt-8 inline-flex" whileHover={{ x: 4 }} whileTap={{ scale: 0.96 }} transition={spring}>
                <Link to="/lab" className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-ink-3">
                  Open the playground <ArrowIcon />
                </Link>
              </motion.span>
            </div>
            <ul className="grid gap-3">
              {demos.map((d) => (
                <li key={d.n}>
                  <Link to={{ pathname: '/lab', hash: `#${d.n === '01' ? 'kmeans' : d.n === '02' ? 'regression' : 'neural-net'}` }} className="group flex items-center gap-5 rounded-2xl border border-ink/15 px-5 py-4 transition-colors hover:bg-ink hover:text-cream">
                    <span className="font-display text-3xl font-bold text-transparent [-webkit-text-stroke:1px_#ffffff] group-hover:[-webkit-text-stroke:1px_#0a0a0a]">{d.n}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-lg font-semibold">{d.title}</span>
                      <span className="block text-sm opacity-70">{d.body}</span>
                    </span>
                    <ArrowIcon className="size-4 shrink-0 transition-transform group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
