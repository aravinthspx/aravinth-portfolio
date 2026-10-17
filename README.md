# Aravinth M — Portfolio

React + TypeScript + Vite + Tailwind CSS v4 + Motion + React Three Fiber/Drei.

## Run

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build to dist/
npm run preview   # serve dist/ at http://localhost:4173 (SPA fallback included)
```

## Edit content

- `src/content/profile.ts` — name, headline, intro, links, study line, `resumeUrl` (null hides the Resume link)
- `src/content/projects.ts` — projects and case studies. Fields set to `null` (role, timeline, testing) stay hidden until you fill them in. Every claim carries a status: documented / planned / illustrative / observed / hypothesis.
- `src/content/focus.ts` — "Current focus" cards and the learning-journey timeline (no skill percentages; undated items say so).
- `src/components/Terminal.tsx` — commands for the Agri-Yield Pro console; answers are read from `projects.ts`.
- `src/content/certificates.ts` — certificates; files live in `public/certificates/` (copied unaltered).
- `src/components/mockups/` — illustrative interface mockups (not shipped screens). Replace with real screenshots when available.

## Hosting

Case-study routes (`/work/:slug`) use client-side routing. `public/_redirects` (Netlify) and `vercel.json` (Vercel) rewrite unknown paths to `index.html` so refresh and direct links work. On GitHub Pages, switch to `HashRouter` in `src/main.tsx`.

Append `?no3d` to any URL to preview the static (no-WebGL) project fallbacks.

The home page shows a short "Get started" intro once per browser session (deep links skip it). To see it again, clear `aravinth-intro-seen` from session storage.
