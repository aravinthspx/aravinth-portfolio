import { useRef, useState, type ReactNode } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import { profile, about } from '../content/profile'
import { projects } from '../content/projects'
import { certificates } from '../content/certificates'
import { focusAreas } from '../content/focus'
import { SMOOTH, useMotionPref } from '../lib/motion'
import { Reveal } from './ui'

type IconName = (typeof about.cards)[number]['icon']

function Icon({ name }: { name: IconName }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" {...p}>
      {name === 'focus' && <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-3.5h.01" />}
      {name === 'interests' && <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" />}
      {name === 'goals' && <path d="M4 19V5m0 14h16M8 15l3-4 3 2 4-6" />}
      {name === 'direction' && <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-12.5-2 5-5 2 2-5 5-2Z" />}
    </svg>
  )
}

/** Card with a soft spotlight that follows the cursor. */
function SpotlightCard({ children, delay }: { children: ReactNode; delay: number }) {
  return (
    <Reveal
      as="li"
      delay={delay}
      className="group relative overflow-hidden rounded-2xl border border-line bg-ink-2/70 p-5 backdrop-blur transition-colors duration-300 hover:border-cream/30"
    >
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(260px circle at var(--x, 50%) var(--y, 0%), rgba(0,0,0,0.045), transparent 70%)' }}
        aria-hidden="true"
      />
      <div
        className="relative"
        onPointerMove={(e) => {
          const card = e.currentTarget.parentElement!
          const r = card.getBoundingClientRect()
          card.style.setProperty('--x', `${e.clientX - r.left}px`)
          card.style.setProperty('--y', `${e.clientY - r.top}px`)
        }}
      >
        {children}
      </div>
    </Reveal>
  )
}

/** Small glass chip floating at the edge of the portrait frame. */
function Chip({ children, className, delay = 0 }: { children: ReactNode; className: string; delay?: number }) {
  return (
    <motion.span
      className={`absolute z-20 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-ink/85 px-3 py-1.5 font-mono text-[11px] text-cream shadow-[0_12px_30px_-12px_rgba(0,0,0,0.45)] backdrop-blur-md ${className}`}
      initial={{ opacity: 0, scale: 0.85, y: 12 }}
      whileInView={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
      viewport={{ once: true }}
      transition={{ opacity: { delay, duration: 0.5 }, scale: { delay, duration: 0.7, ease: SMOOTH }, y: { delay: delay + 0.6, duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
    >
      {children}
    </motion.span>
  )
}

/**
 * Framed portrait: wipes in from the bottom as it scrolls into view, drifts with a gentle
 * parallax, and reveals the photo in colour inside a soft spotlight that follows the cursor.
 */
function PortraitCard() {
  const p = profile.portrait!
  const { reduced } = useMotionPref()
  const frame = useRef<HTMLDivElement>(null)
  const [spot, setSpot] = useState<{ x: number; y: number } | null>(null)
  const { scrollYProgress } = useScroll({ target: frame, offset: ['start end', 'end start'] })
  const y = useSpring(useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [40, -40]), { stiffness: 80, damping: 26 })
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], reduced ? [1, 1, 1] : [1.08, 1, 1.04])

  return (
    <div className="relative mx-auto w-full max-w-[30rem]">
      <motion.div
        ref={frame}
        className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-line bg-ink-2 shadow-[0_40px_90px_-50px_rgba(0,0,0,0.6)]"
        initial={{ clipPath: 'inset(100% 0% 0% 0% round 32px)' }}
        whileInView={{ clipPath: 'inset(0% 0% 0% 0% round 32px)' }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 1.2, ease: SMOOTH }}
        onPointerMove={(e) => {
          if (e.pointerType === 'touch') return
          const r = e.currentTarget.getBoundingClientRect()
          setSpot({ x: e.clientX - r.left, y: e.clientY - r.top })
        }}
        onPointerLeave={() => setSpot(null)}
      >
        {/* studio backdrop: faint grid and a light falling from above */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:28px_28px]" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_15%,rgba(255,255,255,0.95),transparent_70%)]" aria-hidden="true" />

        {/* black and white */}
        <motion.div className="absolute inset-0" style={{ y, scale }}>
          <img
            src={p.src}
            srcSet={p.srcSet}
            sizes="(min-width: 1024px) 480px, 90vw"
            width={p.width}
            height={p.height}
            alt={p.alt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-[50%_18%]"
          />
        </motion.div>
        {/* colour copy, moving identically, masked to a soft circle under the cursor (frame coordinates) */}
        {p.colorSrc && (
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              opacity: spot ? 1 : 0,
              maskImage: `radial-gradient(140px circle at ${spot?.x ?? 0}px ${spot?.y ?? 0}px, black 50%, transparent 100%)`,
              WebkitMaskImage: `radial-gradient(140px circle at ${spot?.x ?? 0}px ${spot?.y ?? 0}px, black 50%, transparent 100%)`,
            }}
            aria-hidden="true"
          >
            <motion.div className="absolute inset-0" style={{ y, scale }}>
              <img src={p.colorSrc} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover object-[50%_18%]" />
            </motion.div>
          </div>
        )}

        {/* soft floor so the suit melts into the frame */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-2/90 to-transparent" aria-hidden="true" />
        <p className="pointer-events-none absolute bottom-4 left-5 font-mono text-[10px] uppercase tracking-[0.2em] text-cream-2">
          {spot ? 'Colour reveal' : 'Hover to reveal colour'}
        </p>
      </motion.div>

      <Chip className="-left-3 top-[12%] sm:-left-8" delay={0.5}>
        <span className="size-1.5 rounded-full bg-cream" aria-hidden="true" />
        SRM IST Ramapuram
      </Chip>
      <Chip className="-right-3 top-[34%] sm:-right-10" delay={0.65}>
        <span aria-hidden="true">◆</span> CSE · AI &amp; ML
      </Chip>
      <Chip className="-left-3 bottom-[30%] sm:-left-10" delay={0.8}>
        <b>{String(projects.length).padStart(2, '0')}</b> team prototypes
      </Chip>
      <Chip className="-right-3 bottom-[12%] sm:-right-6" delay={0.95}>
        <b>{String(certificates.length).padStart(2, '0')}</b> certificates
      </Chip>
    </div>
  )
}

export function AboutSection() {
  const stats = [
    { n: projects.length, label: 'Team prototypes' },
    { n: certificates.length, label: 'Certificates' },
    { n: focusAreas.length, label: 'Focus areas' },
  ]

  return (
    <section id="about" aria-labelledby="about-title" className="relative overflow-hidden py-24 md:py-36">
      {/* giant outlined name drifting behind the section */}
      <div className="pointer-events-none absolute inset-x-0 top-[38%] -rotate-3 select-none" aria-hidden="true">
        <div className="marquee flex w-max gap-12 whitespace-nowrap font-display text-[clamp(5rem,14vw,12rem)] font-bold leading-none tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(10,10,10,0.08)]">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i}>{profile.name.toUpperCase()} —</span>
          ))}
        </div>
      </div>

      <div className="container-x relative grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        {profile.portrait && <PortraitCard />}

        <div className="relative z-10">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-ink/70 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-cream-2">
              <span className="size-1.5 rounded-full bg-cream" aria-hidden="true" />
              Profile &amp; perspective
            </p>
            <h2 id="about-title" className="mt-5 font-display text-4xl font-bold tracking-tight text-cream sm:text-5xl md:text-6xl">
              About <span className="text-transparent [-webkit-text-stroke:1.5px_#0a0a0a]">me</span>
            </h2>
            <motion.span
              className="mt-5 block h-1 w-16 origin-left rounded-full bg-cream"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, delay: 0.3, ease: SMOOTH }}
              aria-hidden="true"
            />
            <p className="mt-7 text-xl leading-relaxed text-cream md:text-2xl">{about.intro}</p>
            <p className="mt-4 text-cream-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream">What I enjoy building · </span>
              {about.enjoyBuilding}
            </p>
          </Reveal>

          <ul className="mt-9 grid gap-4 sm:grid-cols-2">
            {about.cards.map((s, i) => (
              <SpotlightCard key={s.title} delay={0.06 * i}>
                <span className="grid size-10 place-items-center rounded-xl border border-line bg-ink text-cream">
                  <Icon name={s.icon} />
                </span>
                <span className="mt-4 block font-display text-lg font-bold text-cream">{s.title}</span>
                <span className="mt-1.5 block text-sm leading-relaxed text-cream-2">{s.body}</span>
              </SpotlightCard>
            ))}
          </ul>

          <Reveal delay={0.1}>
            <dl className="mt-8 grid grid-cols-3 divide-x divide-line overflow-hidden rounded-2xl border border-line bg-ink-2/60">
              {stats.map((st) => (
                <div key={st.label} className="px-4 py-4 text-center sm:px-5">
                  <dt className="sr-only">{st.label}</dt>
                  <dd>
                    <span className="block font-display text-3xl font-bold text-cream">{String(st.n).padStart(2, '0')}</span>
                    <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted" aria-hidden="true">{st.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
