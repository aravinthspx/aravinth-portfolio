import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { navSections } from '../lib/sections'
import { AnimatePresence, motion } from 'motion/react'
import { profile } from '../content/profile'
import { useMotionPref, spring } from '../lib/motion'
import { GitHubIcon, LinkedInIcon } from './ui'

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
        <motion.span className="inline-flex" initial="rest" animate="rest" whileHover="hover" whileFocus="hover">
          <Link to="/" className="group flex items-center gap-3 rounded-2xl" aria-label={`${profile.name} — home`}>
            <BrandMark />
            <span className="flex flex-col leading-none">
              <span className="font-display text-[17px] font-bold tracking-tight text-cream transition-colors group-hover:text-white">
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
              <motion.li key={l.hash} whileHover={{ y: -2 }} whileTap={{ scale: 0.94 }} transition={spring} className="relative">
                {on && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-full border border-accent/40 bg-accent/10" transition={spring} aria-hidden="true" />}
                <Link
                  to={{ pathname: '/', hash: l.hash }}
                  aria-current={on ? 'location' : undefined}
                  className={`relative block rounded-full px-3 py-2 text-[13px] font-medium transition-colors ${on ? 'text-accent' : 'text-cream-2 hover:text-cream'}`}
                >
                  {l.label}
                </Link>
              </motion.li>
            )
          })}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <MotionToggle />
          <motion.span className="inline-flex" whileHover={{ y: -2, scale: 1.04 }} whileTap={{ scale: 0.95 }} transition={spring}>
            <Link
              to={{ pathname: '/', hash: '#contact' }}
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

        <motion.button
          ref={btnRef}
          type="button"
          className="grid size-11 place-items-center rounded-full border border-line xl:hidden cursor-pointer"
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
            className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line/60 xl:hidden"
          >
            <div className="container-x py-6">
              <ul className="grid gap-1 sm:grid-cols-2">
                {links.map((l, i) => (
                  <motion.li key={l.hash} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * i }}>
                    <Link
                      to={{ pathname: '/', hash: l.hash }}
                      onClick={() => setOpen(false)}
                      aria-current={active === l.id ? 'location' : undefined}
                      className={`block rounded-2xl px-3 py-2.5 font-display text-2xl font-bold hover:bg-ink-3 ${active === l.id ? 'text-accent' : 'text-cream'}`}
                    >
                      {l.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <MotionToggle className="md:hidden" />
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
