import type { ProjectLinks as Links } from '../content/projects'
import { ExternalIcon, GitHubIcon } from './ui'

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
    <path d="M8 5.5v13l11-6.5-11-6.5Z" />
  </svg>
)

/**
 * Project links from src/content/projects.ts. A link set to null renders as a muted
 * "Coming soon" chip instead of a button, so no placeholder URL is ever published.
 */
export function ProjectLinks({ links, name, compact = false }: { links: Links; name: string; compact?: boolean }) {
  const items = [
    { key: 'liveDemo' as const, label: links.liveDemoLabel ?? 'View site' },
    { key: 'github' as const, label: 'GitHub repository' },
    { key: 'video' as const, label: 'Demo video' },
  ]

  return (
    <ul className="flex flex-wrap gap-2" aria-label={`${name} links`}>
      {items.map(({ key, label }) => {
        const url = links[key]
        const icon = key === 'github' ? <GitHubIcon className="size-4" /> : key === 'video' ? <PlayIcon /> : <ExternalIcon className="size-4" />
        return (
          <li key={key}>
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 font-semibold text-accent transition-colors hover:border-accent hover:bg-accent/20 ${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}`}
              >
                {icon}
                {label}
                <span className="sr-only"> for {name} (opens in new tab)</span>
              </a>
            ) : (
              <span
                className={`inline-flex cursor-default items-center gap-2 rounded-full border border-dashed border-line text-muted ${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}`}
                title={`${label} coming soon`}
              >
                {icon}
                {label}
                <span className="rounded-full bg-ink-3 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider">Coming soon</span>
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
