// Project and case-study content. Components render whatever is here.
//
// Status labels keep claims honest:
//   implemented  – visible working in screenshots of the running application
//   documented   – described as implemented in the project's own report/presentation
//   planned      – requested or proposed, not confirmed as built
//   development  – being worked on / concept stage, not in the current build
//   screenshot   – a real screenshot of the running application
//   illustrative – a mockup drawn for this portfolio, not a shipped screen
//   observed     – something seen while running or troubleshooting the project
//   hypothesis   – an unvalidated expectation
//
// Draft fields: any field set to null is hidden on the site. Fill it in once confirmed
// (e.g. your exact role, timeline or test results) and it will appear automatically.

export type Status = 'implemented' | 'documented' | 'planned' | 'development' | 'illustrative' | 'screenshot' | 'observed' | 'hypothesis'

export type Feature = { label: string; status: Status; note?: string }

export type Decision = { title: string; chosen: string; alternative: string; tradeoff: string }

export type Screen = {
  mockup?: string // key into the mockup registry (src/components/mockups) — used when there is no screenshot
  image?: { src: string; small: string; width: number; height: number; alt: string } // real app screenshot
  title: string
  caption: string
  annotations: string[]
  note?: string // data caveat shown under the screen
}

// Leave a link as null to show "Coming soon" instead of a button. Paste the real URL to enable it.
export type ProjectLinks = { liveDemo: string | null; github: string | null; video: string | null }

export type ArchitectureLayer = { layer: string; detail: string; items: string[] }

export type Project = {
  slug: string
  name: string
  fullName?: string
  categories?: string[]
  featured?: boolean
  filters: ('AI/ML' | 'Web Development' | 'Full Stack')[] // used by the Projects filter chips
  links: ProjectLinks
  architecture?: ArchitectureLayer[]
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
    fullName: 'AI-Powered Crop Yield Prediction & Optimization System',
    featured: true,
    filters: ['AI/ML', 'Full Stack', 'Web Development'],
    categories: ['Artificial Intelligence', 'Machine Learning', 'Full-Stack Development', 'Smart Agriculture'],
    // ▼ Paste your real URLs here (keep null to show "Coming soon")
    links: { liveDemo: null, github: null, video: null },
    caseTitle: 'Turning farm inputs into actionable crop plans',
    type: 'Agricultural decision-support prototype',
    summary:
      'A prototype connecting farm conditions, illustrative yield estimates, and crop lifecycle planning in one web application.',
    accent: 'green',
    journey: ['Choose crop', 'Enter conditions', 'Understand estimates', 'Create plan', 'Manage tasks'],
    stack: [
      'React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Recharts', 'Framer Motion', 'Lucide React', 'Python', 'FastAPI', 'Uvicorn',
      'Pydantic', 'SQLite', 'SQLAlchemy', 'bcrypt', 'PyJWT', 'pytest', 'Leaflet', 'MapLibre GL', 'Three.js', 'React Three Fiber', 'Drei',
    ],
    stackNote: 'Technologies listed in the project report (implementation chapter, frontend modules and dependencies).',
    architecture: [
      { layer: 'Frontend', detail: 'React + TypeScript · Vite · Tailwind CSS · Recharts', items: ['Farm dashboard', 'AI yield optimizer', 'Crop planning', 'Agricultural assistant', 'India Agriculture explorer'] },
      { layer: 'API layer', detail: 'FastAPI on Uvicorn', items: ['HTTP endpoints', 'Pydantic request/response schemas', 'Accounts: bcrypt password hashing + JWT'] },
      { layer: 'Processing', detail: 'Python services', items: ['Decision-tree & random-forest regressors (synthetic samples)', 'Crop reference-range comparisons', 'Simulated weather scenarios', 'Keyword-based assistant logic'] },
      { layer: 'Storage', detail: 'SQLite via SQLAlchemy + server memory', items: ['Users, saved predictions, chat logs (SQLite)', 'Active crop plans & version history (in memory — lost on restart)'] },
    ],
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
      { label: 'AI crop yield prediction', status: 'documented', note: 'Decision-tree & random-forest models on synthetic data — illustrative estimates' },
      { label: 'Farm dashboard with crop, area, soil pH, N-P-K and weather inputs', status: 'documented' },
      { label: 'Crop-specific input comparisons and suggested actions', status: 'documented' },
      { label: 'Crop planning from selection and farm setup to harvest and recorded sales', status: 'documented' },
      { label: 'Growth stages with tasks to complete, skip or reschedule', status: 'documented' },
      { label: 'Weather-aware plan updates', status: 'documented', note: 'Weather scenarios are simulated, not a live feed' },
      { label: 'Soil health score and irrigation adjustments', status: 'documented', note: 'Irrigation revised by simulated weather scenarios' },
      { label: 'Agricultural assistant (chatbot) for farmers', status: 'documented', note: 'Keyword-based responses, not an LLM' },
      { label: 'Agricultural statistics and data visualisation', status: 'documented', note: 'Generated demonstration trends' },
      { label: 'Interactive 3D India agricultural landscape', status: 'development', note: 'Concept: terrain, rivers, soil, irrigation and regions from geographic data' },
      { label: 'Live weather feed and verified statistics', status: 'planned', note: 'Listed as future work in the report' },
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
      {
        image: { src: '/images/agri/dashboard.webp', small: '/images/agri/dashboard-800.webp', width: 1600, height: 736, alt: 'Agri-Yield Pro farm dashboard with farm parameters, expected yield, production, crop health and pest risk cards, a yield trend chart and a farming plan' },
        title: 'Farm dashboard',
        caption: 'Farm parameters on the left; expected yield, total production, crop health and pest risk at the top; yield trend and farming plan below.',
        annotations: ['Inputs: crop, area, soil pH and N-P-K', 'Estimate cards come from models trained on synthetic data', 'Farming plan turns nutrient gaps into actions, e.g. a nitrogen top-up'],
        note: 'Weather readings and the statistics banner in this view are simulated or generated demonstration data, according to the project report.',
      },
      {
        image: { src: '/images/agri/crop-categories.webp', small: '/images/agri/crop-categories-800.webp', width: 1600, height: 726, alt: 'Crop planning step one: choosing between seven crop categories such as cereals, vegetables, fruits and pulses' },
        title: 'Crop planning — choose a category',
        caption: 'The first step of the planning flow: seven crop categories to explore before building a plan.',
        annotations: ['Each category leads to detailed crop profiles', 'A demo-farm tip guides first-time users through the flow'],
      },
      {
        image: { src: '/images/agri/crop-profile.webp', small: '/images/agri/crop-profile-800.webp', width: 1600, height: 732, alt: 'Crop profile for apple showing basic information, a growth stages timeline and a Create Crop Plan button' },
        title: 'Crop profile and growth stages',
        caption: 'Requirements at a glance, a growth-stage timeline, and one clear next step: create a crop plan.',
        annotations: ['Climate, water, soil, pH and temperature requirements', 'Growth stages with day ranges', 'Primary action repeated where the user finishes reading'],
      },
      {
        image: { src: '/images/agri/statistics.webp', small: '/images/agri/statistics-800.webp', width: 1410, height: 760, alt: 'India Agriculture data explorer with state, crop and indicator filters and a historical output trend chart' },
        title: 'India Agriculture explorer',
        caption: 'Filter by state, crop and indicator, inspect the trend, explain terms simply and download CSV.',
        annotations: ['Filters for state, crop/commodity and indicator', '“Explain simply” helper for unfamiliar terms', 'CSV export of the selected view'],
        note: 'The project report states these trends are generated demonstration data with MoSPI-related labels — not verified official statistics.',
      },
      {
        image: { src: '/images/agri/analytics.webp', small: '/images/agri/analytics-800.webp', width: 1600, height: 484, alt: 'Analytics panels: soil health score, market price trend against MSP, crop yield comparison and crop calendar' },
        title: 'Analytics panels',
        caption: 'Soil health score, market price vs MSP, crop yield comparison and the crop calendar.',
        annotations: ['Soil score broken down into pH, temperature and nitrogen', 'Market price shown against the minimum support price', 'Calendar mirrors the crop lifecycle'],
        note: 'Values come from synthetic or generated data and are for demonstration.',
      },
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
    filters: ['Full Stack', 'Web Development'],
    // ▼ Paste your real URLs here (keep null to show "Coming soon")
    links: { liveDemo: null, github: null, video: null },
    caseTitle: 'Helping students find campus spaces through interactive navigation',
    type: 'Campus-space discovery prototype',
    summary:
      'A campus platform exploring how students can find buildings, libraries, laboratories, and suitable spaces through filters and map navigation.',
    accent: 'amber',
    logo: '/images/sitto-logo.webp',
    journey: ['Choose a building', 'Pick a lab or reading hall', 'Select seat, date & duration', 'Get a QR pass', 'Check in with the scanner'],
    stack: ['React', 'Vite', 'Tailwind CSS', 'Python', 'Flask', 'Supabase', 'PostgreSQL', 'jsQR'],
    stackNote: 'Stack described in the project presentation; jsQR is shown in the admin scanner.',
    architecture: [
      { layer: 'Frontend', detail: 'React · Vite · Tailwind CSS', items: ['Student app: discovery, seat map, bookings, QR pass', 'Admin console: overview, filters, SeatSure verification', 'QR scanner (jsQR) with manual code entry'] },
      { layer: 'Backend', detail: 'Python · Flask REST APIs', items: ['Reservation management', 'QR validation', 'SeatSure workflow and deadline handling'] },
      { layer: 'Data & auth', detail: 'Supabase · PostgreSQL', items: ['Profiles and authentication', 'Buildings, floors, spaces and seats', 'Reservations, occupancy sessions, verification tasks, usage records'] },
    ],
    overview: {
      audience: 'Students looking for a library or lab seat, and administrators who manage those spaces.',
      problem: 'Students walk between buildings searching for a free seat, and administrators lack a central view of availability.',
      team: 'Team of four — “Day Dreamers”',
      context: 'Built at Tech Horizon 2.0 — national-level 24-hour hackathon, IEEE SMC Society, GNITC Hyderabad (9–10 Oct 2026)',
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
        { status: 'screenshot', text: 'Screenshots of the running app show the student flow end to end — building → lab or reading hall → seat map with date, time and duration → booking → QR pass — plus notifications, an admin console and a QR scanner.' },
        { status: 'documented', text: 'The presentation describes QR check-in and checkout and the SeatSure midpoint verification flow.' },
      ],
      limitations: [
        'No user research or usability testing results are available.',
        'Seat counts and bookings in the screenshots come from a test environment — they are not usage data.',
        'The interactive campus-map hotspots are not in the current build and remain planned.',
      ],
    },
    features: [
      { label: 'Building → floor → space discovery with block search', status: 'implemented' },
      { label: 'Library and lab cards with live availability counts', status: 'implemented' },
      { label: 'Interactive seat map (available · selected · reserved · occupied)', status: 'implemented' },
      { label: 'Booking by date, start time and 1–3 hour duration', status: 'implemented' },
      { label: 'Digital QR pass for entrance verification', status: 'implemented' },
      { label: 'My bookings, notifications and SeatSure prompts', status: 'implemented' },
      { label: 'Admin console with campus metrics and filters', status: 'implemented' },
      { label: 'Admin QR scanner with manual reservation-code entry', status: 'implemented' },
      { label: 'SeatSure midpoint verification workflow', status: 'documented', note: 'Described in the presentation; prompts visible in notifications' },
      { label: 'Clickable building hotspots on a campus map', status: 'planned' },
      { label: 'Map zoom and pan with accessible controls', status: 'planned' },
      { label: 'Clearer loading, error and empty states', status: 'planned', note: 'Proposed improvement' },
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
      {
        image: { src: '/images/sitto/home.webp', small: '/images/sitto/home-800.webp', width: 1600, height: 737, alt: 'SITTO student home: welcome banner with campus availability, and cards for available seats, active reservation, QR pass and notifications' },
        title: 'Student home',
        caption: 'A welcome banner with campus availability, then the four things a student checks first: free seats, active reservation, QR pass and notifications.',
        annotations: ['Primary actions: Find a Seat and My Reservations', 'Active reservation and QR pass one tap away', 'Notification count for SeatSure prompts and reminders'],
        note: 'Counts and bookings come from a test environment, not real usage.',
      },
      {
        image: { src: '/images/sitto/buildings.webp', small: '/images/sitto/buildings-800.webp', width: 1540, height: 861, alt: 'Find Seats step one: a four-step progress bar and searchable cards for CSE Block, Main Library and Old Library Block' },
        title: 'Step 1 — choose a building',
        caption: 'A four-step flow (space, seat, time, pass) starts with searchable campus buildings.',
        annotations: ['Progress bar shows all four steps up front', 'Search blocks by name', 'Each building opens its floors and labs'],
      },
      {
        image: { src: '/images/sitto/spaces.webp', small: '/images/sitto/spaces-800.webp', width: 1540, height: 787, alt: 'Cards for labs and reading halls showing building, floor, live availability bars and a View Seats and Reserve button' },
        title: 'Labs and reading halls',
        caption: 'Each space shows its building and floor, free seats and a clear next action.',
        annotations: ['Type label: lab or library', 'Availability as a number and a bar', 'One primary button per card'],
      },
      {
        image: { src: '/images/sitto/seat-map.webp', small: '/images/sitto/seat-map-800.webp', width: 1540, height: 786, alt: 'Seat map of the Quiet Reading Zone with a legend, alongside a booking summary for date, start time and duration' },
        title: 'Seat map and booking summary',
        caption: 'Pick a seat on the room map, then a date, start time and 1–3 hour duration.',
        annotations: ['Legend uses colour plus labels and counts', 'Room orientation: whiteboard at the front, entrance at the rear', 'Past time slots are disabled'],
      },
      {
        image: { src: '/images/sitto/qr-pass.webp', small: '/images/sitto/qr-pass-800.webp', width: 585, height: 783, alt: 'Digital pass for seat S24 in the Quiet Reading Zone with a QR code and reservation reference' },
        title: 'Digital QR pass',
        caption: 'The confirmed seat as a pass: room, assigned seat, QR code and a copyable reference.',
        annotations: ['Large seat number readable at a glance', 'QR for the entrance scanner', 'Reference code as a manual fallback'],
      },
      {
        image: { src: '/images/sitto/bookings.webp', small: '/images/sitto/bookings-800.webp', width: 1030, height: 680, alt: 'My Bookings cards with session times and Open QR Pass buttons, and booking confirmation notifications' },
        title: 'Bookings and notifications',
        caption: 'Active bookings with their session and pass, and SeatSure prompts and confirmations.',
        annotations: ['Status badge on every booking', 'Open QR Pass from the list', 'Notifications link to a response action'],
      },
      {
        image: { src: '/images/sitto/admin.webp', small: '/images/sitto/admin-800.webp', width: 1600, height: 738, alt: 'Admin console overview with filters, seat status metrics, daily review chart, building occupancy and live activity feed' },
        title: 'Admin console',
        caption: 'Campus-wide seat metrics, filters by building, floor, room type and status, and a live activity feed.',
        annotations: ['Total, occupied, reserved, available and unverified seats', 'Filters to narrow to one building or room type', 'Shown here with no seats configured — the empty state reads clearly'],
      },
      {
        image: { src: '/images/sitto/scanner.webp', small: '/images/sitto/scanner-800.webp', width: 610, height: 830, alt: 'Admin QR scanner with an Activate Camera button and a manual reservation-code entry field' },
        title: 'Admin QR scanner',
        caption: 'Camera scanning for entrance passes, with manual code entry when a camera isn’t available.',
        annotations: ['Camera starts only when activated', 'Manual entry accepts a reservation code or QR token'],
      },
      { mockup: 'sitto-map', title: 'Planned: campus map with hotspots', caption: 'Concept for the next step — choose a building from a map instead of a list.', annotations: ['Hotspots are real buttons — Tab and Enter work', 'Zoom controls duplicate pinch and wheel gestures'] },
    ],
    outcomes: [
      { status: 'implemented', text: 'A working student journey from building to seat, booking and QR pass, plus an admin console and QR scanner.' },
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
        'Add the campus map with clickable building hotspots and correct library-to-building mapping.',
        'Ship explicit loading, error and empty states.',
        'Verify building, floor and space counts against the live database.',
        'Run short usability sessions with students before adding more spaces.',
      ],
    },
  },
]

export const getProject = (slug: string | undefined) => projects.find((p) => p.slug === slug)

export const statusLabel: Record<Status, string> = {
  implemented: 'Implemented',
  documented: 'Documented',
  planned: 'Planned',
  development: 'In development',
  screenshot: 'App screenshot',
  illustrative: 'Illustrative mockup',
  observed: 'Observed',
  hypothesis: 'Hypothesis',
}
