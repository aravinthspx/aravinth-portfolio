import { Fragment, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { profile, facts } from '../content/profile'
import { projects } from '../content/projects'
import { certificates } from '../content/certificates'
import { ProjectCard } from '../components/ProjectCard'
import { CertificateCard } from '../components/CertificateCard'
import { FocusCards } from '../components/FocusCards'
import { Terminal } from '../components/Terminal'
import { Journey } from '../components/Journey'
import { ButtonLink, CopyEmail, IconLink, Reveal, GitHubIcon, LinkedInIcon, MailIcon, ArrowIcon } from '../components/ui'

/** Centred section heading: glowing pill eyebrow, big title, accent bar. */
function Heading({ pill, title, id, children }: { pill: string; title: ReactNode; id: string; children?: ReactNode }) {
  return (
    <Reveal className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
      <p className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/5 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
        <span className="size-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(79,217,234,0.9)]" aria-hidden="true" />
        {pill}
      </p>
      <h2 id={id} className="mt-5 font-display text-4xl font-extrabold tracking-tight text-cream sm:text-5xl md:text-6xl">
        {title}
      </h2>
      <span className="mx-auto mt-5 block h-1 w-16 rounded-full bg-gradient-to-r from-accent to-leaf" aria-hidden="true" />
      {children && <div className="mt-5 text-lg leading-relaxed text-cream-2">{children}</div>}
    </Reveal>
  )
}

function Hero() {
  const words = profile.headline.split(' ')
  return (
    <section aria-labelledby="hero-title" className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pb-16 pt-28 md:pt-32">
      {/* slow orbit rings behind the name */}
      <div className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
        <div className="orbit-slow relative size-[44rem] max-w-[160vw] rounded-full border border-accent/10">
          <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_14px_rgba(79,217,234,0.9)]" />
        </div>
        <div className="absolute inset-[18%] rounded-full border border-leaf/10" />
        <div className="glow-accent absolute inset-[25%] rounded-full blur-2xl" />
      </div>

      <div className="container-x relative text-center">
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
        <motion.h1
          id="hero-title"
          className="mt-4 whitespace-nowrap font-display text-[clamp(2.4rem,11.5vw,8.5rem)] font-extrabold leading-[0.95] tracking-tight"
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <span className="bg-gradient-to-r from-accent-2 via-accent to-leaf bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(79,217,234,0.25)]">{profile.shortName}</span>{' '}
          <span className="text-cream">M</span>
        </motion.h1>
        <motion.p className="mt-4 font-mono text-xs uppercase tracking-[0.25em] text-cream-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          AI/ML student · product builder
        </motion.p>

        <p className="mx-auto mt-8 max-w-3xl font-display text-2xl font-semibold leading-snug text-cream sm:text-3xl" aria-label={`“${profile.headline}”`}>
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

        <motion.div className="mt-9 flex flex-wrap items-center justify-center gap-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
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

function About() {
  const p = profile.portrait
  const stories = [
    { icon: '◆', title: 'Learning by building', body: 'Rather than studying topics in isolation, I learn through projects that force ideas to work end to end — interface, API and data.' },
    { icon: '◎', title: 'Honest about data', body: 'A farm-planning prototype taught me to explain estimates and to label synthetic and demonstration data clearly instead of over-claiming accuracy.' },
    { icon: '▲', title: 'Details shape trust', body: 'A campus-space platform showed me how much a mis-mapped building or an unclear empty state can undermine an otherwise useful tool.' },
    { icon: '✦', title: 'Where I’m heading', body: 'Keep building prototypes that connect AI with clear, usable interfaces — and keep getting better at evaluating them properly.' },
  ]
  return (
    <section id="about" aria-labelledby="about-title" className="relative py-24 md:py-32">
      <div className="container-x">
        <Heading pill="Profile & perspective" title="About me" id="about-title">
          An AI/ML student exploring product design and full-stack development — learning most by building.
        </Heading>
        <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          {p && (
            <Reveal className="mx-auto w-full max-w-md">
              <figure className="panel glow-ring overflow-hidden rounded-[1.75rem] p-3">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-[radial-gradient(90%_70%_at_50%_30%,#14304a_0%,#0b111d_70%)]">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(79,217,234,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(79,217,234,0.06)_1px,transparent_1px)] bg-[size:28px_28px]" aria-hidden="true" />
                  <img
                    src={p.src}
                    srcSet={p.srcSet}
                    sizes="(min-width: 1024px) 420px, 90vw"
                    width={p.width}
                    height={p.height}
                    alt={p.alt}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-x-0 bottom-0 mx-auto h-[96%] w-auto max-w-none object-contain object-bottom contrast-[1.08] grayscale"
                    style={{ maskImage: 'linear-gradient(to bottom, #000 78%, transparent 99%)', WebkitMaskImage: 'linear-gradient(to bottom, #000 78%, transparent 99%)' }}
                  />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-leaf/30 bg-ink/80 px-3 py-1 font-mono text-[11px] text-leaf backdrop-blur">
                    <span className="size-1.5 rounded-full bg-leaf" aria-hidden="true" /> Student builder
                  </span>
                  <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-xl border border-line bg-ink/85 px-3 py-2 font-mono text-[11px] backdrop-blur">
                    <span className="text-cream-2">SRM IST Ramapuram</span>
                    <span className="text-accent">CSE · AI &amp; ML</span>
                  </div>
                </div>
                <figcaption className="flex items-center justify-between gap-3 px-2 pb-1 pt-4">
                  <span>
                    <span className="block font-display text-lg font-bold text-cream">{profile.name}</span>
                    <span className="block font-mono text-[11px] text-muted">B.Tech · Computer Science and Engineering</span>
                  </span>
                  <span className="rounded-md border border-leaf/40 bg-leaf/10 px-2 py-1 font-mono text-[10px] text-leaf">AI &amp; ML</span>
                </figcaption>
              </figure>
            </Reveal>
          )}
          <div>
            <Reveal>
              <p className="text-xl leading-relaxed text-cream md:text-2xl">
                I’m most interested in the space where machine learning meets everyday decisions — and in making the result understandable to the person using it.
              </p>
            </Reveal>
            <ul className="mt-8 grid gap-4">
              {stories.map((s, i) => (
                <Reveal as="li" key={s.title} delay={0.06 * i} className="panel flex gap-4 rounded-2xl p-5 transition-colors hover:border-accent/40">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-accent" aria-hidden="true">
                    {s.icon}
                  </span>
                  <span>
                    <span className="block font-display text-lg font-bold text-cream">{s.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-cream-2">{s.body}</span>
                  </span>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
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

function Featured() {
  const p = projects[0]
  return (
    <section id="console" aria-labelledby="console-title" className="relative py-24 md:py-32">
      <div className="container-x">
        <Heading pill="Featured build · interactive" title={p.name} id="console-title">
          <span className="font-mono text-sm uppercase tracking-[0.25em] text-leaf">{p.type}</span>
          <span className="mt-4 block">Explore the prototype from the command line — every answer comes from the project’s own documentation.</span>
        </Heading>
        <div className="grid items-start gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <Reveal>
            <Terminal />
          </Reveal>
          <Reveal delay={0.1} className="panel rounded-3xl p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">At a glance</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex justify-between gap-3 border-b border-line pb-3">
                <span className="text-cream-2">Status</span>
                <span className="font-mono text-ok">Documented prototype</span>
              </li>
              <li className="flex justify-between gap-3 border-b border-line pb-3">
                <span className="text-cream-2">Team</span>
                <span className="text-right font-mono text-cream">{p.overview.team}</span>
              </li>
              <li className="flex justify-between gap-3 border-b border-line pb-3">
                <span className="text-cream-2">Data</span>
                <span className="font-mono text-warn">Synthetic / demo</span>
              </li>
              <li className="flex justify-between gap-3">
                <span className="text-cream-2">Assistant</span>
                <span className="font-mono text-cream">Keyword-based</span>
              </li>
            </ul>
            <div className="mt-6">
              <ButtonLink to={`/work/${p.slug}`} variant="ghost" className="w-full">
                Read the case study <ArrowIcon />
              </ButtonLink>
            </div>
          </Reveal>
        </div>
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
          <h2 id="contact-title" className="relative mt-6 font-display text-4xl font-extrabold leading-[1] tracking-tight sm:text-6xl md:text-7xl">
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
      <About />
      <Focus />
      <Featured />
      <Work />
      <JourneySection />
      <Learning />
      <Contact />
    </>
  )
}
