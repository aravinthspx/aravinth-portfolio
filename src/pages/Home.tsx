import { Fragment } from 'react'
import { motion } from 'motion/react'
import { profile, interests } from '../content/profile'
import { projects } from '../content/projects'
import { certificates } from '../content/certificates'
import { HeroVisual } from '../components/HeroVisual'
import { ProjectCard } from '../components/ProjectCard'
import { CertificateCard } from '../components/CertificateCard'
import { ButtonLink, CopyEmail, IconLink, Reveal, SectionHeading, GitHubIcon, LinkedInIcon, MailIcon, ArrowIcon } from '../components/ui'

function Hero() {
  const words = profile.headline.split(' ')
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      <p aria-hidden="true" className="outline-text pointer-events-none absolute left-1/2 top-16 -translate-x-1/2 select-none whitespace-nowrap font-display text-[26vw] font-extrabold leading-none tracking-tighter md:top-10">
        BUILD
      </p>
      <div className="container-x relative grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          <motion.p className="eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {profile.name} — {profile.title}
          </motion.p>
          <h1 id="hero-title" className="mt-6 font-display text-[clamp(2rem,9.5vw,2.6rem)] font-extrabold leading-[0.98] tracking-tight text-cream sm:text-6xl lg:text-[4.1rem] xl:text-[5rem]">
            {words.map((w, i) => (
              <Fragment key={i}>
              <span className="inline-block overflow-hidden pb-1 align-bottom">
                <motion.span
                  className={`inline-block ${w.startsWith('interactive') ? 'bg-gradient-to-r from-violet-2 to-cyan bg-clip-text text-transparent' : ''}`}
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  {w}
                </motion.span>
              </span>
              {i < words.length - 1 && ' '}
              </Fragment>
            ))}
          </h1>
          <motion.p className="mt-7 max-w-xl text-lg leading-relaxed text-cream-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }}>
            {profile.intro}
          </motion.p>
          <motion.div className="mt-9 flex flex-wrap gap-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.5 }}>
            <ButtonLink to="#work" variant="primary">
              Explore My Work <ArrowIcon />
            </ButtonLink>
            <ButtonLink to="#contact" variant="ghost">
              Get in Touch
            </ButtonLink>
          </motion.div>
        </div>
        <motion.div className="min-w-0 lg:col-span-5" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 1, ease: [0.2, 0.8, 0.2, 1] }}>
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  )
}

function Marquee() {
  const items = ['AI / ML', 'Product Design', 'Full-Stack', 'Prototyping', 'Interaction']
  const row = [...items, ...items]
  return (
    <div className="relative border-y border-line bg-ink-2/60 py-5" aria-hidden="true">
      <div className="flex overflow-hidden">
        <div className="marquee flex shrink-0 gap-10 pr-10 font-display text-3xl font-bold uppercase tracking-tight text-cream/80 md:text-5xl">
          {[...row, ...row].map((t, i) => (
            <span key={i} className="flex items-center gap-10 whitespace-nowrap">
              {t} <span className="text-violet">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function Work() {
  return (
    <section id="work" aria-labelledby="work-title" className="py-24 md:py-36">
      <div className="container-x">
        <SectionHeading eyebrow="Selected work" title={<>Two prototypes,<br className="hidden sm:block" /> built to learn.</>} id="work-title">
          Team projects where I explored how data, interfaces and backend services come together. Visuals are illustrative mockups unless stated otherwise.
        </SectionHeading>
        <div className="space-y-24 md:space-y-36">
          {projects.map((p, i) => (
            <Reveal key={p.slug}>
              <ProjectCard project={p} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="relative overflow-hidden py-24 md:py-36">
      <div className="glow-violet pointer-events-none absolute -left-40 top-20 size-[36rem] rounded-full blur-3xl" aria-hidden="true" />
      <div className="container-x relative grid grid-cols-1 gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="eyebrow mb-4">About</p>
            <h2 id="about-title" className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
              Learning <span className="italic text-violet-2">by</span> building.
            </h2>
          </Reveal>
        </div>
        <div className="lg:col-span-7">
          <Reveal delay={0.05}>
            <p className="text-xl leading-relaxed text-cream md:text-2xl">
              I’m most interested in the space where machine learning meets everyday decisions — and in making the result understandable to the person using it.
            </p>
            <p className="mt-6 text-lg leading-relaxed text-cream-2">
              Rather than studying topics in isolation, I learn through projects: a farm-planning prototype taught me to explain estimates and label demonstration data honestly; a campus-space platform taught me how much data accuracy and clear error states shape trust.
            </p>
            {profile.study && <p className="mt-6 font-mono text-sm text-muted">{profile.study}</p>}
          </Reveal>
          <ul className="mt-12 grid gap-4 sm:grid-cols-3">
            {interests.map((it, i) => (
              <Reveal as="li" key={it.title} delay={0.08 * i} className="rounded-3xl border border-line bg-ink-2/70 p-5 backdrop-blur">
                <span className="font-mono text-xs text-violet-2">0{i + 1}</span>
                <h3 className="mt-3 font-display text-lg font-bold">{it.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream-2">{it.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function Learning() {
  return (
    <section id="learning" aria-labelledby="learning-title" className="border-t border-line bg-ink-2/40 py-24 md:py-36">
      <div className="container-x">
        <SectionHeading eyebrow="Certifications & applied learning" title="Short courses and job simulations." id="learning-title">
          Self-paced learning alongside projects. Job simulations are practical task-based programmes — not employment or internships.
        </SectionHeading>
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
    <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden py-28 md:py-40">
      <div className="glow-cyan pointer-events-none absolute right-[-10%] top-0 size-[40rem] rounded-full blur-3xl" aria-hidden="true" />
      <div className="container-x relative">
        <Reveal>
          <p className="eyebrow mb-6">Contact</p>
          <h2 id="contact-title" className="max-w-4xl font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl md:text-8xl">
            Let’s build something <span className="bg-gradient-to-r from-violet-2 to-cyan bg-clip-text text-transparent">useful.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-12 flex flex-col gap-8">
          <a href={`mailto:${profile.email}`} className="group inline-flex w-fit max-w-full items-center gap-3 break-all font-display text-xl font-semibold text-cream sm:text-3xl">
            <MailIcon className="size-7 shrink-0 text-violet-2" />
            <span className="underline decoration-line decoration-2 underline-offset-8 transition-colors group-hover:decoration-violet-2">{profile.email}</span>
          </a>
          <div className="flex flex-wrap items-center gap-3">
            <CopyEmail />
          </div>
          <div className="flex items-center gap-3">
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
      <Marquee />
      <Work />
      <About />
      <Learning />
      <Contact />
    </>
  )
}
