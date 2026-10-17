import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { focusAreas, type FocusArea, type Tone } from '../content/focus'
import { spring } from '../lib/motion'

const tones: Record<Tone, { ring: string; text: string; chip: string; bg: string }> = {
  cyan: { ring: 'border-accent/50 shadow-[0_0_40px_-12px_rgba(79,217,234,0.7)]', text: 'text-accent', chip: 'border-accent/40 bg-accent/10 text-accent', bg: 'from-accent/10' },
  leaf: { ring: 'border-leaf/50 shadow-[0_0_40px_-12px_rgba(159,220,116,0.6)]', text: 'text-leaf', chip: 'border-leaf/40 bg-leaf/10 text-leaf', bg: 'from-leaf/10' },
  amber: { ring: 'border-warm/50 shadow-[0_0_40px_-12px_rgba(229,180,95,0.6)]', text: 'text-warm', chip: 'border-warm/40 bg-warm/10 text-warm', bg: 'from-warm/10' },
  slate: { ring: 'border-cream-2/40 shadow-[0_0_40px_-12px_rgba(177,188,203,0.45)]', text: 'text-cream-2', chip: 'border-cream-2/30 bg-cream-2/10 text-cream-2', bg: 'from-cream-2/10' },
}

function Icon({ name, className = '' }: { name: FocusArea['icon']; className?: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg viewBox="0 0 24 24" className={`size-5 ${className}`} aria-hidden="true" {...common}>
      {name === 'spark' && <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />}
      {name === 'layers' && <path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" />}
      {name === 'stack' && <path d="M8 6 3 12l5 6M16 6l5 6-5 6M14 4l-4 16" />}
      {name === 'chat' && <path d="M4 5h16v11H9l-5 4V5Zm4 5h8M8 13h5" />}
    </svg>
  )
}

/** Clickable focus cards (a tab list) with a detail panel for the selected area. */
export function FocusCards() {
  const [active, setActive] = useState(focusAreas[0].id)
  const base = useId()
  const current = focusAreas.find((f) => f.id === active)!
  const t = tones[current.tone]

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div role="tablist" aria-label="Current focus areas" aria-orientation="vertical" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {focusAreas.map((f) => {
          const on = f.id === active
          const tt = tones[f.tone]
          return (
            <motion.button
              key={f.id}
              role="tab"
              id={`${base}-tab-${f.id}`}
              aria-selected={on}
              aria-controls={`${base}-panel`}
              tabIndex={on ? 0 : -1}
              type="button"
              onClick={() => setActive(f.id)}
              onKeyDown={(e) => {
                const i = focusAreas.findIndex((x) => x.id === active)
                const step = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
                if (!step) return
                e.preventDefault()
                const next = focusAreas[(i + step + focusAreas.length) % focusAreas.length]
                setActive(next.id)
                document.getElementById(`${base}-tab-${next.id}`)?.focus()
              }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              transition={spring}
              className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${tt.bg} to-transparent p-4 text-left transition-colors cursor-pointer ${on ? tt.ring : 'border-line hover:border-cream-2/30'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className={`grid size-10 place-items-center rounded-xl border ${tt.chip}`}>
                  <Icon name={f.icon} />
                </span>
                <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${tt.chip}`}>{f.status}</span>
              </div>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">{f.kicker}</p>
              <p className="mt-1 font-display text-lg font-bold text-cream">{f.title}</p>
              <p className={`mt-2 font-mono text-[11px] ${on ? tt.text : 'text-muted'}`}>{on ? '● Viewing' : 'Click to inspect →'}</p>
            </motion.button>
          )
        })}
      </div>

      <div id={`${base}-panel`} role="tabpanel" aria-labelledby={`${base}-tab-${current.id}`} className={`panel relative overflow-hidden rounded-3xl p-6 md:p-8 ${t.ring}`}>
        <AnimatePresence mode="wait">
          <motion.div key={current.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <div className="flex items-center gap-3">
              <span className={`grid size-12 place-items-center rounded-2xl border ${t.chip}`}>
                <Icon name={current.icon} className="size-6" />
              </span>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Focus · {current.status}</p>
                <h3 className="font-display text-2xl font-bold text-cream">{current.title}</h3>
              </div>
            </div>
            <p className="mt-5 text-cream-2 leading-relaxed">{current.summary}</p>
            <ul className="mt-6 space-y-3">
              {current.details.map((d) => (
                <li key={d} className="flex gap-3 text-sm text-cream-2">
                  <span className={`mt-1.5 size-1.5 shrink-0 rounded-full bg-current ${t.text}`} aria-hidden="true" />
                  {d}
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-line pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Connected to</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {current.connected.map((c) => (
                  <li key={c} className={`rounded-full border px-2.5 py-1 text-xs ${t.chip}`}>{c}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
        <p className="mt-6 font-mono text-[10px] text-muted">Grounded in documented projects and certificates · no skill percentages</p>
      </div>
    </div>
  )
}
