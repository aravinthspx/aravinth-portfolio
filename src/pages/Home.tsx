import { Fragment, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { profile, facts } from '../content/profile'
import { projects } from '../content/projects'
import { certificates } from '../content/certificates'
import { ProjectCard } from '../components/ProjectCard'
import { CertificateCard } from '../components/CertificateCard'
import { FocusCards } from '../components/FocusCards'
import { Journey } from '../components/Journey'
import { HeroStage, Tilt3D } from '../components/HeroStage'
import { AboutSection } from '../components/AboutSection'
import { ButtonLink, CopyEmail, IconLink, Reveal, GitHubIcon, LinkedInIcon, MailIcon, ArrowIcon } from '../components/ui'

/** Centred section heading: glowing pill eyebrow, big title, accent bar. */
function Heading({ pill, title, id, children }: { pill: string; title: ReactNode; id: string; children?: ReactNode }) {
  return (
    <Reveal className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
      <p className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/5 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
        <span className="size-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(79,217,234,0.9)]" aria-hidden="true" />
        {pill}
      </p>
      <h2 id={id} className="mt-5 font-display text-3xl font-bold tracking-tight text-cream sm:text-4xl md:text-5xl">
        {title}
      </h2>
      <span className="mx-auto mt-5 block h-1 w-16 rounded-full bg-gradient-to-r from-accent to-leaf" aria-hidden="true" />
      {children && <div className="mt-5 text-lg leading-relaxed text-cream-2">{children}</div>}
    </Reveal>
  )
}

function Hero() {
  const words = profile.headline.split(' ')
  const [live, setLive] = useState(false)
  return (
    <section aria-labelledby="hero-title" className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pb-16 pt-28 md:pt-32">
      {/* Interactive 3D layer: particle globe with orbiting project moons */}
      <HeroStage onLive={setLive} />

      {/* Text sits above the 3D layer; it lets pointer events through except on real controls. */}
      <div className="container-x pointer-events-none relative text-center [text-shadow:0_2px_16px_rgba(6,10,19,0.95)]">
        <motion.div className="flex flex-wrap items-center justify-center gap-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-ink-2/70 px-3 py-1.5 font-mono text-[11px] text-cream-2 backdrop-blur">
            <span className="size-1.5 rounded-full bg-leaf shadow-[0_0_8px_rgba(159,220,116,0.9)]" aria-hidden="true" />
            {profile.title}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-ink-2/70 px-3 py-1.5 font-mono text-[11px] text-cream-2 backdrop-blur">
            SRM IST Ramapuram
          </span>
        </motion.div>

        <motion.p className="mt-8 font-mono text-xs uppercase tracking-[0.35em] text-muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          Portfolio &amp; work
        </motion.p>
        <Tilt3D className="mt-4">
        <motion.h1
          id="hero-title"
          className="whitespace-nowrap font-display [text-shadow:none] text-[clamp(2.4rem,9vw,5.5rem)] font-bold leading-[0.95] tracking-tight"
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <span className="bg-gradient-to-r from-accent-2 via-accent to-leaf bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(79,217,234,0.25)]">{profile.shortName}</span>{' '}
          <span className="text-cream">M</span>
        </motion.h1>
        </Tilt3D>
        <motion.p className="mt-4 font-mono text-xs uppercase tracking-[0.25em] text-cream-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          AI/ML student · product builder
        </motion.p>

        <p className="mx-auto mt-8 max-w-3xl font-display text-xl font-medium leading-snug text-cream sm:text-2xl" aria-label={`“${profile.headline}”`}>
          <span aria-hidden="true">
            “
            {words.map((w, i) => (
              <Fragment key={i}>
                <motion.span
                  className={`inline-block ${w.startsWith('interactive') ? 'text-accent' : ''}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.45 + i * 0.05 }}
                >
                  {w}
                </motion.span>
                {i < words.length - 1 && ' '}
              </Fragment>
            ))}
            ”
          </span>
        </p>
        <motion.p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-cream-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          {profile.intro}
        </motion.p>

        <motion.div className="pointer-events-auto mt-9 flex flex-wrap items-center justify-center gap-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <ButtonLink to="#work" variant="accent">
            Explore my work <ArrowIcon />
          </ButtonLink>
          <ButtonLink to="#contact" variant="ghost">
            Get in touch
          </ButtonLink>
          <IconLink href={profile.links.github} label="GitHub profile (opens in new tab)">
            <GitHubIcon />
          </IconLink>
          <IconLink href={profile.links.linkedin} label="LinkedIn profile (opens in new tab)">
            <LinkedInIcon />
          </IconLink>
        </motion.div>

        {live && (
          <motion.p className="mt-6 hidden font-mono text-[11px] uppercase tracking-[0.2em] text-muted md:block" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            Drag the globe · hover the orbiting projects · click to open
          </motion.p>
        )}

        <motion.dl
          className="panel mx-auto mt-14 grid max-w-4xl grid-cols-2 overflow-hidden rounded-2xl text-left md:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.6 }}
        >
          {facts.map((f, i) => (
            <div key={f.label} className={`p-4 sm:p-5 ${i % 2 ? '' : 'border-r border-line'} ${i < 2 ? 'border-b border-line md:border-b-0' : ''} ${i === 1 ? 'md:border-r' : ''} ${i === 2 ? 'md:border-r' : ''}`}>
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">{f.label}</dt>
              <dd className="mt-1.5 font-display text-sm font-semibold text-cream sm:text-base">{f.value}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  )
}

function Focus() {
  return (
    <section id="focus" aria-labelledby="focus-title" className="relative py-24 md:py-32">
      <div className="container-x">
        <Heading pill="Knowledge map" title="Current focus" id="focus-title">
          Four areas I’m working on, each tied to a real project or certificate. Pick one to inspect.
        </Heading>
        <FocusCards />
      </div>
    </section>
  )
}

function Work() {
  return (
    <section id="work" aria-labelledby="work-title" className="relative py-24 md:py-32">
      <div className="container-x">
        <Heading pill="Projects showcase" title="Selected work" id="work-title">
          Team prototypes where I explored how data, interfaces and backend services come together.
        </Heading>
        <ul className="grid gap-8 lg:grid-cols-2">
          {projects.map((p, i) => (
            <Reveal as="li" key={p.slug} delay={0.08 * i}>
              <ProjectCard project={p} index={i} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

function JourneySection() {
  return (
    <section id="journey" aria-labelledby="journey-title" className="relative py-24 md:py-32">
      <div className="container-x">
        <Heading pill="Constellation · real milestones" title="Learning journey" id="journey-title">
          Each star is a project or a completed programme. Undated project milestones say so.
        </Heading>
        <Journey />
      </div>
    </section>
  )
}

function Learning() {
  return (
    <section id="learning" aria-labelledby="learning-title" className="relative py-24 md:py-32">
      <div className="container-x">
        <Heading pill="Certifications & applied learning" title="Short courses & job simulations" id="learning-title">
          Job simulations are practical task-based programmes — not employment or internships.
        </Heading>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {certificates.map((c, i) => (
            <Reveal as="li" key={c.id} delay={0.06 * i}>
              <CertificateCard cert={c} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative py-28 md:py-40">
      <div className="container-x">
        <Reveal className="panel glow-ring relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] px-6 py-14 text-center md:px-12 md:py-20">
          <div className="glow-accent pointer-events-none absolute left-1/2 top-0 size-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl" aria-hidden="true" />
          <p className="relative inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/5 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" /> Contact
          </p>
          <h2 id="contact-title" className="relative mt-6 font-display text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl md:text-5xl">
            Let’s build something <span className="bg-gradient-to-r from-accent to-leaf bg-clip-text text-transparent">useful.</span>
          </h2>
          <a href={`mailto:${profile.email}`} className="group relative mt-10 inline-flex max-w-full items-center gap-3 break-all font-display text-lg font-semibold text-cream sm:text-2xl">
            <MailIcon className="size-6 shrink-0 text-accent" />
            <span className="underline decoration-line decoration-2 underline-offset-8 transition-colors group-hover:decoration-accent">{profile.email}</span>
          </a>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <CopyEmail />
          </div>
          <div className="relative mt-6 flex items-center justify-center gap-3">
            <IconLink href={`mailto:${profile.email}`} label="Send an email">
              <MailIcon />
            </IconLink>
            <IconLink href={profile.links.linkedin} label="LinkedIn profile (opens in new tab)">
              <LinkedInIcon />
            </IconLink>
            <IconLink href={profile.links.github} label="GitHub profile (opens in new tab)">
              <GitHubIcon />
            </IconLink>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <AboutSection />
      <Focus />
      <Work />
      <JourneySection />
      <Learning />
      <Contact />
    </>
  )
}
