import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useMotionPref } from '../lib/motion'
import { profile, facts } from '../content/profile'
import { FocusCards } from '../components/FocusCards'
import { Journey } from '../components/Journey'
import { Tilt3D } from '../components/HeroStage'
import { HeroShowcase } from '../components/HeroShowcase'
import { AboutSection } from '../components/AboutSection'
import { Heading } from '../components/Heading'
import { SkillsSection } from '../components/sections/Skills'
import { ProjectsSection } from '../components/sections/Projects'
import { LabTeaser } from '../components/sections/LabTeaser'
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

const ease = [0.2, 0.8, 0.2, 1] as const
const rise = (delay: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease } })

function Hero() {
  return (
    <section id="home" aria-labelledby="hero-title" className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pb-16 pt-28 md:pt-32">
      <div className="glow-accent pointer-events-none absolute -left-40 top-1/4 size-[32rem] rounded-full opacity-60 blur-3xl" aria-hidden="true" />

      <div className="container-x relative grid items-center gap-16 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        {/* Left: identity and calls to action */}
        <div className="min-w-0 text-center lg:text-left">
          <motion.p {...rise(0)} className="inline-flex items-center gap-2 rounded-full border border-line bg-ink-2/70 px-3 py-1.5 font-mono text-[11px] text-cream-2 backdrop-blur">
            <span className="size-1.5 rounded-full bg-leaf shadow-[0_0_8px_rgba(212,212,212,0.9)]" aria-hidden="true" />
            B.Tech CSE (AI &amp; ML) · SRM IST Ramapuram
          </motion.p>

          <motion.p {...rise(0.1)} className="mt-8 font-mono text-xs uppercase tracking-[0.3em] text-muted">
            <span className="text-accent">&gt;</span> Hello, I’m
          </motion.p>
          <Tilt3D className="mt-3" max={5}>
            <motion.h1
              id="hero-title"
              className="whitespace-nowrap font-display [text-shadow:none] text-[clamp(2.6rem,8vw,5.25rem)] font-bold leading-[0.95] tracking-tight"
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

          <motion.dl
            className="mt-14 grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4 lg:mt-12 lg:grid-cols-2"
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
        </div>

        {/* Right: real project screens */}
        <motion.div
          className="min-w-0 pb-12"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease }}
        >
          <HeroShowcase />
        </motion.div>
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
      <LabTeaser />
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
