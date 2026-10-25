import { Link } from 'react-router-dom'
import { education, experience, achievements, blogPosts } from '../../content/records'
import { formatDate } from '../../content/certificates'
import { Heading } from '../Heading'
import { ArrowIcon, ExternalIcon, Reveal } from '../ui'
import { motion } from 'motion/react'
import { CountUp, TiltCard } from '../fx'
import { SMOOTH } from '../../lib/motion'

/* ------------------------------ Education ------------------------------- */
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12 2.5 2.5 4.5-5" />
  </svg>
)

/** CGPA as a ring that fills to value/scale while the number counts up. */
function CgpaDial({ value, scale }: { value: number; scale: number }) {
  const r = 52
  const len = 2 * Math.PI * r
  const decimals = String(value).split('.')[1]?.length ?? 0
  return (
    <TiltCard max={10} className="rounded-2xl">
      <div className="flex shrink-0 items-center gap-5 rounded-2xl border border-warm/40 bg-ink-2 px-6 py-5 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.25)]">
        <div className="relative grid size-32 place-items-center">
          <svg viewBox="0 0 120 120" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
            <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-line" />
            <motion.circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className="text-cream"
              strokeDasharray={len}
              initial={{ strokeDashoffset: len }}
              whileInView={{ strokeDashoffset: len * (1 - value / scale) }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 1.6, ease: SMOOTH }}
            />
          </svg>
          <p className="text-center leading-none">
            <span className="font-display text-4xl font-bold text-cream">
              <CountUp value={value} decimals={decimals} />
            </span>
            <span className="mt-1 block font-mono text-[10px] text-muted">/ {scale}</span>
          </p>
        </div>
        <p className="font-mono text-[11px] font-semibold uppercase leading-relaxed tracking-[0.2em] text-warm">
          Cumulative
          <br />
          CGPA
        </p>
      </div>
    </TiltCard>
  )
}

/** Degree timeline from start to graduation, with a marker for today. */
function YearTrack({ start, end }: { start: number; end: number }) {
  const now = new Date()
  const yearNow = now.getFullYear() + now.getMonth() / 12
  const p = Math.min(1, Math.max(0, (yearNow - start) / (end - start)))
  const years = Array.from({ length: end - start + 1 }, (_, i) => start + i)
  return (
    <div className="relative mt-8" aria-label={`Degree timeline ${start} to ${end}`}>
      <div className="relative h-1.5 rounded-full bg-line">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-cream"
          initial={{ width: 0 }}
          whileInView={{ width: `${p * 100}%` }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 1.4, ease: SMOOTH }}
        />
        <motion.span
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={{ left: '0%', opacity: 0 }}
          whileInView={{ left: `${p * 100}%`, opacity: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 1.4, ease: SMOOTH }}
        >
          <span className="relative flex size-4">
            <span className="absolute inset-0 animate-ping rounded-full bg-cream/40" />
            <span className="relative size-4 rounded-full border-[3px] border-ink bg-cream shadow" />
          </span>
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-full bg-cream px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ink">Now</span>
        </motion.span>
      </div>
      <div className="mt-3 flex justify-between font-mono text-[10px] text-muted">
        {years.map((y) => (
          <span key={y} className={y <= yearNow ? 'text-cream-2' : ''}>
            {y}
          </span>
        ))}
      </div>
    </div>
  )
}

export function EducationSection() {
  if (!education.length) return null
  return (
    <section id="education" aria-labelledby="education-title" className="relative py-24 md:py-32">
      <div className="container-x">
        <Heading pill="Academic path" title="Education" id="education-title" />
        <ul className="mx-auto grid max-w-5xl gap-6">
          {education.map((e) => {
            const years = e.startYear && e.graduationYear ? `${e.startYear}–${e.graduationYear}` : e.startYear ?? null
            return (
              <Reveal as="li" key={e.institution + e.degree} className="panel relative overflow-hidden rounded-[2rem] p-6 sm:p-10">
                <div className="glow-accent pointer-events-none absolute -right-24 -top-24 size-72 rounded-full blur-2xl" aria-hidden="true" />
                <div className="relative flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    {(years || e.graduationYear) && (
                      <p className="flex flex-wrap items-center gap-3">
                        {years && <span className="rounded-md border border-accent/40 bg-accent/10 px-2.5 py-1 font-mono text-xs font-semibold text-accent">{years}</span>}
                        {e.graduationYear && <span className="font-mono text-xs text-muted">Graduation target: {e.graduationYear}</span>}
                      </p>
                    )}
                    <h3 className="mt-4 font-display text-2xl font-bold leading-tight text-cream sm:text-3xl md:text-4xl">{e.institution}</h3>
                    <p className="mt-3 text-lg text-accent">
                      {e.degree} — {e.department}
                    </p>
                    {e.location && (
                      <p className="mt-3 flex items-center gap-2 font-mono text-xs text-muted">
                        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                          <path d="M12 21s-7-6.1-7-11a7 7 0 1 1 14 0c0 4.9-7 11-7 11Z" />
                          <circle cx="12" cy="10" r="2.5" />
                        </svg>
                        {e.location}
                      </p>
                    )}
                  </div>

                  {e.cgpa && <CgpaDial value={Number(e.cgpa.value)} scale={Number(e.cgpa.scale)} />}
                </div>
                {e.startYear && e.graduationYear && <YearTrack start={Number(e.startYear)} end={Number(e.graduationYear)} />}

                {(e.coursework.length > 0 || e.projects.length > 0) && (
                  <div className="relative mt-8 border-t border-line pt-8">
                    <p className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                      <svg viewBox="0 0 24 24" className="size-4 text-accent" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <path d="M3 5h7a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H3V5Zm18 0h-7a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h7V5Z" />
                      </svg>
                      {e.coursework.length ? 'Coursework & academic projects' : 'Academic projects'}
                    </p>
                    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                      {e.coursework.map((c) => (
                        <li key={c} className="flex items-center gap-3 rounded-xl border border-line bg-ink-2/70 px-4 py-3.5 text-sm text-cream">
                          <span className="text-accent"><CheckIcon /></span>
                          {c}
                        </li>
                      ))}
                      {e.projects.map((p) => (
                        <li key={p.name}>
                          {p.href ? (
                            <Link to={p.href} className="group relative flex h-full items-center gap-3 overflow-hidden rounded-xl border border-line bg-ink-2/70 px-4 py-3.5 text-sm transition-colors hover:border-accent/50">
                              <span className="pointer-events-none absolute inset-y-0 left-0 w-1 origin-left scale-y-0 bg-cream transition-transform duration-300 group-hover:scale-y-100" aria-hidden="true" />
                              <span className="text-leaf"><CheckIcon /></span>
                              <span className="min-w-0 flex-1">
                                <span className="block font-semibold text-cream group-hover:text-accent-2">{p.name}</span>
                                {p.note && <span className="block text-xs text-muted">{p.note}</span>}
                              </span>
                              <ArrowIcon className="size-4 text-accent transition-transform group-hover:translate-x-1" />
                            </Link>
                          ) : (
                            <span className="flex items-center gap-3 rounded-xl border border-line bg-ink-2/70 px-4 py-3.5 text-sm text-cream">
                              <span className="text-leaf"><CheckIcon /></span>
                              {p.name}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {e.achievements.length > 0 && (
                  <ul className="relative mt-5 space-y-1 text-sm text-cream-2">
                    {e.achievements.map((a) => (
                      <li key={a}>★ {a}</li>
                    ))}
                  </ul>
                )}
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
              <span className="absolute -left-[41px] top-1.5 size-4 rounded-full border-2 border-ink bg-accent shadow-[0_0_12px_rgba(0,0,0,0.27)]" aria-hidden="true" />
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
