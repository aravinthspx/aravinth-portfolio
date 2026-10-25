import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'
import { gmailUrl } from '../lib/email'
import { scrollToTarget } from '../lib/scroll'
import { profile } from '../content/profile'
import { navSections } from '../lib/sections'
import { useMotionPref } from '../lib/motion'
import { GitHubIcon, LinkedInIcon, MailIcon } from './ui'
import { RollText } from './MenuExtras'

const year = new Date().getFullYear()
const WORD = 'ARAVINTH'

/** One letter of the wordmark: rises, fills in and leans as the pointer gets close. */
function Letter({ ch, i, px }: { ch: string; i: number; px: MotionValue<number> }) {
  // px is the pointer's x across the wordmark (0..1); each letter sits at its own slot
  const centre = (i + 0.5) / WORD.length
  const near = useTransform(px, (x) => Math.max(0, 1 - Math.abs(x - centre) * 4.5))
  const s = useSpring(near, { stiffness: 220, damping: 22 })
  const y = useTransform(s, [0, 1], ['0%', '-14%'])
  const fill = useTransform(s, (v) => `rgba(10,10,10,${0.04 + v * 0.96})`)
  const rotate = useTransform(px, (x) => (x - centre) * -18 * Math.max(0, 1 - Math.abs(x - centre) * 4))
  return (
    <motion.span className="inline-block [-webkit-text-stroke:1.5px_rgba(10,10,10,0.35)]" style={{ y, color: fill, rotate }}>
      {ch}
    </motion.span>
  )
}

/** Live India time for the footer strip. */
function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(t)
  }, [])
  return (
    <time className="tabular-nums">
      {new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now)} IST
    </time>
  )
}

export function Footer() {
  const { reduced } = useMotionPref()
  const wordRef = useRef<HTMLDivElement>(null)
  const px = useMotionValue(-1) // off the word until hovered
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 })
  const RING = 2 * Math.PI * 22
  const dash = useTransform(progress, (p) => RING * (1 - p))

  const toTop = () => {
    scrollToTarget(0, { immediate: reduced })
    document.getElementById('main')?.focus({ preventScroll: true })
  }

  return (
    <footer className="relative z-10 overflow-hidden border-t border-line bg-ink/80 backdrop-blur">
      {/* ---------- CTA ---------- */}
      <div className="container-x flex flex-col items-start justify-between gap-8 border-b border-line py-14 md:flex-row md:items-center">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Have an idea?</p>
          <p className="mt-3 max-w-xl font-display text-3xl font-bold leading-tight text-cream sm:text-4xl">
            Let’s turn it into something people can click through.
          </p>
        </div>
        <a href={gmailUrl()} target="_blank" rel="noreferrer" className="group relative grid size-36 shrink-0 place-items-center" aria-label={`Say hello — email ${profile.email} in Gmail (opens in new tab)`}>
          {/* rotating circular text */}
          <motion.svg viewBox="0 0 100 100" className="absolute inset-0 size-full" animate={reduced ? undefined : { rotate: 360 }} transition={{ duration: 16, repeat: Infinity, ease: 'linear' }} aria-hidden="true">
            <defs>
              <path id="footer-circle" d="M50 50 m-40 0 a40 40 0 1 1 80 0 a40 40 0 1 1 -80 0" />
            </defs>
            <text className="fill-cream-2 font-mono text-[8.4px] uppercase">
              <textPath href="#footer-circle" textLength="246" lengthAdjust="spacing">
                Internships · Collaborations · Hackathons ·
              </textPath>
            </text>
          </motion.svg>
          <span className="relative grid size-20 place-items-center rounded-full bg-cream font-display text-sm font-bold text-ink transition-transform duration-500 group-hover:scale-110">
            Say hello
          </span>
        </a>
      </div>

      {/* ---------- Links ---------- */}
      <div className="container-x grid gap-10 py-12 md:grid-cols-[1.2fr_1fr_auto]">
        <div>
          <p className="font-display text-xl font-bold text-cream">{profile.name}</p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{profile.shortTitle}</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream-2">{profile.tagline}</p>
          <div className="mt-5 flex items-center gap-2">
            {[
              { href: profile.links.github, label: 'GitHub profile (opens in new tab)', icon: <GitHubIcon className="size-4" /> },
              { href: profile.links.linkedin, label: 'LinkedIn profile (opens in new tab)', icon: <LinkedInIcon className="size-4" /> },
              { href: gmailUrl(), label: `Email ${profile.email} in Gmail (opens in new tab)`, icon: <MailIcon className="size-4" /> },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                aria-label={l.label}
                {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                className="grid size-10 place-items-center rounded-full border border-line text-cream-2 transition-colors hover:border-accent/50 hover:text-cream"
              >
                {l.icon}
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Footer">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Quick links</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {navSections.map((s, i) => (
              <li key={s.id}>
                <Link to={{ pathname: '/', hash: `#${s.id}` }} className="group/item flex items-baseline gap-2 bg-none text-cream-2 transition-colors hover:text-cream">
                  <span className="font-mono text-[9px] text-muted">{String(i + 1).padStart(2, '0')}</span>
                  <RollText text={s.label} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex md:items-start md:justify-end">
          {/* back to top, wrapped in a ring that tracks how far down the page you are */}
          <button type="button" onClick={toTop} className="group relative grid size-14 place-items-center shadow-none hover:shadow-none" aria-label="Back to top">
            <svg viewBox="0 0 50 50" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
              <circle cx="25" cy="25" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-line" />
              <motion.circle cx="25" cy="25" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-cream" strokeDasharray={RING} style={{ strokeDashoffset: dash }} />
            </svg>
            <motion.svg viewBox="0 0 24 24" className="size-5 text-cream" fill="none" stroke="currentColor" strokeWidth="2" whileHover={reduced ? undefined : { y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity }} aria-hidden="true">
              <path d="M12 19V5M6 11l6-6 6 6" />
            </motion.svg>
          </button>
        </div>
      </div>

      {/* ---------- Status strip ---------- */}
      <div className="container-x flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line py-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        <span>© {year} {profile.name} · designed and built as a learning project</span>
        <span className="flex items-center gap-2">
          <span className="relative flex size-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-cream/50" />
            <span className="relative size-1.5 rounded-full bg-cream" />
          </span>
          India · <Clock />
        </span>
        <span>React · Three.js · Motion</span>
      </div>

      {/* ---------- Giant wordmark ---------- */}
      <div
        ref={wordRef}
        className="select-none overflow-hidden px-2 pb-2"
        onPointerMove={(e) => {
          if (reduced || !wordRef.current) return
          const r = wordRef.current.getBoundingClientRect()
          px.set((e.clientX - r.left) / r.width)
        }}
        onPointerLeave={() => px.set(-1)}
        aria-hidden="true"
      >
        <p className="flex justify-between font-display text-[17.5vw] font-bold leading-[0.82] tracking-tight">
          {WORD.split('').map((ch, i) => (
            <Letter key={i} ch={ch} i={i} px={px} />
          ))}
        </p>
      </div>
    </footer>
  )
}
