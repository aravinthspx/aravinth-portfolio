import { Suspense, lazy, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { PageBackground } from './components/PageBackground'
import { Cursor } from './components/Cursor'
import { IntroGate, shouldShowIntro } from './components/IntroGate'
import { CommandPaletteProvider } from './components/CommandPalette'
import { useMotionPref } from './lib/motion'
import { scrollToTarget, startSmoothScroll } from './lib/scroll'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

const CaseStudy = lazy(() => import('./pages/CaseStudy'))
const BlogPost = lazy(() => import('./pages/BlogPost'))

const EASE = [0.76, 0, 0.24, 1] as const

/** Thin bar across the top that fills smoothly as you scroll. */
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.5 })
  return <motion.div className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-cream" style={{ scaleX }} aria-hidden="true" />
}

/** Scrolls to the #section when a hash is present (waits for the new page to mount). */
function HashScroller() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    let tries = 0
    let t = 0
    const go = () => {
      const el = document.getElementById(hash.slice(1))
      if (el) scrollToTarget(el)
      else if (tries++ < 30) t = window.setTimeout(go, 50)
    }
    go()
    return () => window.clearTimeout(t)
  }, [pathname, hash])
  return null
}

/**
 * Page transition: a black curtain rises over the old page, the new page mounts underneath,
 * then the curtain lifts away. Skipped entirely with reduced motion.
 */
function Curtain() {
  return (
    <>
      <motion.div
        className="pointer-events-none fixed inset-0 z-[65] origin-bottom bg-cream"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 1 }}
        transition={{ duration: 0.45, ease: EASE }}
        aria-hidden="true"
      />
      <motion.div
        className="pointer-events-none fixed inset-0 z-[65] grid origin-top place-items-center bg-cream"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 0 }}
        transition={{ duration: 0.55, ease: EASE, delay: 0.05 }}
        aria-hidden="true"
      >
        <span className="font-display text-2xl font-bold tracking-tight text-ink">AM</span>
      </motion.div>
    </>
  )
}

export default function App() {
  const location = useLocation()
  const { pathname, hash } = location
  const { reduced } = useMotionPref()
  // Deep links (case studies, #sections) skip the intro.
  const [gate, setGate] = useState(() => !hash && shouldShowIntro(pathname))
  // No curtain until the first real page change (hash links within a page never trigger it).
  const [first, setFirst] = useState(true)
  // Without the curtain, jump to the top as soon as the page changes.
  useEffect(() => {
    if (reduced && !window.location.hash) window.scrollTo(0, 0)
  }, [pathname, reduced])

  // Smooth (inertia) scrolling, off when reduced motion is on.
  useEffect(() => {
    if (reduced) return
    document.documentElement.classList.add('smooth-scroll')
    const stop = startSmoothScroll()
    return () => {
      stop()
      document.documentElement.classList.remove('smooth-scroll')
    }
  }, [reduced])

  const routes = (
    <Routes location={location}>
      <Route path="/" element={<Home />} />
      <Route path="/work/:slug" element={<CaseStudy />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )

  return (
    <CommandPaletteProvider>
      <HashScroller />
      <PageBackground />
      <IntroGate
        open={gate}
        onEnter={() => {
          setGate(false)
          // Hand keyboard focus to the page once it mounts.
          requestAnimationFrame(() => document.getElementById('main')?.focus({ preventScroll: true }))
        }}
      />
      {/* The site mounts when the intro closes, so the hero's entrance plays on entry. */}
      {!gate && (
        <>
          <ScrollProgress />
          <Nav />
          <main id="main" tabIndex={-1} className="relative z-10 outline-none">
            <Suspense fallback={<div className="min-h-dvh" />}>
              {reduced ? (
                <div key={pathname}>{routes}</div>
              ) : (
                <AnimatePresence
                  mode="wait"
                  initial={false}
                  onExitComplete={() => {
                    // Swap scroll position while the curtain covers the screen.
                    if (!window.location.hash) scrollToTarget(0, { immediate: true })
                    setFirst(false)
                  }}
                >
                  <motion.div key={pathname}>
                    {!first && <Curtain />}
                    {routes}
                  </motion.div>
                </AnimatePresence>
              )}
            </Suspense>
          </main>
          <Footer />
        </>
      )}
      <div className="grain" aria-hidden="true" />
      <Cursor />
    </CommandPaletteProvider>
  )
}
