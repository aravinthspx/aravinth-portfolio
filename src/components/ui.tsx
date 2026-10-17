import { useEffect, useRef, useState, type ReactNode, type ComponentProps } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { spring } from '../lib/motion'
import { statusLabel, type Status } from '../content/projects'
import { profile } from '../content/profile'

/* ---------- Icons ---------- */
type IconProps = { className?: string }
export const GitHubIcon = ({ className = 'size-5' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
)
export const LinkedInIcon = ({ className = 'size-5' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
  </svg>
)
export const MailIcon = ({ className = 'size-5' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m4 7 8 6 8-6" />
  </svg>
)
export const ArrowIcon = ({ className = 'size-4' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)
export const ExternalIcon = ({ className = 'size-4' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={className}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </svg>
)

/* ---------- Spring buttons ---------- */
const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wide select-none cursor-pointer'
const variants = {
  primary: 'bg-cream text-ink shadow-[0_12px_40px_-14px_rgba(242,239,232,0.45)] hover:bg-white',
  ghost: 'border border-line text-cream hover:border-accent-2 hover:text-white bg-ink-2/60 backdrop-blur',
  accent: 'bg-accent text-ink shadow-[0_12px_40px_-14px_rgba(185,215,122,0.6)] hover:bg-accent-2',
}
type Variant = keyof typeof variants
const press = { whileHover: { y: -2, scale: 1.03 }, whileTap: { scale: 0.95, y: 0 }, transition: spring }

export function ButtonLink({ to, variant = 'primary', children, className = '' }: { to: string; variant?: Variant; children: ReactNode; className?: string }) {
  const cls = `${btnBase} ${variants[variant]} ${className}`
  if (/^(https?:|mailto:)/.test(to) || to.startsWith('#')) {
    const ext = to.startsWith('http')
    return (
      <motion.a href={to} className={cls} {...press} {...(ext ? { target: '_blank', rel: 'noreferrer' } : {})}>
        {children}
      </motion.a>
    )
  }
  return (
    <motion.span className="inline-flex" {...press}>
      <Link to={to} className={cls}>
        {children}
      </Link>
    </motion.span>
  )
}

export function Button({ variant = 'ghost', className = '', children, ...rest }: { variant?: Variant } & ComponentProps<typeof motion.button>) {
  return (
    <motion.button type="button" className={`${btnBase} ${variants[variant]} ${className}`} {...press} {...rest}>
      {children}
    </motion.button>
  )
}

export function IconLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  const ext = href.startsWith('http')
  return (
    <motion.a
      href={href}
      aria-label={label}
      title={label}
      {...(ext ? { target: '_blank', rel: 'noreferrer' } : {})}
      className="grid size-11 place-items-center rounded-full border border-line text-cream-2 hover:text-white hover:border-accent-2"
      whileHover={{ y: -3, rotate: -6 }}
      whileTap={{ scale: 0.9 }}
      transition={spring}
    >
      {children}
    </motion.a>
  )
}

/* ---------- Reveal ---------- */
export function Reveal({ children, delay = 0, className = '', as = 'div' }: { children: ReactNode; delay?: number; className?: string; as?: 'div' | 'li' | 'section' | 'article' }) {
  const M = motion[as]
  return (
    <M
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </M>
  )
}

/* ---------- Status tag ---------- */
const statusStyle: Record<Status, string> = {
  documented: 'text-ok border-ok/30 bg-ok/10',
  planned: 'text-warn border-warn/30 bg-warn/10',
  development: 'text-accent border-accent/30 bg-accent/10',
  screenshot: 'text-leaf border-leaf/30 bg-leaf/10',
  illustrative: 'text-accent-2 border-accent/40 bg-accent/10',
  observed: 'text-warm border-warm/30 bg-warm/10',
  hypothesis: 'text-cream-2 border-line bg-ink-3',
}
export function StatusTag({ status, className = '' }: { status: Status; className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider ${statusStyle[status]} ${className}`}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {statusLabel[status]}
    </span>
  )
}

/* ---------- Section heading ---------- */
export function SectionHeading({ eyebrow, title, id, children }: { eyebrow: string; title: ReactNode; id?: string; children?: ReactNode }) {
  return (
    <Reveal className="mb-12 md:mb-16 max-w-3xl">
      <p className="eyebrow mb-4">{eyebrow}</p>
      <h2 id={id} className="font-display text-3xl font-bold leading-[1.05] tracking-tight text-cream sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {children && <div className="mt-5 text-lg leading-relaxed text-cream-2">{children}</div>}
    </Reveal>
  )
}

/* ---------- Copy email ---------- */
export function CopyEmail({ className = '' }: { className?: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(profile.email)
      else {
        const ta = document.createElement('textarea')
        ta.value = profile.email
        ta.setAttribute('readonly', '')
        ta.style.position = 'absolute'
        ta.style.left = '-9999px'
        document.body.appendChild(ta)
        ta.select()
        const ok = document.execCommand('copy')
        ta.remove()
        if (!ok) throw new Error('copy failed')
      }
      setState('copied')
    } catch {
      setState('failed')
    }
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setState('idle'), 2500)
  }

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Button onClick={copy} variant="ghost" aria-describedby="copy-status">
        {state === 'copied' ? 'Copied!' : 'Copy email'}
      </Button>
      <span id="copy-status" role="status" aria-live="polite" className="text-sm text-cream-2">
        {state === 'copied' && 'Email address copied to clipboard.'}
        {state === 'failed' && `Couldn’t copy — the address is ${profile.email}`}
      </span>
    </span>
  )
}
