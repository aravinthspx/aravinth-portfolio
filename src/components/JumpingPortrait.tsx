import type { ReactNode, RefObject } from 'react'
import { motion, useScroll, useSpring, useTransform, useVelocity } from 'motion/react'
import { useMotionPref } from '../lib/motion'

/**
 * Scroll-driven zoom for the About portrait:
 *  1. Entrance — the portrait zooms in from small and faded as the section appears.
 *  2. While scrolling — it zooms in towards the middle of the section and back out as the
 *     section leaves, and briefly zooms out when you scroll fast, easing back in on a spring.
 * Reduced motion: renders the children in place with no movement.
 */
export function JumpingPortrait({ target, children }: { target: RefObject<HTMLElement | null>; children: ReactNode }) {
  const { reduced } = useMotionPref()
  const { scrollYProgress, scrollY } = useScroll({ target, offset: ['start end', 'end start'] })
  const velocity = useVelocity(scrollY)

  // Zoom curve across the section: small → largest at the centre → small again.
  const zoom = useTransform(scrollYProgress, [0, 0.45, 1], [0.9, 1.07, 0.93])
  // Fast scrolling pulls the image back a little (zoom out), then it settles.
  const pull = useTransform(velocity, [-3000, 0, 3000], [-0.05, 0, -0.05], { clamp: true })
  const scale = useSpring(useTransform(() => zoom.get() + pull.get()), { stiffness: 70, damping: 24, mass: 0.9 })

  if (reduced) return <div className="absolute inset-0">{children}</div>

  return (
    <motion.div
      className="absolute inset-0 origin-[50%_75%]"
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ amount: 0.2 }}
      transition={{ opacity: { duration: 0.6 }, scale: { type: 'spring', stiffness: 100, damping: 26 } }}
    >
      <motion.div className="absolute inset-0 origin-[50%_75%]" style={{ scale }}>
        {children}
      </motion.div>
    </motion.div>
  )
}
