import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { getProject } from '../content/projects'

/**
 * A small typeable console for Agri-Yield Pro. Every answer comes from the documented
 * project content (src/content/projects.ts) — nothing here is a live system.
 */

const p = getProject('agri-yield-pro')!

type Line = { kind: 'in' | 'out'; text: ReactNode }

const commands: Record<string, { help: string; run: () => ReactNode }> = {
  help: {
    help: 'list commands',
    run: () => (
      <ul className="space-y-0.5">
        {Object.entries(commands).map(([k, v]) => (
          <li key={k}>
            <span className="text-accent">{k.padEnd(12, ' ')}</span>
            <span className="text-muted">{v.help}</span>
          </li>
        ))}
      </ul>
    ),
  },
  about: { help: 'what it is', run: () => `${p.name} — ${p.type}. ${p.summary}` },
  status: {
    help: 'build status',
    run: () => (
      <ul>
        <li>• Locally runnable prototype — FastAPI backend + Vite frontend</li>
        <li>• Models trained on synthetic data; no measured field accuracy</li>
        <li>• Weather updates simulated; assistant is keyword-based (not an LLM)</li>
        <li className="text-warn">• Not production-ready (auth/ownership checks incomplete)</li>
      </ul>
    ),
  },
  stack: { help: 'technologies used', run: () => p.stack.join(' · ') },
  features: {
    help: 'documented features',
    run: () => (
      <ul>
        {p.features
          .filter((f) => f.status === 'documented')
          .map((f) => (
            <li key={f.label}>
              <span className="text-ok">✓</span> {f.label}
              {f.note && <span className="text-muted"> ({f.note})</span>}
            </li>
          ))}
      </ul>
    ),
  },
  journey: { help: 'main user journey', run: () => p.journey.join('  →  ') },
  limits: {
    help: 'known limitations',
    run: () => (
      <ul>
        {p.evidence.limitations.map((l) => (
          <li key={l}>! {l}</li>
        ))}
      </ul>
    ),
  },
  team: { help: 'who built it', run: () => `${p.overview.team} · ${p.overview.context}` },
  next: {
    help: 'next steps',
    run: () => (
      <ul>
        {p.reflection.next.map((l) => (
          <li key={l}>→ {l}</li>
        ))}
      </ul>
    ),
  },
  clear: { help: 'clear the console', run: () => null },
}

const quick = ['status', 'stack', 'features', 'limits', 'help']

export function Terminal() {
  const [lines, setLines] = useState<Line[]>([{ kind: 'out', text: 'Agri-Yield Pro console. Type a command or tap one below — try “status”.' }])
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [hIdx, setHIdx] = useState(-1)
  const scroller = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight })
  }, [lines])

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase().replace(/^\$\s*/, '')
    if (!cmd) return
    setHistory((h) => [cmd, ...h].slice(0, 20))
    setHIdx(-1)
    if (cmd === 'clear') {
      setLines([])
      return
    }
    const c = commands[cmd]
    setLines((ls) => [
      ...ls,
      { kind: 'in', text: cmd },
      { kind: 'out', text: c ? c.run() : <span className="text-bad">command not found: {cmd} — type “help”</span> },
    ])
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    run(value)
    setValue('')
  }

  return (
    <div className="panel glow-ring overflow-hidden rounded-3xl">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-bad/70" />
          <span className="size-2.5 rounded-full bg-warn/70" />
          <span className="size-2.5 rounded-full bg-ok/70" />
        </span>
        <span className="ml-2 font-mono text-xs text-muted">agri-yield-pro — console</span>
        <span className="ml-auto rounded-full border border-ok/30 bg-ok/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ok">Ready</span>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-line px-4 py-3" role="group" aria-label="Sample commands">
        {quick.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => {
              run(q)
              input.current?.focus()
            }}
            className="rounded-lg border border-line bg-ink-3/60 px-2.5 py-1 font-mono text-xs text-cream-2 hover:border-accent/60 hover:text-accent cursor-pointer"
          >
            ${q}
          </button>
        ))}
      </div>

      <div
        ref={scroller}
        role="log"
        aria-live="polite"
        aria-label="Console output"
        className="h-72 overflow-y-auto px-4 py-3 font-mono text-[13px] leading-relaxed text-cream-2"
        onClick={() => input.current?.focus()}
      >
        {lines.map((l, i) =>
          l.kind === 'in' ? (
            <p key={i} className="mt-2 text-cream">
              <span className="text-leaf">aravinth</span>
              <span className="text-muted">@portfolio</span>
              <span className="text-accent">:~$</span> {l.text}
            </p>
          ) : (
            <div key={i} className="mt-1 whitespace-pre-wrap">
              {l.text}
            </div>
          ),
        )}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-line px-4 py-3 font-mono text-[13px]">
        <label htmlFor="term-input" className="shrink-0">
          <span className="text-leaf">aravinth</span>
          <span className="text-accent">:~$</span>
          <span className="sr-only">Type a console command</span>
        </label>
        <input
          id="term-input"
          ref={input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp' && history.length) {
              e.preventDefault()
              const n = Math.min(history.length - 1, hIdx + 1)
              setHIdx(n)
              setValue(history[n])
            } else if (e.key === 'ArrowDown') {
              e.preventDefault()
              const n = hIdx - 1
              setHIdx(n)
              setValue(n >= 0 ? history[n] : '')
            }
          }}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="help"
          className="min-w-0 flex-1 bg-transparent text-cream placeholder:text-muted/60 focus:outline-none"
        />
        <button type="submit" className="rounded-md border border-line px-2 py-1 text-xs text-cream-2 hover:border-accent hover:text-accent cursor-pointer">
          Run
        </button>
      </form>
    </div>
  )
}
