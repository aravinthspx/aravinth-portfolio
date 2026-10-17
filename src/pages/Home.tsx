import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useMotionPref } from '../lib/motion'
import { profile, facts } from '../content/profile'
import { FocusCards } from '../components/FocusCards'
import { Journey } from '../components/Journey'
import { HeroStage, Tilt3D } from '../components/HeroStage'
import { AboutSection } from '../components/AboutSection'
import { Heading } from '../components/Heading'
import { SkillsSection } from '../components/sections/Skills'
import { ProjectsSection } from '../components/sections/Projects'
import { HackathonsSection } from '../components/sections/Hackathons'
import { CertificatesSection } from '../components/sections/Certificates'
import { ContactSection } from '../components/sections/Contact'
import { DirectionSection } from '../components/sections/Direction'
import { EducationSection, ExperienceSection, AchievementsSection, BlogSection } from '../components/sections/Records'
import { ButtonLink, IconLink, GitHubIcon, LinkedInIcon, ArrowIcon } from '../components/ui'

const roles = ['machine learning', 'full-stack apps', 'intelligent systems']

/** Cycles through focus areas; holds on the first one when motion is reduced. */
function RoleRotator() {
  const { reduced } = useMotionPref()
  const [i, setI] = useState(0)
  useEffect(() => {
    if (reduced) return
    const t = window.setInterval(() => setI((n) => (n + 1) % roles.length), 2600)
    return () => window.clearInterval(t)
  }, [reduced])
  return (
    <span className="relative mt-1 grid overflow-hidden justify-items-center lg:justify-items-start">
      <span className="invisible col-start-1 row-start-1" aria-hidden="true">intelligent systems</span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={roles[i]}
          className="col-start-1 row-start-1 bg-gradient-to-r from-accent to-leaf bg-clip-text text-transparent"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {roles[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

// Keyboard/touch-friendly mirror of the three orbiting objects in the 3D scene.
const orbitLegend = [
  { label: 'Agri-Yield Pro', to: '/work/agri-yield-pro', dot: 'bg-leaf shadow-[0_0_8px_rgba(159,220,116,0.9)]' },
  { label: 'SITTO', to: '/work/sitto', dot: 'bg-accent shadow-[0_0_8px_rgba(79,217,234,0.9)]' },
  { label: 'Certificates', to: '#certificates', dot: 'bg-warm shadow-[0_0_8px_rgba(229,180,95,0.9)]' },
]

function Corner({ className }: { className: string }) {
  return <span className={`pointer-events-none absolute size-5 border-accent/60 ${className}`} aria-hidden="true" />
}

const ease = [0.2, 0.8, 0.2, 1] as const
const rise = (delay: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease } })

function Hero() {
  const [live, setLive] = useState(false)
  return (
    <section id="home" aria-labelledby="hero-title" className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pb-16 pt-28 md:pt-32">
      <div className="glow-accent pointer-events-none absolute -left-40 top-1/4 size-[32rem] rounded-full opacity-60 blur-3xl" aria-hidden="true" />

      <div className="container-x relative grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        {/* Left: identity and calls to action */}
        <div className="min-w-0 text-center lg:text-left">
          <motion.p {...rise(0)} className="inline-flex items-center gap-2 rounded-full border border-line bg-ink-2/70 px-3 py-1.5 font-mono text-[11px] text-cream-2 backdrop-blur">
            <span className="size-1.5 rounded-full bg-leaf shadow-[0_0_8px_rgba(159,220,116,0.9)]" aria-hidden="true" />
            B.Tech CSE (AI &amp; ML) · SRM IST Ramapuram
          </motion.p>

          <motion.p {...rise(0.1)} className="mt-8 font-mono text-xs uppercase tracking-[0.3em] text-muted">
            <span className="text-accent">&gt;</span> Hello, I’m
          </motion.p>
          <Tilt3D className="mt-3" max={5}>
            <motion.h1
              id="hero-title"
              className="whitespace-nowrap font-display text-[clamp(2.6rem,8vw,5.25rem)] font-bold leading-[0.95] tracking-tight"
              initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, delay: 0.15, ease }}
            >
              <span className="bg-gradient-to-r from-accent-2 via-accent to-leaf bg-clip-text text-transparent">{profile.shortName}</span>{' '}
              <span className="text-cream">M</span>
            </motion.h1>
          </Tilt3D>

          <motion.p {...rise(0.3)} className="mt-6 font-display text-xl font-medium text-cream sm:text-2xl">
            AI/ML engineering student building <RoleRotator />
          </motion.p>
          <motion.p {...rise(0.45)} className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-cream-2 sm:text-lg lg:mx-0">
            {profile.intro}
          </motion.p>

          <motion.div {...rise(0.6)} className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <ButtonLink to="#projects" variant="accent">
              View Projects <ArrowIcon />
            </ButtonLink>
            <ButtonLink to="#contact" variant="ghost">
              Contact Me
            </ButtonLink>
            {profile.resumeUrl && (
              <ButtonLink to={profile.resumeUrl} variant="ghost">
                Download Resume
              </ButtonLink>
            )}
            <span className="mx-1 hidden h-6 w-px bg-line sm:block" aria-hidden="true" />
            <IconLink href={profile.links.github} label="GitHub profile (opens in new tab)">
              <GitHubIcon />
            </IconLink>
            <IconLink href={profile.links.linkedin} label="LinkedIn profile (opens in new tab)">
              <LinkedInIcon />
            </IconLink>
          </motion.div>
        </div>

        {/* Right: the 3D orbit, framed like an instrument panel */}
        <motion.div
          className="relative mx-auto w-full max-w-[34rem]"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease }}
        >
          <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-line bg-[radial-gradient(70%_70%_at_50%_50%,rgba(79,217,234,0.09),rgba(6,10,19,0.2)_70%)]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(79,217,234,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(79,217,234,0.04)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(circle,black_40%,transparent_75%)]" aria-hidden="true" />
            <HeroStage framed onLive={setLive} />
            <Corner className="left-4 top-4 rounded-tl-lg border-l border-t" />
            <Corner className="right-4 top-4 rounded-tr-lg border-r border-t" />
            <Corner className="bottom-4 left-4 rounded-bl-lg border-b border-l" />
            <Corner className="bottom-4 right-4 rounded-br-lg border-b border-r" />
            <p className="pointer-events-none absolute left-8 top-7 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              <span className="text-accent">●</span> Orbit view
            </p>
            <p className="pointer-events-none absolute right-8 top-7 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{live ? 'Live · 3D' : 'Loading'}</p>
            {live && (
              <p className="pointer-events-none absolute inset-x-0 bottom-7 hidden text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted md:block">
                Drag · hover · click a moon
              </p>
            )}
          </div>
          <ul className="mt-4 flex flex-wrap justify-center gap-2" aria-label="Orbiting projects">
            {orbitLegend.map((o) => (
              <li key={o.label}>
                <ButtonLink to={o.to} variant="ghost" className="!px-3.5 !py-1.5 !text-xs">
                  <span className={`size-2 rounded-full ${o.dot}`} aria-hidden="true" />
                  {o.label}
                </ButtonLink>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.dl
        className="container-x relative mt-14 grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        {facts.map((f) => (
          <div key={f.label} className="border-l-2 border-accent/40 py-1 pl-4 text-left">
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">{f.label}</dt>
            <dd className="mt-1 font-display text-sm font-semibold text-cream sm:text-base">{f.value}</dd>
          </div>
        ))}
      </motion.dl>
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

export default function Home() {
  return (
    <>
      <Hero />
      <AboutSection />
      <Focus />
      <SkillsSection />
      <ProjectsSection />
      <HackathonsSection />
      <CertificatesSection />
      <JourneySection />
      <DirectionSection />
      <ExperienceSection />
      <AchievementsSection />
      <EducationSection />
      <BlogSection />
      <ContactSection />
    </>
  )
}
