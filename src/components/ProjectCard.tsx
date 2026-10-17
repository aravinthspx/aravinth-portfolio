import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import type { Project } from '../content/projects'
import { ProjectVisual } from './ProjectVisual'
import { hasWebGL, useFinePointer } from '../lib/hooks'
import { useMotionPref, spring } from '../lib/motion'
import { ArrowIcon } from './ui'

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const fine = useFinePointer()
  const { reduced } = useMotionPref()
  const ref = useRef<HTMLDivElement>(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 200, damping: 20 })
  const sry = useSpring(ry, { stiffness: 200, damping: 20 })
  const glareX = useTransform(sry, [-6, 6], ['20%', '80%'])
  const glare = useTransform(glareX, (x) => `radial-gradient(600px circle at ${x} 0%, rgba(255,255,255,0.06), transparent 50%)`)
  const tiltOn = fine && !reduced
  const [webgl] = useState(hasWebGL)

  const onMove = (e: React.PointerEvent) => {
    if (!tiltOn || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    ry.set(px * 8) // restrained: max ~4°
    rx.set(py * -6)
  }
  const reset = () => {
    rx.set(0)
    ry.set(0)
  }

  const green = project.accent === 'green'
  const flip = index % 2 === 1

  return (
    <article className="group relative" aria-labelledby={`p-${project.slug}`}>
      <div className={`grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12 ${flip ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <div className="min-w-0 lg:col-span-7" style={{ perspective: 1200 }}>
          <motion.div
            ref={ref}
            onPointerMove={onMove}
            onPointerLeave={reset}
            style={{ rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d' }}
            className="relative overflow-hidden rounded-[2rem] border border-line bg-ink-2/80 p-3 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)] sm:p-4"
          >
            {tiltOn && (
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: glare }}
              />
            )}
            <ProjectVisual slug={project.slug} />
            <p className="mt-3 px-2 pb-1 font-mono text-[11px] uppercase tracking-wider text-muted">
              {green ? 'Abstract farmland' : 'Abstract campus'}
              {webgl && <span className="hidden lg:inline"> — {green ? 'hover, then click a tree' : 'hover or click a building'}</span>}
            </p>
          </motion.div>
        </div>

        <div className="min-w-0 lg:col-span-5">
          {project.logo && <img src={project.logo} alt="" width={400} height={160} loading="lazy" className="mb-5 h-16 w-auto rounded-2xl bg-white px-3 py-1.5" />}
          <p className="font-mono text-sm text-muted">0{index + 1} — {project.type}</p>
          <h3 id={`p-${project.slug}`} className="mt-3 font-display text-5xl font-extrabold tracking-tight text-cream sm:text-6xl">
            {project.name}
          </h3>
          <p className="mt-4 font-display text-xl font-semibold text-cream-2">{project.caseTitle}</p>
          <p className="mt-4 leading-relaxed text-cream-2">{project.summary}</p>
          <ol className="mt-6 flex flex-wrap gap-2" aria-label="Main user journey">
            {project.journey.map((j, i) => (
              <li key={j} className="flex items-center gap-2 text-xs text-cream-2">
                <span className="rounded-full border border-line px-2.5 py-1">{j}</span>
                {i < project.journey.length - 1 && <span aria-hidden="true" className="text-muted">→</span>}
              </li>
            ))}
          </ol>
          <motion.div className="mt-8 inline-block" whileHover={{ x: 4 }} whileTap={{ scale: 0.96 }} transition={spring}>
            <Link
              to={`/work/${project.slug}`}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold ${green ? 'bg-accent text-ink hover:bg-accent-2' : 'bg-warm text-ink hover:bg-warm/85'} after:absolute after:inset-0 after:content-[''] lg:after:hidden`}
            >
              Read case study <span className="sr-only">: {project.name}</span>
              <ArrowIcon />
            </Link>
          </motion.div>
        </div>
      </div>
    </article>
  )
}
