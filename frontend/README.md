# Wayfarer AI — Frontend

Next.js (App Router) + TypeScript + Tailwind CSS. See the root `README.md`
for the full project overview and `.env.example` for required configuration.

## Scripts

- `npm run dev` — start the dev server on http://localhost:3000
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint the codebase

## Current pages

- `/login`, `/signup` — email/password auth (Firebase Authentication)
- `/` — Trip Planner (Home) — protected, form comes in Phase 4
- `/results/places`, `/results/transport`, `/results/hotels` — protected, tabbed shells; real data comes in Phases 5–6
- `/itinerary` — protected shell; generation comes in Phase 7
- `/telegram` — Telegram Bot Setup shell; wiring comes in Phase 8
- `/trips` — My Trips shell; comes alongside trip creation in Phase 4
- `/settings` — account info + sign out (functional now); more preferences land as later phases need them
- `/api/health` — frontend health-check endpoint

Every page except `/login` and `/signup` is behind a client-side auth guard
(`src/app/(app)/layout.tsx`) that redirects signed-out users to `/login`.

See `../docs/DESIGN.md` for the UI design tokens (colors, layout, component
style) used throughout.

## Deployment (Vercel)

Import this repo in Vercel, set the **root directory** to `frontend/`, and
add the environment variables from `.env.example` in the Vercel project
settings. Vercel auto-detects Next.js — no extra build config needed, but
`vercel.json` in this folder pins the framework explicitly.
