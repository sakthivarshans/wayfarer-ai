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
- `/` — Trip Planner (Home) — protected; creates a trip, then goes to `/trips/:id`
- `/trips` — My Trips — lists every trip you've planned
- `/trips/:tripId` — redirects to that trip's Results tab
- `/trips/:tripId/results/{places,transport,hotels}` — protected, tabbed
  shells scoped to one trip; real data comes in Phases 5–6
- `/trips/:tripId/itinerary` — protected shell scoped to one trip;
  generation comes in Phase 7
- `/results`, `/itinerary` — convenience redirects to your most recent
  trip's version of each (or an empty state if you have no trips yet)
- `/telegram` — Telegram Bot Setup shell; wiring comes in Phase 8
- `/settings` — account info + sign out (functional now); more preferences
  land as later phases need them
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
