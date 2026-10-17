import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { profile } from '../content/profile'
import { ArrowIcon } from './ui'
import { spring } from '../lib/motion'

const KEY = 'aravinth-intro-seen'

/** True the first time the home page is opened in this browser session. */
export function shouldShowIntro(pathname: string) {
  if (pathname !== '/') return false
  try {
    return sessionStorage.getItem(KEY) !== '1'
  } catch {
    return false
  }
}

/**
 * Short, skippable "Get started" screen shown once per session on the home page.
 * The starfield shows through behind it. Enter, Escape, Space or a click enters the site.
 */
export function IntroGate({ open, onEnter }: { open: boolean; onEnter: () => void }) {
  const btn = useRef<HTMLButtonElement>(null)

  const enter = () => {
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {
      /* storage unavailable */
    }
    onEnter()
  }

  useEffect(() => {
    if (!open) return
    btn.current?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || (e.key === 'Enter' && document.activeElement !== btn.current)) enter()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="intro-title"
          className="fixed inset-0 z-[70] grid place-items-center bg-[radial-gradient(circle_at_50%_50%,rgba(6,10,19,0.2),rgba(6,10,19,0.75))] px-6"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: 'blur(6px)' }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/10" aria-hidden="true" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 size-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/10" aria-hidden="true" />
          <div className="relative flex flex-col items-center text-center">
            <motion.p
              id="intro-title"
              className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.35em] text-cream-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="size-2 animate-pulse rounded-full bg-accent shadow-[0_0_12px_rgba(79,217,234,0.9)]" aria-hidden="true" />
              {profile.name} · Portfolio
            </motion.p>
            <motion.button
              ref={btn}
              type="button"
              onClick={enter}
              className="mt-8 inline-flex items-center gap-3 rounded-full border border-accent/40 bg-ink-2/90 px-9 py-4 font-display text-base font-bold tracking-wide text-cream shadow-[0_0_40px_-6px_rgba(79,217,234,0.55)] hover:border-accent cursor-pointer"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={spring}
            >
              Get started <ArrowIcon className="size-4 text-accent" />
            </motion.button>
            <p className="mt-5 font-mono text-xs text-muted">Click or press Enter to explore</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
