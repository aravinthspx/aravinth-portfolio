import { Link } from 'react-router-dom'
import { profile } from '../content/profile'

const year = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-line bg-ink/70 backdrop-blur">
      <div className="container-x flex flex-col gap-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} {profile.name}. Designed and built as a learning project.
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          <li><Link className="hover:text-cream" to={{ pathname: '/', hash: '#projects' }}>Projects</Link></li>
          <li><a className="hover:text-cream" href={`mailto:${profile.email}`}>Email</a></li>
          <li><a className="hover:text-cream" href={profile.links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>
          <li><a className="hover:text-cream" href={profile.links.github} target="_blank" rel="noreferrer">GitHub</a></li>
        </ul>
      </div>
    </footer>
  )
}
