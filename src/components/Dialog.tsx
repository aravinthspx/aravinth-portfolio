import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Accessible modal built on the native <dialog> element: showModal() makes the rest of the
 * page inert, Escape closes it, and focus returns to the element that opened it.
 */
export function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  const returnTo = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) {
      returnTo.current = document.activeElement as HTMLElement
      d.showModal()
      document.body.style.overflow = 'hidden'
      d.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    } else if (!open && d.open) {
      d.close()
    }
  }, [open])

  useEffect(() => {
    const d = ref.current
    if (!d) return
    const handleClose = () => {
      document.body.style.overflow = ''
      returnTo.current?.focus()
      onClose()
    }
    d.addEventListener('close', handleClose)
    return () => d.removeEventListener('close', handleClose)
  }, [onClose])

  return (
    <dialog
      ref={ref}
      aria-labelledby="dialog-title"
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="m-auto w-[min(64rem,calc(100vw-1.5rem))] max-h-[calc(100dvh-1.5rem)] overflow-hidden rounded-3xl border border-line bg-ink-2 p-0 text-cream backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
        <h2 id="dialog-title" className="font-display text-lg font-semibold">
          {title}
        </h2>
        <button
          type="button"
          data-autofocus
          onClick={() => ref.current?.close()}
          className="grid size-10 place-items-center rounded-full border border-line hover:border-accent-2 cursor-pointer"
          aria-label="Close preview"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
      <div data-lenis-prevent className="max-h-[calc(100dvh-7rem)] overflow-auto p-4 sm:p-6">{children}</div>
    </dialog>
  )
}
