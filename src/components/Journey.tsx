import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'motion/react'
import { journey, type Milestone } from '../content/focus'
import { useMotionPref, spring } from '../lib/motion'
import { ArrowIcon } from './ui'

type Tone = { text: string; chip: string; ring: string; glow: string; dot: string; beam: string; card: string }

const tones: Record<Milestone['kind'], Tone> = {
  Project: { text: 'text-accent', chip: 'border-accent/40 bg-accent/10 text-accent', ring: 'border-accent/60', glow: 'shadow-[0_0_30px_-4px_rgba(0,0,0,0.24)]', dot: 'bg-accent', beam: 'from-accent', card: 'border-accent/40 shadow-[0_0_44px_-14px_rgba(0,0,0,0.15)]' },
  'Job simulation': { text: 'text-leaf', chip: 'border-leaf/40 bg-leaf/10 text-leaf', ring: 'border-leaf/60', glow: 'shadow-[0_0_30px_-4px_rgba(212,212,212,0.8)]', dot: 'bg-leaf', beam: 'from-leaf', card: 'border-leaf/40 shadow-[0_0_44px_-14px_rgba(212,212,212,0.45)]' },
  Hackathon: { text: 'text-accent-2', chip: 'border-accent-2/40 bg-accent-2/10 text-accent-2', ring: 'border-accent-2/60', glow: 'shadow-[0_0_30px_-4px_rgba(217,217,217,0.8)]', dot: 'bg-accent-2', beam: 'from-accent-2', card: 'border-accent-2/40 shadow-[0_0_44px_-14px_rgba(217,217,217,0.45)]' },
  Certificate: { text: 'text-warm', chip: 'border-warm/40 bg-warm/10 text-warm', ring: 'border-warm/60', glow: 'shadow-[0_0_30px_-4px_rgba(163,163,163,0.8)]', dot: 'bg-warm', beam: 'from-warm', card: 'border-warm/40 shadow-[0_0_44px_-14px_rgba(163,163,163,0.45)]' },
  Next: { text: 'text-muted', chip: 'border-dashed border-cream-2/30 bg-transparent text-cream-2', ring: 'border-dashed border-cream-2/50', glow: '', dot: 'bg-cream-2', beam: 'from-cream-2', card: 'border-dashed border-cream-2/30' },
  Now: { text: 'text-cream', chip: 'border-cream-2/40 bg-cream-2/10 text-cream', ring: 'border-cream/60', glow: 'shadow-[0_0_30px_-4px_rgba(245,245,245,0.7)]', dot: 'bg-cream', beam: 'from-cream', card: 'border-cream-2/40 shadow-[0_0_44px_-14px_rgba(245,245,245,0.35)]' },
}

function KindIcon({ kind }: { kind: Milestone['kind'] }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden="true" {...p}>
      {kind === 'Project' && <path d="M5 15c-1 1.5-1 4-1 4s2.5 0 4-1M9 15l-3-3c1.5-4 5-7.5 11-8-.5 6-4 9.5-8 11Zm4-6.5a1.5 1.5 0 1 0 0-.01" />}
      {kind === 'Job simulation' && <path d="M4 8h16v11H4zM9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M4 13h16" />}
      {kind === 'Hackathon' && <path d="M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6" />}
      {kind === 'Certificate' && <path d="M12 3 9.5 8.5 4 9.3l4 3.9-.9 5.8L12 16.3l4.9 2.7-.9-5.8 4-3.9-5.5-.8L12 3Z" />}
      {kind === 'Next' && <path d="M5 12h14M13 6l6 6-6 6" />}
      {kind === 'Now' && <path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />}
    </svg>
  )
}

const legend = [
  { label: 'Projects', dot: 'bg-accent' },
  { label: 'Hackathons', dot: 'bg-accent-2' },
  { label: 'Courses & simulations', dot: 'bg-warm' },
  { label: 'Up next', dot: 'border border-dashed border-cream-2 bg-transparent' },
]

/** Faint constellation decoration behind the timeline. */
function Constellation() {
  const stars = [
    [8, 12], [18, 30], [12, 52], [24, 70], [10, 88], [88, 18], [80, 38], [92, 58], [78, 76], [90, 92],
  ]
  return (
    <svg className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={stars.slice(0, 5).map((s) => s.join(',')).join(' ')} fill="none" stroke="rgba(0,0,0,0.036)" strokeWidth="0.15" />
      <polyline points={stars.slice(5).map((s) => s.join(',')).join(' ')} fill="none" stroke="rgba(212,212,212,0.1)" strokeWidth="0.15" />
      {stars.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="0.35" fill={i < 5 ? 'rgba(217,217,217,0.6)' : 'rgba(235,235,235,0.5)'} />
      ))}
    </svg>
  )
}

/**
 * Scroll-driven constellation timeline. As the list scrolls through the viewport a glowing
 * line fills and a comet travels down it; each milestone node lights up when reached, a beam
 * draws out to its card, and the card swings in from its side.
 */
export function Journey() {
  const { reduced } = useMotionPref()
  const listRef = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 75%', 'end 55%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.6 })
  const cometTop = useTransform(progress, (v) => `${Math.min(100, Math.max(0, v * 100))}%`)
  const n = journey.length
  const [reached, setReached] = useState(reduced ? n - 1 : -1)

  useMotionValueEvent(progress, 'change', (v) => {
    if (reduced) return
    const idx = Math.floor(v * (n - 1) + 0.08)
    setReached((r) => (r === idx ? r : idx))
  })

  const lit = (i: number) => reduced || i <= reached

  return (
    <div className="relative mx-auto max-w-5xl">
      <Constellation />
      <div className="relative mb-10 flex flex-col items-center gap-4">
        <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 font-mono text-[11px] text-cream-2" aria-label="Legend">
          {legend.map((l) => (
            <li key={l.label} className="flex items-center gap-2">
              <span className={`size-2.5 rounded-full ${l.dot}`} aria-hidden="true" />
              {l.label}
            </li>
          ))}
        </ul>
        <p className="rounded-full border border-accent/30 bg-ink-2/80 px-4 py-1.5 font-mono text-[11px] text-cream-2 backdrop-blur" aria-live="polite">
          <span className="text-accent">● Active node</span> · {reached >= 0 ? journey[Math.min(reached, n - 1)].title : 'Scroll to travel the timeline'}
        </p>
      </div>
      <ol ref={listRef} className="relative">
        {/* track + glowing fill + comet */}
        <span className="absolute bottom-6 left-[21px] top-6 w-px bg-line md:left-1/2" aria-hidden="true" />
        <motion.span
          className="absolute bottom-6 left-[21px] top-6 w-[2px] origin-top -translate-x-[0.5px] bg-gradient-to-b from-accent via-leaf to-warm md:left-1/2"
          style={{ scaleY: reduced ? 1 : progress }}
          aria-hidden="true"
        />
        {!reduced && (
          <span className="pointer-events-none absolute bottom-6 left-[21px] top-6 md:left-1/2" aria-hidden="true">
            <motion.span className="absolute left-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_18px_6px_rgba(0,0,0,0.225)]" style={{ top: cometTop }} />
          </span>
        )}

        {journey.map((m, i) => {
          const right = i % 2 === 1
          const t = tones[m.kind]
          const on = lit(i)
          return (
            <li key={m.title} className="relative grid grid-cols-[44px_1fr] gap-4 pb-12 last:pb-0 md:grid-cols-2 md:gap-16">
              {/* node */}
              <span className="absolute left-[21px] top-6 z-10 -translate-x-1/2 md:left-1/2" aria-hidden="true">
                <motion.span
                  className={`grid size-11 place-items-center rounded-full border-2 bg-ink transition-colors duration-500 ${on ? `${t.ring} ${t.text} ${t.glow}` : 'border-line text-muted'}`}
                  animate={on && !reduced ? { scale: [1, 1.25, 1.08] } : { scale: 1 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  <KindIcon kind={m.kind} />
                </motion.span>
                {on && !reduced && <span className={`absolute inset-0 animate-ping rounded-full opacity-30 [animation-duration:2.4s] ${t.dot}`} />}
              </span>

              {/* beam from node to card (desktop) */}
              <motion.span
                className={`absolute top-[45px] hidden h-px md:block ${right ? 'left-1/2 bg-gradient-to-r' : 'right-1/2 bg-gradient-to-l'} ${t.beam} to-transparent`}
                style={{ width: '4rem', transformOrigin: right ? 'left' : 'right' }}
                initial={false}
                animate={{ scaleX: on ? 1 : 0, opacity: on ? 1 : 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                aria-hidden="true"
              />

              <div className={`col-start-2 ${right ? 'md:col-start-2' : 'md:col-start-1 md:row-start-1'}`} style={{ perspective: 1000 }}>
                <motion.div
                  className={`group panel relative overflow-hidden rounded-2xl p-5 transition-[border-color,box-shadow] duration-500 sm:p-6 ${on ? t.card : ''}`}
                  initial={reduced ? false : { opacity: 0, x: right ? 70 : -70, rotateY: right ? -18 : 18 }}
                  whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                  viewport={{ once: true, margin: '0px 0px -12% 0px' }}
                  transition={{ type: 'spring', stiffness: 110, damping: 16 }}
                  whileHover={reduced ? undefined : { y: -4, rotateY: right ? -3 : 3 }}
                >
                  {/* oversized step number */}
                  <span className="outline-text pointer-events-none absolute -right-1 -top-4 select-none font-display text-[5.5rem] font-bold leading-none" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={`absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b ${t.beam} to-transparent transition-opacity duration-500 ${on ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true" />

                  <div className="relative flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${t.chip}`}>{m.kind}</span>
                    <span className="font-mono text-xs text-muted">{m.when}</span>
                  </div>
                  <h3 className="relative mt-3 font-display text-xl font-bold text-cream sm:text-2xl">{m.title}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-cream-2">{m.body}</p>
                  {m.href && (
                    <motion.span className="relative mt-4 inline-block" whileHover={{ x: 4 }} transition={spring}>
                      <Link to={m.href} className={`inline-flex items-center gap-1.5 text-sm font-semibold ${t.text} hover:brightness-125`}>
                        {m.href.startsWith('/work') ? 'Read case study' : 'View details'} <span className="sr-only">: {m.title}</span>
                        <ArrowIcon className="size-3.5" />
                      </Link>
                    </motion.span>
                  )}
                </motion.div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
