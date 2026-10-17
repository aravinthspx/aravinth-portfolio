// Certificates and job simulations. Files live in /public/certificates (copied unaltered).
// To add a missing asset, place it in public/certificates and set `file` (and optionally `thumb`).

export type Certificate = {
  id: string
  title: string
  kind: 'Course certificate' | 'Job simulation'
  provider: string
  issuer?: string
  completed: string // ISO date
  topics?: string[]
  file?: string
  fileType?: 'image' | 'pdf'
  thumb?: string
  verifyUrl?: string
}

export const certificates: Certificate[] = [
  {
    id: 'ai-prompting',
    title: 'AI Prompting for Everyone',
    kind: 'Course certificate',
    provider: 'DeepLearning.AI',
    completed: '2026-10-06',
    file: '/certificates/ai-prompting-for-everyone.png',
    fileType: 'image',
    thumb: '/certificates/thumb-deeplearningai.webp',
    verifyUrl: 'https://www.deeplearning.ai/certificates/88942d42-ec0e-4585-bee6-c352172334fd',
  },
  {
    id: 'datacom',
    title: 'Partnering with AI in the Workplace',
    kind: 'Job simulation',
    provider: 'Datacom',
    issuer: 'Forage',
    completed: '2026-08-10',
    topics: ['Effective prompting', 'AI-assisted research and design', 'AI-powered debugging'],
    file: '/certificates/datacom-job-simulation.pdf',
    fileType: 'pdf',
    thumb: '/certificates/thumb-datacom.webp',
  },
  {
    id: 'deloitte',
    title: 'Data Analytics',
    kind: 'Job simulation',
    provider: 'Deloitte',
    issuer: 'Forage',
    completed: '2026-08-10',
    topics: ['Data analysis', 'Forensic technology'],
    file: '/certificates/deloitte-data-analytics-job-simulation.pdf',
    fileType: 'pdf',
    thumb: '/certificates/thumb-deloitte.webp',
  },
  {
    id: 'genai',
    title: 'GenAI',
    kind: 'Job simulation',
    // Company confirmed from the logo on the certificate.
    provider: 'BCG X',
    issuer: 'Forage',
    completed: '2026-08-10',
    topics: ['Data extraction and initial analysis', 'AI-powered financial chatbot development'],
    file: '/certificates/bcgx-genai-job-simulation.pdf',
    fileType: 'pdf',
    thumb: '/certificates/thumb-bcgx.webp',
  },
]

export function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}
