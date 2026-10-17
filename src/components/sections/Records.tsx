import { Link } from 'react-router-dom'
import { education, experience, achievements, blogPosts } from '../../content/records'
import { formatDate } from '../../content/certificates'
import { Heading } from '../Heading'
import { ArrowIcon, ExternalIcon, Reveal } from '../ui'

/* ------------------------------ Education ------------------------------- */
export function EducationSection() {
  if (!education.length) return null
  return (
    <section id="education" aria-labelledby="education-title" className="relative py-24 md:py-32">
      <div className="container-x">
        <Heading pill="Academic path" title="Education" id="education-title" />
        <ul className="mx-auto grid max-w-4xl gap-6">
          {education.map((e) => {
            const years = [e.startYear, e.graduationYear ? `${e.graduationYear} (expected)` : null].filter(Boolean).join(' – ')
            return (
              <Reveal as="li" key={e.institution + e.degree} className="panel glow-ring relative overflow-hidden rounded-3xl p-6 md:p-8">
                <div className="glow-accent pointer-events-none absolute -right-20 -top-20 size-64 rounded-full blur-2xl" aria-hidden="true" />
                <div className="relative flex flex-col gap-6 md:flex-row md:items-start">
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-accent/30 bg-accent/10 text-accent" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m2 9 10-5 10 5-10 5L2 9Zm4 2v5c2 2 10 2 12 0v-5M22 9v6" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    {years && <p className="font-mono text-xs text-accent">{years}</p>}
                    <h3 className="font-display text-2xl font-bold text-cream">{e.degree}</h3>
                    <p className="mt-1 text-cream-2">{e.department}</p>
                    <p className="mt-1 text-sm text-muted">{e.institution}</p>

                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                      {e.coursework.length > 0 && (
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Relevant coursework</p>
                          <ul className="mt-2 space-y-1.5 text-sm text-cream-2">
                            {e.coursework.map((c) => (
                              <li key={c} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {e.projects.length > 0 && (
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Academic projects</p>
                          <ul className="mt-2 space-y-2 text-sm">
                            {e.projects.map((p) => (
                              <li key={p.name}>
                                {p.href ? (
                                  <Link to={p.href} className="inline-flex items-center gap-1.5 font-semibold text-accent hover:text-accent-2">
                                    {p.name} <ArrowIcon className="size-3.5" />
                                  </Link>
                                ) : (
                                  <span className="font-semibold text-cream">{p.name}</span>
                                )}
                                {p.note && <span className="block text-xs text-muted">{p.note}</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    {e.achievements.length > 0 && (
                      <ul className="mt-5 space-y-1 text-sm text-cream-2">
                        {e.achievements.map((a) => (
                          <li key={a}>★ {a}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/* ------------------------------ Experience ------------------------------ */
export function ExperienceSection() {
  if (!experience.length) return null
  return (
    <section id="experience" aria-labelledby="experience-title" className="relative py-24 md:py-32">
      <div className="container-x">
        <Heading pill="Where I’ve contributed" title="Experience" id="experience-title" />
        <ol className="relative mx-auto max-w-3xl border-l border-line pl-8">
          {experience.map((x, i) => (
            <Reveal as="li" key={x.id} delay={0.06 * i} className="relative pb-10 last:pb-0">
              <span className="absolute -left-[41px] top-1.5 size-4 rounded-full border-2 border-ink bg-accent shadow-[0_0_12px_rgba(79,217,234,0.9)]" aria-hidden="true" />
              <p className="font-mono text-xs text-accent">{x.start} – {x.end} · {x.kind}</p>
              <h3 className="mt-1 font-display text-xl font-bold text-cream">{x.role}</h3>
              <p className="text-sm text-cream-2">{x.organization}</p>
              <ul className="mt-3 space-y-1.5 text-sm text-cream-2">
                {x.responsibilities.map((r) => (
                  <li key={r} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-leaf" aria-hidden="true" />{r}</li>
                ))}
              </ul>
              {x.technologies && (
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {x.technologies.map((t) => <li key={t} className="rounded-md border border-line px-2 py-0.5 font-mono text-[11px] text-cream-2">{t}</li>)}
                </ul>
              )}
              {x.links?.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="mr-3 mt-3 inline-flex items-center gap-1 text-sm text-accent">{l.label} <ExternalIcon className="size-3.5" /></a>
              ))}
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ----------------------------- Achievements ----------------------------- */
export function AchievementsSection() {
  if (!achievements.length) return null
  return (
    <section id="achievements" aria-labelledby="achievements-title" className="relative py-24 md:py-32">
      <div className="container-x">
        <Heading pill="Verified milestones" title="Achievements" id="achievements-title" />
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a, i) => (
            <Reveal as="li" key={a.id} delay={0.06 * i} className="panel overflow-hidden rounded-3xl">
              {a.image && <img src={a.image} alt={`${a.title} — supporting image`} loading="lazy" className="aspect-[16/9] w-full object-cover" />}
              <div className="p-6">
                <p className="font-mono text-xs text-leaf">{a.date} · {a.event}</p>
                <h3 className="mt-2 font-display text-xl font-bold text-cream">{a.title}</h3>
                <p className="mt-2 text-sm text-cream-2">{a.description}</p>
                {a.link && (
                  <a href={a.link.url} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent">{a.link.label} <ArrowIcon className="size-3.5" /></a>
                )}
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* --------------------------------- Blog --------------------------------- */
export function BlogSection() {
  if (!blogPosts.length) return null
  const posts = [...blogPosts].sort((a, b) => b.date.localeCompare(a.date))
  return (
    <section id="blog" aria-labelledby="blog-title" className="relative py-24 md:py-32">
      <div className="container-x">
        <Heading pill="Notes & learnings" title="Blog" id="blog-title" />
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <Reveal as="li" key={p.slug} delay={0.06 * i}>
              <Link to={`/blog/${p.slug}`} className="panel group block h-full overflow-hidden rounded-3xl transition-colors hover:border-accent/40">
                {p.cover && <img src={p.cover} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />}
                <div className="p-6">
                  <p className="font-mono text-[11px] text-muted">
                    <span className="text-accent">{p.category}</span> · {formatDate(p.date)} · {p.readingMinutes} min read
                  </p>
                  <h3 className="mt-2 font-display text-xl font-bold text-cream group-hover:text-accent-2">{p.title}</h3>
                  <p className="mt-2 text-sm text-cream-2">{p.summary}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
