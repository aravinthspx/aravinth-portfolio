import { ButtonLink } from '../components/ui'

export default function NotFound() {
  return (
    <section className="container-x grid min-h-[80dvh] place-content-center pt-24 text-center">
      <p className="outline-text font-display text-[30vw] font-bold leading-none md:text-[14rem]" aria-hidden="true">404</p>
      <h1 className="font-display text-3xl font-bold">This page doesn’t exist.</h1>
      <p className="mt-3 text-cream-2">The link may be outdated. The work is still here.</p>
      <div className="mt-8 flex justify-center">
        <ButtonLink to="/">Back to home</ButtonLink>
      </div>
    </section>
  )
}
