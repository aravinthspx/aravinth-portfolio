// Personal details shown across the site. Edit here — components read from this file only.

export const profile = {
  name: 'Aravinth M',
  shortName: 'Aravinth',
  wordmark: 'ARAVINTH',
  title: 'AI/ML Student & Product Builder',
  headline: 'Turning complex ideas into interactive digital experiences.',
  intro:
    'I’m Aravinth, an AI/ML student exploring product design and full-stack development through projects in agriculture and campus navigation.',
  email: 'aravinthff2007@gmail.com',
  links: {
    linkedin: 'https://www.linkedin.com/in/aravinth-m-07445a36a',
    github: 'https://github.com/aravinthspx',
  },
  // Source: Agri-Yield Pro project report title page. Set to null to hide.
  study: 'B.Tech Computer Science and Engineering (AI & Machine Learning), SRM Institute of Science and Technology, Ramapuram',
  // Add a real file to /public (e.g. /resume.pdf) and set the path here to show a Resume link.
  resumeUrl: null as string | null,
}

export const interests = [
  {
    title: 'AI / ML',
    body: 'Learning how models are trained, evaluated and explained — and being honest about what synthetic or demonstration data can and cannot show.',
  },
  {
    title: 'Product design',
    body: 'Starting from the task a person is trying to finish, then shaping flows, states and feedback so the interface stays understandable.',
  },
  {
    title: 'Full-stack development',
    body: 'Connecting React interfaces to Python APIs and databases so ideas become prototypes that can actually be clicked through.',
  },
]

// Tools that appear in the documented project stacks (not a claim of expertise).
export const toolbox = ['React', 'TypeScript', 'Python', 'FastAPI', 'Flask', 'Tailwind CSS', 'SQLite', 'Supabase', 'Three.js', 'Vite']
