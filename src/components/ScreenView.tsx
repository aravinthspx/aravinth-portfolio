import { useCallback, useState } from 'react'
import type { Screen } from '../content/projects'
import { mockups } from './mockups'
import { Dialog } from './Dialog'

/** Renders a real app screenshot (click to enlarge) or, when none exists, the illustrative mockup. */
export function ScreenView({ screen, priority = false }: { screen: Screen; priority?: boolean }) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const img = screen.image
  // Tall (phone/panel) screenshots stay at a readable size instead of stretching to the card width
  const tall = !!img && img.height > img.width

  if (!img) {
    const M = screen.mockup ? mockups[screen.mockup] : null
    return M ? <M /> : null
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block w-full overflow-hidden rounded-2xl border border-line bg-ink-2 shadow-2xl shadow-black/50 cursor-zoom-in"
        aria-label={`Enlarge screenshot: ${screen.title}`}
      >
        <img
          src={img.small}
          srcSet={`${img.small} 800w, ${img.src} ${img.width}w`}
          sizes="(min-width: 1024px) 760px, 100vw"
          width={img.width}
          height={img.height}
          alt={img.alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={`block transition-transform duration-500 group-hover:scale-[1.015] ${tall ? 'mx-auto h-auto max-h-[32rem] w-auto max-w-full' : 'h-auto w-full'}`}
        />
        <span className="pointer-events-none absolute right-3 top-3 rounded-full border border-line bg-ink/85 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-cream-2 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          Click to enlarge
        </span>
      </button>
      <Dialog open={open} onClose={close} title={screen.title}>
        {open && <img src={img.src} width={img.width} height={img.height} alt={img.alt} className={`mx-auto h-auto rounded-xl ${tall ? 'w-auto max-w-full' : 'w-full'}`} />}
        {screen.note && <p className="mt-4 text-sm text-warn">{screen.note}</p>}
      </Dialog>
    </>
  )
}
