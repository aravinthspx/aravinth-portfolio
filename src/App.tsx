import { Suspense, lazy, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { Starfield } from './components/Starfield'
import { IntroGate, shouldShowIntro } from './components/IntroGate'
import { CommandPaletteProvider } from './components/CommandPalette'
import { useMotionPref } from './lib/motion'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

const CaseStudy = lazy(() => import('./pages/CaseStudy'))
const BlogPost = lazy(() => import('./pages/BlogPost'))

const EASE = [0.76, 0, 0.24, 1] as const

/** Thin bar across the top that fills as you scroll, with a springy follow. */
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 260, damping: 26, mass: 0.4 })
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
      if (el) el.scrollIntoView()
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
  // The very first page load shows no curtain (the intro or the hero entrance covers it).
  const [first, setFirst] = useState(true)
  useEffect(() => {
    if (pathname !== '/' || hash) setFirst(false)
  }, [pathname, hash])
  // Without the curtain, jump to the top as soon as the page changes.
  useEffect(() => {
    if (reduced && !window.location.hash) window.scrollTo(0, 0)
  }, [pathname, reduced])

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
      <Starfield />
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
                    if (!window.location.hash) window.scrollTo(0, 0)
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
    </CommandPaletteProvider>
  )
}
