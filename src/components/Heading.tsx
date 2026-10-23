import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { Reveal } from './ui'
import { SMOOTH } from '../lib/motion'

/** Title words rise one after another from behind a mask and come into focus. */
export function BounceWords({ text, delay = 0.08 }: { text: string; delay?: number }) {
  const words = text.split(' ')
  return (
    <motion.span
      className="inline"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ staggerChildren: 0.08, delayChildren: delay }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom" aria-hidden="true">
          <motion.span
            className="inline-block"
            variants={{ hidden: { y: '110%', opacity: 0, filter: 'blur(6px)' }, show: { y: '0%', opacity: 1, filter: 'blur(0px)', transition: { duration: 1, ease: SMOOTH } } }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}

/** Centred section heading: glowing pill eyebrow, big title, accent bar. */
export function Heading({ pill, title, id, children }: { pill: string; title: ReactNode; id: string; children?: ReactNode }) {
  return (
    <Reveal className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
      <p className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/5 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
        <span className="size-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(0,0,0,0.27)]" aria-hidden="true" />
        {pill}
      </p>
      <h2 id={id} className="mt-5 font-display text-3xl font-bold tracking-tight text-cream sm:text-4xl md:text-5xl">
        {typeof title === 'string' ? <BounceWords text={title} /> : title}
      </h2>
      <motion.span
        className="mx-auto mt-5 block h-1 w-16 origin-left rounded-full bg-gradient-to-r from-accent to-leaf"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.45, ease: SMOOTH }}
        aria-hidden="true"
      />
      {children && <div className="mt-5 text-lg leading-relaxed text-cream-2">{children}</div>}
    </Reveal>
  )
}

/** Friendly placeholder for a section that has no entries yet. */
export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <Reveal className="panel relative mx-auto max-w-2xl overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" aria-hidden="true" />
      <div className="glow-accent pointer-events-none absolute left-1/2 top-0 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl" aria-hidden="true" />
      <span className="relative mx-auto grid size-14 place-items-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">{icon}</span>
      <p className="relative mt-5 font-display text-2xl font-bold text-cream">{title}</p>
      <p className="relative mx-auto mt-2 max-w-md text-cream-2">{body}</p>
      {action && <div className="relative mt-6 flex justify-center">{action}</div>}
    </Reveal>
  )
}
