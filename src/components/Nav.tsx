import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { profile } from '../content/profile'
import { useMotionPref, spring } from '../lib/motion'
import { GitHubIcon, LinkedInIcon } from './ui'

const links = [
  { hash: '#work', label: 'Work' },
  { hash: '#about', label: 'About' },
  { hash: '#learning', label: 'Learning' },
  { hash: '#contact', label: 'Contact' },
]

/** Original orbit logo mark: a core with two orbiting points. */
function OrbitMark() {
  return (
    <span className="relative grid size-10 place-items-center" aria-hidden="true">
      <svg viewBox="0 0 40 40" className="size-10">
        <circle cx="20" cy="20" r="15" fill="none" stroke="rgba(79,217,234,0.35)" strokeWidth="1" />
        <circle cx="20" cy="20" r="9" fill="none" stroke="rgba(159,220,116,0.3)" strokeWidth="1" />
        <circle cx="20" cy="20" r="4.5" fill="#4fd9ea" />
        <circle cx="20" cy="20" r="7" fill="rgba(79,217,234,0.18)" />
      </svg>
      <span className="orbit-spin absolute inset-0">
        <span className="absolute left-1/2 top-[2px] size-2 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_8px_rgba(79,217,234,0.9)]" />
      </span>
      <span className="orbit-spin-rev absolute inset-[9px]">
        <span className="absolute bottom-0 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-leaf" />
      </span>
    </span>
  )
}

export function MotionToggle({ className = '' }: { className?: string }) {
  const { reduced, systemReduced, toggle } = useMotionPref()
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={systemReduced}
      aria-pressed={!reduced}
      title={systemReduced ? 'Reduced motion is set by your system' : reduced ? 'Turn animations on' : 'Turn animations off'}
      className={`group inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-cream-2 hover:border-accent-2 hover:text-cream disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${className}`}
    >
      <span className={`relative h-4 w-7 rounded-full transition-colors ${reduced ? 'bg-ink-3' : 'bg-accent'}`} aria-hidden="true">
        <span className={`absolute top-0.5 size-3 rounded-full bg-cream transition-all ${reduced ? 'left-0.5' : 'left-3.5'}`} />
      </span>
      Motion
      <span className="sr-only">{reduced ? 'off' : 'on'}</span>
    </button>
  )
}

export function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    if (!open) return
    menuRef.current?.querySelector<HTMLElement>('a')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        btnRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled || open ? 'bg-ink/80 backdrop-blur-xl border-b border-line/60' : 'border-b border-transparent'}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-cream focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <nav aria-label="Primary" className="container-x flex h-16 items-center justify-between gap-4 md:h-20">
        <Link to="/" className="group flex items-center gap-3" aria-label={`${profile.name} — home`}>
          <OrbitMark />
          <span className="flex flex-col leading-none">
            <span className="flex items-center gap-2">
              <span className="font-display text-lg font-bold text-cream group-hover:text-white">{profile.shortName}</span>
              <span className="rounded-md border border-accent/40 bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] text-accent">AI·ML</span>
            </span>
            <span className="mt-1 hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted sm:block">Product builder</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <motion.li key={l.hash} whileHover={{ y: -2 }} whileTap={{ scale: 0.94 }} transition={spring}>
              <Link to={{ pathname: '/', hash: l.hash }} className="rounded-full px-4 py-2 text-sm font-medium text-cream-2 transition-colors hover:bg-ink-3 hover:text-cream">
                {l.label}
              </Link>
            </motion.li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <MotionToggle />
          <motion.span className="inline-flex" whileHover={{ y: -2, scale: 1.04 }} whileTap={{ scale: 0.95 }} transition={spring}>
            <Link
              to={{ pathname: '/', hash: '#contact' }}
              className="ml-1 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink shadow-[0_0_24px_-4px_rgba(79,217,234,0.75)] hover:bg-accent-2"
            >
              <span className="size-1.5 rounded-full bg-ink/70" aria-hidden="true" />
              Let’s talk
            </Link>
          </motion.span>
          {profile.resumeUrl && (
            <a href={profile.resumeUrl} className="rounded-full px-3 py-2 text-sm text-cream-2 hover:text-cream" target="_blank" rel="noreferrer">
              Resume
            </a>
          )}
          <a href={profile.links.github} target="_blank" rel="noreferrer" aria-label="GitHub profile (opens in new tab)" className="grid size-10 place-items-center rounded-full text-cream-2 hover:bg-ink-3 hover:text-cream">
            <GitHubIcon />
          </a>
          <a href={profile.links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn profile (opens in new tab)" className="grid size-10 place-items-center rounded-full text-cream-2 hover:bg-ink-3 hover:text-cream">
            <LinkedInIcon />
          </a>
        </div>

        <motion.button
          ref={btnRef}
          type="button"
          className="grid size-11 place-items-center rounded-full border border-line md:hidden cursor-pointer"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
          whileTap={{ scale: 0.9 }}
          transition={spring}
        >
          <span className="relative block h-3 w-5" aria-hidden="true">
            <span className={`absolute left-0 h-0.5 w-5 rounded bg-cream transition-all ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
            <span className={`absolute left-0 h-0.5 w-5 rounded bg-cream transition-all ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
          </span>
        </motion.button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            ref={menuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-line/60 md:hidden"
          >
            <div className="container-x py-6">
              <ul className="flex flex-col gap-1">
                {links.map((l, i) => (
                  <motion.li key={l.hash} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}>
                    <Link to={{ pathname: '/', hash: l.hash }} onClick={() => setOpen(false)} className="block rounded-2xl px-3 py-3 font-display text-3xl font-bold text-cream hover:bg-ink-3">
                      {l.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-6 flex items-center gap-3">
                <MotionToggle />
                <a href={profile.links.github} target="_blank" rel="noreferrer" aria-label="GitHub profile (opens in new tab)" className="grid size-11 place-items-center rounded-full border border-line">
                  <GitHubIcon />
                </a>
                <a href={profile.links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn profile (opens in new tab)" className="grid size-11 place-items-center rounded-full border border-line">
                  <LinkedInIcon />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
