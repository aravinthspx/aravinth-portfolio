// Skills grouped by category. Only tools confirmed by a project, certificate or this site are listed.
// `evidence` says where each one was used — add, edit or remove entries freely. No percentages by design.

export type Skill = { name: string; evidence: string }
export type SkillGroup = { id: string; title: string; icon: 'code' | 'brain' | 'web' | 'server' | 'tools'; skills: Skill[] }

export const skillGroups: SkillGroup[] = [
  {
    id: 'programming',
    title: 'Programming',
    icon: 'code',
    skills: [
      { name: 'Python', evidence: 'Agri-Yield Pro backend and models; SITTO Flask API' },
      { name: 'TypeScript', evidence: 'Agri-Yield Pro frontend; this portfolio' },
      { name: 'JavaScript', evidence: 'React projects' },
      // Add confirmed languages here, e.g. { name: 'Java', evidence: 'Course project …' }
    ],
  },
  {
    id: 'ai-ml',
    title: 'AI / Machine Learning',
    icon: 'brain',
    skills: [
      { name: 'Machine Learning', evidence: 'Custom decision-tree & random-forest regressors (Agri-Yield Pro)' },
      { name: 'Data Analysis', evidence: 'Deloitte Data Analytics job simulation' },
      { name: 'Prompt Engineering', evidence: 'DeepLearning.AI course; Datacom job simulation' },
      { name: 'GenAI chatbots', evidence: 'BCG X GenAI job simulation' },
      // Add libraries once used in a project, e.g. NumPy, Pandas, scikit-learn
    ],
  },
  {
    id: 'web',
    title: 'Web Development',
    icon: 'web',
    skills: [
      { name: 'React', evidence: 'Agri-Yield Pro, SITTO, this portfolio' },
      { name: 'HTML & CSS', evidence: 'All web projects' },
      { name: 'Tailwind CSS', evidence: 'Agri-Yield Pro, SITTO, this portfolio' },
      { name: 'Vite', evidence: 'Agri-Yield Pro, SITTO, this portfolio' },
      { name: 'Three.js / React Three Fiber', evidence: 'Agri-Yield Pro, this portfolio' },
      { name: 'Recharts', evidence: 'Agri-Yield Pro dashboards' },
    ],
  },
  {
    id: 'backend',
    title: 'Backend & Databases',
    icon: 'server',
    skills: [
      { name: 'FastAPI', evidence: 'Agri-Yield Pro API' },
      { name: 'Flask', evidence: 'SITTO REST API' },
      { name: 'SQLite & SQLAlchemy', evidence: 'Agri-Yield Pro storage' },
      { name: 'Supabase / PostgreSQL', evidence: 'SITTO database and auth' },
      { name: 'JWT auth', evidence: 'Agri-Yield Pro accounts (bcrypt + PyJWT)' },
    ],
  },
  {
    id: 'tools',
    title: 'Tools',
    icon: 'tools',
    skills: [
      { name: 'Git & GitHub', evidence: 'Version control for projects' },
      { name: 'VS Code', evidence: 'Everyday editor' },
      { name: 'Claude Code', evidence: 'Used to build this portfolio' },
      { name: 'Google Antigravity', evidence: 'AI-assisted development' },
      { name: 'pytest', evidence: 'Agri-Yield Pro backend checks' },
    ],
  },
]
