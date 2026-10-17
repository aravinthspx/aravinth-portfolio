import type { ReactNode, RefObject } from 'react'
import { motion, useScroll, useSpring, useTransform, useVelocity } from 'motion/react'
import { useMotionPref } from '../lib/motion'

/**
 * Scroll-driven "jump" for the About portrait:
 *  1. Entrance — when the section scrolls into view the portrait leaps up from below and
 *     lands with a springy overshoot (squash on landing via scaleY).
 *  2. While scrolling — it drifts with a parallax offset, hops upward in proportion to
 *     scroll speed and tilts slightly, all through a low-damping spring so it bounces
 *     and settles when scrolling stops.
 * Reduced motion: renders the children in place with no movement.
 */
export function JumpingPortrait({ target, children }: { target: RefObject<HTMLElement | null>; children: ReactNode }) {
  const { reduced } = useMotionPref()
  const { scrollYProgress, scrollY } = useScroll({ target, offset: ['start end', 'end start'] })
  const velocity = useVelocity(scrollY)

  // Parallax: moves a little slower than the page as the section passes through.
  const drift = useTransform(scrollYProgress, [0, 1], [70, -70])
  // Hop: scrolling down quickly lifts the portrait; the spring brings it back down with a bounce.
  const hop = useTransform(velocity, [-2500, 0, 2500], [30, 0, -55], { clamp: true })
  const y = useSpring(useTransform(() => drift.get() + hop.get()), { stiffness: 170, damping: 9, mass: 0.9 })
  const rotate = useSpring(useTransform(velocity, [-2500, 0, 2500], [1.6, 0, -2.2], { clamp: true }), { stiffness: 140, damping: 10 })
  const stretch = useSpring(useTransform(velocity, [-2500, 0, 2500], [0.985, 1, 1.03], { clamp: true }), { stiffness: 220, damping: 11 })

  if (reduced) return <div className="absolute inset-0">{children}</div>

  return (
    <motion.div
      className="absolute inset-0 origin-bottom"
      initial={{ opacity: 0, y: 180, scaleY: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scaleY: [0.92, 1.06, 0.97, 1] }}
      viewport={{ amount: 0.2 }}
      transition={{
        opacity: { duration: 0.4 },
        y: { type: 'spring', stiffness: 210, damping: 11, mass: 0.9 },
        scaleY: { duration: 0.9, times: [0, 0.45, 0.75, 1], ease: 'easeOut' },
      }}
    >
      <motion.div className="absolute inset-0 origin-bottom" style={{ y, rotate, scaleY: stretch }}>
        {children}
      </motion.div>
    </motion.div>
  )
}
