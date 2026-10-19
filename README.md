<div align="center">

# Aravinth M — Portfolio

**AI/ML Engineering Student · Aspiring Machine Learning Engineer**
B.Tech CSE (AI & ML), SRM Institute of Science and Technology, Ramapuram

[![Live site](https://img.shields.io/badge/Live_site-aravinth--portfolio-4fd9ea?style=for-the-badge&logo=vercel&logoColor=white)](https://aravinth-portfolio-virid.vercel.app)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Aravinth_M-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/aravinth-m-07445a36a)
[![GitHub](https://img.shields.io/badge/GitHub-aravinthspx-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/aravinthspx)

![React](https://img.shields.io/badge/React_19-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?logo=tailwindcss&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?logo=threedotjs&logoColor=white)
![Motion](https://img.shields.io/badge/Motion-FF0055?logo=framer&logoColor=white)

</div>

---

A space-themed personal portfolio built to show real work honestly: every project, certificate and milestone on the site is backed by screenshots, reports or certificates, and every feature is labelled with how it is known (implemented, documented, planned…). No fake percentages, metrics or testimonials.

## ✨ Highlights

- **Cinematic intro** — a launch orb opens a short, skippable intro reel (portrait, name, role, a loader to 100%). Shown once per session; `Esc` or *Skip intro* goes straight in.
- **Project showcase** — layered browser-window previews of real project screens in the hero, plus project cards with:
  - a **UI / Architecture** toggle that switches the preview to a system diagram,
  - a **Quick view** dialog with features, stack and links,
  - **3D dioramas** (React Three Fiber) and full **case-study pages** at `/work/:slug`.
- **Live GitHub strip** — latest public repositories fetched from the GitHub API, with loading, error and honest empty states.
- **Skills with evidence** — each skill links to where it was used; switch between **Cards** and a **Tree** view.
- **Learning journey** — a constellation timeline of real milestones with a legend and “up next” goals.
- **Certificates & hackathons** — searchable, filterable certificates with credential IDs; hackathon entries with team, problem, solution and proof.
- **Contact** — validated form that opens Gmail (or any email app) with the message pre-filled; a form-service endpoint can be plugged in to send directly.
- **Polish** — scroll-spy navigation, animated starfield, spring physics, responsive down to 375 px, keyboard-friendly dialogs, and full `prefers-reduced-motion` support.

## 🚀 Featured projects

| Project | What it is | Links |
| --- | --- | --- |
| **Agri-Yield Pro** | Crop planning web app for farmers: live weather, mandi prices, yield optimizer, crop-plan wizard and a multilingual farm assistant. | [Live](https://agri-yield-pro-india.vercel.app) · [Code](https://github.com/aravinthspx/Agri-Yield-Pro) |
| **SITTO** | Smart campus seating — find and reserve library and lab seats with QR check-in. Built at Tech Horizon 2.0 by team Day Dreamers. | [Live](https://sitto-self.vercel.app) |

## 🛠️ Tech stack

| Area | Tools |
| --- | --- |
| Framework | React 19, TypeScript, Vite |
| Styling | Tailwind CSS v4, custom design tokens (cyan + green space theme) |
| Animation | Motion (springs, layout animations, scroll-linked effects) |
| 3D | Three.js, React Three Fiber, Drei — lazy-loaded with static fallbacks |
| Routing | React Router 7 (home, case studies, blog, 404) |
| Quality | `tsc` type-checking, oxlint |
| Hosting | Vercel |

## 📦 Getting started

Requires Node.js 20.19+ or 22.12+.

```bash
git clone https://github.com/aravinthspx/aravinth-portfolio.git
cd aravinth-portfolio
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server at http://localhost:5173 |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build at http://localhost:4173 |
| `npm run lint` | Lint with oxlint |

## 🗂️ Project structure

```text
src/
├── content/        # All site content — edit these, not the components
│   ├── profile.ts       # name, headline, about, facts, goals, contact settings
│   ├── projects.ts      # projects, case studies, screenshots, links
│   ├── certificates.ts  # certificates and credential IDs
│   ├── skills.ts        # skill groups, each with evidence
│   ├── records.ts       # hackathons, education, experience, achievements, blog
│   └── focus.ts         # current-focus cards and journey milestones
├── components/     # UI: hero, intro, nav, cards, dialogs, sections/
├── pages/          # Home, CaseStudy, BlogPost, NotFound
├── three/          # React Three Fiber scenes and materials
└── lib/            # motion prefs, hooks, section list, email helpers
public/
├── images/         # project screenshots and portrait
└── certificates/   # certificate files and thumbnails
```

## ✏️ Editing content

Everything visible on the site comes from `src/content/` — no component changes needed.

| What | Where |
| --- | --- |
| Name, headline, intro, email, social links, portrait | `profile.ts` → `profile` |
| About text and cards | `profile.ts` → `about` |
| Hero facts and “Where I’m heading” goals | `profile.ts` → `facts`, `direction` |
| **Resume** | Add a PDF to `public/` (e.g. `public/resume.pdf`) and set `resumeUrl: '/resume.pdf'`. While `null`, download buttons stay hidden and visitors can request it by email. |
| **Contact form delivery** | `profile.ts` → `contactForm.endpoint`. `null` opens Gmail / the email app with the message pre-filled. Paste a public form-service URL (e.g. Formspree) to send directly. Never put private keys here. |
| Projects, case studies, live / GitHub / video links | `projects.ts` — a `null` link shows as “Coming soon” |
| Certificates | `certificates.ts` + files in `public/certificates/` |
| Hackathons, education, experience, achievements, blog posts | `records.ts` — copy the commented template in each list |
| Skills | `skills.ts` (no percentages; each skill has `evidence`) |
| Focus cards and journey timeline | `focus.ts` |
| Live GitHub repositories | Automatic, from `profile.links.github` |

Empty lists are handled automatically: **Experience**, **Achievements** and **Blog** stay hidden — including from the navigation and footer — until they have entries. Blog posts get their own page at `/blog/<slug>`.

### Honesty labels

Features and claims carry a status so nothing is overstated:
**Implemented** (seen working) · **Documented** (described in a project report) · **In development** · **Planned** · **Illustrative mockup** · **Observed** · **Hypothesis**.

## ☁️ Deployment

Deployed on **Vercel**. `vercel.json` rewrites every route to `index.html`, so refreshes and direct links to `/work/...` pages work; `public/_redirects` does the same on Netlify.

```bash
npx vercel deploy --prod
```

Tips:
- Append `?no3d` to any URL to preview the static, no-WebGL fallbacks.
- To see the intro again, clear `aravinth-intro-seen` from session storage (or open a private window).

## 📬 Contact

- **Email:** aravinthff2007@gmail.com
- **LinkedIn:** [Aravinth M](https://www.linkedin.com/in/aravinth-m-07445a36a)
- **GitHub:** [@aravinthspx](https://github.com/aravinthspx)

<div align="center">

Designed and built by **Aravinth M** · Chennai, India

</div>
