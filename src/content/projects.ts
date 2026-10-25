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
export type ProjectLinks = { liveDemo: string | null; liveDemoLabel?: string; github: string | null; video: string | null }

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
    links: { liveDemo: 'https://agri-yield-pro-india.vercel.app', liveDemoLabel: 'View site', github: 'https://github.com/aravinthspx/Agri-Yield-Pro', video: null },
    caseTitle: 'Live farm data, crop plans and advice in a farmer’s own language',
    type: 'Agricultural decision-support web app',
    summary:
      'A deployed web app for farmers in South India: live weather and mandi prices, a yield optimizer, day-by-day crop plans and a farm assistant in four languages.',
    accent: 'green',
    journey: ['Sign in', 'Check live weather & prices', 'Estimate yield', 'Build a crop plan', 'Work through daily tasks', 'Ask Krishi Mitra'],
    stack: [
      'React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Python', 'FastAPI', 'Uvicorn', 'Pydantic', 'SQLAlchemy', 'PostgreSQL (Neon)',
      'JWT (python-jose)', 'bcrypt', 'Open-Meteo API', 'Agmarknet (data.gov.in)', 'World Bank Open Data', 'Vercel', 'Render',
    ],
    stackNote: 'From the project repository (backend requirements, data sources in live_data.py, and the deployment guide).',
    architecture: [
      { layer: 'Frontend', detail: 'React + TypeScript · Vite · Tailwind CSS (Vercel)', items: ['Dashboard & task plan', 'AI Yield Optimizer', 'Crop Planning wizard', 'India Agriculture', 'Krishi Mitra assistant'] },
      { layer: 'API layer', detail: 'FastAPI on Uvicorn (Render)', items: ['Pydantic schemas', 'Email, mobile OTP and Google sign-in', 'JWT sessions, bcrypt password hashing'] },
      { layer: 'Live data', detail: 'Public data sources', items: ['Open-Meteo weather & geocoding', 'Agmarknet mandi prices via data.gov.in', 'World Bank agriculture indicators'] },
      { layer: 'Processing & storage', detail: 'Python services · PostgreSQL (Neon) via SQLAlchemy', items: ['Random-forest & decision-tree yield models (generated training data)', 'Rule-based assistant using live weather & prices', 'Users, farms, plans and tasks'] },
    ],
    overview: {
      audience: 'Farmers in South India planning crops, and anyone exploring local farm conditions and market prices.',
      problem: 'Weather, market prices and crop know-how live in different places, in different languages — hard to turn into a plan a farmer can follow day by day.',
      team: null,
      context: 'Grew out of a team-of-three Advanced Programming Practice course project at SRM IST Ramapuram; this version is deployed online.',
      role: null,
      timeline: null,
      constraints: [
        'Yield models are trained on generated sample data — estimates are illustrative, not field-validated.',
        'Mandis do not report every crop every day, so prices can be missing; the app says so instead of inventing a number.',
        'Free hosting: the backend sleeps after inactivity, so the first load can take 30–60 seconds.',
      ],
    },
    problem: {
      need: 'A farmer wants to know what to grow, what yield to expect, what to do this week, and what the market is paying — without juggling several apps in a language they don’t read comfortably.',
      difficulties: [
        'Weather and prices change daily; static advice goes stale.',
        'An estimate alone does not say what to do next.',
        'Advice has to be simple, local and in the farmer’s language.',
        'Estimates are easy to over-trust when the training data is generated.',
      ],
    },
    evidence: {
      items: [
        { status: 'screenshot', text: 'Screenshots of the deployed app show the dashboard task plan, Yield Optimizer, Crop Planning wizard, India Agriculture page, Krishi Mitra assistant and sign-in.' },
        { status: 'screenshot', text: 'Live labels in the app: weather marked “LIVE · Open-Meteo”, prices marked “Live mandi price · Agmarknet” with the date.' },
        { status: 'documented', text: 'Repository: FastAPI backend, PostgreSQL via SQLAlchemy, JWT + bcrypt auth, and a deployment guide for Vercel, Render and Neon.' },
      ],
      limitations: [
        'Yield models train on generated data; no measured field accuracy has been established.',
        'Krishi Mitra is rule-based (using live weather and prices), not a large language model.',
        'Not yet tested with farmers.',
      ],
    },
    features: [
      { label: 'Live weather for the farm location', status: 'implemented', note: 'Open-Meteo' },
      { label: 'Today’s mandi prices for South Indian states', status: 'implemented', note: 'Agmarknet via data.gov.in; shows when no prices were reported' },
      { label: 'AI Yield Optimizer: 20 crops, 13 soil types, live result as values change', status: 'implemented', note: 'Models trained on generated data — illustrative estimates' },
      { label: 'Crop Planning: 5-step wizard across 7 crop categories', status: 'implemented' },
      { label: 'Day-by-day task plan with irrigation, fertilizer, pest, market and plan history', status: 'implemented' },
      { label: 'Risk monitor, crop progress, expected harvest and “mark crop as sold”', status: 'implemented' },
      { label: 'Krishi Mitra assistant in English, Tamil, Telugu and Kannada, with Simple/Expert modes', status: 'implemented', note: 'Rule-based, using live weather and prices' },
      { label: 'India Agriculture: long-term statistics with CSV download', status: 'implemented', note: 'World Bank Open Data' },
      { label: 'Sign-in with email, mobile OTP or Google', status: 'implemented' },
      { label: 'Yield models trained and evaluated on real crop data', status: 'planned' },
    ],
    decisions: [
      {
        title: 'Live public data over simulated values',
        chosen: 'Pull weather, mandi prices and statistics from Open-Meteo, Agmarknet and the World Bank.',
        alternative: 'Generated demonstration data (as in the first version).',
        tradeoff: 'Numbers are real and current, but sources can be missing or slow — the UI has to handle gaps honestly.',
      },
      {
        title: 'One connected workflow',
        chosen: 'Dashboard, optimizer, planning, statistics and assistant share one app and the same farm context.',
        alternative: 'Separate single-purpose tools.',
        tradeoff: 'Farmers move from estimate to plan to tasks without re-entering data; the wider scope means more to keep clear and simple.',
      },
      {
        title: 'Predictable rule-based assistant',
        chosen: 'Krishi Mitra answers from rules plus live weather and prices, in four languages and two levels of detail.',
        alternative: 'A generative language model.',
        tradeoff: 'Answers are predictable and cheap to run, but cover anticipated questions only.',
      },
    ],
    screens: [
      {
        image: { src: '/images/agri/v2-dashboard.webp', small: '/images/agri/v2-dashboard-800.webp', width: 1600, height: 729, alt: 'Agri-Yield Pro dashboard: crop progress, estimated yield, expected harvest, risk monitor and a day-by-day farm task list with irrigation, fertilizer, pest, market and plan history tabs' },
        title: 'Dashboard and daily tasks',
        caption: 'Crop progress, estimated yield, expected harvest and a risk monitor beside the day-by-day task list.',
        annotations: ['Tabs for today’s tasks, irrigation, fertilizer, pest & disease, market and plan history', '“Why this task?” explains each step', 'Live weather strip at the top'],
      },
      {
        image: { src: '/images/agri/v2-optimizer.webp', small: '/images/agri/v2-optimizer-800.webp', width: 1600, height: 723, alt: 'AI Yield Optimizer with crop type chips, soil type cards and a live result panel showing expected yield, conditions in ideal range and the live mandi price used' },
        title: 'AI Yield Optimizer',
        caption: 'Pick a crop and soil, adjust field conditions, and the expected yield updates live with the mandi price it used.',
        annotations: ['20 crops, South Indian crops first', '13 soil types with a hint for the selected crop', 'Conditions-in-range meter and top things to fix'],
        note: 'Yield estimates come from models trained on generated data and are illustrative.',
      },
      {
        image: { src: '/images/agri/v2-planning.webp', small: '/images/agri/v2-planning-800.webp', width: 1600, height: 730, alt: 'Crop Planning step one of five: choose between seven crop categories such as cereals, vegetables, fruits, pulses, oilseeds, cash crops and spices' },
        title: 'Crop Planning wizard',
        caption: 'Step 1 of 5: seven crop categories lead to crop profiles and a personalised farming plan.',
        annotations: ['Crop counts per category', 'Demo-farm tip for a guided walkthrough'],
      },
      {
        image: { src: '/images/agri/v2-india.webp', small: '/images/agri/v2-india-800.webp', width: 1600, height: 722, alt: 'South India Agriculture page with today’s mandi prices by crop and a chart of how Indian farming is changing from World Bank data, with CSV downloads' },
        title: 'India Agriculture — live',
        caption: 'Today’s mandi prices across South Indian states, plus long-term World Bank indicators with CSV download.',
        annotations: ['Switch between South India and All India', 'Clear message when a mandi has not reported a crop', 'Indicators: cereal yield, fertilizer use, agricultural land and more'],
      },
      {
        image: { src: '/images/agri/v2-assistant.webp', small: '/images/agri/v2-assistant.webp', width: 506, height: 715, alt: 'Krishi Mitra assistant panel with language buttons for English, Tamil, Telugu and Kannada, Simple and Expert modes, live weather data and quick questions' },
        title: 'Krishi Mitra assistant',
        caption: 'A farm friend that answers in English, Tamil, Telugu or Kannada, simply or in detail, using live data.',
        annotations: ['Location, crop, temperature and rain chips', 'Quick questions: rain, market price, pest risk', 'Voice input button'],
        note: 'Rule-based answers using live weather and prices — not a large language model.',
      },
      {
        image: { src: '/images/agri/v2-login.webp', small: '/images/agri/v2-login-800.webp', width: 1600, height: 733, alt: 'Sign-in screen greeting “Vanakkam, Farmer!” with email or mobile OTP login and Continue with Google' },
        title: 'Sign in',
        caption: '“Vanakkam, Farmer!” — email, mobile OTP or Google sign-in.',
        annotations: ['Live weather, mandi prices and AI advice highlighted up front'],
      },
    ],
    outcomes: [
      { status: 'screenshot', text: 'A deployed app connecting live weather and prices, yield estimates, crop plans, daily tasks and a multilingual assistant.' },
      { status: 'documented', text: 'Frontend on Vercel, API on Render and database on Neon, with a written deployment guide.' },
      { status: 'hypothesis', text: 'Advice in the farmer’s language, tied to live local data, may be easier to act on than generic tips. Not yet tested with farmers.' },
    ],
    testing: null,
    reflection: {
      learned: [
        'Real data is messy — handling “no price reported today” honestly matters more than a full-looking table.',
        'Designing for farmers means big targets, local languages and plain words.',
        'Explaining a recommendation (“Why this task?”) builds more trust than the number alone.',
      ],
      next: [
        'Train and evaluate the yield models on real, held-out crop data.',
        'Test with farmers and refine wording in each language.',
        'Add offline-friendly access for low-connectivity areas.',
      ],
    },
  },
  {
    slug: 'sitto',
    name: 'SITTO',
    filters: ['Full Stack', 'Web Development'],
    // ▼ Paste your real URLs here (keep null to show "Coming soon")
    links: { liveDemo: 'https://sitto-self.vercel.app', liveDemoLabel: 'View site', github: null, video: null },
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
