import { experience, achievements, education, blogPosts } from '../content/records'
import { certificates } from '../content/certificates'
import { projects } from '../content/projects'

// Single source of truth for the home-page sections used by the navigation, footer and scroll-spy.
// Sections whose data is empty are hidden everywhere, except Hackathons, which shows an empty state.
export type SectionId =
  | 'home'
  | 'about'
  | 'skills'
  | 'projects'
  | 'hackathons'
  | 'certificates'
  | 'experience'
  | 'achievements'
  | 'education'
  | 'blog'
  | 'contact'

const all: { id: SectionId; label: string; visible: boolean }[] = [
  { id: 'home', label: 'Home', visible: true },
  { id: 'about', label: 'About', visible: true },
  { id: 'skills', label: 'Skills', visible: true },
  { id: 'projects', label: 'Projects', visible: projects.length > 0 },
  { id: 'hackathons', label: 'Hackathons', visible: true },
  { id: 'certificates', label: 'Certificates', visible: certificates.length > 0 },
  { id: 'experience', label: 'Experience', visible: experience.length > 0 },
  { id: 'achievements', label: 'Achievements', visible: achievements.length > 0 },
  { id: 'education', label: 'Education', visible: education.length > 0 },
  { id: 'blog', label: 'Blog', visible: blogPosts.length > 0 },
  { id: 'contact', label: 'Contact', visible: true },
]

export const navSections = all.filter((s) => s.visible)
export const isVisible = (id: SectionId) => all.some((s) => s.id === id && s.visible)
