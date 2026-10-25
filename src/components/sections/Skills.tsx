import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { skillGroups, type SkillGroup } from '../../content/skills'
import { Heading } from '../Heading'
import { Reveal } from '../ui'
import { TiltCard } from '../fx'
import { Link } from 'react-router-dom'
import { SMOOTH, spring, useMotionPref } from '../../lib/motion'

function GroupIcon({ name }: { name: SkillGroup['icon'] }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" {...p}>
      {name === 'code' && <path d="M8 7 3 12l5 5M16 7l5 5-5 5M14 4l-4 16" />}
      {name === 'brain' && <path d="M9 4a3 3 0 0 0-3 3v.5A3 3 0 0 0 4 10.3 3 3 0 0 0 5 15a3 3 0 0 0 4 3.8V4Zm6 0a3 3 0 0 1 3 3v.5a3 3 0 0 1 2 2.8 3 3 0 0 1-1 4.7 3 3 0 0 1-4 3.8V4Z" />}
      {name === 'web' && <path d="M3 5h18v14H3zM3 9h18M7 7h.01M10 7h.01" />}
      {name === 'server' && <path d="M4 5h16v5H4zM4 14h16v5H4zM8 7.5h.01M8 16.5h.01" />}
      {name === 'tools' && <path d="M14.5 6.5a4 4 0 0 0-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5 2.5-2.5Z" />}
    </svg>
  )
}

/** Projects that have case studies: evidence mentioning them becomes a link. */
const CASE_LINKS: [string, string][] = [
  ['Agri-Yield Pro', '/work/agri-yield-pro'],
  ['SITTO', '/work/sitto'],
]

/** Evidence text that types itself out whenever the selected skill changes. */
function TypedEvidence({ text, reduced }: { text: string; reduced: boolean }) {
  const [n, setN] = useState(reduced ? text.length : 0)
  useEffect(() => {
    if (reduced) return setN(text.length)
    setN(0)
    let i = 0
    const t = window.setInterval(() => {
      i += 2
      setN(Math.min(i, text.length))
      if (i >= text.length) window.clearInterval(t)
    }, 18)
    return () => window.clearInterval(t)
  }, [text, reduced])
  return (
    <>
      {text.slice(0, n)}
      {n < text.length && <span className="ml-px inline-block h-3 w-1.5 translate-y-0.5 animate-pulse bg-cream" aria-hidden="true" />}
    </>
  )
}

function SkillCard({ group, index }: { group: SkillGroup; index: number }) {
  const { reduced } = useMotionPref()
  const ref = useRef<HTMLLIElement>(null)
  const inView = useInView(ref, { amount: 0.4 })
  const [active, setActive] = useState(0)
  const [hover, setHover] = useState(false)
  const current = group.skills[active]
  const links = CASE_LINKS.filter(([name]) => current.evidence.includes(name))

  // Step through the skills on its own while visible and not being used (staggered per card)
  useEffect(() => {
    if (!inView || hover || reduced || group.skills.length < 2) return
    const t = window.setTimeout(() => setActive((a) => (a + 1) % group.skills.length), 3200 + index * 450)
    return () => window.clearTimeout(t)
  }, [active, inView, hover, reduced, group.skills.length, index])

  return (
    <Reveal as="li" delay={0.06 * index} className="h-full">
      <TiltCard max={5} className="rounded-3xl">
        <article
          ref={ref}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className="panel group relative flex h-full flex-col overflow-hidden rounded-3xl p-6 transition-colors hover:border-cream/30"
        >
          {/* big outlined index number */}
          <span className="pointer-events-none absolute -right-2 -top-6 select-none font-display text-[7.5rem] font-bold leading-none text-transparent transition-transform duration-700 [-webkit-text-stroke:1px_rgba(10,10,10,0.08)] group-hover:-translate-x-2 group-hover:translate-y-2" aria-hidden="true">
            0{index + 1}
          </span>
          <div className="relative flex items-center gap-3">
            <motion.span className="grid size-11 place-items-center rounded-xl bg-cream text-ink" whileHover={{ rotate: -12, scale: 1.08 }} transition={spring}>
              <GroupIcon name={group.icon} />
            </motion.span>
            <div>
              <h3 className="font-display text-lg font-bold text-cream">{group.title}</h3>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                {String(active + 1).padStart(2, '0')} / {String(group.skills.length).padStart(2, '0')} skills
              </p>
            </div>
          </div>

          <ul className="relative mt-5 flex flex-wrap gap-2" aria-label={`${group.title} skills`}>
            {group.skills.map((s, i) => {
              const on = i === active
              return (
                <li key={s.name}>
                  <motion.button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    aria-pressed={on}
                    whileTap={{ scale: 0.94 }}
                    transition={spring}
                    className={`relative rounded-lg border px-3 py-1.5 text-sm transition-colors duration-300 cursor-pointer ${on ? 'border-cream text-ink' : 'border-line bg-ink-3/60 text-cream-2 hover:text-cream'}`}
                  >
                    {on && <motion.span layoutId={`skill-pill-${group.id}`} className="absolute inset-0 rounded-[7px] bg-cream" transition={spring} aria-hidden="true" />}
                    <span className="relative">{s.name}</span>
                  </motion.button>
                </li>
              )
            })}
          </ul>

          {/* where it was used */}
          <div className="relative mt-auto pt-6">
            <div className="rounded-xl border border-line bg-ink-2/80 px-3.5 py-3 font-mono text-[11.5px] leading-relaxed" aria-live="polite">
              <p className="text-muted">
                <span className="text-cream">↳</span> used in
              </p>
              <p className="mt-1 min-h-[2.6em] text-cream-2">
                <TypedEvidence key={current.name} text={current.evidence} reduced={reduced} />
              </p>
              {links.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {links.map(([name, to]) => (
                    <Link key={name} to={to} className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-cream hover:border-cream">
                      {name} case study →
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {/* auto-step progress */}
            {!hover && !reduced && inView && group.skills.length > 1 && (
              <motion.span
                key={`${active}`}
                className="absolute inset-x-0 -bottom-3 h-px origin-left bg-cream/40"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: (3200 + index * 450) / 1000, ease: 'linear' }}
                aria-hidden="true"
              />
            )}
          </div>
        </article>
      </TiltCard>
    </Reveal>
  )
}

/** Two rows of every skill drifting in opposite directions; hovering pauses them. */
function SkillMarquee() {
  const { reduced } = useMotionPref()
  const all = skillGroups.flatMap((g) => g.skills.map((s) => s.name))
  const half = Math.ceil(all.length / 2)
  const rows = [all.slice(0, half), all.slice(half)]
  if (reduced) return null
  return (
    <div className="group/mq relative -mx-4 mb-10 space-y-3 overflow-hidden py-1 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]" aria-hidden="true">
      {rows.map((row, r) => (
        <div key={r} className="flex w-max gap-3 group-hover/mq:[animation-play-state:paused]" style={{ animation: `marquee ${38 + r * 8}s linear infinite ${r ? 'reverse' : ''}` }}>
          {[...row, ...row].map((name, i) => (
            <span key={i} className="flex items-center gap-3 whitespace-nowrap font-display text-2xl font-bold text-cream/80 sm:text-3xl">
              {name}
              <span className="text-base text-muted">✦</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

/** Wraps the part of `text` that matches `q` in a highlight. */
function Mark({ text, q }: { text: string; q: string }) {
  const i = q ? text.toLowerCase().indexOf(q) : -1
  if (i < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-sm bg-cream px-0.5 text-ink">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  )
}

const TREE_CMD = 'tree aravinth/skills --evidence'

/**
 * Terminal view: a `tree` command types itself, then each group streams in as a folder you can
 * open or close, with a grep box that filters skills and evidence as you type.
 */
function SkillTree() {
  const { reduced } = useMotionPref()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.25 })
  const [typed, setTyped] = useState(reduced ? TREE_CMD.length : 0)
  const [closed, setClosed] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [hover, setHover] = useState<string | null>(null)
  const q = query.trim().toLowerCase()
  const done = typed >= TREE_CMD.length

  useEffect(() => {
    if (!inView || done) return
    const t = window.setTimeout(() => setTyped((n) => n + 1), 38)
    return () => window.clearTimeout(t)
  }, [inView, typed, done])

  const groups = skillGroups
    .map((g) => ({ ...g, skills: q ? g.skills.filter((s) => `${s.name} ${s.evidence} ${g.title}`.toLowerCase().includes(q)) : g.skills }))
    .filter((g) => g.skills.length > 0)
  const files = groups.reduce((n, g) => n + g.skills.length, 0)
  const toggle = (id: string) =>
    setClosed((c) => {
      const n = new Set(c)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  let row = 0 // running line number, used for the stream-in delay
  return (
    <Reveal className="mx-auto max-w-4xl">
      <div ref={ref} className="panel overflow-hidden rounded-3xl font-mono text-[13px] leading-7 shadow-[0_40px_90px_-50px_rgba(0,0,0,0.5)]">
        {/* window chrome + grep box */}
        <div className="flex flex-wrap items-center gap-3 border-b border-line bg-ink-2/80 px-5 py-3">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-cream/15" />
            <span className="size-2.5 rounded-full bg-cream/15" />
            <span className="size-2.5 rounded-full bg-cream/15" />
          </span>
          <span className="text-[11px] text-muted">~/aravinth — zsh</span>
          <label className="ml-auto flex items-center gap-2 rounded-full border border-line bg-ink px-3 py-1 text-[12px] text-muted focus-within:border-cream/60">
            <span aria-hidden="true">grep</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="react, python…"
              aria-label="Filter skills"
              className="w-28 bg-transparent text-cream outline-none placeholder:text-muted/60 sm:w-36"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="text-muted hover:text-cream" aria-label="Clear filter">
                ×
              </button>
            )}
          </label>
        </div>

        <div className="overflow-x-auto p-6 sm:p-8" onMouseLeave={() => setHover(null)}>
          <p>
            <span className="text-leaf">➜</span> <span className="text-accent">~</span>{' '}
            <span className="text-cream">{TREE_CMD.slice(0, typed)}</span>
            {!done && <span className="ml-px inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-cream" aria-hidden="true" />}
          </p>

          {done && (
            <>
              <motion.p className="font-semibold text-cream" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }}>
                aravinth/skills
              </motion.p>
              <ul>
                {groups.map((g, gi) => {
                  const lastG = gi === groups.length - 1
                  const open = q !== '' || !closed.has(g.id)
                  const gDelay = row++ * 0.035
                  return (
                    <li key={g.id}>
                      <motion.button
                        type="button"
                        onClick={() => toggle(g.id)}
                        aria-expanded={open}
                        className="group/dir flex w-full items-center whitespace-nowrap text-left"
                        initial={reduced ? false : { opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: gDelay, duration: 0.3 }}
                      >
                        <span className="text-muted">{lastG ? '└── ' : '├── '}</span>
                        <motion.span className="mr-1.5 inline-block text-[10px] text-muted" animate={{ rotate: open ? 90 : 0 }} transition={spring} aria-hidden="true">
                          ▶
                        </motion.span>
                        <span className="font-semibold text-cream underline-offset-4 group-hover/dir:underline">{g.title}/</span>
                        <span className="ml-3 text-[11px] text-muted">{g.skills.length}</span>
                      </motion.button>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: SMOOTH }}
                            className="overflow-hidden"
                          >
                            {g.skills.map((s, si) => {
                              const key = `${g.id}/${s.name}`
                              const dim = hover !== null && hover !== key
                              const delay = row++ * 0.035
                              return (
                                <motion.li
                                  key={s.name}
                                  onMouseEnter={() => setHover(key)}
                                  className={`relative -mx-2 whitespace-nowrap rounded-md px-2 transition-[opacity,background-color] duration-200 ${hover === key ? 'bg-ink-3' : ''} ${dim ? 'opacity-35' : ''}`}
                                  initial={reduced ? false : { opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay, duration: 0.3 }}
                                >
                                  <span className="text-muted">
                                    {lastG ? '    ' : '│   '}
                                    {si === g.skills.length - 1 ? '└── ' : '├── '}
                                  </span>
                                  <span className="text-cream">
                                    <Mark text={s.name} q={q} />
                                  </span>
                                  <span className={`transition-colors ${hover === key ? 'text-cream-2' : 'text-muted'}`}>
                                    {'  # '}
                                    <Mark text={s.evidence} q={q} />
                                  </span>
                                </motion.li>
                              )
                            })}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  )
                })}
              </ul>
              <motion.p className="mt-4 text-muted" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: row * 0.035 + 0.1 }} aria-live="polite">
                {groups.length === 0 ? `grep: no skills match "${query.trim()}"` : `${groups.length} directories, ${files} files`}
              </motion.p>
              <p className="mt-1">
                <span className="text-leaf">➜</span> <span className="text-accent">~</span>{' '}
                <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-cream" aria-hidden="true" />
              </p>
            </>
          )}
        </div>
      </div>
      <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Click a folder to open or close it · type to filter</p>
    </Reveal>
  )
}

export function SkillsSection() {
  const [view, setView] = useState<'cards' | 'tree'>('cards')
  return (
    <section id="skills" aria-labelledby="skills-title" className="relative py-24 md:py-32">
      <div className="container-x">
        <Heading pill="Technical toolkit" title="Skills" id="skills-title">
          Tools I’ve actually used in projects, courses and this site — each linked to where it was used. No made-up percentages.
        </Heading>
        <div role="group" aria-label="Skills view" className="mb-8 flex justify-center">
          <div className="relative inline-flex rounded-full border border-line bg-ink/70 p-1 text-sm">
            {(['cards', 'tree'] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={`relative rounded-full px-4 py-1.5 font-medium transition-colors cursor-pointer ${view === v ? 'text-ink' : 'text-cream-2 hover:text-cream'}`}
              >
                {view === v && <motion.span layoutId="skills-view" className="absolute inset-0 rounded-full bg-accent" transition={spring} aria-hidden="true" />}
                <span className="relative">{v === 'cards' ? 'Cards' : 'Tree'}</span>
              </button>
            ))}
          </div>
        </div>
        <SkillMarquee />
        {view === 'cards' ? (
          <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {skillGroups.map((g, i) => (
              <SkillCard key={g.id} group={g} index={i} />
            ))}
          </ul>
        ) : (
          <SkillTree />
        )}
        <p className="mx-auto mt-8 flex max-w-3xl items-start gap-3 rounded-2xl border border-leaf/25 bg-leaf/5 px-5 py-4 text-sm leading-relaxed text-cream-2">
          <span className="mt-0.5 text-leaf" aria-hidden="true">✓</span>
          <span>
            <span className="font-semibold text-cream">Truthfulness note:</span> I’m a student, so these are tools I’ve used, not claims of mastery. Every skill points to the project, course or simulation where it was applied — there are no ratings or percentages on purpose.
          </span>
        </p>
      </div>
    </section>
  )
}
