# Wayfarer AI — Frontend

Next.js (App Router) + TypeScript + Tailwind CSS. See the root `README.md`
for the full project overview and `.env.example` for required configuration.

## Scripts

- `npm run dev` — start the dev server on http://localhost:3000
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint the codebase

## Current pages

- `/` — placeholder landing page
- `/api/health` — frontend health-check endpoint

Auth, the trip planner, results tabs, itinerary, and Telegram setup pages are
added in later phases — see `../PHASES.md`.

## Deployment (Vercel)

Import this repo in Vercel, set the **root directory** to `frontend/`, and
add the environment variables from `.env.example` in the Vercel project
settings. Vercel auto-detects Next.js — no extra build config needed, but
`vercel.json` in this folder pins the framework explicitly.
