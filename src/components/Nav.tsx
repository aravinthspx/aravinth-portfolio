import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { navSections } from '../lib/sections'
import { AnimatePresence, motion } from 'motion/react'
import { profile } from '../content/profile'
import { SMOOTH, useMotionPref, spring } from '../lib/motion'
import { gmailUrl } from '../lib/email'
import { GitHubIcon, LinkedInIcon } from './ui'
import { PaletteButton, useCommandPalette } from './CommandPalette'

const links = navSections.map((sec) => ({ id: sec.id, hash: `#${sec.id}`, label: sec.label }))

/** Scroll-spy: the id of the section currently in the middle of the viewport (home page only). */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string>('home')
  useEffect(() => {
    if (!enabled || !('IntersectionObserver' in window)) return
    const els = links.map((l) => document.getElementById(l.id)).filter((el): el is HTMLElement => !!el)
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (hit) setActive(hit.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.01] },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [enabled])
  return enabled ? active : null
}

/**
 * Brand mark: a glass "AM" monogram tile with a cyan→leaf gradient edge.
 * It tilts in 3D and glows when the logo link is hovered or focused.
 */
function BrandMark() {
  const { reduced } = useMotionPref()
  return (
    <span className="relative block size-11 [perspective:400px]" aria-hidden="true">
      <motion.span
        className="relative block size-full rounded-[14px] bg-gradient-to-br from-accent-2 via-accent to-leaf p-[1.5px] shadow-[0_0_0_rgba(0,0,0,0)] transition-shadow duration-300 group-hover:shadow-[0_0_26px_-4px_rgba(0,0,0,0.225)] group-focus-visible:shadow-[0_0_26px_-4px_rgba(0,0,0,0.225)]"
        variants={reduced ? undefined : { rest: { rotateX: 0, rotateY: 0, scale: 1 }, hover: { rotateX: -14, rotateY: 20, scale: 1.06 } }}
        transition={spring}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <span className="relative grid size-full place-items-center overflow-hidden rounded-[12.5px] bg-[linear-gradient(160deg,#ffffff_0%,#ececec_75%)]">
          {/* glass sheen */}
          <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/12 to-transparent" />
          <span className="relative font-display text-[15px] font-bold leading-none tracking-[-0.04em]" style={{ transform: 'translateZ(12px)' }}>
            <span className="text-cream">A</span>
            <span className="bg-gradient-to-br from-accent to-leaf bg-clip-text text-transparent">M</span>
          </span>
        </span>
      </motion.span>
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
  const { pathname } = useLocation()
  const active = useActiveSection(pathname === '/')
  const palette = useCommandPalette()
  const { reduced, systemReduced, toggle: toggleMotion } = useMotionPref()

  // Header hides while scrolling down and slides back on any scroll up.
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    let last = window.scrollY
    const on = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 160)
        last = y
      }
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  // Close the menu on navigation.
  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const t = window.setTimeout(() => menuRef.current?.querySelector<HTMLElement>('a')?.focus(), 350)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        btnRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <motion.header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${open ? 'border-b border-transparent bg-transparent' : scrolled ? 'border-b border-line/60 bg-ink/80 backdrop-blur-xl' : 'border-b border-transparent'}`}
        animate={{ y: hidden && !open ? '-100%' : '0%' }}
        transition={{ duration: 0.5, ease: SMOOTH }}
      >
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-cream focus:px-4 focus:py-2 focus:text-ink">
          Skip to content
        </a>
        {/* While the black menu is open, the bar's colours invert so it stays readable on top of it. */}
        <nav aria-label="Primary" className={`container-x flex h-16 items-center justify-between gap-4 transition-[filter] duration-500 md:h-20 ${open ? 'invert' : ''}`}>
          <motion.span className="inline-flex" initial="rest" animate="rest" whileHover="hover" whileFocus="hover">
            <Link to="/" className="group flex items-center gap-3 rounded-2xl" aria-label={`${profile.name} — home`}>
              <BrandMark />
              <span className="flex flex-col leading-none">
                <span className="font-display text-[17px] font-bold tracking-tight text-cream transition-colors">
                  {profile.shortName} <span className="text-accent">M</span>
                </span>
                <span className="mt-1.5 hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted sm:flex">
                  <span className="h-px w-4 bg-gradient-to-r from-accent to-leaf" aria-hidden="true" />
                  {profile.shortTitle}
                </span>
              </span>
            </Link>
          </motion.span>

          <ul className="hidden items-center gap-0.5 xl:flex">
            {links.map((l) => {
              const on = active === l.id
              return (
                <motion.li key={l.hash} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} transition={spring} className="relative">
                  {on && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-full border border-accent/40 bg-accent/10" transition={spring} aria-hidden="true" />}
                  <Link
                    to={{ pathname: '/', hash: l.hash }}
                    aria-current={on ? 'location' : undefined}
                    className={`group/link relative block rounded-full px-3 py-2 text-[13px] font-medium transition-colors ${on ? 'text-accent' : 'text-cream-2 hover:text-cream'}`}
                  >
                    {l.label}
                    <span className="absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 bg-cream transition-transform duration-500 group-hover/link:scale-x-100" aria-hidden="true" />
                  </Link>
                </motion.li>
              )
            })}
          </ul>

          <div className="hidden items-center gap-2 md:flex">
            {!open && <PaletteButton />}
            {!open && <MotionToggle />}
            <motion.span className="inline-flex" whileHover={{ y: -2, scale: 1.03 }} whileTap={{ scale: 0.96 }} transition={spring}>
              <Link
                to={{ pathname: '/', hash: '#contact' }}
                onClick={() => setOpen(false)}
                className="ml-1 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink shadow-[0_0_24px_-4px_rgba(0,0,0,0.225)] hover:bg-accent-2"
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
          </div>

          <MenuButton open={open} onToggle={() => setOpen((v) => !v)} btnRef={btnRef} />
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            data-lenis-prevent
            className="fixed inset-0 z-[45] overflow-y-auto bg-cream text-ink xl:hidden"
            initial={{ clipPath: 'circle(0% at calc(100% - 3.25rem) 2.5rem)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 3.25rem) 2.5rem)', transition: { duration: 0.9, ease: SMOOTH } }}
            exit={{ clipPath: 'circle(0% at calc(100% - 3.25rem) 2.5rem)', transition: { duration: 0.6, ease: [0.64, 0, 0.78, 0], delay: 0.15 } }}
          >
            {/* faint oversized monogram */}
            <motion.span
              className="pointer-events-none absolute -bottom-10 -right-6 select-none font-display text-[42vw] font-bold leading-none text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.08)] sm:text-[30vw]"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 1.2, delay: 0.3, ease: SMOOTH } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              aria-hidden="true"
            >
              AM
            </motion.span>

            <div className="container-x relative flex min-h-full flex-col pb-8 pt-24 md:pt-28">
              <motion.p
                className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.25 } }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
              >
                Navigate
              </motion.p>
              <ul className="mt-4 grid gap-x-10 sm:grid-cols-2">
                {links.map((l, i) => {
                  const on = active === l.id
                  return (
                    <li key={l.hash} className="overflow-hidden border-b border-ink/10">
                      <motion.div
                        initial={{ y: '110%' }}
                        animate={{ y: '0%', transition: { duration: 0.8, delay: 0.18 + i * 0.05, ease: SMOOTH } }}
                        exit={{ y: '-110%', transition: { duration: 0.35, delay: (links.length - i) * 0.02, ease: [0.64, 0, 0.78, 0] } }}
                      >
                        <Link
                          to={{ pathname: '/', hash: l.hash }}
                          onClick={() => setOpen(false)}
                          aria-current={on ? 'location' : undefined}
                          className="group/item flex items-center gap-4 py-3 outline-none focus-visible:underline sm:py-4"
                        >
                          <span className="w-7 font-mono text-xs text-ink/40">{String(i + 1).padStart(2, '0')}</span>
                          <span className="font-display text-[clamp(2rem,7.5vw,3.5rem)] font-bold leading-none tracking-tight transition-transform duration-500 group-hover/item:translate-x-3 group-focus-visible/item:translate-x-3">
                            {l.label}
                          </span>
                          {on && <span className="size-2 rounded-full bg-ink" aria-hidden="true" />}
                          <svg viewBox="0 0 24 24" className="ml-auto size-6 -translate-x-3 opacity-0 transition-all duration-500 group-hover/item:translate-x-0 group-hover/item:opacity-100" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                            <path d="M7 17 17 7M8 7h9v9" />
                          </svg>
                        </Link>
                      </motion.div>
                    </li>
                  )
                })}
              </ul>

              <motion.div
                className="mt-auto grid gap-6 pt-12 sm:grid-cols-[1fr_auto] sm:items-end"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.55, ease: SMOOTH } }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
              >
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink/50">Say hello</p>
                  <a href={gmailUrl()} target="_blank" rel="noreferrer" className="mt-2 inline-block break-all font-display text-lg font-semibold underline decoration-ink/30 underline-offset-8 hover:decoration-ink sm:text-xl">
                    {profile.email}
                  </a>
                  <LocalTime />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      window.setTimeout(palette.open, 450)
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-ink/25 px-4 py-2.5 text-sm hover:bg-ink hover:text-cream cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-3.5-3.5" />
                    </svg>
                    Search
                  </button>
                  <button type="button" onClick={toggleMotion} disabled={systemReduced} aria-pressed={!reduced} className="rounded-full border border-ink/25 px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider hover:bg-ink hover:text-cream disabled:opacity-50 cursor-pointer">
                    Motion {reduced ? 'off' : 'on'}
                  </button>
                  <a href={profile.links.github} target="_blank" rel="noreferrer" aria-label="GitHub profile (opens in new tab)" className="grid size-11 place-items-center rounded-full border border-ink/25 hover:bg-ink hover:text-cream">
                    <GitHubIcon />
                  </a>
                  <a href={profile.links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn profile (opens in new tab)" className="grid size-11 place-items-center rounded-full border border-ink/25 hover:bg-ink hover:text-cream">
                    <LinkedInIcon />
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/** "Menu" / "Close" pill: the label rolls and the two lines morph into an ×. */
function MenuButton({ open, onToggle, btnRef }: { open: boolean; onToggle: () => void; btnRef: React.RefObject<HTMLButtonElement | null> }) {
  return (
    <motion.button
      ref={btnRef}
      type="button"
      className="group inline-flex h-11 items-center gap-3 rounded-full border border-line bg-ink/60 pl-4 pr-3 backdrop-blur xl:hidden cursor-pointer"
      aria-expanded={open}
      aria-controls="mobile-menu"
      aria-label={open ? 'Close menu' : 'Open menu'}
      onClick={onToggle}
      whileTap={{ scale: 0.94 }}
      transition={spring}
    >
      <span className="relative h-4 overflow-hidden font-mono text-[11px] uppercase leading-4 tracking-[0.18em] text-cream" aria-hidden="true">
        <motion.span className="flex flex-col" animate={{ y: open ? '-50%' : '0%' }} transition={{ duration: 0.5, ease: SMOOTH }}>
          <span>Menu</span>
          <span>Close</span>
        </motion.span>
      </span>
      <span className="relative block h-3 w-5" aria-hidden="true">
        <motion.span className="absolute left-0 top-0 h-0.5 w-5 rounded bg-cream" animate={open ? { top: 5, rotate: 45 } : { top: 0, rotate: 0 }} transition={{ duration: 0.5, ease: SMOOTH }} />
        <motion.span className="absolute left-0 top-[10px] h-0.5 rounded bg-cream" animate={open ? { top: 5, rotate: -45, width: 20 } : { top: 10, rotate: 0, width: 12 }} transition={{ duration: 0.5, ease: SMOOTH }} />
      </span>
    </motion.button>
  )
}

/** Live local time in Chennai — a small, human touch in the menu. */
function LocalTime() {
  const fmt = () => new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date())
  const [now, setNow] = useState(fmt)
  useEffect(() => {
    const t = window.setInterval(() => setNow(fmt()), 15000)
    return () => window.clearInterval(t)
  }, [])
  return (
    <p className="mt-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
      <span className="relative flex size-2" aria-hidden="true">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-ink opacity-40 motion-reduce:animate-none" />
        <span className="relative inline-flex size-2 rounded-full bg-ink" />
      </span>
      Chennai, India · {now} IST
    </p>
  )
}
