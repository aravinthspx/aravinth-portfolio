import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { profile } from '../content/profile'
import { projects } from '../content/projects'
import { certificates } from '../content/certificates'
import { navSections } from '../lib/sections'
import { gmailUrl } from '../lib/email'
import { SMOOTH, spring, useMotionPref } from '../lib/motion'
import { menuInfo } from './MenuExtras'

type Group = 'Pages' | 'Sections' | 'Projects' | 'Certificates' | 'Actions'
type Preview = { img: string; fit?: 'cover' | 'contain' } | { big: string; small: string }
type Item = { id: string; group: Group; label: string; hint?: string; keywords?: string; preview?: Preview; run: () => void }

const Ctx = createContext<{ open: () => void }>({ open: () => {} })
/** Opens the palette from anywhere (e.g. the nav's search button). */
export const useCommandPalette = () => useContext(Ctx)

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
export const shortcutLabel = isMac ? '⌘K' : 'Ctrl K'

const HINTS = ['SITTO', 'certificates', 'email', 'Agri-Yield', 'education', 'GitHub']

/** Every word typed must appear somewhere in the item's text. */
function matches(item: Item, q: string) {
  const hay = `${item.label} ${item.hint ?? ''} ${item.keywords ?? ''} ${item.group}`.toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w))
}

/** Bolds the parts of `text` that match any typed word. */
function Highlight({ text, q }: { text: string; q: string }) {
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return <>{text}</>
  const re = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  return (
    <>
      {text.split(re).map((part, i) =>
        words.includes(part.toLowerCase()) ? (
          <mark key={i} className="rounded-sm bg-transparent font-bold text-inherit underline decoration-2 underline-offset-2">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

function Icon({ group }: { group: Group }) {
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

/** Cycling "Try …" suggestions shown in the empty search box. */
function RotatingHint() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = window.setInterval(() => setI((n) => (n + 1) % HINTS.length), 2200)
    return () => window.clearInterval(t)
  }, [])
  return (
    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center gap-1.5 text-base text-muted" aria-hidden="true">
      Try
      <span className="relative inline-flex h-6 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={HINTS[i]}
            className="inline-block font-semibold text-cream-2"
            initial={{ y: '100%', opacity: 0, filter: 'blur(4px)' }}
            animate={{ y: '0%', opacity: 1, filter: 'blur(0px)', transition: { duration: 0.5, ease: SMOOTH } }}
            exit={{ y: '-100%', opacity: 0, transition: { duration: 0.35, ease: SMOOTH } }}
          >
            “{HINTS[i]}”
          </motion.span>
        </AnimatePresence>
      </span>
      …
    </span>
  )
}

/** Right-hand panel: a picture or a big label for the highlighted result. */
function PreviewPanel({ item }: { item: Item | undefined }) {
  return (
    <div className="relative hidden overflow-hidden border-l border-line bg-ink-2 sm:block">
      <AnimatePresence mode="popLayout" initial={false}>
        {item && (
          <motion.div
            key={item.id}
            className="absolute inset-0 flex flex-col p-4"
            initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.45, ease: SMOOTH } }}
            exit={{ opacity: 0, y: -12, filter: 'blur(4px)', transition: { duration: 0.25 } }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">{item.group}</p>
            <div className="mt-3 overflow-hidden rounded-xl border border-line bg-ink">
              {item.preview && 'img' in item.preview ? (
                <img src={item.preview.img} alt="" className={`block aspect-[4/3] w-full ${item.preview.fit === 'contain' ? 'object-contain grayscale' : 'object-cover object-top'}`} />
              ) : (
                <div className="flex aspect-[4/3] flex-col justify-end p-4">
                  <span className="font-display text-4xl font-bold leading-none tracking-tight text-cream">{item.preview?.big ?? '→'}</span>
                  <span className="mt-2 truncate font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{item.preview?.small ?? item.hint}</span>
                </div>
              )}
            </div>
            <p className="mt-4 font-display text-lg font-bold leading-snug text-cream">{item.label}</p>
            {item.hint && <p className="mt-1 truncate font-mono text-[11px] text-muted">{item.hint}</p>}
            <p className="mt-auto flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              <kbd className="rounded border border-line px-1.5 py-0.5 text-cream">↵</kbd> to open
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
    const shot = (slug: string) => projects.find((p) => p.slug === slug)?.screens.find((s) => s.image)?.image?.small
    const sectionPreview = (id: string): Preview | undefined => {
      const m = menuInfo[id]
      if (!m) return undefined
      return 'img' in m ? { img: m.img, fit: m.fit } : { big: m.big, small: m.small }
    }
    return [
      { id: 'home', group: 'Pages', label: 'Home', hint: '/', preview: sectionPreview('home'), run: () => navigate('/') },
      ...projects.map<Item>((p) => ({ id: `case-${p.slug}`, group: 'Pages', label: `${p.name} case study`, hint: `/work/${p.slug}`, keywords: p.caseTitle, preview: shot(p.slug) ? { img: shot(p.slug)! } : undefined, run: () => navigate(`/work/${p.slug}`) })),
      ...navSections.filter((s) => s.id !== 'home').map<Item>((s) => ({ id: `sec-${s.id}`, group: 'Sections', label: s.label, hint: `#${s.id}`, preview: sectionPreview(s.id), run: () => navigate({ pathname: '/', hash: `#${s.id}` }) })),
      ...projects.flatMap<Item>((p) => [
        ...(p.links.liveDemo ? [{ id: `live-${p.slug}`, group: 'Projects' as const, label: `Open ${p.name} live site`, hint: p.links.liveDemo.replace(/^https?:\/\//, ''), preview: shot(p.slug) ? { img: shot(p.slug)! } : undefined, run: ext(p.links.liveDemo) }] : []),
        ...(p.links.github ? [{ id: `gh-${p.slug}`, group: 'Projects' as const, label: `${p.name} source code`, hint: 'GitHub', preview: { big: '</>', small: `${p.name} on GitHub` }, run: ext(p.links.github) }] : []),
      ]),
      ...certificates.map<Item>((c) => ({ id: `cert-${c.id}`, group: 'Certificates', label: c.title, hint: c.provider, preview: c.thumb ? { img: c.thumb } : { big: '★', small: c.provider }, run: () => navigate({ pathname: '/', hash: '#certificates' }) })),
      {
        id: 'copy-email',
        group: 'Actions',
        label: 'Copy email address',
        hint: profile.email,
        preview: { big: '@', small: profile.email },
        run: () => {
          navigator.clipboard?.writeText(profile.email).then(() => flash('Email copied'), () => flash(profile.email))
        },
      },
      { id: 'email', group: 'Actions', label: 'Write me an email', hint: 'Opens Gmail', keywords: 'contact mail', preview: { big: 'Hello', small: 'Opens Gmail' }, run: ext(gmailUrl()) },
      { id: 'github', group: 'Actions', label: 'Open GitHub profile', hint: '@aravinthspx', preview: { big: 'GH', small: '@aravinthspx' }, run: ext(profile.links.github) },
      { id: 'linkedin', group: 'Actions', label: 'Open LinkedIn profile', preview: { big: 'in', small: 'LinkedIn' }, run: ext(profile.links.linkedin) },
      { id: 'motion', group: 'Actions', label: reduced ? 'Turn animations on' : 'Turn animations off', keywords: 'motion reduce', preview: { big: reduced ? 'On' : 'Off', small: 'Animations' }, run: toggle },
    ]
  }, [navigate, reduced, toggle])

  const shown = useMemo(() => (q.trim() ? items.filter((i) => matches(i, q)) : items), [items, q])
  const safeActive = Math.min(active, Math.max(shown.length - 1, 0))

  const runItem = (it: Item) => {
    close()
    // Let the palette close before navigating so focus and scroll land on the new page.
    window.setTimeout(it.run, 80)
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
    const t = window.setTimeout(() => input.current?.focus(), 30)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.clearTimeout(t)
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
            className="fixed inset-0 z-[80] flex items-start justify-center bg-ink/60 px-3 pt-[10vh]"
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)', transition: { duration: 0.35 } }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)', transition: { duration: 0.3, delay: 0.05 } }}
            onMouseDown={(e) => e.target === e.currentTarget && close()}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
              className="w-full max-w-3xl overflow-hidden rounded-2xl border border-line bg-ink shadow-[0_40px_120px_-30px_rgba(0,0,0,0.55)]"
              initial={{ opacity: 0, y: -28, scale: 0.94, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.55, ease: SMOOTH } }}
              exit={{ opacity: 0, y: -16, scale: 0.97, filter: 'blur(6px)', transition: { duration: 0.25, ease: SMOOTH } }}
              onKeyDown={onKeyDown}
            >
              <div className="relative flex items-center gap-3 border-b border-line px-4">
                <motion.svg
                  viewBox="0 0 24 24"
                  className="size-5 shrink-0 text-cream"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                  animate={q ? { rotate: [0, -12, 0], scale: [1, 1.15, 1] } : { rotate: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: SMOOTH }}
                  key={q.length}
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </motion.svg>
                <div className="relative w-full">
                  {!q && <RotatingHint />}
                  <input
                    ref={input}
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value)
                      setActive(0)
                    }}
                    aria-label="Search pages, projects, certificates and actions"
                    className="relative h-14 w-full bg-transparent text-base text-cream focus:outline-none"
                    role="combobox"
                    aria-expanded="true"
                    aria-controls="palette-list"
                    aria-activedescendant={shown[safeActive] ? `palette-${shown[safeActive].id}` : undefined}
                    aria-autocomplete="list"
                  />
                </div>
                <motion.span
                  key={shown.length}
                  className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-muted sm:block"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {shown.length} results
                </motion.span>
                <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted sm:block">Esc</kbd>
                {/* thin progress line that sweeps once while the palette opens */}
                <motion.span className="absolute inset-x-0 bottom-0 h-px origin-left bg-cream" initial={{ scaleX: 0, opacity: 1 }} animate={{ scaleX: 1, opacity: 0 }} transition={{ duration: 0.9, ease: SMOOTH }} aria-hidden="true" />
              </div>

              <div className="grid sm:min-h-[22rem] sm:grid-cols-[1fr_14rem]">
                <ul ref={list} data-lenis-prevent id="palette-list" role="listbox" aria-label="Results" className="relative max-h-[min(60vh,26rem)] overflow-y-auto p-2">
                  {shown.length === 0 && (
                    <motion.li className="px-3 py-10 text-center" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, ease: SMOOTH }}>
                      <motion.span className="mb-2 block font-display text-4xl" animate={{ rotate: [0, -8, 8, -4, 0] }} transition={{ duration: 0.6 }} aria-hidden="true">
                        ¯\_(ツ)_/¯
                      </motion.span>
                      <span className="text-sm text-muted">No results for “{q}”.</span>
                    </motion.li>
                  )}
                  {shown.map((it, i) => {
                    const header = it.group !== lastGroup
                    lastGroup = it.group
                    const on = i === safeActive
                    return (
                      <motion.li
                        key={it.id}
                        role="presentation"
                        layout="position"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.4, delay: Math.min(i, 12) * 0.025, ease: SMOOTH } }}
                      >
                        {header && <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted first:pt-1">{it.group}</p>}
                        <div
                          id={`palette-${it.id}`}
                          role="option"
                          aria-selected={on}
                          data-index={i}
                          onMouseMove={() => setActive(i)}
                          onClick={() => runItem(it)}
                          className={`relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-300 ${on ? 'text-ink' : 'text-cream'}`}
                        >
                          {on && <motion.span layoutId="palette-active" className="absolute inset-0 rounded-xl bg-cream" transition={spring} aria-hidden="true" />}
                          <motion.span className="relative" animate={on ? { scale: 1.15, rotate: -6 } : { scale: 1, rotate: 0 }} transition={spring}>
                            <Icon group={it.group} />
                          </motion.span>
                          <span className="relative min-w-0 flex-1 truncate font-medium">
                            <Highlight text={it.label} q={q} />
                          </span>
                          {it.hint && <span className={`relative truncate font-mono text-[11px] transition-colors ${on ? 'text-ink/60' : 'text-muted'}`}>{it.hint}</span>}
                          <AnimatePresence>
                            {on && (
                              <motion.span className="relative font-mono text-xs" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.2 }} aria-hidden="true">
                                ↵
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.li>
                    )
                  })}
                </ul>
                <PreviewPanel item={shown[safeActive]} />
              </div>

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
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: SMOOTH } }}
            exit={{ opacity: 0, y: 10, transition: { duration: 0.25 } }}
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
      className={`group inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-[13px] text-cream-2 transition-colors hover:border-cream hover:text-cream cursor-pointer ${className}`}
    >
      <svg viewBox="0 0 24 24" className="size-4 transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <span>Search</span>
      <kbd className="rounded-md border border-line bg-ink-2 px-1.5 py-0.5 font-mono text-[10px] text-muted">{shortcutLabel}</kbd>
    </button>
  )
}
