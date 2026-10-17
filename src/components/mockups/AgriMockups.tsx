import { useState } from 'react'
import { MockFrame, Card, Label, DemoBadge } from './MockFrame'

// All values below are invented sample values for illustration only.

export function AgriDashboard({ compact }: { compact?: boolean }) {
  const bars = [38, 52, 46, 64, 58, 72, 68]
  return (
    <MockFrame title="agri-yield-pro / dashboard" compact={compact}>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="sm:col-span-2">
          <div className="flex items-center justify-between">
            <Label>Estimated yield · Rice</Label>
            <DemoBadge />
          </div>
          <p className="mt-2 font-display text-3xl font-bold text-cream">
            4.2 <span className="text-base font-medium text-cream-2">t/ha (sample)</span>
          </p>
          <div className="mt-4 flex h-20 items-end gap-1.5" aria-hidden="true">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-accent/30 to-accent" style={{ height: `${h}%` }} />
            ))}
          </div>
        </Card>
        <Card>
          <Label>Soil score</Label>
          <div className="relative mx-auto mt-2 size-24">
            <svg viewBox="0 0 36 36" className="size-full -rotate-90" aria-hidden="true">
              <circle cx="18" cy="18" r="15" fill="none" stroke="#2a2a26" strokeWidth="4" />
              <circle cx="18" cy="18" r="15" fill="none" stroke="#d9a95b" strokeWidth="4" strokeDasharray="72 100" strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 grid place-items-center font-display text-xl font-bold">72</span>
          </div>
        </Card>
        <Card className="sm:col-span-3">
          <Label>Suggested actions</Label>
          <ul className="mt-2 grid gap-2 text-xs text-cream-2 sm:grid-cols-3">
            <li className="rounded-lg bg-white/5 px-3 py-2">Nitrogen below crop range</li>
            <li className="rounded-lg bg-white/5 px-3 py-2">Plan irrigation for stage 2</li>
            <li className="rounded-lg bg-white/5 px-3 py-2">Create crop plan →</li>
          </ul>
        </Card>
      </div>
    </MockFrame>
  )
}

export function AgriInputs() {
  const fields = [
    ['Crop', 'Rice'],
    ['Land area', '2.5 acres'],
    ['Soil pH', '6.4'],
    ['Nitrogen (N)', '42 kg/ha'],
    ['Phosphorus (P)', '28 kg/ha'],
    ['Potassium (K)', '35 kg/ha'],
    ['Rainfall', '180 mm'],
    ['Temperature', '29 °C'],
  ]
  return (
    <MockFrame title="agri-yield-pro / farm inputs">
      <div className="grid grid-cols-2 gap-2.5">
        {fields.map(([k, v]) => (
          <div key={k} className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
            <Label>{k}</Label>
            <p className="mt-0.5 text-sm text-cream">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-full bg-accent py-2 text-center text-xs font-semibold text-ink">Estimate yield</div>
    </MockFrame>
  )
}

export function AgriEstimate() {
  const rows = [
    { k: 'Soil pH', pos: 55, ok: true },
    { k: 'Nitrogen', pos: 18, ok: false },
    { k: 'Phosphorus', pos: 48, ok: true },
    { k: 'Potassium', pos: 62, ok: true },
  ]
  return (
    <MockFrame title="agri-yield-pro / estimate explained">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-cream">Inputs vs. crop reference range</p>
        <DemoBadge>Synthetic model</DemoBadge>
      </div>
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.k}>
            <div className="flex justify-between text-xs">
              <span className="text-cream-2">{r.k}</span>
              <span className={r.ok ? 'text-ok' : 'text-warn'}>{r.ok ? 'In range' : 'Below range'}</span>
            </div>
            <div className="relative mt-1.5 h-2 rounded-full bg-white/5">
              <div className="absolute inset-y-0 left-[30%] right-[30%] rounded-full bg-ok/25" aria-hidden="true" />
              <div className={`absolute -top-1 size-4 rounded-full border-2 border-ink ${r.ok ? 'bg-ok' : 'bg-warn'}`} style={{ left: `calc(${r.pos}% - 8px)` }} aria-hidden="true" />
            </div>
          </li>
        ))}
      </ul>
    </MockFrame>
  )
}

export function AgriTimeline() {
  const stages = ['Sowing', 'Vegetative', 'Flowering', 'Harvest']
  const [tasks, setTasks] = useState([
    { t: 'Apply first fertiliser dose', s: 'todo' },
    { t: 'Check standing water level', s: 'todo' },
    { t: 'Weed control', s: 'todo' },
  ])
  const set = (i: number, s: string) => setTasks((ts) => ts.map((x, j) => (j === i ? { ...x, s } : x)))
  return (
    <MockFrame title="agri-yield-pro / crop plan">
      <ol className="mb-4 flex items-center gap-1" aria-label="Growth stages">
        {stages.map((s, i) => (
          <li key={s} className="flex flex-1 flex-col items-center gap-1.5">
            <span className={`h-1.5 w-full rounded-full ${i < 2 ? 'bg-accent' : 'bg-white/10'}`} />
            <span className={`text-[10px] ${i === 1 ? 'text-cream font-semibold' : 'text-muted'}`}>{s}</span>
          </li>
        ))}
      </ol>
      <ul className="space-y-2">
        {tasks.map((x, i) => (
          <li key={x.t} className="flex flex-wrap items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2">
            <span className={`flex-1 text-xs ${x.s === 'done' ? 'text-muted line-through' : x.s === 'skipped' ? 'text-muted' : 'text-cream'}`}>
              {x.t}
              {x.s === 'later' && <span className="ml-2 text-warm">· moved +2 days</span>}
              {x.s === 'skipped' && <span className="ml-2">· skipped</span>}
            </span>
            <span className="flex gap-1">
              {[
                ['done', 'Done'],
                ['skipped', 'Skip'],
                ['later', 'Later'],
              ].map(([k, l]) => (
                <button key={k} type="button" onClick={() => set(i, x.s === k ? 'todo' : k)} aria-pressed={x.s === k} className={`rounded-full border px-2 py-0.5 text-[10px] cursor-pointer ${x.s === k ? 'border-accent bg-accent/20 text-cream' : 'border-white/10 text-cream-2 hover:border-accent-2'}`}>
                  {l}
                  <span className="sr-only"> — {x.t}</span>
                </button>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </MockFrame>
  )
}

export function AgriWeather() {
  return (
    <MockFrame title="agri-yield-pro / weather update">
      <div className="flex items-start gap-3 rounded-xl border border-warm/30 bg-warm/5 p-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-warm/15 text-warm" aria-hidden="true">☂</span>
        <div>
          <p className="text-sm font-semibold text-cream">Heavy rain scenario applied</p>
          <p className="text-xs text-cream-2">Simulated weather — not a live forecast.</p>
        </div>
      </div>
      <ul className="mt-3 space-y-2 text-xs">
        <li className="flex justify-between rounded-lg bg-white/[0.03] px-3 py-2"><span className="text-cream-2 line-through">Irrigate field · Tue</span><span className="text-warn">Paused</span></li>
        <li className="flex justify-between rounded-lg bg-white/[0.03] px-3 py-2"><span className="text-cream">Check drainage channels</span><span className="text-warm">Added</span></li>
        <li className="flex justify-between rounded-lg bg-white/[0.03] px-3 py-2"><span className="text-cream">Fertiliser dose</span><span className="text-cream-2">Moved to Fri</span></li>
      </ul>
    </MockFrame>
  )
}

export function AgriMap() {
  const states = [
    { n: 'Punjab', x: 34, y: 18, v: 0.9 },
    { n: 'Uttar Pradesh', x: 48, y: 30, v: 0.7 },
    { n: 'West Bengal', x: 70, y: 42, v: 0.6 },
    { n: 'Maharashtra', x: 34, y: 56, v: 0.5 },
    { n: 'Andhra Pradesh', x: 50, y: 70, v: 0.65 },
    { n: 'Tamil Nadu', x: 46, y: 86, v: 0.55 },
  ]
  const [sel, setSel] = useState(0)
  return (
    <MockFrame title="agri-yield-pro / india explorer">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative aspect-[4/5] max-h-64 w-full rounded-xl bg-gradient-to-b from-accent/10 to-warm/5">
          <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden="true" preserveAspectRatio="none">
            <path d="M30 6 L52 10 L60 22 L78 30 L84 42 L70 50 L62 62 L56 78 L48 96 L40 82 L32 66 L22 56 L18 44 L26 32 Z" fill="rgba(242,239,232,0.05)" stroke="rgba(244,239,230,0.25)" strokeWidth="0.6" />
          </svg>
          {states.map((s, i) => (
            <button
              key={s.n}
              type="button"
              onClick={() => setSel(i)}
              aria-pressed={sel === i}
              aria-label={s.n}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer"
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
            >
              <span className={`block rounded-full transition-all ${sel === i ? 'size-4 bg-warm ring-4 ring-warm/25' : 'size-3 bg-accent-2 hover:scale-125'}`} />
            </button>
          ))}
        </div>
        <Card className="sm:w-40">
          <Label>Selected state</Label>
          <p className="mt-1 text-sm font-semibold text-cream">{states[sel].n}</p>
          <div className="mt-3 h-2 rounded-full bg-white/5">
            <div className="h-full rounded-full bg-warm" style={{ width: `${states[sel].v * 100}%` }} />
          </div>
          <p className="mt-2"><DemoBadge>Generated data</DemoBadge></p>
        </Card>
      </div>
    </MockFrame>
  )
}
