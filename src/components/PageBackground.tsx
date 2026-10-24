/**
 * Static page background, three quiet layers:
 * 1. a soft grey glow at the top that fades into white,
 * 2. a very faint line grid (stronger every 4 cells) that fades out towards the edges,
 * 3. paper-like grain (the `.grain` overlay rendered in App).
 * Pure CSS: nothing animates, so it costs nothing to render.
 */
export function PageBackground() {
  const grid = [
    'linear-gradient(to right, color-mix(in srgb, var(--color-cream) 6%, transparent) 1px, transparent 1px)',
    'linear-gradient(to bottom, color-mix(in srgb, var(--color-cream) 6%, transparent) 1px, transparent 1px)',
    'linear-gradient(to right, color-mix(in srgb, var(--color-cream) 3%, transparent) 1px, transparent 1px)',
    'linear-gradient(to bottom, color-mix(in srgb, var(--color-cream) 3%, transparent) 1px, transparent 1px)',
  ].join(',')
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      {/* soft glow from the top */}
      <div className="absolute inset-0 bg-[radial-gradient(80%_55%_at_50%_-5%,color-mix(in_srgb,var(--color-cream)_7.5%,transparent),color-mix(in_srgb,var(--color-cream)_2%,transparent)_45%,transparent_75%)]" />
      {/* faint grid, fading out from the top centre */}
      <div
        className="absolute inset-0 [mask-image:radial-gradient(90%_75%_at_50%_0%,black_25%,transparent_80%)]"
        style={{ backgroundImage: grid, backgroundSize: '112px 112px, 112px 112px, 28px 28px, 28px 28px', backgroundPosition: 'center top' }}
      />
    </div>
  )
}
