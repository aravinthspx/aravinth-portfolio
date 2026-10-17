import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { profile } from '../../content/profile'
import { ExternalIcon } from '../ui'
import { spring } from '../../lib/motion'

type Repo = { id: number; name: string; description: string | null; html_url: string; language: string | null; stargazers_count: number; updated_at: string; fork: boolean }
type State = { kind: 'loading' } | { kind: 'error' } | { kind: 'ready'; repos: Repo[] }

// Username comes from the GitHub link in profile.ts — nothing else to configure.
const username = profile.links.github?.replace(/\/+$/, '').split('/').pop() ?? null
const CACHE_KEY = `gh-repos:${username}`
const CACHE_MS = 30 * 60 * 1000

function readCache(): Repo[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { at, repos } = JSON.parse(raw) as { at: number; repos: Repo[] }
    return Date.now() - at < CACHE_MS ? repos : null
  } catch {
    return null
  }
}

function useRepos(): State {
  const [state, setState] = useState<State>(() => {
    const cached = readCache()
    return cached ? { kind: 'ready', repos: cached } : { kind: 'loading' }
  })
  useEffect(() => {
    if (!username || state.kind === 'ready') return
    const ctrl = new AbortController()
    // Public, unauthenticated endpoint — no token is (or should be) used in frontend code.
    fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=12`, { signal: ctrl.signal, headers: { Accept: 'application/vnd.github+json' } })
      .then((r) => (r.ok ? (r.json() as Promise<Repo[]>) : Promise.reject(new Error(String(r.status)))))
      .then((all) => {
        const repos = all.filter((r) => !r.fork).slice(0, 6)
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), repos }))
        } catch {
          /* storage unavailable — fine */
        }
        setState({ kind: 'ready', repos })
      })
      .catch((e: unknown) => {
        if ((e as Error).name !== 'AbortError') setState({ kind: 'error' })
      })
    return () => ctrl.abort()
  }, [state.kind])
  return state
}

const GitHubMark = ({ className = 'size-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5a3.9 3.9 0 0 1 1-2.7c-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.8V21c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" />
  </svg>
)

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })

/** Live list of public GitHub repositories, fetched in the browser. Honest empty and error states. */
export function ReposStrip() {
  const state = useRepos()
  if (!username) return null
  const profileUrl = profile.links.github

  return (
    <div className="mt-16">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-leaf opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-leaf" />
            </span>
            Live from GitHub
          </p>
          <h3 className="mt-1 font-display text-xl font-bold text-cream">Latest public repositories</h3>
        </div>
        <a href={profileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold text-cream-2 transition-colors hover:border-accent/50 hover:text-cream">
          <GitHubMark className="size-4" /> @{username} <ExternalIcon className="size-3.5" />
        </a>
      </div>

      <div aria-live="polite" aria-busy={state.kind === 'loading'}>
        {state.kind === 'loading' && (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading repositories">
            {[0, 1, 2].map((i) => (
              <li key={i} className="panel h-32 animate-pulse rounded-2xl motion-reduce:animate-none" />
            ))}
          </ul>
        )}

        {state.kind === 'error' && (
          <p className="panel rounded-2xl px-5 py-4 text-sm text-cream-2">
            Couldn’t reach GitHub right now (it may be rate-limiting).{' '}
            <a href={profileUrl} target="_blank" rel="noreferrer" className="text-accent underline underline-offset-4">View the profile directly</a>.
          </p>
        )}

        {state.kind === 'ready' && state.repos.length === 0 && (
          <div className="panel flex flex-col items-center gap-3 rounded-2xl px-6 py-8 text-center sm:flex-row sm:text-left">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-accent"><GitHubMark /></span>
            <p className="flex-1 text-sm leading-relaxed text-cream-2">
              No public repositories yet — project code is currently private to each team. Repos will appear here automatically once they’re published.
            </p>
            <a href={profileUrl} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink hover:bg-accent-2">
              Follow on GitHub <ExternalIcon className="size-3.5" />
            </a>
          </div>
        )}

        {state.kind === 'ready' && state.repos.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {state.repos.map((r) => (
              <li key={r.id}>
                <motion.a
                  href={r.html_url}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ y: -4 }}
                  transition={spring}
                  className="panel flex h-full flex-col rounded-2xl p-5 transition-colors hover:border-accent/40"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-mono text-sm font-semibold text-cream">{r.name}</span>
                    <ExternalIcon className="size-3.5 shrink-0 text-muted" />
                  </span>
                  <span className="mt-2 line-clamp-2 text-xs leading-relaxed text-cream-2">{r.description ?? 'No description provided.'}</span>
                  <span className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4 font-mono text-[11px] text-muted">
                    {r.language && <span className="text-accent">● {r.language}</span>}
                    <span>★ {r.stargazers_count}</span>
                    <span>Updated {fmt(r.updated_at)}</span>
                  </span>
                </motion.a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
