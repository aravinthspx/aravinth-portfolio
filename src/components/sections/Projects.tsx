import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { projects, type Project } from '../../content/projects'
import { Heading } from '../Heading'
import { ProjectCard } from '../ProjectCard'
import { ReposStrip } from './Repos'
import { spring } from '../../lib/motion'

type Filter = 'All' | Project['filters'][number]

export function ProjectsSection() {
  const [filter, setFilter] = useState<Filter>('All')
  const filters = useMemo<Filter[]>(() => ['All', ...Array.from(new Set(projects.flatMap((p) => p.filters)))], [])
  const shown = projects.filter((p) => filter === 'All' || p.filters.includes(filter))

  return (
    <section id="projects" aria-labelledby="projects-title" className="relative py-24 md:py-32">
      <div className="container-x">
        <Heading pill="Projects showcase" title="Projects" id="projects-title">
          Team prototypes where I explored how data, interfaces and backend services come together.
        </Heading>

        <div role="group" aria-label="Filter projects" className="mb-10 flex flex-wrap justify-center gap-2">
          {filters.map((f) => {
            const count = f === 'All' ? projects.length : projects.filter((p) => p.filters.includes(f)).length
            const on = f === filter
            return (
              <motion.button
                key={f}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(f)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={spring}
                className={`relative rounded-full border px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${on ? 'border-accent/60 text-ink' : 'border-line text-cream-2 hover:border-cream-2/40 hover:text-cream'}`}
              >
                {on && <motion.span layoutId="project-filter" className="absolute inset-0 rounded-full bg-accent" transition={spring} aria-hidden="true" />}
                <span className="relative">
                  {f} <span className={on ? 'text-ink/70' : 'text-muted'}>· {count}</span>
                </span>
              </motion.button>
            )
          })}
        </div>

        <motion.ul layout className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {shown.map((p) => (
              <motion.li
                key={p.slug}
                layout
                className="min-w-0"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <ProjectCard project={p} index={projects.indexOf(p)} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
        <p className="mt-8 text-center text-sm text-muted" aria-live="polite">
          Showing {shown.length} of {projects.length} projects{filter !== 'All' ? ` · ${filter}` : ''}. More projects will be added here as they’re completed.
        </p>
        <ReposStrip />
      </div>
    </section>
  )
}
