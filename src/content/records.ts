// Structured records for Hackathons, Experience, Achievements, Education and Blog.
// To add an entry, copy the commented template inside the array, fill it in, and uncomment it.
// Empty arrays are handled on the site: Hackathons shows a tasteful empty state; Experience,
// Achievements and Blog stay hidden (and out of the navigation) until they have entries.
// Never add anything that didn't happen — every field is shown to visitors.

export type Link = { label: string; url: string }

/* ------------------------------ Hackathons ------------------------------ */
export type Hackathon = {
  id: string
  name: string
  organizer: string
  date: string // e.g. 'Mar 2026' or '2026'
  format: string // e.g. 'Online' or 'Chennai, India'
  team?: string
  teamSize?: number
  role?: string
  problem: string
  solution: string
  technologies: string[]
  result?: string // only real results, e.g. 'Finalist' — omit if none
  image?: string // e.g. '/images/hackathons/my-project.webp'
  proof?: string // certificate image/PDF path or URL
  links?: Link[] // repository, demo, devpost…
}

export const hackathons: Hackathon[] = [
  // {
  //   id: 'example-2026',
  //   name: 'Hackathon name',
  //   organizer: 'Organizer',
  //   date: '2026',
  //   format: 'Online',
  //   team: 'Team name',
  //   teamSize: 4,
  //   role: 'What you did',
  //   problem: 'Problem statement in one or two sentences.',
  //   solution: 'What the team built.',
  //   technologies: ['React', 'Python'],
  //   links: [{ label: 'Repository', url: 'https://github.com/…' }],
  // },
]

/* ------------------------------ Experience ------------------------------ */
export type Experience = {
  id: string
  organization: string
  role: string
  kind: 'Internship' | 'Work' | 'Research' | 'Volunteering' | 'Leadership'
  start: string
  end: string // or 'Present'
  responsibilities: string[]
  technologies?: string[]
  links?: Link[]
}

export const experience: Experience[] = [
  // { id: 'org-2026', organization: '…', role: '…', kind: 'Internship', start: 'Jun 2026', end: 'Aug 2026', responsibilities: ['…'] },
]

/* ----------------------------- Achievements ----------------------------- */
export type Achievement = {
  id: string
  title: string
  event: string
  date: string
  description: string
  image?: string
  link?: Link
}

export const achievements: Achievement[] = [
  // { id: '…', title: '…', event: '…', date: '2026', description: '…' },
]

/* ------------------------------ Education ------------------------------- */
export type Education = {
  institution: string
  degree: string
  department: string
  startYear: string | null // set when confirmed, e.g. '2025'
  graduationYear: string | null // expected graduation, e.g. '2029'
  coursework: string[]
  projects: { name: string; href?: string; note?: string }[]
  achievements: string[]
}

// Source: Agri-Yield Pro project report (title page and course code). Years left blank until confirmed.
export const education: Education[] = [
  {
    institution: 'SRM Institute of Science and Technology, Ramapuram, Chennai',
    degree: 'Bachelor of Technology (B.Tech)',
    department: 'Computer Science and Engineering — Artificial Intelligence & Machine Learning',
    startYear: null,
    graduationYear: null,
    coursework: ['21CSC203P — Advanced Programming Practice'],
    projects: [
      { name: 'Agri-Yield Pro', href: '/work/agri-yield-pro', note: 'Advanced Programming Practice course project · team of three' },
      { name: 'SITTO', href: '/work/sitto', note: 'Team project · team of four' },
    ],
    achievements: [],
  },
]

/* --------------------------------- Blog --------------------------------- */
export type BlogPost = {
  slug: string // used in the URL: /blog/<slug>
  title: string
  date: string // ISO, e.g. '2026-11-02'
  summary: string
  category: 'Machine Learning' | 'Project Development' | 'Tutorial' | 'Hackathon' | 'AI Experiment' | 'Learning'
  cover?: string
  readingMinutes: number
  content: string[] // one paragraph per entry; lines starting with '## ' become headings
  relatedProject?: string // project slug
}

export const blogPosts: BlogPost[] = [
  // {
  //   slug: 'what-synthetic-data-taught-me',
  //   title: 'What synthetic data taught me about honest ML demos',
  //   date: '2026-11-01',
  //   summary: '…',
  //   category: 'Machine Learning',
  //   readingMinutes: 5,
  //   content: ['## Why it matters', 'Paragraph…'],
  //   relatedProject: 'agri-yield-pro',
  // },
]
