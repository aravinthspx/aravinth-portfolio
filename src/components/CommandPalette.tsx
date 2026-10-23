import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { profile } from '../content/profile'
import { projects } from '../content/projects'
import { certificates } from '../content/certificates'
import { navSections } from '../lib/sections'
import { gmailUrl } from '../lib/email'
import { useMotionPref } from '../lib/motion'

type Item = { id: string; group: 'Pages' | 'Sections' | 'Projects' | 'Certificates' | 'Actions'; label: string; hint?: string; keywords?: string; run: () => void }

const Ctx = createContext<{ open: () => void }>({ open: () => {} })
/** Opens the palette from anywhere (e.g. the nav's search button). */
export const useCommandPalette = () => useContext(Ctx)

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
export const shortcutLabel = isMac ? '⌘K' : 'Ctrl K'

/** Every word typed must appear somewhere in the item's text. */
function matches(item: Item, q: string) {
  const hay = `${item.label} ${item.hint ?? ''} ${item.keywords ?? ''} ${item.group}`.toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w))
}

function Icon({ group }: { group: Item['group'] }) {
  const d = {
    Pages: 'M5 4h10l4 4v12H5zM15 4v4h4',
    Sections: 'M4 6h16M4 12h16M4 18h10',
    Projects: 'M3 7h18v12H3zM8 7V5h8v2',
    Certificates: 'M12 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-3 3.5L8 22l4-2 4 2-1-3.5',
    Actions: 'M13 2 4 14h7l-1 8 9-12h-7z',
  }[group]
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

/**
 * Site-wide command palette. Ctrl/⌘+K (or the nav button) opens it; type to filter pages,
 * sections, projects, certificates and actions; arrows + Enter to run; Escape to close.
 */
export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const input = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const returnTo = useRef<HTMLElement | null>(null)
  const navigate = useNavigate()
  const { toggle, reduced } = useMotionPref()

  const close = useCallback(() => {
    setOpen(false)
    requestAnimationFrame(() => returnTo.current?.focus?.())
  }, [])

  const show = useCallback(() => {
    returnTo.current = document.activeElement as HTMLElement
    setQ('')
    setActive(0)
    setOpen(true)
  }, [])

  const flash = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2200)
  }

  const items = useMemo<Item[]>(() => {
    const ext = (url: string) => () => window.open(url, '_blank', 'noopener')
    return [
      { id: 'home', group: 'Pages', label: 'Home', hint: '/', run: () => navigate('/') },
      ...projects.map<Item>((p) => ({ id: `case-${p.slug}`, group: 'Pages', label: `${p.name} case study`, hint: `/work/${p.slug}`, keywords: p.caseTitle, run: () => navigate(`/work/${p.slug}`) })),
      ...navSections.filter((s) => s.id !== 'home').map<Item>((s) => ({ id: `sec-${s.id}`, group: 'Sections', label: s.label, hint: `#${s.id}`, run: () => navigate({ pathname: '/', hash: `#${s.id}` }) })),
      ...projects.flatMap<Item>((p) => [
        ...(p.links.liveDemo ? [{ id: `live-${p.slug}`, group: 'Projects' as const, label: `Open ${p.name} live site`, hint: p.links.liveDemo.replace(/^https?:\/\//, ''), run: ext(p.links.liveDemo) }] : []),
        ...(p.links.github ? [{ id: `gh-${p.slug}`, group: 'Projects' as const, label: `${p.name} source code`, hint: 'GitHub', run: ext(p.links.github) }] : []),
      ]),
      ...certificates.map<Item>((c) => ({ id: `cert-${c.id}`, group: 'Certificates', label: c.title, hint: c.provider, run: () => navigate({ pathname: '/', hash: '#certificates' }) })),
      {
        id: 'copy-email',
        group: 'Actions',
        label: 'Copy email address',
        hint: profile.email,
        run: () => {
          navigator.clipboard?.writeText(profile.email).then(() => flash('Email copied'), () => flash(profile.email))
        },
      },
      { id: 'email', group: 'Actions', label: 'Write me an email', hint: 'Opens Gmail', keywords: 'contact mail', run: ext(gmailUrl()) },
      { id: 'github', group: 'Actions', label: 'Open GitHub profile', hint: '@aravinthspx', run: ext(profile.links.github) },
      { id: 'linkedin', group: 'Actions', label: 'Open LinkedIn profile', run: ext(profile.links.linkedin) },
      { id: 'motion', group: 'Actions', label: reduced ? 'Turn animations on' : 'Turn animations off', keywords: 'motion reduce', run: toggle },
    ]
  }, [navigate, reduced, toggle])

  const shown = useMemo(() => (q.trim() ? items.filter((i) => matches(i, q)) : items), [items, q])
  const safeActive = Math.min(active, Math.max(shown.length - 1, 0))

  const runItem = (it: Item) => {
    close()
    // Let the palette close before navigating so focus and scroll land on the new page.
    window.setTimeout(it.run, 60)
  }

  // Global shortcut.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (open) close()
        else show()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close, show])

  useEffect(() => {
    if (!open) return
    input.current?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Keep the highlighted row in view.
  useEffect(() => {
    list.current?.querySelector(`[data-index="${safeActive}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [safeActive])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (Math.min(a, shown.length - 1) + 1) % Math.max(shown.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (Math.min(a, shown.length - 1) - 1 + shown.length) % Math.max(shown.length, 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const it = shown[safeActive]
      if (it) runItem(it)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      close()
    } else if (e.key === 'Tab') {
      e.preventDefault() // keep focus in the search box while open
    }
  }

  let lastGroup = ''

  return (
    <Ctx.Provider value={{ open: show }}>
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-start justify-center bg-ink/70 px-3 pt-[12vh] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onMouseDown={(e) => e.target === e.currentTarget && close()}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
              className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-ink shadow-[0_40px_100px_-30px_rgba(0,0,0,0.45)]"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 500, damping: 34 }}
              onKeyDown={onKeyDown}
            >
              <div className="flex items-center gap-3 border-b border-line px-4">
                <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  ref={input}
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value)
                    setActive(0)
                  }}
                  placeholder="Search pages, projects, certificates…"
                  className="h-14 w-full bg-transparent text-base text-cream placeholder:text-muted focus:outline-none"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="palette-list"
                  aria-activedescendant={shown[safeActive] ? `palette-${shown[safeActive].id}` : undefined}
                  aria-autocomplete="list"
                />
                <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted sm:block">Esc</kbd>
              </div>
              <ul ref={list} id="palette-list" role="listbox" aria-label="Results" className="max-h-[min(60vh,26rem)] overflow-y-auto p-2">
                {shown.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted">No results for “{q}”.</li>}
                {shown.map((it, i) => {
                  const header = it.group !== lastGroup
                  lastGroup = it.group
                  const on = i === safeActive
                  return (
                    <li key={it.id} role="presentation">
                      {header && <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted first:pt-1">{it.group}</p>}
                      <div
                        id={`palette-${it.id}`}
                        role="option"
                        aria-selected={on}
                        data-index={i}
                        onMouseMove={() => setActive(i)}
                        onClick={() => runItem(it)}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${on ? 'bg-cream text-ink' : 'text-cream'}`}
                      >
                        <Icon group={it.group} />
                        <span className="min-w-0 flex-1 truncate font-medium">{it.label}</span>
                        {it.hint && <span className={`truncate font-mono text-[11px] ${on ? 'text-ink/60' : 'text-muted'}`}>{it.hint}</span>}
                      </div>
                    </li>
                  )
                })}
              </ul>
              <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                <span>↑↓ move</span>
                <span>↵ open</span>
                <span className="ml-auto">{shortcutLabel} toggle</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <motion.p
            role="status"
            className="fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 rounded-full bg-cream px-4 py-2 text-sm font-semibold text-ink shadow-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {toast}
          </motion.p>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  )
}

/** Button that opens the palette, showing the keyboard shortcut. */
export function PaletteButton({ className = '' }: { className?: string }) {
  const { open } = useCommandPalette()
  return (
    <button
      type="button"
      onClick={open}
      aria-label="Open command palette"
      className={`inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-[13px] text-cream-2 transition-colors hover:border-cream hover:text-cream cursor-pointer ${className}`}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <span>Search</span>
      <kbd className="rounded-md border border-line bg-ink-2 px-1.5 py-0.5 font-mono text-[10px] text-muted">{shortcutLabel}</kbd>
    </button>
  )
}
