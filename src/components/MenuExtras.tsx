import { useEffect } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, useVelocity } from 'motion/react'
import { profile } from '../content/profile'
import { SMOOTH } from '../lib/motion'

type Preview = { blurb: string } & ({ img: string; fit?: 'cover' | 'contain' } | { big: string; small: string })

/** One-line description and a hover preview for each home-page section in the menu. */
export const menuInfo: Record<string, Preview> = {
  home: { blurb: 'Start here', big: 'Hi.', small: 'AI/ML engineering student' },
  about: { blurb: 'Who I am', img: '/images/aravinth-cutout-480.webp', fit: 'contain' },
  skills: { blurb: 'Tools I use', big: 'Py · TS', small: 'Python · React · FastAPI · ML' },
  projects: { blurb: 'Agri-Yield Pro · SITTO', img: '/images/agri/dashboard-800.webp' },
  hackathons: { blurb: 'Tech Horizon 2.0', img: '/images/sitto/home-800.webp' },
  certificates: { blurb: '4 completed', img: '/certificates/thumb-deeplearningai.webp' },
  experience: { blurb: 'Where I’ve contributed', big: 'Work', small: 'Experience' },
  achievements: { blurb: 'Milestones', big: '★', small: 'Achievements' },
  education: { blurb: 'B.Tech · CGPA 8.27', big: '8.27', small: 'CGPA · SRM IST Ramapuram' },
  blog: { blurb: 'Notes', big: 'Blog', small: 'Notes & learnings' },
  contact: { blurb: 'Let’s talk', big: 'Say hello', small: profile.email },
}

/**
 * Text that rolls on hover: each letter slides up, one after another, revealing a copy beneath.
 * Driven by the parent's `group/item` hover/focus, so the whole row triggers it.
 */
export function RollText({ text }: { text: string }) {
  return (
    <span className="relative inline-flex overflow-hidden" aria-label={text}>
      {text.split('').map((ch, i) => (
        <span key={i} className="relative inline-block" aria-hidden="true">
          <span
            className="inline-block transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover/item:-translate-y-full group-focus-visible/item:-translate-y-full"
            style={{ transitionDelay: `${i * 22}ms` }}
          >
            {ch === ' ' ? ' ' : ch}
          </span>
          <span
            className="absolute left-0 top-full inline-block transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover/item:-translate-y-full group-focus-visible/item:-translate-y-full"
            style={{ transitionDelay: `${i * 22}ms` }}
          >
            {ch === ' ' ? ' ' : ch}
          </span>
        </span>
      ))}
    </span>
  )
}

/**
 * Floating preview card that follows the pointer while a menu link is hovered, tilting with
 * the pointer's speed. Mouse/pen only; hidden on touch screens.
 */
export function CursorPreview({ id }: { id: string | null }) {
  const x = useMotionValue(-400)
  const y = useMotionValue(-400)
  const sx = useSpring(x, { stiffness: 180, damping: 26, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 180, damping: 26, mass: 0.6 })
  const vx = useVelocity(sx)
  const rotate = useTransform(vx, [-1500, 0, 1500], [-10, 0, 10], { clamp: true })

  useEffect(() => {
    const on = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      x.set(e.clientX)
      y.set(e.clientY)
    }
    window.addEventListener('pointermove', on, { passive: true })
    return () => window.removeEventListener('pointermove', on)
  }, [x, y])

  const info = id ? menuInfo[id] : null
  return (
    <motion.div className="pointer-events-none fixed left-0 top-0 z-[46] hidden [@media(hover:hover)]:block" style={{ x: sx, y: sy, rotate }} aria-hidden="true">
      <AnimatePresence mode="popLayout">
        {info && (
          <motion.div
            key={id}
            className="-translate-y-1/2 translate-x-8 overflow-hidden rounded-2xl border border-white/15 bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
            initial={{ opacity: 0, scale: 0.6, clipPath: 'inset(50% 50% 50% 50% round 16px)' }}
            animate={{ opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0% round 16px)', transition: { duration: 0.55, ease: SMOOTH } }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
          >
            {'img' in info ? (
              <img
                src={info.img}
                alt=""
                className={`block h-44 w-64 ${info.fit === 'contain' ? 'object-contain bg-[#efefef] grayscale' : 'object-cover object-top'}`}
              />
            ) : (
              <div className="flex h-44 w-64 flex-col justify-end bg-[#f2f2f2] p-5 text-[#0a0a0a]">
                <span className="font-display text-5xl font-bold leading-none tracking-tight">{info.big}</span>
                <span className="mt-2 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-[#0a0a0a]/60">{info.small}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/** Giant outlined number behind the menu that morphs to the hovered link's number. */
export function MenuBigNumber({ n }: { n: string }) {
  return (
    <div className="pointer-events-none absolute bottom-6 right-4 h-[38vw] overflow-hidden sm:h-[24vw]" aria-hidden="true">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={n}
          className="block select-none font-display text-[38vw] font-bold leading-[0.8] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.12)] sm:text-[24vw]"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1, transition: { duration: 0.6, ease: SMOOTH } }}
          exit={{ y: '-100%', opacity: 0, transition: { duration: 0.4, ease: SMOOTH } }}
        >
          {n}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
