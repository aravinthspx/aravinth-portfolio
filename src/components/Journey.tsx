import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { journey, type Milestone } from '../content/focus'
import { ArrowIcon } from './ui'

const kindTone: Record<Milestone['kind'], string> = {
  Project: 'border-accent/40 bg-accent/10 text-accent',
  'Job simulation': 'border-leaf/40 bg-leaf/10 text-leaf',
  Certificate: 'border-warm/40 bg-warm/10 text-warm',
  Now: 'border-cream-2/40 bg-cream-2/10 text-cream',
}

/** Constellation-style timeline: glowing star nodes joined by a faint line. */
export function Journey() {
  return (
    <ol className="relative mx-auto max-w-4xl">
      {/* the constellation line */}
      <span className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-accent/60 via-leaf/40 to-transparent md:left-1/2" aria-hidden="true" />
      {journey.map((m, i) => {
        const right = i % 2 === 1
        return (
          <motion.li
            key={m.title}
            className="relative grid grid-cols-[32px_1fr] gap-4 pb-10 last:pb-0 md:grid-cols-2 md:gap-12"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 0.6, delay: 0.05 * i }}
          >
            {/* star node */}
            <span className="absolute left-[15px] top-5 -translate-x-1/2 md:left-1/2" aria-hidden="true">
              <span className="absolute inset-[-8px] animate-ping rounded-full bg-accent/20 [animation-duration:3s]" />
              <span className={`relative block size-3.5 rounded-full border-2 border-ink ${m.kind === 'Now' ? 'bg-leaf shadow-[0_0_14px_rgba(159,220,116,0.9)]' : 'bg-accent shadow-[0_0_14px_rgba(79,217,234,0.9)]'}`} />
            </span>
            <div className={`col-start-2 ${right ? 'md:col-start-2' : 'md:col-start-1 md:row-start-1 md:text-right'}`}>
              <div className={`panel inline-block w-full rounded-2xl p-5 text-left transition-colors hover:border-accent/40 ${right ? '' : 'md:ml-auto'}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${kindTone[m.kind]}`}>{m.kind}</span>
                  <span className="font-mono text-xs text-muted">{m.when}</span>
                </div>
                <h3 className="mt-3 font-display text-xl font-bold text-cream">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream-2">{m.body}</p>
                {m.href && (
                  <Link to={m.href} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-2">
                    Read case study <span className="sr-only">: {m.title}</span>
                    <ArrowIcon className="size-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </motion.li>
        )
      })}
    </ol>
  )
}
