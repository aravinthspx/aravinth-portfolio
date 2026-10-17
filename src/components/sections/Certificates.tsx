import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { certificates } from '../../content/certificates'
import { Heading, EmptyState } from '../Heading'
import { CertificateCard } from '../CertificateCard'
import { spring } from '../../lib/motion'

export function CertificatesSection() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const categories = useMemo(() => ['All', ...Array.from(new Set(certificates.map((c) => c.category)))], [])

  const q = query.trim().toLowerCase()
  const shown = certificates.filter((c) => {
    if (category !== 'All' && c.category !== category) return false
    if (!q) return true
    return [c.title, c.provider, c.issuer, c.description, c.kind, ...c.skills].filter(Boolean).join(' ').toLowerCase().includes(q)
  })

  return (
    <section id="certificates" aria-labelledby="certificates-title" className="relative py-24 md:py-32">
      <div className="container-x">
        <Heading pill="Certifications & applied learning" title="Certificates" id="certificates-title">
          Short courses and job simulations, each with the original certificate. Job simulations are practical task-based programmes — not employment or internships.
        </Heading>

        {certificates.length === 0 ? (
          <EmptyState icon={<span aria-hidden="true">★</span>} title="Certificates coming soon" body="Completed courses and programmes will be listed here with their original certificates." />
        ) : (
          <>
            <div className="mb-10 flex flex-col items-center gap-4 md:flex-row md:justify-between">
              <div role="group" aria-label="Filter certificates by category" className="flex flex-wrap justify-center gap-2">
                {categories.map((c) => {
                  const on = c === category
                  return (
                    <motion.button
                      key={c}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setCategory(c)}
                      whileTap={{ scale: 0.95 }}
                      transition={spring}
                      className={`relative rounded-full border px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${on ? 'border-accent/60 text-ink' : 'border-line text-cream-2 hover:text-cream'}`}
                    >
                      {on && <motion.span layoutId="cert-filter" className="absolute inset-0 rounded-full bg-accent" transition={spring} aria-hidden="true" />}
                      <span className="relative">{c}</span>
                    </motion.button>
                  )
                })}
              </div>
              <label className="relative w-full max-w-xs">
                <span className="sr-only">Search certificates</span>
                <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search title, issuer or skill"
                  className="w-full rounded-full border border-line bg-ink-2/80 py-2.5 pl-10 pr-4 text-sm text-cream placeholder:text-muted focus:border-accent/60 focus:outline-none"
                />
              </label>
            </div>

            <p className="sr-only" aria-live="polite">
              {shown.length} certificate{shown.length === 1 ? '' : 's'} shown
            </p>
            {shown.length ? (
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {shown.map((c) => (
                  <motion.li key={c.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <CertificateCard cert={c} />
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="panel mx-auto max-w-md rounded-2xl p-8 text-center">
                <p className="font-display text-lg font-bold text-cream">No certificates match “{query}”.</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setCategory('All')
                  }}
                  className="mt-4 rounded-full border border-line px-4 py-2 text-sm text-cream-2 hover:border-accent/50 hover:text-cream cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
