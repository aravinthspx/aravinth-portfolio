import { useEffect, useId, useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react'
import { WordReveal } from '../fx'
import { profile, contactForm } from '../../content/profile'
import { CopyEmail, IconLink, Reveal, GitHubIcon, LinkedInIcon, MailIcon, ExternalIcon } from '../ui'
import { SMOOTH, spring, useMotionPref } from '../../lib/motion'
import { gmailUrl, mailtoUrl } from '../../lib/email'

type Fields = { name: string; email: string; subject: string; message: string; website: string }
type Errors = Partial<Record<keyof Fields, string>>
type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent'; via: 'service' | 'gmail' | 'mailto' } | { kind: 'error'; message: string }

const EMPTY: Fields = { name: '', email: '', subject: '', message: '', website: '' }

function validate(f: Fields): Errors {
  const e: Errors = {}
  if (f.name.trim().length < 2) e.name = 'Please enter your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Please enter a valid email address.'
  if (f.subject.trim().length < 3) e.subject = 'Please add a short subject.'
  if (f.message.trim().length < 10) e.message = 'Your message should be at least 10 characters.'
  return e
}

/** Quick topics: fill the subject (and a starter message when it's empty). */
const TOPICS: { label: string; subject: string; starter: string }[] = [
  { label: 'Internship', subject: 'Internship opportunity', starter: 'Hi Aravinth, we have an internship role that might suit you: ' },
  { label: 'Collaboration', subject: 'Project collaboration', starter: 'Hi Aravinth, I’m working on a project and would like to collaborate on ' },
  { label: 'Hackathon team', subject: 'Hackathon team-up', starter: 'Hi Aravinth, we’re forming a team for ' },
  { label: 'Just saying hi', subject: 'Hello from your portfolio', starter: 'Hi Aravinth, ' },
]

/** Ring that fills as the required fields become valid. */
function ReadyRing({ done, total }: { done: number; total: number }) {
  const r = 9
  const len = 2 * Math.PI * r
  const full = done === total
  return (
    <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted" aria-live="polite">
      <svg viewBox="0 0 24 24" className="size-6 -rotate-90" aria-hidden="true">
        <circle cx="12" cy="12" r={r} fill="none" stroke="currentColor" strokeWidth="2.5" className="text-line" />
        <motion.circle cx="12" cy="12" r={r} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-cream" strokeDasharray={len} animate={{ strokeDashoffset: len * (1 - done / total) }} transition={spring} />
      </svg>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={full ? 'ready' : done} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.25 }} className={full ? 'text-cream' : ''}>
          {full ? 'Ready to send' : `${done}/${total} ready`}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/** Paper plane that flies off the send button once the message has been handed to Gmail / the mail app. */
function PaperPlane({ fly }: { fly: number }) {
  return (
    <AnimatePresence>
      {fly > 0 && (
        <motion.svg
          key={fly}
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-6 top-1/2 z-10 size-6 text-cream"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
          initial={{ x: 0, y: -12, rotate: 0, opacity: 1, scale: 1 }}
          animate={{ x: [0, 60, 260, 420], y: [-12, -40, -120, -220], rotate: [0, -10, -20, -25], opacity: [1, 1, 1, 0], scale: [1, 1.2, 1, 0.6] }}
          transition={{ duration: 1.4, ease: 'easeIn' }}
          aria-hidden="true"
        >
          <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
        </motion.svg>
      )}
    </AnimatePresence>
  )
}

/**
 * Contact form. With `contactForm.endpoint` set (e.g. a Formspree URL) it POSTs JSON to that
 * service. Without one it opens Gmail (or, as a fallback, the visitor's email app) with the
 * message pre-filled — and says
 * so, rather than pretending a message was sent. A hidden "website" field traps simple bots.
 */
function ContactForm() {
  const id = useId()
  const [f, setF] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [fly, setFly] = useState(0)
  const endpoint = contactForm.endpoint
  const live = validate(f)
  const ready = (['name', 'email', 'subject', 'message'] as const).filter((k) => !live[k]).length
  const pickTopic = (t: (typeof TOPICS)[number]) => {
    setF((p) => ({ ...p, subject: t.subject, message: p.message.trim() ? p.message : t.starter }))
    setErrors((p) => ({ ...p, subject: undefined }))
  }

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setF((p) => ({ ...p, [k]: e.target.value }))
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }))
  }

  /** Validates; on failure moves focus to the first invalid field and returns false. */
  const check = (form: HTMLFormElement) => {
    const errs = validate(f)
    setErrors(errs)
    if (!Object.keys(errs).length) return true
    requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
    return false
  }
  const body = () => `${f.message.trim()}\n\n— ${f.name.trim()} (${f.email.trim()})`

  const openMailApp = (form: HTMLFormElement | null) => {
    if (!form || f.website || !check(form)) return
    window.location.href = mailtoUrl(f.subject.trim(), body())
    setStatus({ kind: 'sent', via: 'mailto' })
    setFly((n) => n + 1)
  }

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (f.website) return // honeypot filled: silently ignore bots
    if (!check(e.currentTarget)) return
    if (!endpoint) {
      window.open(gmailUrl(f.subject.trim(), body()), '_blank', 'noopener')
      setStatus({ kind: 'sent', via: 'gmail' })
      setFly((n) => n + 1)
      return
    }
    setStatus({ kind: 'sending' })
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: f.name.trim(), email: f.email.trim(), subject: f.subject.trim(), message: f.message.trim() }),
      })
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
      setStatus({ kind: 'sent', via: 'service' })
      setFly((n) => n + 1)
      setF(EMPTY)
    } catch {
      setStatus({ kind: 'error', message: `Your message couldn’t be sent. Please email ${profile.email} directly.` })
    }
  }

  const field = 'mt-1.5 w-full rounded-xl border bg-ink-2/80 px-4 py-3 text-sm text-cream placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40'
  const border = (k: keyof Fields) => (errors[k] ? 'border-bad/70' : 'border-line focus:border-accent/60')
  const Err = ({ k }: { k: keyof Fields }) =>
    errors[k] ? (
      <p id={`${id}-${k}-err`} className="mt-1.5 text-xs text-bad">
        {errors[k]}
      </p>
    ) : null

  return (
    <form onSubmit={submit} noValidate className="panel relative rounded-3xl p-6 text-left sm:p-8" aria-describedby={`${id}-note`}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="font-display text-lg font-bold text-cream">Write a message</p>
        <ReadyRing done={ready} total={4} />
      </div>
      <div className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">What’s it about?</p>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Pick a topic">
          {TOPICS.map((t, i) => {
            const on = f.subject === t.subject
            return (
              <motion.button
                key={t.label}
                type="button"
                onClick={() => pickTopic(t)}
                aria-pressed={on}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: 0.05 * i }}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${on ? 'border-cream bg-cream text-ink' : 'border-line text-cream-2'}`}
              >
                {t.label}
              </motion.button>
            )
          })}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-cream">
          Name
          <input value={f.name} onChange={set('name')} autoComplete="name" required aria-invalid={!!errors.name} aria-describedby={errors.name ? `${id}-name-err` : undefined} className={`${field} ${border('name')}`} placeholder="Your name" />
          <Err k="name" />
        </label>
        <label className="block text-sm font-medium text-cream">
          Email
          <input type="email" value={f.email} onChange={set('email')} autoComplete="email" required aria-invalid={!!errors.email} aria-describedby={errors.email ? `${id}-email-err` : undefined} className={`${field} ${border('email')}`} placeholder="you@example.com" />
          <Err k="email" />
        </label>
      </div>
      <label className="mt-5 block text-sm font-medium text-cream">
        Subject
        <input value={f.subject} onChange={set('subject')} required aria-invalid={!!errors.subject} aria-describedby={errors.subject ? `${id}-subject-err` : undefined} className={`${field} ${border('subject')}`} placeholder="Internship, collaboration, hackathon…" />
        <Err k="subject" />
      </label>
      <label className="mt-5 block text-sm font-medium text-cream">
        <span className="flex items-baseline justify-between">
          Message
          <span className={`font-mono text-[10px] transition-colors ${f.message.trim().length >= 10 ? 'text-cream-2' : 'text-muted'}`} aria-hidden="true">
            {f.message.trim().length >= 10 ? `${f.message.trim().length} chars` : `${Math.max(0, 10 - f.message.trim().length)} more to go`}
          </span>
        </span>
        <textarea value={f.message} onChange={set('message')} rows={5} required aria-invalid={!!errors.message} aria-describedby={errors.message ? `${id}-message-err` : undefined} className={`${field} ${border('message')} resize-y`} placeholder="What would you like to build or discuss?" />
        <Err k="message" />
      </label>
      {/* Honeypot: hidden from people, tempting to bots */}
      <label className="absolute -left-[9999px]" aria-hidden="true">
        Website
        <input tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} />
      </label>

      <div className="relative mt-6 flex flex-wrap items-center gap-4">
        <PaperPlane fly={fly} />
        <motion.button
          type="submit"
          disabled={status.kind === 'sending'}
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          transition={spring}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-ink shadow-[0_0_24px_-6px_rgba(0,0,0,0.24)] hover:bg-accent-2 disabled:cursor-wait disabled:opacity-70 cursor-pointer"
        >
          {status.kind === 'sending' ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" aria-hidden="true" /> Sending…
            </>
          ) : endpoint ? (
            'Send message'
          ) : (
            <>
              Send via Gmail <ExternalIcon className="size-4" />
            </>
          )}
        </motion.button>
        {!endpoint && (
          <button
            type="button"
            onClick={(e) => openMailApp(e.currentTarget.form)}
            className="text-sm text-cream-2 underline decoration-line underline-offset-4 transition-colors hover:text-cream hover:decoration-accent cursor-pointer"
          >
            Use another email app
          </button>
        )}
      </div>
      <p id={`${id}-note`} className="mt-3 text-xs text-muted">
        {endpoint ? 'Sent securely through the form service.' : 'Opens Gmail in a new tab with your message ready — nothing is sent until you press Send there.'}
      </p>

      <div role="status" aria-live="polite" className="mt-4 text-sm">
        {status.kind === 'sent' && status.via === 'service' && <p className="rounded-xl border border-ok/30 bg-ok/10 px-4 py-3 text-ok">Thanks — your message was sent. I’ll reply by email.</p>}
        {status.kind === 'sent' && status.via === 'gmail' && (
          <p className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-cream-2">
            Gmail should now be open in a new tab with your message filled in — press Send there. Not using Gmail? <button type="button" className="text-accent underline cursor-pointer" onClick={(e) => openMailApp(e.currentTarget.closest('form'))}>Use another email app</button> or copy my address: {profile.email}
          </p>
        )}
        {status.kind === 'sent' && status.via === 'mailto' && (
          <p className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-cream-2">
            Your email app should now be open with the message filled in. If nothing opened, <a className="text-accent underline" href={gmailUrl()} target="_blank" rel="noreferrer">write in Gmail</a> or email {profile.email} directly.
          </p>
        )}
        {status.kind === 'error' && <p className="rounded-xl border border-bad/30 bg-bad/10 px-4 py-3 text-bad">{status.message}</p>}
      </div>
    </form>
  )
}

/** Resume card: download/preview when a PDF is configured, otherwise an honest email fallback. */
function ResumeCard() {
  const url = profile.resumeUrl
  return (
    <div className="panel rounded-3xl p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl border border-leaf/30 bg-leaf/10 text-leaf" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Zm0 0v5h5M9 13h6M9 17h4" />
          </svg>
        </span>
        <div>
          <p className="font-display text-lg font-bold text-cream">Resume</p>
          <p className="text-xs text-muted">{url ? 'PDF · opens in a new tab' : 'PDF coming soon'}</p>
        </div>
      </div>
      {url ? (
        <div className="mt-5 flex flex-wrap gap-2">
          <a href={url} download className="inline-flex items-center gap-2 rounded-full bg-leaf px-4 py-2 text-sm font-semibold text-ink hover:bg-leaf-2">
            Download resume
          </a>
          <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm text-cream-2 hover:border-leaf/50 hover:text-cream">
            Preview <ExternalIcon className="size-3.5" />
          </a>
        </div>
      ) : (
        <p className="mt-4 text-sm leading-relaxed text-cream-2">
          My resume is being finalised. Email me and I’ll send the latest version directly.
          <a href={gmailUrl('Resume request')} target="_blank" rel="noreferrer" className="mt-3 flex items-center gap-1.5 font-semibold text-leaf hover:text-leaf-2">
            Request my resume →
          </a>
        </p>
      )}
    </div>
  )
}

/** Live local time in India (IST), so visitors know whether it's day or night here. */
function LocalTime() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000 * 15)
    return () => window.clearInterval(t)
  }, [])
  const time = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }).format(now)
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false }).format(now))
  const awake = hour >= 8 && hour < 23
  return (
    <p className="mt-4 inline-flex items-center gap-2.5 rounded-full border border-line bg-ink-2/70 px-3.5 py-1.5 font-mono text-[11px] text-cream-2">
      <span className="relative flex size-2">
        {awake && <span className="absolute inset-0 animate-ping rounded-full bg-cream/50" />}
        <span className={`relative size-2 rounded-full ${awake ? 'bg-cream' : 'bg-muted'}`} />
      </span>
      {profile.location ?? 'India'} · {time} IST · {awake ? 'daytime here' : 'night here — replies may wait till morning'}
    </p>
  )
}

/** Wraps an icon link so it drifts toward the pointer and springs back. */
function Magnetic({ children }: { children: React.ReactNode }) {
  const { reduced } = useMotionPref()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 15 })
  const sy = useSpring(y, { stiffness: 220, damping: 15 })
  return (
    <motion.div
      style={reduced ? undefined : { x: sx, y: sy }}
      onPointerMove={(e) => {
        if (reduced || e.pointerType === 'touch') return
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - r.left - r.width / 2) * 0.4)
        y.set((e.clientY - r.top - r.height / 2) * 0.4)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}

export function ContactSection() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative py-24 md:py-32">
      <div className="container-x">
        <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/5 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
              <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" /> Contact
            </p>
            <h2 id="contact-title" className="mt-6 font-display text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl md:text-5xl">
              <WordReveal text="Let’s build something" />{' '}
              <span className="relative inline-block">
                <WordReveal text="useful." delay={0.2} />
                {/* hand-drawn underline */}
                <svg viewBox="0 0 200 20" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-3 w-full overflow-visible" aria-hidden="true">
                  <motion.path
                    d="M3 14 C 40 4, 80 4, 120 10 S 180 16, 197 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="text-cream"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.7, ease: SMOOTH }}
                  />
                </svg>
              </span>
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-cream-2">
              Open to internships, collaborations and hackathon teams in AI/ML and full-stack development. I usually reply by email.
            </p>
            <a href={gmailUrl()} target="_blank" rel="noreferrer" className="group mt-8 inline-flex max-w-full items-center gap-3 break-all font-display text-lg font-semibold text-cream sm:text-xl">
              <MailIcon className="size-6 shrink-0 text-accent" />
              <span className="underline decoration-line decoration-2 underline-offset-8 transition-colors group-hover:decoration-accent">{profile.email}</span>
            </a>
            <div>
              <LocalTime />
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <CopyEmail />
            </div>
            <div className="mt-6 flex items-center gap-3">
              <Magnetic>
                <IconLink href={gmailUrl()} label="Email me in Gmail (opens in new tab)">
                  <MailIcon />
                </IconLink>
              </Magnetic>
              <Magnetic>
                <IconLink href={profile.links.linkedin} label="LinkedIn profile (opens in new tab)">
                  <LinkedInIcon />
                </IconLink>
              </Magnetic>
              <Magnetic>
                <IconLink href={profile.links.github} label="GitHub profile (opens in new tab)">
                  <GitHubIcon />
                </IconLink>
              </Magnetic>
            </div>
            <div className="mt-8 max-w-md">
              <ResumeCard />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
