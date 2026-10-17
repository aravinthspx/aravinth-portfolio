import { direction } from '../../content/profile'
import { Heading } from '../Heading'
import { Reveal } from '../ui'

function GoalCard({ tone, icon, label, title, quote, detail, delay }: { tone: 'accent' | 'leaf'; icon: 'flag' | 'star'; label: string; title: string; quote: string; detail: string; delay: number }) {
  const c = tone === 'accent' ? { text: 'text-accent', chip: 'border-accent/40 bg-accent/10 text-accent', glow: 'glow-accent' } : { text: 'text-leaf', chip: 'border-leaf/40 bg-leaf/10 text-leaf', glow: 'glow-warm' }
  return (
    <Reveal delay={delay} className="panel group relative h-full overflow-hidden rounded-3xl p-6 transition-colors hover:border-accent/40 sm:p-8">
      <div className={`${c.glow} pointer-events-none absolute -right-16 -top-16 size-56 rounded-full blur-2xl transition-opacity group-hover:opacity-100`} aria-hidden="true" />
      <div className="relative flex items-center gap-3">
        <span className={`grid size-11 place-items-center rounded-xl border ${c.chip}`} aria-hidden="true">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            {icon === 'flag' ? <path d="M5 21V4m0 0h11l-2 4 2 4H5" /> : <path d="M12 3l2.6 5.6L20 9.4l-4 3.9.9 5.7L12 16.3 7.1 19l.9-5.7-4-3.9 5.4-.8L12 3Z" />}
          </svg>
        </span>
        <span className={`font-mono text-[11px] font-semibold uppercase tracking-[0.18em] ${c.text}`}>{label}</span>
      </div>
      <h3 className="relative mt-5 font-display text-2xl font-bold text-cream">{title}</h3>
      <p className="relative mt-3 text-lg leading-relaxed text-cream">“{quote}”</p>
      <p className="relative mt-3 text-sm leading-relaxed text-cream-2">{detail}</p>
    </Reveal>
  )
}

/** "Where I'm heading": short-term objective, longer-term direction, and a guiding conviction. */
export function DirectionSection() {
  return (
    <section id="direction" aria-labelledby="direction-title" className="relative py-24 md:py-32">
      <div className="container-x">
        <Heading pill="Direction & north star" title="Where I’m heading" id="direction-title">
          Goals grounded in what I’m building now — not claims about what I’ve already done.
        </Heading>
        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
          <GoalCard tone="accent" icon="flag" {...direction.shortTerm} delay={0} />
          <GoalCard tone="leaf" icon="star" {...direction.vision} delay={0.08} />
        </div>
        <Reveal delay={0.12} className="relative mx-auto mt-5 max-w-5xl overflow-hidden rounded-3xl border border-accent/25 bg-[linear-gradient(120deg,rgba(79,217,234,0.08),rgba(159,220,116,0.06))] px-6 py-8 text-center sm:px-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">The guiding conviction</p>
          <p className="mx-auto mt-3 max-w-3xl font-display text-xl font-semibold leading-snug text-cream sm:text-2xl">“{direction.conviction}”</p>
        </Reveal>
      </div>
    </section>
  )
}
