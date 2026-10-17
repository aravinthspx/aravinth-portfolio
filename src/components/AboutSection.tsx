import { useRef, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { profile } from '../content/profile'
import { projects } from '../content/projects'
import { certificates } from '../content/certificates'
import { focusAreas } from '../content/focus'
import { JumpingPortrait } from './JumpingPortrait'
import { Reveal } from './ui'

// Fade the cut-out's bottom (the photo crops the legs) so it melts into the page.
const PORTRAIT_FADE = 'linear-gradient(to bottom, #000 0%, #000 72%, transparent 97%)'

type IconName = 'build' | 'data' | 'trust' | 'compass'

function Icon({ name }: { name: IconName }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" {...p}>
      {name === 'build' && <path d="M14.5 5.5 18.5 9.5M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />}
      {name === 'data' && <path d="M4 19V5m0 14h16M8 15l3-4 3 2 4-6" />}
      {name === 'trust' && <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Zm-3 9 2 2 4-4" />}
      {name === 'compass' && <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-12.5-2 5-5 2 2-5 5-2Z" />}
    </svg>
  )
}

const stories: { icon: IconName; title: string; body: string }[] = [
  { icon: 'build', title: 'Learning by building', body: 'I learn through projects that force ideas to work end to end — interface, API and data.' },
  { icon: 'data', title: 'Honest about data', body: 'A farm-planning prototype taught me to explain estimates and label synthetic data instead of over-claiming accuracy.' },
  { icon: 'trust', title: 'Details shape trust', body: 'A campus-space platform showed how a mis-mapped building or unclear empty state undermines a useful tool.' },
  { icon: 'compass', title: 'Where I’m heading', body: 'Prototypes that connect AI with clear, usable interfaces — and better ways to evaluate them.' },
]

/** Card with a soft cyan spotlight that follows the cursor. */
function SpotlightCard({ children, delay }: { children: ReactNode; delay: number }) {
  return (
    <Reveal
      as="li"
      delay={delay}
      className="group relative overflow-hidden rounded-2xl border border-line bg-ink-2/70 p-5 backdrop-blur transition-colors duration-300 hover:border-accent/40"
    >
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(260px circle at var(--x, 50%) var(--y, 0%), rgba(79,217,234,0.12), transparent 70%)' }}
        aria-hidden="true"
      />
      <span className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
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

/** Small glass chip floating beside the portrait. */
function Chip({ children, className, delay = 0 }: { children: ReactNode; className: string; delay?: number }) {
  return (
    <motion.span
      className={`absolute z-10 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-ink-2/75 px-3 py-1.5 font-mono text-[11px] text-cream shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] backdrop-blur-md ${className}`}
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      whileInView={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
      viewport={{ once: true }}
      transition={{ opacity: { delay, duration: 0.4 }, scale: { delay, type: 'spring', stiffness: 260, damping: 18 }, y: { delay: delay + 0.4, duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
    >
      {children}
    </motion.span>
  )
}

export function AboutSection() {
  const p = profile.portrait
  const sectionRef = useRef<HTMLElement>(null)
  const stats = [
    { n: projects.length, label: 'Team prototypes' },
    { n: certificates.length, label: 'Certificates' },
    { n: focusAreas.length, label: 'Focus areas' },
  ]

  return (
    <section ref={sectionRef} id="about" aria-labelledby="about-title" className="relative overflow-hidden py-24 md:py-36">
      {/* soft band of light behind the whole section */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[70%] -translate-y-1/2 bg-[radial-gradient(60%_60%_at_25%_50%,rgba(79,217,234,0.08),transparent_70%)]" aria-hidden="true" />

      <div className="container-x relative">
        {/* ---------- Portrait stage: a large background layer behind the text ---------- */}
        {p && (
          <div className="pointer-events-none absolute left-1/2 top-0 h-[34rem] w-full max-w-[40rem] -translate-x-1/2 sm:h-[40rem] lg:-bottom-36 lg:-top-28 lg:left-[10%] lg:h-auto lg:w-[62%] lg:max-w-none lg:translate-x-0">
            {/* faint grid floor */}
            <div
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(79,217,234,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(79,217,234,0.07)_1px,transparent_1px)] bg-[size:36px_36px]"
              style={{ maskImage: 'radial-gradient(60% 55% at 50% 55%, #000, transparent)', WebkitMaskImage: 'radial-gradient(60% 55% at 50% 55%, #000, transparent)' }}
              aria-hidden="true"
            />
            {/* oversized outline word */}
            <p className="outline-text pointer-events-none absolute bottom-[14%] left-1/2 -translate-x-1/2 select-none font-display text-[7rem] font-bold leading-none tracking-tight sm:text-[9rem] lg:text-[12rem]" aria-hidden="true">
              BUILD
            </p>
            {/* rim light and orbit rings around the head */}
            <div className="pointer-events-none absolute left-1/2 top-[-6%] aspect-square w-[80%] max-w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(79,217,234,0.35),rgba(159,220,116,0.08)_55%,transparent)] blur-2xl" aria-hidden="true" />
            <div className="pointer-events-none absolute left-1/2 top-[-6%] aspect-square w-[66%] max-w-[36rem] -translate-x-[46%]" aria-hidden="true">
              <div className="orbit-slow absolute inset-0 rounded-full border border-accent/25">
                <span className="absolute left-1/2 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_14px_rgba(79,217,234,1)]" />
              </div>
              <div className="absolute inset-[12%] rounded-full border border-dashed border-leaf/20" />
            </div>

            <JumpingPortrait target={sectionRef}>
              <img
                src={p.src}
                srcSet={p.srcSet}
                sizes="(min-width: 1024px) 801px, 90vw"
                width={p.width}
                height={p.height}
                alt={p.alt}
                loading="lazy"
                decoding="async"
                className="absolute bottom-0 left-1/2 h-full w-auto max-w-none -translate-x-1/2 object-contain object-bottom"
                style={{
                  filter: 'grayscale(1) contrast(1.12) brightness(1.05)',
                  maskImage: PORTRAIT_FADE,
                  WebkitMaskImage: PORTRAIT_FADE,
                }}
              />
            </JumpingPortrait>

            <Chip className="left-0 top-[18%] sm:left-[4%]" delay={0.1}>
              <span className="size-1.5 rounded-full bg-leaf shadow-[0_0_8px_rgba(159,220,116,0.9)]" aria-hidden="true" />
              SRM IST Ramapuram
            </Chip>
            <Chip className="right-0 top-[38%] sm:right-[6%] lg:right-[18%]" delay={0.25}>
              <span className="text-accent">◆</span> CSE · AI &amp; ML
            </Chip>
            <Chip className="bottom-[26%] left-2 sm:left-[6%]" delay={0.4}>
              <span className="text-accent">{String(projects.length).padStart(2, '0')}</span> team prototypes
            </Chip>
            <Chip className="bottom-[12%] right-2 sm:right-[8%] lg:right-[22%]" delay={0.55}>
              <span className="text-leaf">{String(certificates.length).padStart(2, '0')}</span> certificates
            </Chip>
          </div>
        )}

        {/* ---------- Content (sits over the portrait) ---------- */}
        <div className="relative z-10 pt-[24rem] sm:pt-[30rem] lg:ml-auto lg:w-[50%] lg:pt-0">
          <Reveal className="rounded-3xl border border-white/[0.06] bg-ink/55 p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-md sm:p-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/5 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
              <span className="size-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(79,217,234,0.9)]" aria-hidden="true" />
              Profile &amp; perspective
            </p>
            <h2 id="about-title" className="mt-5 font-display text-3xl font-bold tracking-tight text-cream sm:text-4xl md:text-5xl">
              About <span className="bg-gradient-to-r from-accent to-leaf bg-clip-text text-transparent">me</span>
            </h2>
            <span className="mt-5 block h-1 w-16 rounded-full bg-gradient-to-r from-accent to-leaf" aria-hidden="true" />
            <p className="mt-7 text-xl leading-relaxed text-cream md:text-2xl">
              I’m most interested in the space where <span className="text-accent">machine learning</span> meets{' '}
              <span className="text-leaf">everyday decisions</span> — and in making the result <span className="underline decoration-accent/60 decoration-2 underline-offset-[6px]">understandable</span> to the person using it.
            </p>
            <p className="mt-4 text-cream-2">An AI/ML student exploring product design and full-stack development — learning most by building.</p>
          </Reveal>

          <ul className="mt-9 grid gap-4 sm:grid-cols-2">
            {stories.map((s, i) => (
              <SpotlightCard key={s.title} delay={0.06 * i}>
                <span className="grid size-10 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
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
                    <span className="block bg-gradient-to-r from-accent to-leaf bg-clip-text font-display text-3xl font-bold text-transparent">{String(st.n).padStart(2, '0')}</span>
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
