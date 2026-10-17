import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { spring, useMotionPref } from '../lib/motion'

/**
 * Hero visual: real screenshots of the two projects, layered like windows on a desk.
 * Hovering the group fans them apart; each window links to its case study.
 */

function Window({ src, w, h, title, url, alt }: { src: string; w: number; h: number; title: string; url: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-ink-2 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.95)]">
      <div className="flex items-center gap-2 border-b border-line bg-ink-3/80 px-3 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-cream/20" />
          <span className="size-2 rounded-full bg-cream/20" />
          <span className="size-2 rounded-full bg-cream/20" />
        </span>
        <span className="mx-auto truncate rounded-md bg-ink/70 px-3 py-0.5 font-mono text-[10px] text-muted">{url}</span>
        <span className="sr-only">{title}</span>
      </div>
      <img src={src} width={w} height={h} alt={alt} className="block h-auto w-full" />
    </div>
  )
}

export function HeroShowcase() {
  const { reduced } = useMotionPref()
  const [open, setOpen] = useState(false)
  const fan = open && !reduced

  return (
    <div
      className="relative mx-auto aspect-[5/4] w-full max-w-[36rem]"
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <div className="glow-accent pointer-events-none absolute inset-[12%] rounded-full blur-3xl" aria-hidden="true" />

      {/* Back: Agri-Yield Pro dashboard */}
      <motion.div
        className="absolute left-0 top-[4%] w-[78%]"
        animate={{ x: fan ? -14 : 0, y: fan ? -10 : 0, rotate: fan ? -4 : -2 }}
        transition={spring}
      >
        <Link to="/work/agri-yield-pro" className="block rounded-xl focus-visible:outline-2" aria-label="Agri-Yield Pro case study">
          <Window src="/images/agri/dashboard-800.webp" w={800} h={368} title="Agri-Yield Pro" url="agri-yield-pro / dashboard" alt="Agri-Yield Pro farm dashboard screenshot" />
        </Link>
      </motion.div>

      {/* Front: SITTO home */}
      <motion.div
        className="absolute bottom-[8%] right-0 w-[78%]"
        animate={{ x: fan ? 14 : 0, y: fan ? 10 : 0, rotate: fan ? 3 : 1.5 }}
        transition={spring}
      >
        <Link to="/work/sitto" className="block rounded-xl focus-visible:outline-2" aria-label="SITTO case study">
          <Window src="/images/sitto/home-800.webp" w={800} h={369} title="SITTO" url="sitto / home" alt="SITTO campus space-booking home screen screenshot" />
        </Link>
      </motion.div>

      {/* Phone: SITTO QR pass */}
      <motion.div
        className="absolute bottom-0 left-[6%] w-[22%] overflow-hidden rounded-[1.1rem] border-4 border-ink-3 bg-ink-2 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.95)]"
        animate={{ x: fan ? -10 : 0, y: fan ? 8 : 0, rotate: fan ? -6 : -3 }}
        transition={spring}
        aria-hidden="true"
      >
        <img src="/images/sitto/qr-pass-800.webp" width={585} height={783} alt="" className="block h-auto w-full" />
      </motion.div>

      {/* Captions */}
      <div className="pointer-events-none absolute -bottom-12 inset-x-0 flex flex-wrap justify-center gap-x-6 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
        <span><span className="text-leaf">●</span> Agri-Yield Pro</span>
        <span><span className="text-accent">●</span> SITTO</span>
        <span className="hidden sm:inline">Real project screens</span>
      </div>
    </div>
  )
}
