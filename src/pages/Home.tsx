import { useState } from 'react'
import { motion } from 'motion/react'
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

function Hero() {
  const [live, setLive] = useState(false)
  return (
    <section id="home" aria-labelledby="hero-title" className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pb-16 pt-28 md:pt-32">
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
          Machine learning · full-stack development
        </motion.p>

        <motion.p className="mx-auto mt-8 max-w-3xl font-display text-xl font-medium leading-snug text-cream sm:text-2xl" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          {profile.title}
        </motion.p>
        <motion.p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-cream-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          {profile.intro}
        </motion.p>

        <motion.div className="pointer-events-auto mt-9 flex flex-wrap items-center justify-center gap-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
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
