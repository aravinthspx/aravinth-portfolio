import { useRef, useState } from 'react'
import { MockFrame, Card, Label, DemoBadge } from './MockFrame'

// Concept visuals. Building names and seat values are generic samples, not real campus data.

const buildings = [
  { id: 'lib', name: 'Library Block', x: 28, y: 30, w: 22, h: 16, spaces: 'Reading hall · 2 floors', free: 18 },
  { id: 'lab', name: 'Lab Block', x: 60, y: 22, w: 18, h: 22, spaces: 'Computer labs · 3 floors', free: 6 },
  { id: 'acad', name: 'Academic Block', x: 54, y: 58, w: 28, h: 16, spaces: 'Study rooms · 4 floors', free: 11 },
  { id: 'tech', name: 'Tech Park', x: 18, y: 62, w: 20, h: 20, spaces: 'Project labs · 5 floors', free: 0 },
]

export function SittoMap({ compact }: { compact?: boolean }) {
  const [sel, setSel] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null)
  const clampZoom = (z: number) => Math.min(2, Math.max(1, +z.toFixed(2)))
  const nudge = (dx: number, dy: number) => setPan((p) => ({ x: p.x + dx, y: p.y + dy }))
  const current = buildings.find((b) => b.id === sel)

  return (
    <MockFrame title="sitto / campus map — concept" tone="warm" compact={compact}>
      <div className="grid gap-3 md:grid-cols-[1fr_12rem]">
        <div
          className="relative aspect-[4/3] touch-none overflow-hidden rounded-xl bg-[radial-gradient(circle_at_30%_20%,rgba(217,169,91,0.10),transparent_60%),#121210]"
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest('button')) return
            drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y }
            ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
          }}
          onPointerMove={(e) => {
            if (!drag.current) return
            setPan({ x: drag.current.px + (e.clientX - drag.current.x), y: drag.current.py + (e.clientY - drag.current.y) })
          }}
          onPointerUp={() => (drag.current = null)}
        >
          <div className="absolute inset-0 origin-center transition-transform duration-200" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden="true">
              <path d="M0 50 H100 M45 0 V100" stroke="rgba(244,239,230,0.08)" strokeWidth="3" />
              <circle cx="45" cy="50" r="6" fill="rgba(185,215,122,0.15)" />
            </svg>
            {buildings.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSel(b.id)}
                aria-pressed={sel === b.id}
                className={`absolute rounded-lg border text-[9px] font-semibold leading-tight transition-colors cursor-pointer sm:text-[10px] ${sel === b.id ? 'border-warm bg-warm/25 text-cream' : 'border-white/15 bg-white/[0.06] text-cream-2 hover:border-warm/60 hover:bg-warm/10'}`}
                style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
              >
                <span className="absolute -right-1.5 -top-1.5 flex size-3" aria-hidden="true">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-warm opacity-60" />
                  <span className="relative inline-flex size-3 rounded-full bg-warm" />
                </span>
                {b.name}
              </button>
            ))}
          </div>
          <div className="absolute bottom-2 right-2 flex flex-col gap-1" role="group" aria-label="Map controls">
            {[
              ['+', 'Zoom in', () => setZoom((z) => clampZoom(z + 0.25))],
              ['−', 'Zoom out', () => setZoom((z) => clampZoom(z - 0.25))],
              ['⟲', 'Reset view', () => { setZoom(1); setPan({ x: 0, y: 0 }) }],
            ].map(([s, l, fn]) => (
              <button key={l as string} type="button" onClick={fn as () => void} aria-label={l as string} className="grid size-8 place-items-center rounded-lg border border-white/15 bg-ink/80 text-sm text-cream hover:border-warm cursor-pointer">
                {s as string}
              </button>
            ))}
          </div>
          <div className="absolute bottom-2 left-2 hidden gap-1 sm:flex" role="group" aria-label="Pan map">
            {[
              ['←', 'Pan left', 30, 0],
              ['↑', 'Pan up', 0, 30],
              ['↓', 'Pan down', 0, -30],
              ['→', 'Pan right', -30, 0],
            ].map(([s, l, dx, dy]) => (
              <button key={l as string} type="button" onClick={() => nudge(dx as number, dy as number)} aria-label={l as string} className="grid size-7 place-items-center rounded-md border border-white/15 bg-ink/80 text-xs text-cream hover:border-warm cursor-pointer">
                {s as string}
              </button>
            ))}
          </div>
        </div>
        <Card>
          <Label>Building</Label>
          <div aria-live="polite">
            {current ? (
              <>
                <p className="mt-1 text-sm font-semibold text-cream">{current.name}</p>
                <p className="mt-1 text-xs text-cream-2">{current.spaces}</p>
                <p className={`mt-3 text-xs ${current.free ? 'text-ok' : 'text-bad'}`}>{current.free ? `${current.free} seats free` : 'No seats free'} <span className="text-muted">(sample)</span></p>
                <p className="mt-3 text-xs text-warm">View building details →</p>
              </>
            ) : (
              <p className="mt-1 text-xs text-cream-2">Select a building hotspot, or Tab to one and press Enter.</p>
            )}
          </div>
        </Card>
      </div>
    </MockFrame>
  )
}

export function SittoBuilding() {
  const floors = [
    { f: 'Floor 2', items: [['Reading hall', 'Library', 14, 40]] },
    { f: 'Floor 1', items: [['Digital library', 'Library', 4, 24], ['Discussion room', 'Room', 0, 8]] },
    { f: 'Ground', items: [['Periodicals', 'Library', 0, 0]] },
  ] as const
  return (
    <MockFrame title="sitto / building details" tone="warm">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-lg font-semibold text-cream">Library Block</p>
        <DemoBadge>Sample values</DemoBadge>
      </div>
      <ul className="space-y-3">
        {floors.map((fl) => (
          <li key={fl.f}>
            <Label>{fl.f}</Label>
            <ul className="mt-1.5 space-y-1.5">
              {fl.items.map(([n, t, free, total]) => (
                <li key={n} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2 text-xs">
                  <span className="text-cream">{n} <span className="text-muted">· {t}</span></span>
                  <span className={total === 0 ? 'text-muted' : free ? 'text-ok' : 'text-bad'}>{total === 0 ? 'No bookable seats' : `${free}/${total} free`}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </MockFrame>
  )
}

export function SittoSeats() {
  const pattern = 'AARAOAARAOAAOARAAROAAOAA'
  const style = { A: 'bg-ok/25 border-ok/50 text-ok', R: 'bg-warn/20 border-warn/50 text-warn', O: 'bg-bad/20 border-bad/50 text-bad' } as const
  const name = { A: 'Available', R: 'Reserved', O: 'Occupied' } as const
  return (
    <MockFrame title="sitto / reading hall seats" tone="warm">
      <div className="mb-3 flex flex-wrap items-center gap-3 text-[11px] text-cream-2">
        {(['A', 'R', 'O'] as const).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5"><span className={`size-2.5 rounded-sm border ${style[k]}`} />{name[k]}</span>
        ))}
        <span className="ml-auto"><DemoBadge>Sample, not live</DemoBadge></span>
      </div>
      <ul className="grid grid-cols-6 gap-1.5" aria-label="Seat map with sample values">
        {pattern.split('').map((c, i) => {
          const k = c as keyof typeof style
          const id = `${String.fromCharCode(65 + Math.floor(i / 6))}${(i % 6) + 1}`
          return (
            <li key={i} className={`grid aspect-square place-items-center rounded-md border font-mono text-[9px] ${style[k]}`} aria-label={`Seat ${id}: ${name[k]}`}>
              {id}
            </li>
          )
        })}
      </ul>
    </MockFrame>
  )
}

export function SittoStates() {
  const [s, setS] = useState<'loading' | 'error' | 'empty'>('error')
  return (
    <MockFrame title="sitto / search states — proposed" tone="warm">
      <div role="tablist" aria-label="Interface state" className="mb-3 inline-flex rounded-full border border-white/10 p-0.5">
        {(['loading', 'error', 'empty'] as const).map((k) => (
          <button key={k} role="tab" type="button" aria-selected={s === k} onClick={() => setS(k)} className={`rounded-full px-3 py-1 text-[11px] capitalize cursor-pointer ${s === k ? 'bg-warm/20 text-cream' : 'text-cream-2 hover:text-cream'}`}>
            {k}
          </button>
        ))}
      </div>
      <div className="min-h-36 rounded-xl border border-white/5 bg-white/[0.02] p-4" role="tabpanel">
        {s === 'loading' && (
          <div className="space-y-2" aria-label="Loading spaces">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-9 animate-pulse rounded-lg bg-white/5" />
            ))}
          </div>
        )}
        {s === 'error' && (
          <div className="text-center">
            <p className="text-sm font-semibold text-cream">Couldn’t load campus spaces</p>
            <p className="mx-auto mt-1 max-w-xs text-xs text-cream-2">This is a connection problem, not an empty campus. Your filters are kept.</p>
            <span className="mt-3 inline-block rounded-full bg-warm px-4 py-1.5 text-xs font-semibold text-ink">Try again</span>
          </div>
        )}
        {s === 'empty' && (
          <div className="text-center">
            <p className="text-sm font-semibold text-cream">No spaces match these filters</p>
            <p className="mx-auto mt-1 max-w-xs text-xs text-cream-2">Try another building or remove the “labs only” filter.</p>
            <span className="mt-3 inline-block rounded-full border border-white/15 px-4 py-1.5 text-xs text-cream">Clear filters</span>
          </div>
        )}
      </div>
    </MockFrame>
  )
}
