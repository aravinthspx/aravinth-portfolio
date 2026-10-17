import { Suspense, lazy, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { AmbientBackground } from './components/AmbientBackground'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

const CaseStudy = lazy(() => import('./pages/CaseStudy'))

/** Scroll to top on route change, or to the #section when a hash is present. */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      // Wait a frame so the target section exists after navigation.
      const id = requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView())
      return () => cancelAnimationFrame(id)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <AmbientBackground />
      <Nav />
      <main id="main" tabIndex={-1} className="relative z-10 outline-none">
        <Suspense fallback={<div className="min-h-dvh" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/work/:slug" element={<CaseStudy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <div className="grain" aria-hidden="true" />
    </>
  )
}
