import { useEffect, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { getProject, projects, type Status } from '../content/projects'
import { ScreenView } from '../components/ScreenView'
import { ProjectLinks } from '../components/ProjectLinks'
import { ArrowIcon, ButtonLink, Reveal, StatusTag } from '../components/ui'
import NotFound from './NotFound'
import { SITE_TITLE } from '../lib/meta'

const baseSections = [
  ['overview', 'Overview'],
  ['problem', 'Problem'],
  ['evidence', 'Evidence'],
  ['decisions', 'Decisions'],
  ['architecture', 'Architecture'],
  ['solution', 'Solution'],
  ['outcomes', 'Outcomes'],
  ['reflection', 'Reflection'],
] as const

function Block({ id, n, title, children }: { id: string; n: number; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24 border-t border-line py-16 md:py-24">
      <Reveal>
        <p className="font-mono text-xs text-muted">0{n}</p>
        <h2 id={`${id}-h`} className="mt-2 font-display text-2xl font-bold tracking-tight text-cream md:text-4xl">
          {title}
        </h2>
      </Reveal>
      <div className="mt-10">{children}</div>
    </section>
  )
}

function StatusItem({ status, children }: { status: Status; children: ReactNode }) {
  return (
    <li className="flex flex-col gap-2 rounded-2xl border border-line bg-ink-2/60 p-4 sm:flex-row sm:items-start sm:gap-4">
      <StatusTag status={status} className="sm:mt-0.5" />
      <span className="leading-relaxed text-cream-2">{children}</span>
    </li>
  )
}

export default function CaseStudy() {
  const { slug } = useParams()
  const p = getProject(slug)

  useEffect(() => {
    if (p) document.title = `${p.name} — ${p.caseTitle} | Aravinth M`
    return () => {
      document.title = SITE_TITLE
    }
  }, [p])

  if (!p) return <NotFound />

  const heroScreen = p.screens[0]
  const hasShots = p.screens.some((s) => s.image)
  // Architecture only appears when the project has it; numbering follows the visible sections.
  const sections = baseSections.filter(([id]) => id !== 'architecture' || p.architecture)
  const num = (id: string) => sections.findIndex(([s]) => s === id) + 1
  const next = projects[(projects.indexOf(p) + 1) % projects.length]
  const green = p.accent === 'green'
  const o = p.overview
  const facts: [string, string | null][] = [
    ['Project type', p.type],
    ['Audience', o.audience],
    ['Team', o.team],
    ['Context', o.context],
    ['My role', o.role],
    ['Timeline', o.timeline],
  ]

  return (
    <article className="pt-24 md:pt-32">
      {/* Intro + final experience shown early */}
      <header className="container-x relative">
        <div className={`pointer-events-none absolute -top-20 right-0 size-[30rem] rounded-full blur-3xl ${green ? 'glow-warm' : 'glow-accent'}`} aria-hidden="true" />
        <nav aria-label="Breadcrumb" className="relative mb-8 text-sm text-muted">
          <Link to={{ pathname: '/', hash: '#projects' }} className="hover:text-cream">← All projects</Link>
        </nav>
        <motion.p className="eyebrow relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Case study · {p.name}
        </motion.p>
        <motion.h1
          className="relative mt-5 max-w-5xl font-display text-3xl font-bold leading-[1.08] tracking-tight text-cream sm:text-4xl md:text-5xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {p.caseTitle}
        </motion.h1>
        {p.fullName && (
          <motion.p className="relative mt-4 font-mono text-sm uppercase tracking-[0.18em] text-accent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            {p.fullName}
          </motion.p>
        )}
        <motion.p className="relative mt-6 max-w-2xl text-lg leading-relaxed text-cream-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          {p.summary}
        </motion.p>
        <motion.div className="relative mt-6 flex flex-col gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          {p.categories && (
            <ul className="flex flex-wrap gap-2" aria-label="Categories">
              {p.categories.map((c) => (
                <li key={c} className="rounded-full border border-line bg-ink-2/70 px-3 py-1 font-mono text-[11px] text-cream-2">{c}</li>
              ))}
            </ul>
          )}
          <ProjectLinks links={p.links} name={p.name} />
        </motion.div>
        <motion.div
          className={`relative mt-12 rounded-[2rem] p-4 sm:p-8 panel glow-ring`}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <ScreenView screen={heroScreen} priority />
          <p className="mt-4 text-center text-sm text-cream-2">
            {heroScreen.caption}{' '}
            <span className="text-muted">{heroScreen.image ? 'Screenshot from the running application.' : 'Illustrative mockup — not a shipped screen.'}</span>
          </p>
          {heroScreen.note && <p className="mt-2 text-center text-xs text-warn">{heroScreen.note}</p>}
        </motion.div>
      </header>

      <div className="container-x mt-16 grid gap-10 lg:grid-cols-[13rem_1fr]">
        <aside className="hidden lg:block">
          <nav aria-label="Case study sections" className="sticky top-28">
            <ul className="space-y-1 border-l border-line">
              {sections.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm text-muted hover:border-accent-2 hover:text-cream">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="min-w-0">
          <Block id="overview" n={num('overview')} title="Overview">
            <dl className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2">
              {facts.filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="bg-ink-2 p-5">
                  <dt className="font-mono text-[11px] uppercase tracking-wider text-muted">{k}</dt>
                  <dd className="mt-2 text-cream">{v}</dd>
                </div>
              ))}
              <div className="bg-ink-2 p-5 sm:col-span-2">
                <dt className="font-mono text-[11px] uppercase tracking-wider text-muted">Problem</dt>
                <dd className="mt-2 text-cream">{o.problem}</dd>
              </div>
            </dl>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="font-display text-lg font-semibold">Constraints</h3>
                <ul className="mt-3 space-y-2 text-cream-2">
                  {o.constraints.map((c) => (
                    <li key={c} className="flex gap-3"><span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent-2" aria-hidden="true" />{c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">Main user journey</h3>
                <ol className="mt-3 space-y-2">
                  {p.journey.map((j, i) => (
                    <li key={j} className="flex items-center gap-3 text-cream-2">
                      <span className={`grid size-7 shrink-0 place-items-center rounded-full font-mono text-xs ${green ? 'bg-leaf/15 text-leaf' : 'bg-accent/15 text-accent'}`}>{i + 1}</span>
                      {j}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="mt-8">
              <h3 className="font-display text-lg font-semibold">Technologies</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {p.stack.map((s) => (
                  <li key={s} className="rounded-full border border-line px-3 py-1 text-sm text-cream-2">{s}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-muted">{p.stackNote}</p>
            </div>
          </Block>

          <Block id="problem" n={num('problem')} title="Problem">
            <p className="max-w-3xl text-xl leading-relaxed text-cream">{p.problem.need}</p>
            <h3 className="mt-10 font-display text-lg font-semibold">What makes it difficult</h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {p.problem.difficulties.map((d, i) => (
                <Reveal as="li" key={d} delay={0.05 * i} className="rounded-2xl border border-line bg-ink-2/60 p-5 text-cream-2">
                  {d}
                </Reveal>
              ))}
            </ul>
          </Block>

          <Block id="evidence" n={num('evidence')} title="Evidence">
            <p className="mb-6 max-w-3xl text-cream-2">No formal user research was conducted. What follows are implementation observations and documentation from the project itself.</p>
            <ul className="space-y-3">
              {p.evidence.items.map((e) => (
                <StatusItem key={e.text} status={e.status}>{e.text}</StatusItem>
              ))}
            </ul>
            <div className="mt-10 rounded-3xl border border-warn/25 bg-warn/5 p-6">
              <h3 className="font-display text-lg font-semibold text-warn">Limitations</h3>
              <ul className="mt-3 space-y-2 text-cream-2">
                {p.evidence.limitations.map((l) => (
                  <li key={l} className="flex gap-3"><span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-warn" aria-hidden="true" />{l}</li>
                ))}
              </ul>
            </div>
          </Block>

          <Block id="decisions" n={num('decisions')} title="Design decisions">
            <ol className="space-y-6">
              {p.decisions.map((d, i) => (
                <Reveal as="li" key={d.title} delay={0.05 * i} className="rounded-3xl border border-line bg-ink-2/60 p-6 md:p-8">
                  <p className="font-mono text-xs text-accent-2">Decision {i + 1}</p>
                  <h3 className="mt-2 font-display text-2xl font-bold">{d.title}</h3>
                  <dl className="mt-5 grid gap-5 md:grid-cols-3">
                    <div><dt className="font-mono text-[11px] uppercase tracking-wider text-ok">Chosen</dt><dd className="mt-1.5 text-cream-2">{d.chosen}</dd></div>
                    <div><dt className="font-mono text-[11px] uppercase tracking-wider text-muted">Alternative</dt><dd className="mt-1.5 text-cream-2">{d.alternative}</dd></div>
                    <div><dt className="font-mono text-[11px] uppercase tracking-wider text-warn">Tradeoff</dt><dd className="mt-1.5 text-cream-2">{d.tradeoff}</dd></div>
                  </dl>
                </Reveal>
              ))}
            </ol>
          </Block>

          {p.architecture && (
            <Block id="architecture" n={num('architecture')} title="Architecture">
              <p className="mb-8 max-w-3xl text-cream-2">How requests flow through the prototype, as described in the project report.</p>
              <ol className="relative space-y-4">
                {p.architecture.map((l, i) => (
                  <Reveal as="li" key={l.layer} delay={0.06 * i} className="relative">
                    <div className="panel rounded-2xl p-5 md:grid md:grid-cols-[12rem_1fr] md:gap-6">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Layer {i + 1}</p>
                        <p className={`mt-1 font-display text-xl font-bold ${green ? 'text-leaf' : 'text-accent'}`}>{l.layer}</p>
                        <p className="mt-1 text-xs text-cream-2">{l.detail}</p>
                      </div>
                      <ul className="mt-4 flex flex-wrap gap-2 md:mt-0 md:content-center">
                        {l.items.map((it) => (
                          <li key={it} className="rounded-lg border border-line bg-ink-3/60 px-3 py-1.5 text-sm text-cream-2">{it}</li>
                        ))}
                      </ul>
                    </div>
                    {i < p.architecture!.length - 1 && (
                      <span className="mx-auto mt-4 block h-4 w-px bg-gradient-to-b from-accent/70 to-transparent" aria-hidden="true" />
                    )}
                  </Reveal>
                ))}
              </ol>
            </Block>
          )}

          <Block id="solution" n={num('solution')} title="Solution">
            <h3 className="font-display text-lg font-semibold">Feature status</h3>
            <ul className="mt-4 grid gap-2 md:grid-cols-2">
              {p.features.map((f) => (
                <li key={f.label} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-ink-2/50 px-4 py-3">
                  <span className="text-sm text-cream">
                    {f.label}
                    {f.note && <span className="block text-xs text-muted">{f.note}</span>}
                  </span>
                  <StatusTag status={f.status} />
                </li>
              ))}
            </ul>

            <h3 className="mt-14 font-display text-lg font-semibold">Annotated screens</h3>
            <p className="mt-2 text-sm text-cream-2">
              {hasShots
                ? 'Screenshots from the running application. Click any screen to enlarge it.'
                : 'No screenshots were supplied, so these are illustrative mockups drawn for this portfolio. Some are interactive — try the buttons.'}
            </p>
            <div className="mt-8 space-y-16">
              {p.screens.map((s, i) => {
                return (
                  <Reveal key={s.title} className="grid items-start gap-6 md:grid-cols-12">
                    <div className={`md:col-span-7 ${i % 2 ? 'md:order-2' : ''}`}>
                      <ScreenView screen={s} />
                    </div>
                    <div className="md:col-span-5">
                      <StatusTag status={s.image ? 'screenshot' : 'illustrative'} />
                      <h4 className="mt-3 font-display text-2xl font-bold">{s.title}</h4>
                      <p className="mt-2 text-cream-2">{s.caption}</p>
                      <ol className="mt-5 space-y-3">
                        {s.annotations.map((a, j) => (
                          <li key={a} className="flex gap-3 text-sm text-cream-2">
                            <span className={`grid size-6 shrink-0 place-items-center rounded-full font-mono text-[11px] ${green ? 'bg-leaf text-ink' : 'bg-accent text-ink'}`}>{j + 1}</span>
                            {a}
                          </li>
                        ))}
                      </ol>
                      {s.note && <p className="mt-4 rounded-xl border border-warn/25 bg-warn/5 px-3 py-2 text-xs leading-relaxed text-warn">{s.note}</p>}
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </Block>

          <Block id="outcomes" n={num('outcomes')} title="Outcomes">
            <ul className="space-y-3">
              {p.outcomes.map((x) => (
                <StatusItem key={x.text} status={x.status}>{x.text}</StatusItem>
              ))}
            </ul>
            {p.testing && <p className="mt-6 text-cream-2">{p.testing}</p>}
            <p className="mt-6 text-sm text-muted">No usage numbers, user-testing results or impact metrics are reported for this prototype.</p>
          </Block>

          <Block id="reflection" n={num('reflection')} title="Reflection">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-3xl border border-line bg-ink-2/60 p-6">
                <h3 className="font-display text-xl font-bold">What I learned</h3>
                <ul className="mt-4 space-y-3 text-cream-2">
                  {p.reflection.learned.map((l) => <li key={l} className="flex gap-3"><span className="text-accent-2" aria-hidden="true">✦</span>{l}</li>)}
                </ul>
              </div>
              <div className="rounded-3xl border border-line bg-ink-2/60 p-6">
                <h3 className="font-display text-xl font-bold">Next steps</h3>
                <ul className="mt-4 space-y-3 text-cream-2">
                  {p.reflection.next.map((l) => <li key={l} className="flex gap-3"><span className="text-warm" aria-hidden="true">→</span>{l}</li>)}
                </ul>
              </div>
            </div>
          </Block>
        </div>
      </div>

      <section aria-label="Next project" className="mt-12 border-t border-line">
        <Link to={`/work/${next.slug}`} className="group container-x flex flex-col gap-4 py-16 md:flex-row md:items-end md:justify-between md:py-24">
          <span>
            <span className="eyebrow">Next case study</span>
            <span className="mt-4 block font-display text-4xl font-bold tracking-tight transition-colors group-hover:text-accent-2 md:text-5xl">{next.name}</span>
            <span className="mt-2 block text-cream-2">{next.caseTitle}</span>
          </span>
          <span className="grid size-16 shrink-0 place-items-center rounded-full border border-line transition-all group-hover:translate-x-2 group-hover:border-accent-2 group-hover:bg-accent group-hover:text-ink">
            <ArrowIcon className="size-6" />
          </span>
        </Link>
        <div className="container-x pb-16">
          <ButtonLink to="/#contact" variant="ghost">Get in touch</ButtonLink>
        </div>
      </section>
    </article>
  )
}
