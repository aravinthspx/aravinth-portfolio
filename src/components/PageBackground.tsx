/**
 * Static page background, three quiet layers:
 * 1. a soft grey glow at the top that fades into white,
 * 2. a very faint line grid (stronger every 4 cells) that fades out towards the edges,
 * 3. paper-like grain (the `.grain` overlay rendered in App).
 * Pure CSS: nothing animates, so it costs nothing to render.
 */
export function PageBackground() {
  const grid = [
    'linear-gradient(to right, rgba(10,10,10,0.05) 1px, transparent 1px)',
    'linear-gradient(to bottom, rgba(10,10,10,0.05) 1px, transparent 1px)',
    'linear-gradient(to right, rgba(10,10,10,0.025) 1px, transparent 1px)',
    'linear-gradient(to bottom, rgba(10,10,10,0.025) 1px, transparent 1px)',
  ].join(',')
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      {/* soft glow from the top */}
      <div className="absolute inset-0 bg-[radial-gradient(80%_55%_at_50%_-5%,rgba(0,0,0,0.075),rgba(0,0,0,0.02)_45%,transparent_75%)]" />
      {/* faint grid, fading out from the top centre */}
      <div
        className="absolute inset-0 [mask-image:radial-gradient(90%_75%_at_50%_0%,black_25%,transparent_80%)]"
        style={{ backgroundImage: grid, backgroundSize: '112px 112px, 112px 112px, 28px 28px, 28px 28px', backgroundPosition: 'center top' }}
      />
    </div>
  )
}
