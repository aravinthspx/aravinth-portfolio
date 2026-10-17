import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { gmailUrl } from '../lib/email'
import { profile } from '../content/profile'
import { navSections } from '../lib/sections'
import { useMotionPref, spring } from '../lib/motion'
import { GitHubIcon, LinkedInIcon, MailIcon } from './ui'

const year = new Date().getFullYear()

export function Footer() {
  const { reduced } = useMotionPref()
  const toTop = () => {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
    document.getElementById('main')?.focus({ preventScroll: true })
  }

  return (
    <footer className="relative z-10 border-t border-line bg-ink/80 backdrop-blur">
      <div className="container-x grid gap-10 py-12 md:grid-cols-[1.2fr_1fr_auto]">
        <div>
          <p className="font-display text-xl font-bold text-cream">
            {profile.shortName} <span className="text-accent">M</span>
          </p>
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
            {navSections.map((s) => (
              <li key={s.id}>
                <Link to={{ pathname: '/', hash: `#${s.id}` }} className="text-cream-2 transition-colors hover:text-cream">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex md:items-start md:justify-end">
          <motion.button
            type="button"
            onClick={toTop}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.92 }}
            transition={spring}
            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm text-cream-2 transition-colors hover:border-accent/50 hover:text-cream cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 19V5M6 11l6-6 6 6" />
            </svg>
            Back to top
          </motion.button>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="container-x py-5 text-xs text-muted">
          © {year} {profile.name}. Designed and built as a learning project.
        </p>
      </div>
    </footer>
  )
}
