// Personal details shown across the site. Edit here — components read from this file only.

export const profile = {
  name: 'Aravinth M',
  shortName: 'Aravinth',
  wordmark: 'ARAVINTH',
  // Professional headline shown in the hero and page title.
  title: 'AI/ML Engineering Student | Aspiring Machine Learning Engineer',
  // Short label for small badges (nav, chips).
  shortTitle: 'AI/ML Engineering Student',
  // Tagline used in the footer.
  tagline: 'Turning complex ideas into interactive digital experiences.',
  intro:
    'I am an AI/ML engineering student interested in building intelligent applications, solving real-world problems, and exploring the intersection of machine learning and full-stack development.',
  email: 'aravinthff2007@gmail.com',
  // All public profile links live here. Add other verified profiles (e.g. Kaggle) as new keys.
  links: {
    linkedin: 'https://www.linkedin.com/in/aravinth-m-07445a36a',
    github: 'https://github.com/aravinthspx',
  },
  // Optional — set to e.g. 'Chennai, India · IST (UTC+5:30)' to show in Contact. null hides it.
  location: null as string | null,
  // Source: Agri-Yield Pro project report title page. Set to null to hide.
  study: 'B.Tech Computer Science and Engineering (AI & Machine Learning), SRM Institute of Science and Technology, Ramapuram',
  // Portrait: background removed, shown in black and white. Set to null to hide.
  portrait: {
    src: '/images/aravinth-cutout-801.webp',
    srcSet: '/images/aravinth-cutout-480.webp 480w, /images/aravinth-cutout-801.webp 801w',
    width: 801,
    height: 1509,
    alt: 'Black and white portrait of Aravinth M, seated and looking to the side',
  } as { src: string; srcSet: string; width: number; height: number; alt: string } | null,
  // ▼ RESUME: put your PDF in /public (e.g. public/resume.pdf) and set '/resume.pdf' here.
  //   While null, the site hides the download buttons and shows an email fallback instead.
  resumeUrl: null as string | null,
}

/** About-section copy. Every field is editable; keep it to things you can stand behind. */
export const about = {
  intro:
    "I'm an AI/ML engineering student interested in machine learning, Python development, intelligent systems, and modern web applications. I enjoy exploring new technologies and building practical projects that connect software engineering with real-world challenges.",
  education: 'B.Tech CSE (AI & ML), SRM IST Ramapuram',
  enjoyBuilding: 'Practical tools where a model, an API and a clear interface work together — like crop planning and campus-space discovery.',
  cards: [
    {
      icon: 'focus' as const,
      title: 'Current Focus',
      body: 'Strengthening machine-learning foundations while building full-stack prototypes such as Agri-Yield Pro and SITTO.',
    },
    {
      icon: 'interests' as const,
      title: 'Technical Interests',
      body: 'Machine learning, Python development, intelligent systems and modern web applications.',
    },
    {
      icon: 'goals' as const,
      title: 'Learning Goals',
      body: 'Evaluating models on real, held-out data; deeper ML tooling; and production-ready backends with proper access control.',
    },
    {
      icon: 'direction' as const,
      title: 'Career Direction',
      body: 'Aspiring machine learning engineer — building intelligent applications that solve real-world problems.',
    },
  ],
}

/**
 * Contact form delivery. With `endpoint: null` the form validates input and opens the visitor's
 * email app with the message pre-filled (nothing is sent from the site itself).
 * To send directly, create a form at a service such as Formspree or Getform and paste its public
 * POST URL here — never put private API keys in frontend code.
 */
export const contactForm = {
  endpoint: null as string | null,
}

// Quick facts shown under the hero. Source: Agri-Yield Pro report title page and certificates.
export const facts = [
  { label: 'Institution', value: 'SRM IST Ramapuram' },
  { label: 'Programme', value: 'B.Tech CSE (AI & ML)' },
  { label: 'Recent work', value: 'Agri-Yield Pro · SITTO' },
  { label: 'Certificates', value: '4 completed' },
]

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
