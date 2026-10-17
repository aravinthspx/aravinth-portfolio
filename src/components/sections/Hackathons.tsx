import { hackathons } from '../../content/records'
import { Heading, EmptyState } from '../Heading'
import { ButtonLink, ExternalIcon, Reveal } from '../ui'

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6" />
  </svg>
)

/** Hackathons from src/content/records.ts — shows an empty state until real entries exist. */
export function HackathonsSection() {
  return (
    <section id="hackathons" aria-labelledby="hackathons-title" className="relative py-24 md:py-32">
      <div className="container-x">
        <Heading pill="Build sprints" title="Hackathons" id="hackathons-title">
          {hackathons.length ? 'Problems tackled under time pressure, with the teams I built alongside.' : undefined}
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
          <ul className="grid gap-6 lg:grid-cols-2">
            {hackathons.map((h, i) => (
              <Reveal as="li" key={h.id} delay={0.06 * i} className="panel overflow-hidden rounded-3xl">
                {h.image && <img src={h.image} alt={`${h.name} project screenshot`} loading="lazy" className="aspect-[16/9] w-full object-cover" />}
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted">
                    <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 uppercase tracking-wider text-accent">{h.date}</span>
                    <span>{h.organizer}</span>
                    <span>· {h.format}</span>
                    {h.result && <span className="rounded-full border border-leaf/40 bg-leaf/10 px-2 py-0.5 uppercase tracking-wider text-leaf">{h.result}</span>}
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-bold text-cream">{h.name}</h3>
                  {(h.team || h.role) && (
                    <p className="mt-1 text-sm text-cream-2">
                      {h.team && <>Team {h.team}{h.teamSize ? ` (${h.teamSize})` : ''}</>}
                      {h.team && h.role && ' · '}
                      {h.role}
                    </p>
                  )}
                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="font-mono text-[10px] uppercase tracking-wider text-muted">Problem</dt>
                      <dd className="mt-1 text-cream-2">{h.problem}</dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[10px] uppercase tracking-wider text-muted">Solution</dt>
                      <dd className="mt-1 text-cream-2">{h.solution}</dd>
                    </div>
                  </dl>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {h.technologies.map((t) => (
                      <li key={t} className="rounded-md border border-line bg-ink-3/60 px-2 py-0.5 font-mono text-[11px] text-cream-2">{t}</li>
                    ))}
                  </ul>
                  {(h.links?.length || h.proof) && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {h.links?.map((l) => (
                        <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/10">
                          {l.label} <ExternalIcon className="size-3.5" />
                        </a>
                      ))}
                      {h.proof && (
                        <a href={h.proof} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-cream-2 hover:border-accent/40">
                          Certificate <ExternalIcon className="size-3.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
