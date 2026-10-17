import type { ReactNode } from 'react'

/** Browser-style frame that always carries an "Illustrative mockup" label. */
export function MockFrame({ title, children, tone = 'accent', compact = false }: { title: string; children: ReactNode; tone?: 'accent' | 'warm'; compact?: boolean }) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-line bg-[#0e0e0d] shadow-2xl shadow-black/40" aria-label={`Illustrative mockup: ${title}`}>
      <div className="flex items-center gap-2 border-b border-line/70 bg-ink-2 px-3 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#35342f]" />
          <span className="size-2.5 rounded-full bg-[#35342f]" />
          <span className="size-2.5 rounded-full bg-[#35342f]" />
        </span>
        <span className="ml-1 truncate font-mono text-[10px] text-muted">{title}</span>
        <span className={`ml-auto shrink-0 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${tone === 'accent' ? 'border-accent/40 text-accent-2' : 'border-warm/40 text-warm'}`}>
          Illustrative mockup
        </span>
      </div>
      <div className={compact ? 'p-3' : 'p-4 sm:p-5'}>{children}</div>
    </figure>
  )
}

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-xl border border-white/5 bg-white/[0.03] p-3 ${className}`}>{children}</div>
)

export const Label = ({ children }: { children: ReactNode }) => <p className="font-mono text-[10px] uppercase tracking-wider text-muted">{children}</p>

export const DemoBadge = ({ children = 'Demo data' }: { children?: ReactNode }) => (
  <span className="rounded-full bg-warn/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-warn">{children}</span>
)
