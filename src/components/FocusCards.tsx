import { useEffect, useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { focusAreas, type FocusArea } from '../content/focus'
import { SMOOTH, spring, useMotionPref } from '../lib/motion'

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

/* ---- Constellation layout: me in the middle, focus areas on an inner ring, real work on the outer ring ---- */

const at = (deg: number, r: number) => ({ x: 50 + Math.cos((deg * Math.PI) / 180) * r, y: 50 + Math.sin((deg * Math.PI) / 180) * r })

// Inner ring angles per focus area (degrees, 0 = right, clockwise)
const FOCUS_ANGLE: Record<string, number> = { 'ai-ml': -135, fullstack: -45, 'ai-assisted': 45, product: 135 }

// Outer ring: each project / certificate placed near the areas it feeds
const SATELLITES: { name: string; short: string; angle: number }[] = [
  { name: 'Agri-Yield Pro', short: 'Agri-Yield Pro', angle: -90 },
  { name: 'This portfolio', short: 'This portfolio', angle: -38 },
  { name: 'DeepLearning.AI', short: 'DeepLearning.AI', angle: 0 },
  { name: 'Datacom', short: 'Datacom', angle: 32 },
  { name: 'Deloitte', short: 'Deloitte', angle: 78 },
  { name: 'SITTO', short: 'SITTO', angle: 108 },
  { name: 'GenAI Job Simulation (BCG X)', short: 'BCG X GenAI', angle: -152 },
]

const INNER = 25
const OUTER = 45
const pos = {
  focus: (id: string) => at(FOCUS_ANGLE[id] ?? 0, INNER),
  sat: (name: string) => at(SATELLITES.find((s) => s.name === name)?.angle ?? 0, OUTER),
}

/** Current focus as an interactive knowledge map with a detail panel for the selected area. */
export function FocusCards() {
  const { reduced } = useMotionPref()
  const [active, setActive] = useState(focusAreas[0].id)
  const [touched, setTouched] = useState(false) // stop auto-tour once the visitor interacts
  const [hoverSat, setHoverSat] = useState<string | null>(null)
  const base = useId()
  const current = focusAreas.find((f) => f.id === active)!

  useEffect(() => {
    if (touched || reduced) return
    const t = window.setTimeout(() => {
      const i = focusAreas.findIndex((f) => f.id === active)
      setActive(focusAreas[(i + 1) % focusAreas.length].id)
    }, 4500)
    return () => window.clearTimeout(t)
  }, [active, touched, reduced])

  const pick = (id: string) => {
    setTouched(true)
    setActive(id)
  }
  // Which focus areas are "lit": the selected one, or every area a hovered satellite connects to
  const lit = (f: FocusArea) => (hoverSat ? f.connected.includes(hoverSat) : f.id === active)
  const satLit = (name: string) => (hoverSat ? hoverSat === name : current.connected.includes(name))

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_1fr]">
      {/* ---------------- Map ---------------- */}
      <div className="relative mx-auto aspect-square w-full max-w-[34rem]" onMouseLeave={() => setHoverSat(null)}>
        {/* orbit rings */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
          <motion.circle cx="50" cy="50" r={INNER} fill="none" stroke="currentColor" strokeWidth="0.25" strokeDasharray="0.8 1.4" className="text-cream/25" animate={reduced ? undefined : { rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: 'linear' }} style={{ originX: '50px', originY: '50px' }} />
          <motion.circle cx="50" cy="50" r={OUTER} fill="none" stroke="currentColor" strokeWidth="0.25" strokeDasharray="0.8 1.4" className="text-cream/20" animate={reduced ? undefined : { rotate: -360 }} transition={{ duration: 180, repeat: Infinity, ease: 'linear' }} style={{ originX: '50px', originY: '50px' }} />

          {/* me → focus edges, with a pulse travelling outwards */}
          {focusAreas.map((f) => {
            const p = pos.focus(f.id)
            const on = lit(f)
            return (
              <g key={f.id}>
                <motion.line x1={50} y1={50} x2={p.x} y2={p.y} stroke="currentColor" className="text-cream" animate={{ strokeOpacity: on ? 0.75 : 0.15, strokeWidth: on ? 0.5 : 0.3 }} transition={{ duration: 0.4 }} />
                {on && !reduced && (
                  <motion.circle r="0.9" className="fill-cream" initial={{ cx: 50, cy: 50, opacity: 0 }} animate={{ cx: [50, p.x], cy: [50, p.y], opacity: [0, 1, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }} />
                )}
              </g>
            )
          })}

          {/* focus → work edges */}
          {focusAreas.flatMap((f) =>
            f.connected.map((c) => {
              const a = pos.focus(f.id)
              const b = pos.sat(c)
              const on = lit(f) && satLit(c)
              return (
                <g key={`${f.id}-${c}`}>
                  <motion.line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="currentColor"
                    strokeDasharray="1.2 1.2"
                    className="text-cream"
                    animate={{ strokeOpacity: on ? 0.7 : 0.1, strokeDashoffset: reduced ? 0 : on ? [0, -4.8] : 0 }}
                    transition={{ strokeOpacity: { duration: 0.4 }, strokeDashoffset: { duration: 1.2, repeat: Infinity, ease: 'linear' } }}
                    strokeWidth={0.35}
                  />
                </g>
              )
            }),
          )}
        </svg>

        {/* centre: me */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative grid size-16 place-items-center rounded-full bg-cream font-display text-lg font-bold text-ink shadow-[0_20px_40px_-16px_rgba(0,0,0,0.5)] sm:size-20 sm:text-xl">
            {!reduced && (
              <>
                <span className="absolute inset-0 animate-ping rounded-full bg-cream/20 [animation-duration:2.6s]" aria-hidden="true" />
                <span className="absolute -inset-3 rounded-full border border-cream/15" aria-hidden="true" />
              </>
            )}
            <span className="relative">AM</span>
          </div>
        </div>

        {/* focus nodes (tabs) */}
        <div role="tablist" aria-label="Current focus areas" className="contents">
          {focusAreas.map((f) => {
            const p = pos.focus(f.id)
            const on = f.id === active
            const glow = lit(f)
            return (
              <motion.button
                key={f.id}
                role="tab"
                id={`${base}-tab-${f.id}`}
                aria-selected={on}
                aria-controls={`${base}-panel`}
                tabIndex={on ? 0 : -1}
                type="button"
                onClick={() => pick(f.id)}
                onMouseEnter={() => !touched && setActive(f.id)}
                onKeyDown={(e) => {
                  const i = focusAreas.findIndex((x) => x.id === active)
                  const step = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
                  if (!step) return
                  e.preventDefault()
                  const next = focusAreas[(i + step + focusAreas.length) % focusAreas.length]
                  pick(next.id)
                  document.getElementById(`${base}-tab-${next.id}`)?.focus()
                }}
                className="group absolute flex w-28 -translate-x-1/2 -translate-y-6 flex-col items-center text-center shadow-none hover:shadow-none sm:w-36"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                initial={reduced ? false : { opacity: 0, scale: 0.4 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: 0.1 + focusAreas.indexOf(f) * 0.08 }}
              >
                <motion.span
                  className={`relative grid size-12 place-items-center rounded-2xl border transition-colors duration-300 sm:size-14 ${glow ? 'border-cream bg-cream text-ink shadow-[0_18px_40px_-14px_rgba(0,0,0,0.55)]' : 'border-line bg-ink text-cream-2 group-hover:border-cream/50'}`}
                  animate={{ scale: on ? 1.12 : 1, rotate: on ? -6 : 0 }}
                  transition={spring}
                >
                  <Icon name={f.icon} className="sm:size-6" />
                  {on && !reduced && <motion.span layoutId={`${base}-halo`} className="absolute -inset-2 rounded-[1.2rem] border border-cream/40" transition={spring} aria-hidden="true" />}
                </motion.span>
                <span className={`mt-2 rounded-md bg-ink/85 px-1.5 font-display text-[12px] font-bold leading-tight backdrop-blur-sm transition-colors sm:text-sm ${glow ? 'text-cream' : 'text-cream-2'}`}>{f.title}</span>
                <span className="mt-0.5 rounded bg-ink/85 px-1 font-mono text-[9px] uppercase tracking-[0.16em] text-muted">{f.status}</span>
              </motion.button>
            )
          })}
        </div>

        {/* outer ring: real projects and certificates */}
        {SATELLITES.map((s, i) => {
          const p = pos.sat(s.name)
          const on = satLit(s.name)
          return (
            <motion.div
              key={s.name}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              initial={reduced ? false : { opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ ...spring, delay: 0.45 + i * 0.05 }}
            >
              <button
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                onMouseEnter={() => setHoverSat(s.name)}
                onFocus={() => setHoverSat(s.name)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] transition-all duration-300 sm:text-[10px] ${on ? 'border-cream bg-cream text-ink shadow-md' : 'border-line bg-ink/90 text-muted'}`}
              >
                <span className={`size-1.5 rounded-full ${on ? 'bg-ink' : 'bg-cream/30'}`} />
                <span className={on ? '' : 'hidden sm:inline'}>{s.short}</span>
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* ---------------- Detail panel ---------------- */}
      <div id={`${base}-panel`} role="tabpanel" aria-labelledby={`${base}-tab-${current.id}`} className="panel relative overflow-hidden rounded-3xl p-6 md:p-8">
        {/* auto-tour progress */}
        {!touched && !reduced && (
          <motion.span key={active} className="absolute inset-x-0 top-0 h-0.5 origin-left bg-cream/70" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 4.5, ease: 'linear' }} aria-hidden="true" />
        )}
        <AnimatePresence mode="wait">
          <motion.div key={current.id} initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }} transition={{ duration: 0.35, ease: SMOOTH }}>
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-cream text-ink">
                <Icon name={current.icon} className="size-6" />
              </span>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                  {current.kicker} · {current.status}
                </p>
                <h3 className="font-display text-2xl font-bold text-cream">{current.title}</h3>
              </div>
            </div>
            <p className="mt-5 leading-relaxed text-cream-2">{current.summary}</p>
            <ul className="mt-6 space-y-3">
              {current.details.map((d, i) => (
                <motion.li key={d} className="flex gap-3 text-sm text-cream-2" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.08, duration: 0.35, ease: SMOOTH }}>
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-cream" aria-hidden="true" />
                  {d}
                </motion.li>
              ))}
            </ul>
            <div className="mt-6 border-t border-line pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Connected to</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {current.connected.map((c) => (
                  <li key={c} onMouseEnter={() => setHoverSat(c)} onMouseLeave={() => setHoverSat(null)} className="cursor-default rounded-full border border-line bg-ink-2 px-2.5 py-1 text-xs text-cream-2 transition-colors hover:border-cream hover:text-cream">
                    {c}
                  </li>
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
