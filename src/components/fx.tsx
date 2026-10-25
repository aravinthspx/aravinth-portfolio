import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { animate, motion, useInView, useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react'
import { SMOOTH, useMotionPref } from '../lib/motion'

/**
 * Small shared motion effects for cards, headings and images.
 * All of them fall back to a still version when the visitor prefers reduced motion.
 */

/**
 * Card that tilts towards the pointer with a light sheen following it.
 * `holo` adds a faint rainbow foil band — used on certificates.
 */
export function TiltCard({
  children,
  className = '',
  max = 8,
  holo = false,
}: {
  children: ReactNode
  className?: string
  max?: number
  holo?: boolean
}) {
  const { reduced } = useMotionPref()
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const sx = useSpring(px, { stiffness: 160, damping: 18 })
  const sy = useSpring(py, { stiffness: 160, damping: 18 })
  const rotateY = useTransform(sx, [0, 1], [-max, max])
  const rotateX = useTransform(sy, [0, 1], [max * 0.8, -max * 0.8])
  const gx = useTransform(sx, (v) => `${v * 100}%`)
  const gy = useTransform(sy, (v) => `${v * 100}%`)
  const sheen = useMotionTemplate`radial-gradient(520px circle at ${gx} ${gy}, rgba(255,255,255,0.35), transparent 45%)`
  const foilPos = useTransform(sx, (v) => `${v * 100}% ${50}%`)
  const [on, setOn] = useState(false)

  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType === 'touch') return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }
  const leave = () => {
    setOn(false)
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <div className="h-full [perspective:1100px]" onPointerEnter={() => setOn(true)} onPointerMove={move} onPointerLeave={leave}>
      <motion.div className={`relative h-full [transform-style:preserve-3d] ${className}`} style={reduced ? undefined : { rotateX, rotateY }}>
        {children}
        {!reduced && (
          <>
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] mix-blend-soft-light transition-opacity duration-300"
              style={{ background: sheen, opacity: on ? 1 : 0 }}
            />
            {holo && (
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] mix-blend-color-dodge transition-opacity duration-300"
                style={{
                  opacity: on ? 0.22 : 0,
                  backgroundImage: 'linear-gradient(115deg, transparent 20%, #ff9ad5 36%, #9ad7ff 46%, #b8ffb0 56%, #ffe49a 66%, transparent 80%)',
                  backgroundSize: '220% 100%',
                  backgroundPosition: foilPos,
                }}
              />
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}

/** Heading text whose words rise one by one out of a mask. */
export function WordReveal({ text, delay = 0, stagger = 0.05 }: { text: string; delay?: number; stagger?: number }) {
  const { reduced } = useMotionPref()
  if (reduced) return <>{text}</>
  return (
    <span aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-top" aria-hidden="true">
          <motion.span
            className="inline-block"
            initial={{ y: '105%', rotate: 4 }}
            animate={{ y: '0%', rotate: 0 }}
            transition={{ duration: 0.8, delay: delay + i * stagger, ease: SMOOTH }}
          >
            {w}
            {i < text.split(' ').length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

/** Number that counts up from zero the first time it scrolls into view. */
export function CountUp({ value, decimals = 0, duration = 1.6 }: { value: number; decimals?: number; duration?: number }) {
  const { reduced } = useMotionPref()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const [shown, setShown] = useState(reduced ? value : 0)
  useEffect(() => {
    if (!inView || reduced) return
    const c = animate(0, value, { duration, ease: SMOOTH, onUpdate: setShown })
    return () => c.stop()
  }, [inView, reduced, value, duration])
  return <span ref={ref}>{shown.toFixed(decimals)}</span>
}

/** Screenshot frame that unfolds from a tilted-back angle to flat as it scrolls into view. */
export function ScrollUnfold({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { reduced } = useMotionPref()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 24 })
  const rotateX = useTransform(p, [0, 1], [24, 0])
  const scale = useTransform(p, [0, 1], [0.9, 1])
  const y = useTransform(p, [0, 1], [40, 0])
  return (
    <div ref={ref} className="[perspective:1400px]">
      <motion.div className={`origin-bottom ${className}`} style={reduced ? undefined : { rotateX, scale, y }}>
        {children}
      </motion.div>
    </div>
  )
}

/** Image that wipes in when it enters the view and drifts gently with scroll inside its frame. */
export function ParallaxImage({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const { reduced } = useMotionPref()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])
  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      initial={reduced ? false : { clipPath: 'inset(0 100% 0 0 round 16px)' }}
      whileInView={{ clipPath: 'inset(0 0% 0 0 round 16px)' }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1.1, ease: SMOOTH }}
    >
      <motion.img src={src} alt={alt} loading="lazy" className="block h-auto w-full scale-[1.14]" style={reduced ? undefined : { y }} />
    </motion.div>
  )
}
