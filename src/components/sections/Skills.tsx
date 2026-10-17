import { useState } from 'react'
import { motion } from 'motion/react'
import { skillGroups, type SkillGroup } from '../../content/skills'
import { Heading } from '../Heading'
import { Reveal } from '../ui'
import { spring } from '../../lib/motion'

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

function SkillCard({ group, index }: { group: SkillGroup; index: number }) {
  const [active, setActive] = useState<string | null>(null)
  const current = group.skills.find((s) => s.name === active)
  return (
    <Reveal as="li" delay={0.06 * index} className="panel group relative flex h-full flex-col overflow-hidden rounded-3xl p-6 transition-colors hover:border-accent/40">
      <span className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
          <GroupIcon name={group.icon} />
        </span>
        <div>
          <h3 className="font-display text-lg font-bold text-cream">{group.title}</h3>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{group.skills.length} skills</p>
        </div>
      </div>
      <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${group.title} skills`}>
        {group.skills.map((s) => (
          <li key={s.name}>
            <motion.button
              type="button"
              onMouseEnter={() => setActive(s.name)}
              onFocus={() => setActive(s.name)}
              onClick={() => setActive((a) => (a === s.name ? null : s.name))}
              aria-pressed={active === s.name}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={spring}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors cursor-pointer ${active === s.name ? 'border-accent/60 bg-accent/15 text-cream' : 'border-line bg-ink-3/60 text-cream-2 hover:text-cream'}`}
            >
              {s.name}
            </motion.button>
          </li>
        ))}
      </ul>
      <p className="mt-auto pt-5 text-xs leading-relaxed text-muted" aria-live="polite">
        {current ? (
          <>
            <span className="text-accent">{current.name}</span> — {current.evidence}
          </>
        ) : (
          'Hover or tap a skill to see where it was used.'
        )}
      </p>
    </Reveal>
  )
}

export function SkillsSection() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="relative py-24 md:py-32">
      <div className="container-x">
        <Heading pill="Technical toolkit" title="Skills" id="skills-title">
          Tools I’ve actually used in projects, courses and this site — each linked to where it was used. No made-up percentages.
        </Heading>
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {skillGroups.map((g, i) => (
            <SkillCard key={g.id} group={g} index={i} />
          ))}
        </ul>
      </div>
    </section>
  )
}
