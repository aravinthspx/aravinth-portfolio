import { useCallback, useState } from 'react'
import { motion } from 'motion/react'
import { hackathons, type Hackathon } from '../../content/records'
import { Heading, EmptyState } from '../Heading'
import { Dialog } from '../Dialog'
import { ButtonLink, ExternalIcon, Reveal } from '../ui'
import { spring } from '../../lib/motion'

const TrophyIcon = ({ className = 'size-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6" />
  </svg>
)

function HackathonCard({ h, index }: { h: Hackathon; index: number }) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const details = [
    h.team && { k: 'Team', v: `${h.team}${h.teamSize ? ` · ${h.teamSize} members` : ''}` },
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
          <h3 className="mt-4 flex items-center gap-3 font-display text-2xl font-bold text-cream sm:text-3xl">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
              <TrophyIcon className="size-5" />
            </span>
            {h.name}
          </h3>
          <p className="mt-3 text-sm text-cream-2">{h.organizer}</p>
          <p className="mt-1 font-mono text-xs text-muted">{h.format}</p>
          {h.summary && <p className="mt-4 text-sm leading-relaxed text-cream-2">{h.summary}</p>}

          {details.length > 0 && (
            <dl className="mt-5 space-y-3 text-sm">
              {details.map((d) => (
                <div key={d.k}>
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-muted">{d.k}</dt>
                  <dd className="mt-1 text-cream-2">{d.v}</dd>
                </div>
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
          {h.links && h.links.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {h.links.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/10">
                  {l.label} <ExternalIcon className="size-3.5" />
                </a>
              ))}
            </div>
          )}
        </div>

        {(h.proof || h.image) && (
          <div className="min-w-0">
            {h.image && <img src={h.image} alt={`${h.name} project screenshot`} loading="lazy" className="mb-4 w-full rounded-2xl border border-line" />}
            {h.proof && (
              <>
                <motion.button
                  type="button"
                  onClick={() => setOpen(true)}
                  whileHover={{ y: -4, rotate: -0.6 }}
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
