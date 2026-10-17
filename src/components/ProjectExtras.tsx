import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import type { Project } from '../content/projects'
import { Dialog } from './Dialog'
import { ProjectLinks } from './ProjectLinks'
import { ArrowIcon, StatusTag } from './ui'
import { spring } from '../lib/motion'

/** Segmented control that switches a project preview between the 3D UI view and its architecture. */
export function ViewToggle({ view, onChange, name, label }: { view: 'ui' | 'arch'; onChange: (v: 'ui' | 'arch') => void; name: string; label: string }) {
  return (
    <div role="group" aria-label={`${label} preview: interface or architecture`} className="relative inline-flex rounded-full border border-line bg-ink/70 p-0.5 font-mono text-[10px] uppercase tracking-wider">
      {(['ui', 'arch'] as const).map((v) => {
        const on = v === view
        return (
          <button
            key={v}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(v)}
            className={`relative rounded-full px-2.5 py-1 transition-colors cursor-pointer ${on ? 'text-ink' : 'text-muted hover:text-cream'}`}
          >
            {on && <motion.span layoutId={`view-${name}`} className="absolute inset-0 rounded-full bg-accent" transition={spring} aria-hidden="true" />}
            <span className="relative">{v === 'ui' ? 'UI' : 'Arch'}</span>
          </button>
        )
      })}
    </div>
  )
}

/** Architecture view: the user flow, then each layer of the system stacked with connectors. */
export function ArchitectureView({ project }: { project: Project }) {
  const green = project.accent === 'green'
  const layers = project.architecture ?? []
  return (
    <div className="relative flex aspect-[4/3] w-full flex-col overflow-y-auto rounded-[1.5rem] bg-[radial-gradient(120%_90%_at_50%_0%,#0f2733_0%,#080d17_72%)] p-4 sm:p-5">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(79,217,234,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(79,217,234,0.05)_1px,transparent_1px)] bg-[size:24px_24px]" aria-hidden="true" />
      <div className="relative rounded-xl border border-line bg-ink/80 px-3 py-2 font-mono text-[11px] leading-relaxed text-cream-2">
        <span className={green ? 'text-leaf' : 'text-accent'}>Flow:</span> {project.journey.join(' → ')}
      </div>
      <ol className="relative mt-3 flex flex-1 flex-col justify-center gap-1.5">
        {layers.map((l, i) => (
          <motion.li key={l.layer} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * i }}>
            <div className="rounded-xl border border-line bg-ink-2/85 px-3 py-2">
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span className={`font-display text-sm font-bold ${green ? 'text-leaf' : 'text-accent'}`}>{l.layer}</span>
                <span className="font-mono text-[10px] text-muted">{l.detail}</span>
              </p>
              <p className="mt-0.5 truncate text-[11px] text-cream-2">{l.items.join(' · ')}</p>
            </div>
            {i < layers.length - 1 && <span className={`mx-auto block h-2 w-px ${green ? 'bg-leaf/50' : 'bg-accent/50'}`} aria-hidden="true" />}
          </motion.li>
        ))}
      </ol>
    </div>
  )
}

/** "Quick view" button + dialog with the project's verified details, without leaving the page. */
export function QuickView({ project }: { project: Project }) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const green = project.accent === 'green'
  const proven = project.features.filter((f) => f.status === 'implemented' || f.status === 'documented')
  const upcoming = project.features.filter((f) => f.status === 'planned' || f.status === 'development')

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
        transition={spring}
        className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-semibold text-cream-2 transition-colors hover:border-accent/50 hover:text-cream cursor-pointer"
      >
        Quick view<span className="sr-only">: {project.name}</span>
      </motion.button>
      <Dialog open={open} onClose={close} title={project.name}>
        {open && (
          <div className="text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${green ? 'border-leaf/40 bg-leaf/10 text-leaf' : 'border-accent/40 bg-accent/10 text-accent'}`}>{project.type}</span>
              {project.overview.team && <span className="font-mono text-[11px] text-muted">{project.overview.team}</span>}
            </div>
            {project.fullName && <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">{project.fullName}</p>}
            <p className="mt-2 font-display text-xl font-bold text-cream">{project.caseTitle}</p>
            <p className="mt-2 text-sm leading-relaxed text-cream-2">{project.summary}</p>
            {project.overview.context && <p className="mt-2 text-xs text-muted">{project.overview.context}</p>}

            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">What it does</p>
            <ul className="mt-2 space-y-2">
              {proven.map((f) => (
                <li key={f.label} className="flex flex-wrap items-start justify-between gap-2 text-sm text-cream-2">
                  <span className="min-w-0 flex-1">
                    {f.label}
                    {f.note && <span className="block text-xs text-muted">{f.note}</span>}
                  </span>
                  <StatusTag status={f.status} />
                </li>
              ))}
            </ul>
            {upcoming.length > 0 && (
              <>
                <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Next / in progress</p>
                <ul className="mt-2 space-y-2">
                  {upcoming.map((f) => (
                    <li key={f.label} className="flex flex-wrap items-start justify-between gap-2 text-sm text-cream-2">
                      <span className="min-w-0 flex-1">{f.label}</span>
                      <StatusTag status={f.status} />
                    </li>
                  ))}
                </ul>
              </>
            )}

            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Tech stack</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {project.stack.map((s) => (
                <li key={s} className="rounded-md border border-line bg-ink-3/60 px-2 py-0.5 font-mono text-[11px] text-cream-2">{s}</li>
              ))}
            </ul>

            <div className="mt-6">
              <ProjectLinks links={project.links} name={project.name} compact />
            </div>
            <div className="mt-6 border-t border-line pt-5">
              <Link
                to={`/work/${project.slug}`}
                onClick={close}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-ink ${green ? 'bg-leaf hover:bg-leaf-2' : 'bg-accent hover:bg-accent-2'}`}
              >
                Read the full case study <ArrowIcon />
              </Link>
            </div>
          </div>
        )}
      </Dialog>
    </>
  )
}
