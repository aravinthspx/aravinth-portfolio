import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import type { Project } from '../content/projects'
import { ProjectVisual } from './ProjectVisual'
import { hasWebGL, useFinePointer } from '../lib/hooks'
import { useMotionPref, spring } from '../lib/motion'
import { ArrowIcon, StatusTag } from './ui'
import { ProjectLinks } from './ProjectLinks'
import { ArchitectureView, QuickView, ViewToggle } from './ProjectExtras'

/** Floating project panel: status header, 3D diorama, key facts and a case-study link. */
export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const fine = useFinePointer()
  const { reduced } = useMotionPref()
  const ref = useRef<HTMLDivElement>(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 200, damping: 20 })
  const sry = useSpring(ry, { stiffness: 200, damping: 20 })
  const glareX = useTransform(sry, [-5, 5], ['15%', '85%'])
  const glare = useTransform(glareX, (x) => `radial-gradient(500px circle at ${x} 0%, rgba(79,217,234,0.10), transparent 50%)`)
  const tiltOn = fine && !reduced
  const [webgl] = useState(hasWebGL)
  const [view, setView] = useState<'ui' | 'arch'>('ui')

  const onMove = (e: React.PointerEvent) => {
    if (!tiltOn || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 6) // restrained: max ~3°
    rx.set(((e.clientY - r.top) / r.height - 0.5) * -5)
  }
  const reset = () => {
    rx.set(0)
    ry.set(0)
  }

  const green = project.accent === 'green'
  const code = project.slug === 'agri-yield-pro' ? 'AGRI_YIELD // PROTOTYPE' : 'SITTO // CAMPUS'
  const implemented = project.features.some((f) => f.status === 'implemented')
  // Prefer features proven by screenshots, then those documented in the report.
  const keyFeatures = [...project.features.filter((f) => f.status === 'implemented'), ...project.features.filter((f) => f.status === 'documented')].slice(0, 3)

  return (
    <article aria-labelledby={`p-${project.slug}`} style={{ perspective: 1200 }} className="h-full">
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={reset}
        style={{ rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d' }}
        whileHover={reduced ? undefined : { y: -6 }}
        transition={spring}
        className={`group panel relative flex h-full flex-col overflow-hidden rounded-[1.75rem] ${green ? 'hover:border-leaf/50' : 'hover:border-accent/50'} transition-colors`}
      >
        {tiltOn && <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: glare }} />}

        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
          <span className="font-mono text-[11px] tracking-wider text-muted">{code}</span>
          <span className="flex items-center gap-2">
            {project.architecture && <ViewToggle view={view} onChange={setView} name={project.slug} label={project.name} />}
            <StatusTag status={implemented ? 'implemented' : 'documented'} />
          </span>
        </div>

        <div className="p-3">
          {view === 'arch' && project.architecture ? <ArchitectureView project={project} /> : <ProjectVisual slug={project.slug} />}
          <p className="mt-2 px-1 font-mono text-[10px] uppercase tracking-wider text-muted">
            {view === 'arch' ? (
              'System architecture · from the project documentation'
            ) : (
              <>
                {green ? 'Abstract farmland' : 'Abstract campus'}
                {webgl && <span className="hidden lg:inline"> — {green ? 'hover, then click a tree' : 'hover or click a building'}</span>}
              </>
            )}
          </p>
        </div>

        <div className="flex flex-1 flex-col px-5 pb-6 pt-2 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${green ? 'border-leaf/40 bg-leaf/10 text-leaf' : 'border-accent/40 bg-accent/10 text-accent'}`}>
              {project.type}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">0{index + 1}</span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            {project.logo && <img src={project.logo} alt="" width={400} height={160} loading="lazy" className="h-10 w-auto rounded-lg bg-white px-2 py-1" />}
            <h3 id={`p-${project.slug}`} className="font-display text-2xl font-bold tracking-tight text-cream sm:text-3xl">
              {project.name}
            </h3>
          </div>
          {project.fullName && <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">{project.fullName}</p>}
          <p className="mt-2 font-display text-lg font-semibold text-cream-2">{project.caseTitle}</p>
          <p className="mt-3 text-sm leading-relaxed text-cream-2">{project.summary}</p>

          <ul className="mt-5 space-y-2">
            {keyFeatures.map((f) => (
              <li key={f.label} className="flex gap-2.5 text-sm text-cream-2">
                <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${green ? 'bg-leaf' : 'bg-accent'}`} aria-hidden="true" />
                {f.label}
              </li>
            ))}
          </ul>

          <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Technologies">
            {project.stack.slice(0, 6).map((s) => (
              <li key={s} className="rounded-md border border-line bg-ink-3/60 px-2 py-0.5 font-mono text-[11px] text-cream-2">{s}</li>
            ))}
            {project.stack.length > 6 && <li className="px-1 py-0.5 font-mono text-[11px] text-muted">+{project.stack.length - 6} more</li>}
          </ul>

          <div className="mt-5">
            <ProjectLinks links={project.links} name={project.name} compact />
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
            <motion.span className="inline-flex" whileHover={{ x: 4 }} whileTap={{ scale: 0.96 }} transition={spring}>
              <Link
              to={`/work/${project.slug}`}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-ink ${green ? 'bg-leaf shadow-[0_0_24px_-6px_rgba(159,220,116,0.8)] hover:bg-leaf-2' : 'bg-accent shadow-[0_0_24px_-6px_rgba(79,217,234,0.8)] hover:bg-accent-2'}`}
            >
              Inspect case study <span className="sr-only">: {project.name}</span>
              <ArrowIcon />
            </Link>
            </motion.span>
            <QuickView project={project} />
          </div>
        </div>
      </motion.div>
    </article>
  )
}
