// Project and case-study content. Components render whatever is here.
//
// Status labels keep claims honest:
//   documented   – described as implemented in the project's own report/presentation
//   planned      – requested or proposed, not confirmed as built
//   illustrative – a mockup drawn for this portfolio, not a shipped screen
//   observed     – something seen while running or troubleshooting the project
//   hypothesis   – an unvalidated expectation
//
// Draft fields: any field set to null is hidden on the site. Fill it in once confirmed
// (e.g. your exact role, timeline or test results) and it will appear automatically.

export type Status = 'documented' | 'planned' | 'illustrative' | 'observed' | 'hypothesis'

export type Feature = { label: string; status: Status; note?: string }

export type Decision = { title: string; chosen: string; alternative: string; tradeoff: string }

export type Screen = {
  mockup: string // key into the mockup registry (src/components/mockups)
  title: string
  caption: string
  annotations: string[]
}

export type Project = {
  slug: string
  name: string
  caseTitle: string
  type: string
  summary: string
  accent: 'green' | 'amber'
  logo?: string
  journey: string[]
  stack: string[]
  stackNote: string
  overview: {
    audience: string
    problem: string
    team: string | null
    context: string | null
    role: string | null // DRAFT — not confirmed
    timeline: string | null // DRAFT — not confirmed
    constraints: string[]
  }
  problem: { need: string; difficulties: string[] }
  evidence: { items: { text: string; status: Status }[]; limitations: string[] }
  features: Feature[]
  decisions: Decision[]
  screens: Screen[]
  outcomes: { text: string; status: Status }[]
  testing: string | null // DRAFT — user-testing results, not confirmed
  reflection: { learned: string[]; next: string[] }
}

export const projects: Project[] = [
  {
    slug: 'agri-yield-pro',
    name: 'Agri-Yield Pro',
    caseTitle: 'Turning farm inputs into actionable crop plans',
    type: 'Agricultural decision-support prototype',
    summary:
      'A prototype connecting farm conditions, illustrative yield estimates, and crop lifecycle planning in one web application.',
    accent: 'green',
    journey: ['Choose crop', 'Enter conditions', 'Understand estimates', 'Create plan', 'Manage tasks'],
    stack: [
      'React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Recharts', 'Framer Motion', 'Python', 'FastAPI',
      'SQLite', 'SQLAlchemy', 'Leaflet', 'MapLibre GL', 'Three.js', 'React Three Fiber', 'Drei',
    ],
    stackNote: 'Technologies listed in the project report and frontend dependencies.',
    overview: {
      audience: 'Farmers and agricultural planners exploring crop options and organising seasonal work.',
      problem: 'Farm information is spread across separate tools, making it hard to connect yield estimates with day-to-day tasks.',
      team: 'Team of three',
      context: 'Course project — 21CSC203P Advanced Programming Practice, SRM IST Ramapuram',
      role: null,
      timeline: null,
      constraints: [
        'No verified agricultural dataset — models train on synthetic crop samples.',
        'No live weather feed — weather changes are simulated.',
        'Runs locally: FastAPI backend and Vite frontend side by side.',
      ],
    },
    problem: {
      need: 'Someone planning a crop wants to see how their soil, nutrients, land area and weather relate to a likely outcome — and then turn that into a sequence of tasks they can actually follow.',
      difficulties: [
        'Inputs such as soil pH and N-P-K levels mean little without a crop-specific reference range.',
        'An estimate on its own does not say what to do next.',
        'Plans change: weather shifts the timing of irrigation and other work.',
        'Estimates are easy to over-trust when the data behind them is synthetic.',
      ],
    },
    evidence: {
      items: [
        { status: 'documented', text: 'Report defines verification steps: frontend lint, build and preview; a /api/health check; and inspection of /docs request schemas.' },
        { status: 'documented', text: 'A weather smoke script (test_drought.py) creates a crop plan and submits heavy-rain and dry-weather scenarios, reporting request success or errors.' },
        { status: 'documented', text: 'Active crop plans and their version history live in server memory; SQLite stores users, saved predictions and chat logs.' },
      ],
      limitations: [
        'Models are trained on synthetic data; some benchmark scores shown in the app are predefined demonstration values.',
        'No measured field accuracy has been established.',
        'Weather updates are simulated; agricultural trends use generated demonstration data.',
        'The assistant uses keyword-based logic, not a large language model.',
        'Authentication and ownership checks are not consistently enforced — not production-ready.',
      ],
    },
    features: [
      { label: 'Farm dashboard', status: 'documented' },
      { label: 'Crop, land area, soil pH, nutrient and weather inputs', status: 'documented' },
      { label: 'Illustrative yield estimates', status: 'documented', note: 'Synthetic training data' },
      { label: 'Crop-specific input comparisons', status: 'documented' },
      { label: 'Crop selection and farm setup', status: 'documented' },
      { label: 'Growth stages and farming tasks', status: 'documented' },
      { label: 'Task completion, skipping and rescheduling', status: 'documented' },
      { label: 'Simulated weather updates', status: 'documented', note: 'Not a live feed' },
      { label: 'Agricultural assistant', status: 'documented', note: 'Keyword-based' },
      { label: 'State-wise agricultural exploration', status: 'documented', note: 'Generated data' },
      { label: '3D India map interaction', status: 'planned', note: 'Discussed improvement; not confirmed in the project files' },
    ],
    decisions: [
      {
        title: 'One connected workflow instead of separate tools',
        chosen: 'Dashboard, optimizer, planning, assistant and state explorer share one app and navigation.',
        alternative: 'A focused single-purpose yield calculator.',
        tradeoff: 'Users can move from estimate to plan without re-entering data, but the wider scope means more surfaces that rely on demonstration data and need clear labelling.',
      },
      {
        title: 'Compare inputs against crop reference ranges',
        chosen: 'Show where soil and nutrient values sit relative to crop-specific ranges, next to the estimate.',
        alternative: 'Show only a single predicted yield number.',
        tradeoff: 'Gives a reason and a next step rather than a bare number, but the ranges themselves still need local agronomic validation.',
      },
      {
        title: 'Predictable keyword assistant over an LLM',
        chosen: 'Intent detection through keywords and predefined responses, optionally using farm context.',
        alternative: 'A generative language model.',
        tradeoff: 'Responses are predictable and run locally without an API key, but coverage is limited to anticipated questions and language support is partial.',
      },
    ],
    screens: [
      { mockup: 'agri-dashboard', title: 'Farm dashboard', caption: 'Farm summary with estimate, soil score and suggested actions.', annotations: ['Estimate shown with its unit and a “demo data” badge', 'Soil score summarises inputs at a glance', 'Suggested actions link estimate to tasks'] },
      { mockup: 'agri-inputs', title: 'Farm inputs', caption: 'Crop, land area, soil pH, N-P-K and weather inputs.', annotations: ['Grouped by what the farmer knows', 'Units visible on every field'] },
      { mockup: 'agri-estimate', title: 'Estimate explanation', caption: 'Inputs compared with crop reference ranges.', annotations: ['Bars show where each input sits in the range', 'Out-of-range inputs highlighted first'] },
      { mockup: 'agri-timeline', title: 'Lifecycle timeline', caption: 'Growth stages with tasks to complete, skip or reschedule.', annotations: ['Current stage emphasised', 'Every task has three clear actions'] },
      { mockup: 'agri-weather', title: 'Simulated weather update', caption: 'A weather scenario revises upcoming activities.', annotations: ['Labelled as a simulation', 'Shows which tasks changed and why'] },
      { mockup: 'agri-map', title: 'State-wise explorer', caption: 'Explore crop indicators by state.', annotations: ['Generated demonstration data, labelled', 'Select a state to see its trend'] },
    ],
    outcomes: [
      { status: 'documented', text: 'A locally runnable prototype that connects inputs, estimates, crop plans, simulated weather and guidance in one application.' },
      { status: 'documented', text: 'Frontend build and preview procedures and a weather smoke script for checking plan updates.' },
      { status: 'hypothesis', text: 'Seeing inputs against reference ranges may make estimates easier to act on than a single number. Not yet tested with users.' },
    ],
    testing: null,
    reflection: {
      learned: [
        'Clearly separating demonstration data from verified data is part of the design, not an afterthought.',
        'Explaining an estimate is often more useful than the estimate itself.',
        'Where state lives (memory vs. database) directly shapes what users can trust.',
      ],
      next: [
        'Train and evaluate models with verified, held-out agricultural data and documented coverage.',
        'Integrate an authenticated weather feed and verified agricultural statistics.',
        'Persist crop plans, task history and notifications in the database.',
        'Enforce authentication and per-user access checks throughout.',
        'Add complete regional-language support.',
      ],
    },
  },
  {
    slug: 'sitto',
    name: 'SITTO',
    caseTitle: 'Helping students find campus spaces through interactive navigation',
    type: 'Campus-space discovery prototype',
    summary:
      'A campus platform exploring how students can find buildings, libraries, laboratories, and suitable spaces through filters and map navigation.',
    accent: 'amber',
    logo: '/images/sitto-logo.webp',
    journey: ['Explore campus', 'Select building', 'Inspect spaces', 'Check availability'],
    stack: ['React', 'Vite', 'Tailwind CSS', 'Python', 'Flask', 'Supabase', 'PostgreSQL'],
    stackNote: 'Stack described in the project presentation.',
    overview: {
      audience: 'Students looking for a library or lab seat, and administrators who manage those spaces.',
      problem: 'Students walk between buildings searching for a free seat, and administrators lack a central view of availability.',
      team: 'Team of four — “Day Dreamers”',
      context: null,
      role: null,
      timeline: null,
      constraints: [
        'Software-only: no cameras or occupancy sensors.',
        'Campus data (buildings, floors, spaces) must be imported and kept consistent.',
        'Map interactions must work on phones and with a keyboard.',
      ],
    },
    problem: {
      need: 'A student between classes wants to know which building has a free library or lab seat right now — without walking around to check.',
      difficulties: [
        'Campus spaces are nested: building → floor → library or lab → seat.',
        'Names on a map don’t always match how spaces are recorded (e.g. which building a library belongs to).',
        'Reservations can be held by students who never arrive.',
        'When data fails to load, an “empty” result looks the same as “nothing available”.',
      ],
    },
    evidence: {
      items: [
        { status: 'observed', text: 'During troubleshooting, the search showed an empty-results message when backend data was unavailable — making a failure look like “no spaces”.' },
        { status: 'observed', text: 'A campus import file contains building and floor records; counts in earlier notes did not match it, so no totals are shown here until verified.' },
        { status: 'documented', text: 'The presentation describes the flow: campus map → building → floor → library or lab → seat, with QR check-in and checkout.' },
      ],
      limitations: [
        'No user research or usability testing results are available.',
        'Implementation status of each interaction is not confirmed — features below are labelled accordingly.',
        'Seat values in visuals are sample data, not live availability.',
      ],
    },
    features: [
      { label: 'Buildings, floors and spaces data model', status: 'documented' },
      { label: 'Library and laboratory discovery', status: 'documented' },
      { label: 'Seat-availability information', status: 'documented', note: 'Available · Reserved · Occupied' },
      { label: 'Reservations with QR check-in and checkout', status: 'documented' },
      { label: 'SeatSure midpoint verification and admin dashboard', status: 'documented' },
      { label: 'React/Vite frontend, Flask backend, Supabase database', status: 'documented' },
      { label: 'Clickable building hotspots on the campus map', status: 'planned' },
      { label: 'Correct library-to-building mapping', status: 'planned' },
      { label: 'Navigation from hotspot to building details', status: 'planned' },
      { label: 'Map zoom and pan with accessible controls', status: 'planned' },
      { label: 'Clear loading, error and empty states', status: 'planned', note: 'Proposed improvement' },
    ],
    decisions: [
      {
        title: 'Software-only verification with QR codes',
        chosen: 'Students scan a QR code to check in and out; no sensors or cameras.',
        alternative: 'Occupancy sensors or camera-based detection.',
        tradeoff: 'Cheap to deploy across many rooms and privacy-friendly, but relies on students scanning and on follow-up checks for no-shows.',
      },
      {
        title: 'Ask before releasing a seat (SeatSure)',
        chosen: 'At the booking midpoint the student confirms they are still there; no response creates an admin verification task.',
        alternative: 'Release seats automatically on a timer.',
        tradeoff: 'Fairer to students who are present, at the cost of an extra prompt and admin review work.',
      },
      {
        title: 'Map first, filters second',
        chosen: 'Start from the campus map and drill into a building, keeping filters for narrowing down.',
        alternative: 'A flat searchable list of every space.',
        tradeoff: 'Matches how students think about walking to a place, but requires accurate building mapping and accessible controls for non-pointer users.',
      },
    ],
    screens: [
      { mockup: 'sitto-map', title: 'Campus map with hotspots', caption: 'Interactive concept: select a building hotspot, zoom and pan.', annotations: ['Hotspots are real buttons — Tab and Enter work', 'Zoom controls duplicate pinch and wheel gestures', 'Selected building opens its details'] },
      { mockup: 'sitto-building', title: 'Building details', caption: 'Floors and spaces inside the selected building.', annotations: ['Libraries and labs grouped by floor', 'Availability summary per space'] },
      { mockup: 'sitto-seats', title: 'Seat availability', caption: 'Seat map using sample values.', annotations: ['Colour plus text label — never colour alone', 'Sample values, not live data'] },
      { mockup: 'sitto-states', title: 'Loading, error and empty states', caption: 'Proposed improvement: distinguish “couldn’t load” from “nothing found”.', annotations: ['Error state offers retry', 'Empty state suggests widening filters'] },
    ],
    outcomes: [
      { status: 'documented', text: 'A defined student journey from campus map to seat, with reservation, QR check-in and SeatSure verification flows.' },
      { status: 'observed', text: 'Identified that missing backend data was presented as an empty search, prompting the proposed state-handling design.' },
      { status: 'hypothesis', text: 'Map-first navigation with clear hotspots may reduce time spent locating a suitable space. Not yet measured.' },
    ],
    testing: null,
    reflection: {
      learned: [
        'Data accuracy is a UX problem: a library mapped to the wrong building breaks trust immediately.',
        'Loading, error and empty states deserve the same design attention as the happy path.',
        'Map interactions need keyboard and touch equivalents from the start.',
      ],
      next: [
        'Implement and verify clickable hotspots with correct library-to-building mapping.',
        'Ship explicit loading, error and empty states.',
        'Verify building, floor and space counts against the live database.',
        'Run short usability sessions with students before adding more spaces.',
      ],
    },
  },
]

export const getProject = (slug: string | undefined) => projects.find((p) => p.slug === slug)

export const statusLabel: Record<Status, string> = {
  documented: 'Documented',
  planned: 'Planned',
  illustrative: 'Illustrative mockup',
  observed: 'Observed',
  hypothesis: 'Hypothesis',
}
