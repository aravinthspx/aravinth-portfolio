# Aravinth M — Portfolio

React + TypeScript + Vite + Tailwind CSS v4 + Motion + React Three Fiber/Drei.

## Run

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build to dist/
npm run preview   # serve dist/ at http://localhost:4173 (SPA fallback included)
npm run lint
```

## Edit content (no component changes needed)

| What | File |
| --- | --- |
| Name, headline, intro, email, social links, location, portrait | `src/content/profile.ts` → `profile` |
| About text and the four About cards | `src/content/profile.ts` → `about` |
| **Resume PDF** | Put it in `public/` (e.g. `public/resume.pdf`) and set `resumeUrl: '/resume.pdf'` in `profile.ts`. While `null`, download buttons are hidden and the Contact section offers "Request my resume" by email. |
| **Contact form delivery** | `src/content/profile.ts` → `contactForm.endpoint`. `null` = the form opens the visitor's email app with the message pre-filled. Paste a public form-service URL (e.g. Formspree) to send directly. Never put private keys here. |
| Skills (no percentages; each has `evidence`) | `src/content/skills.ts` |
| Projects, case studies, links (live demo / GitHub / video), screenshots, filters | `src/content/projects.ts` |
| **Certificates** (category, credential ID, skills, file, verify link) | `src/content/certificates.ts` + files in `public/certificates/` |
| **Hackathons**, experience, achievements, education, blog posts | `src/content/records.ts` — copy the commented template in each list |
| Current-focus cards and learning-journey timeline | `src/content/focus.ts` |

Empty lists are handled automatically: **Hackathons** shows an empty state; **Experience**, **Achievements** and **Blog** stay hidden (and out of the navigation and footer) until they have entries. The navigation, footer and scroll-spy all read from `src/lib/sections.ts`.

Blog posts get their own page at `/blog/<slug>`; paragraphs starting with `## ` become headings.

Status labels keep claims honest: *Implemented* (seen working in screenshots), *Documented* (described in project reports), *In development*, *Planned*, *Illustrative mockup*, *Observed*, *Hypothesis*.

## Hosting

Routes (`/work/:slug`, `/blog/:slug`) use client-side routing. `public/_redirects` (Netlify) and `vercel.json` (Vercel) rewrite unknown paths to `index.html` so refresh and direct links work. On GitHub Pages, switch to `HashRouter` in `src/main.tsx`.

- Append `?no3d` to any URL to preview the static (no-WebGL) fallbacks.
- The home page shows a short "Get started" intro once per browser session (deep links skip it). Clear `aravinth-intro-seen` from session storage to see it again.
- Once you have a domain, add an absolute `og:image` and `og:url` in `index.html` for richer link previews.
