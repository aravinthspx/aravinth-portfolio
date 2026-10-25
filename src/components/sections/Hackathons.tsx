import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'motion/react'
import { CountUp, ParallaxImage, TiltCard } from '../fx'
import { hackathons, type Hackathon } from '../../content/records'
import { Heading, EmptyState } from '../Heading'
import { Dialog } from '../Dialog'
import { ArrowIcon, ButtonLink, ExternalIcon, Reveal } from '../ui'
import { SMOOTH, spring, useMotionPref } from '../../lib/motion'

const TrophyIcon = ({ className = 'size-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6" />
  </svg>
)

/** Clock ring with one tick per hour of the event; ticks light up in turn when it scrolls into view. */
function HoursRing({ hours }: { hours: number }) {
  const { reduced } = useMotionPref()
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  return (
    <div className="relative grid size-24 shrink-0 place-items-center sm:size-28">
      <svg ref={ref} viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
        {Array.from({ length: hours }, (_, i) => {
          const a = (i / hours) * Math.PI * 2
          const [c, s] = [Math.cos(a), Math.sin(a)]
          return (
            <motion.line
              key={i}
              x1={50 + c * 38}
              y1={50 + s * 38}
              x2={50 + c * 47}
              y2={50 + s * 47}
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              className="text-cream"
              initial={{ opacity: reduced ? 1 : 0.12 }}
              animate={inView ? { opacity: 1 } : undefined}
              transition={{ delay: reduced ? 0 : 0.2 + i * 0.045, duration: 0.25 }}
            />
          )
        })}
      </svg>
      <div className="text-center leading-none">
        <span className="font-display text-3xl font-bold text-cream">
          <CountUp value={hours} />
        </span>
        <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-muted">hours</span>
      </div>
    </div>
  )
}

function HackathonCard({ h, index }: { h: Hackathon; index: number }) {
  const hours = Number(/(\d+)\s*hours?/i.exec(h.format ?? '')?.[1] ?? 0)
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const details = [
    h.role && { k: 'My role', v: h.role },
    h.problem && { k: 'Problem', v: h.problem },
    h.solution && { k: 'Solution', v: h.solution },
  ].filter(Boolean) as { k: string; v: string }[]

  return (
    <Reveal as="li" delay={0.06 * index} className="panel glow-ring group relative overflow-hidden rounded-3xl">
      <div className="glow-accent pointer-events-none absolute -left-24 -top-24 size-72 rounded-full blur-2xl" aria-hidden="true" />
      <div className="relative grid gap-6 p-6 md:grid-cols-[1.3fr_1fr] md:p-8">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 uppercase tracking-wider text-accent">{h.date}</span>
            {h.result && <span className="rounded-full border border-leaf/40 bg-leaf/10 px-2.5 py-0.5 uppercase tracking-wider text-leaf">{h.result}</span>}
          </div>
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h3 className="flex items-center gap-3 font-display text-2xl font-bold text-cream sm:text-3xl">
                <motion.span
                  className="grid size-10 shrink-0 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-accent"
                  whileHover={{ rotate: [0, -14, 12, -6, 0], scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <TrophyIcon className="size-5" />
                </motion.span>
                {h.name}
              </h3>
              <p className="mt-3 text-sm text-cream-2">{h.organizer}</p>
              <p className="mt-1 font-mono text-xs text-muted">{h.format}</p>
            </div>
            {hours > 0 && <HoursRing hours={hours} />}
          </div>
          {h.summary && <p className="mt-4 text-sm leading-relaxed text-cream-2">{h.summary}</p>}

          {h.team && (
            <div className="mt-5 flex items-center gap-3">
              {h.teamSize ? (
                <span className="flex -space-x-2" aria-hidden="true">
                  {Array.from({ length: h.teamSize }, (_, i) => (
                    <motion.span
                      key={i}
                      className={`size-7 rounded-full border-2 border-ink ${i === 0 ? 'bg-cream' : 'bg-ink-3'}`}
                      initial={{ scale: 0, x: -10 }}
                      whileInView={{ scale: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ ...spring, delay: 0.1 * i }}
                    />
                  ))}
                </span>
              ) : null}
              <p className="text-sm text-cream-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted">Team · </span>
                {h.team}
                {h.teamSize ? ` · ${h.teamSize} members` : ''}
              </p>
            </div>
          )}

          {details.length > 0 && (
            <dl className="relative mt-6 space-y-5 pl-6 text-sm">
              {/* line that draws down through the steps */}
              <motion.span
                aria-hidden="true"
                className="absolute bottom-2 left-[5px] top-2 w-px origin-top bg-cream/40"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1.2, ease: SMOOTH }}
              />
              {details.map((d, i) => (
                <motion.div
                  key={d.k}
                  className="relative"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ delay: 0.2 + i * 0.2, duration: 0.5, ease: SMOOTH }}
                >
                  <span className={`absolute -left-6 top-1 size-[11px] rounded-full border-2 border-cream ${d.k === 'Solution' ? 'bg-cream' : 'bg-ink'}`} aria-hidden="true" />
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-muted">{d.k}</dt>
                  <dd className="mt-1 text-cream-2">{d.v}</dd>
                </motion.div>
              ))}
            </dl>
          )}
          {h.technologies && h.technologies.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
              {h.technologies.map((t) => (
                <li key={t} className="rounded-md border border-line bg-ink-3/60 px-2 py-0.5 font-mono text-[11px] text-cream-2">{t}</li>
              ))}
            </ul>
          )}
          {(h.caseStudy || (h.links && h.links.length > 0)) && (
            <div className="mt-6 flex flex-wrap gap-2">
              {h.caseStudy && (
                <motion.span className="inline-flex" whileHover={{ x: 3 }} whileTap={{ scale: 0.96 }} transition={spring}>
                  <Link to={h.caseStudy.href} className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink shadow-[0_0_24px_-6px_rgba(0,0,0,0.24)] hover:bg-accent-2">
                    {h.caseStudy.label} <ArrowIcon className="size-4" />
                  </Link>
                </motion.span>
              )}
              {h.links?.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/10">
                  {l.label} <ExternalIcon className="size-3.5" />
                </a>
              ))}
            </div>
          )}
        </div>

        {(h.proof || h.image) && (
          <div className="min-w-0">
            {h.image && (
              <figure className="mb-4">
                <TiltCard max={6} className="rounded-2xl">
                  <ParallaxImage src={h.image} alt={`Screenshot of the project built at ${h.name}`} className="rounded-2xl border border-line" />
                </TiltCard>
                <figcaption className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-muted">Project built at the event</figcaption>
              </figure>
            )}
            {h.proof && (
              <>
                <TiltCard holo max={8} className="rounded-2xl">
                  <motion.button
                    type="button"
                    onClick={() => setOpen(true)}
                    whileTap={{ scale: 0.98 }}
                    transition={spring}
                    className="group/cert relative block w-full overflow-hidden rounded-2xl border border-line bg-cream/90 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)] cursor-zoom-in"
                    aria-label={`View certificate: ${h.name}`}
                  >
                    <img src={h.proof.thumb} alt="" loading="lazy" width={720} height={563} className="block h-auto w-full transition-transform duration-500 group-hover/cert:scale-[1.03]" />
                    <span className="absolute inset-x-3 bottom-3 rounded-xl border border-line bg-ink/85 px-3 py-2 text-left font-mono text-[11px] text-cream backdrop-blur">
                      Participation certificate · click to view
                    </span>
                  </motion.button>
                </TiltCard>
                <Dialog open={open} onClose={close} title={`${h.name} — certificate`}>
                  {open && <img src={h.proof.image} alt={h.proof.alt} className="mx-auto h-auto w-full rounded-xl" />}
                  <p className="mt-4 text-sm">
                    <a href={h.proof.image} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-accent-2 underline underline-offset-4 hover:text-cream">
                      Open the original file <ExternalIcon className="size-3.5" />
                    </a>
                  </p>
                </Dialog>
              </>
            )}
          </div>
        )}
      </div>
    </Reveal>
  )
}

/** Hackathons from src/content/records.ts — shows an empty state until real entries exist. */
export function HackathonsSection() {
  return (
    <section id="hackathons" aria-labelledby="hackathons-title" className="relative py-24 md:py-32">
      <div className="container-x">
        <Heading pill="Build sprints" title="Hackathons" id="hackathons-title">
          {hackathons.length ? 'Time-boxed builds with a team, a theme and a deadline.' : undefined}
        </Heading>

        {hackathons.length === 0 ? (
          <EmptyState
            icon={<TrophyIcon />}
            title="Your next hackathon story starts here."
            body="Hackathon projects, teams and results will appear here. Building something for a hackathon? I’m always open to teaming up."
            action={
              <ButtonLink to="#contact" variant="ghost">
                Team up with me
              </ButtonLink>
            }
          />
        ) : (
          <ul className={`mx-auto grid gap-6 ${hackathons.length > 1 ? 'lg:grid-cols-2' : 'max-w-5xl'}`}>
            {hackathons.map((h, i) => (
              <HackathonCard key={h.id} h={h} index={i} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
