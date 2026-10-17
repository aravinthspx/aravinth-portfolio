// "Current focus" cards and the learning-journey timeline. Everything here is drawn from
// documented projects and certificates — no skill percentages or invented milestones.

export type Tone = 'cyan' | 'leaf' | 'amber' | 'slate'

export type FocusArea = {
  id: string
  title: string
  kicker: string
  status: 'Exploring' | 'Practising' | 'Building' | 'Applying'
  tone: Tone
  icon: 'spark' | 'layers' | 'stack' | 'chat'
  summary: string
  details: string[]
  connected: string[]
}

export const focusAreas: FocusArea[] = [
  {
    id: 'ai-ml',
    title: 'AI & Machine Learning',
    kicker: 'Models, data & evaluation',
    status: 'Exploring',
    tone: 'cyan',
    icon: 'spark',
    summary: 'Learning how models are trained and evaluated — and how to be clear about what demonstration data can and cannot show.',
    details: [
      'Agri-Yield Pro uses custom decision-tree and random-forest regressors trained on synthetic crop samples.',
      'Its report separates demonstration benchmark values from measured accuracy — none is claimed.',
      'Next: evaluating models on verified, held-out data.',
    ],
    connected: ['Agri-Yield Pro', 'GenAI Job Simulation (BCG X)'],
  },
  {
    id: 'product',
    title: 'Product & Interaction Design',
    kicker: 'Flows, states & feedback',
    status: 'Practising',
    tone: 'leaf',
    icon: 'layers',
    summary: 'Starting from the task a person is trying to finish, then shaping flows, states and feedback so the interface stays understandable.',
    details: [
      'SITTO: designing map-first discovery with keyboard-accessible hotspots (planned).',
      'Proposed clearer loading, error and empty states after an empty-search issue was observed.',
      'Labelling illustrative mockups and demo data so nothing is over-claimed.',
    ],
    connected: ['SITTO', 'Agri-Yield Pro'],
  },
  {
    id: 'fullstack',
    title: 'Full-Stack Development',
    kicker: 'Interfaces to APIs & data',
    status: 'Building',
    tone: 'amber',
    icon: 'stack',
    summary: 'Connecting React interfaces to Python APIs and databases so ideas become prototypes that can be clicked through.',
    details: [
      'React, TypeScript, Vite and Tailwind CSS on the frontend.',
      'FastAPI with SQLite/SQLAlchemy (Agri-Yield Pro) and Flask with Supabase (SITTO) on the backend.',
      'Three.js / React Three Fiber for interactive visuals — including this site.',
    ],
    connected: ['Agri-Yield Pro', 'SITTO', 'This portfolio'],
  },
  {
    id: 'ai-assisted',
    title: 'AI-Assisted Work',
    kicker: 'Prompting, research & debugging',
    status: 'Applying',
    tone: 'slate',
    icon: 'chat',
    summary: 'Using AI tools deliberately: clear prompts, AI-assisted research and design, and checking the output rather than trusting it blindly.',
    details: [
      'AI Prompting for Everyone — DeepLearning.AI course certificate.',
      'Datacom job simulation: effective prompting, AI-assisted research and design, AI-powered debugging.',
      'Deloitte job simulation: data analysis and forensic technology tasks.',
    ],
    connected: ['DeepLearning.AI', 'Datacom', 'Deloitte'],
  },
]

export type Milestone = {
  when: string // shown as-is; undated items say so rather than guessing
  title: string
  body: string
  kind: 'Project' | 'Certificate' | 'Job simulation' | 'Hackathon' | 'Now'
  href?: string
}

export const journey: Milestone[] = [
  {
    when: 'Course project · date not listed',
    title: 'Agri-Yield Pro',
    body: 'Team of three. Connected farm inputs, illustrative yield estimates and crop-lifecycle planning in one web app.',
    kind: 'Project',
    href: '/work/agri-yield-pro',
  },
  {
    when: 'Team project · date not listed',
    title: 'SITTO',
    body: 'Team of four. Campus seat discovery and reservations, from campus map to QR check-in.',
    kind: 'Project',
    href: '/work/sitto',
  },
  {
    when: '10 Aug 2026',
    title: 'Three Forage job simulations',
    body: 'Datacom (partnering with AI), Deloitte (data analytics) and BCG X (GenAI) — practical task-based programmes.',
    kind: 'Job simulation',
  },
  {
    when: '6 Oct 2026',
    title: 'AI Prompting for Everyone',
    body: 'Course certificate from DeepLearning.AI.',
    kind: 'Certificate',
  },
  {
    when: '9–10 Oct 2026',
    title: 'Tech Horizon 2.0 hackathon',
    body: 'Took part in a national-level 24-hour offline hackathon run by the IEEE SMC Society at GNITC, Hyderabad.',
    kind: 'Hackathon',
    href: '/#hackathons',
  },
  {
    when: 'Oct 2026 · now',
    title: 'Designing this portfolio',
    body: 'Turning the two projects into honest case studies, with interactive 3D and motion that respects reduced-motion settings.',
    kind: 'Now',
  },
]
