import { AnimatePresence, motion } from 'motion/react'
import { themeLabel, useTheme, type Theme } from '../lib/theme'

function ThemeIcon({ theme }: { theme: Theme }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" {...p}>
      {theme === 'system' && <path d="M3 5h18v11H3zM8 20h8M12 16v4" />}
      {theme === 'light' && <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />}
      {theme === 'dark' && <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />}
    </svg>
  )
}

/**
 * Cycles System → Light → Dark. The icon spins between states; `withLabel` adds the
 * current mode as text (used in the phone menu).
 */
export function ThemeToggle({ withLabel = false, className = '' }: { withLabel?: boolean; className?: string }) {
  const { theme, cycle } = useTheme()
  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${themeLabel[theme]}. Click to change.`}
      title={`Theme: ${themeLabel[theme]}`}
      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-line text-cream-2 hover:text-cream cursor-pointer ${withLabel ? 'h-11 px-4 text-sm' : 'size-9'} ${className}`}
    >
      <span className="relative grid size-4 place-items-center overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={theme}
            className="grid place-items-center"
            initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <ThemeIcon theme={theme} />
          </motion.span>
        </AnimatePresence>
      </span>
      {withLabel && <span className="font-mono text-[11px] uppercase tracking-wider">Theme · {themeLabel[theme]}</span>}
    </button>
  )
}
