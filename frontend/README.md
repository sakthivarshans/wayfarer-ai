# Wayfarer AI — Frontend

Next.js (App Router) + TypeScript + Tailwind CSS. See the root `README.md`
for the full project overview and `.env.example` for required configuration.

## Scripts

- `npm run dev` — start the dev server on http://localhost:3000
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint the codebase
- `npm run test` — run the test suite (vitest + React Testing Library)

## Current pages

- `/login`, `/signup` — email/password auth (Firebase Authentication)
- `/` — Trip Planner (Home) — protected; creates a trip, then goes to `/trips/:id`
- `/trips` — My Trips — lists every trip you've planned
- `/trips/:tripId` — redirects to that trip's Results tab
- `/trips/:tripId/results/{places,transport,hotels}` — protected, tabbed
  results scoped to one trip: ranked nearby places, and quick-compare
  deep links for transport and hotels
- `/trips/:tripId/itinerary` — generate/regenerate and view the trip's
  day-by-day itinerary
- `/results`, `/itinerary` — convenience redirects to your most recent
  trip's version of each (or an empty state if you have no trips yet)
- `/telegram` — connect your own Telegram bot (via BotFather) to ask it
  questions about your most recent trip's itinerary
- `/settings` — account info + sign out, plus a link to manage the
  Telegram connection
- `/api/health` — frontend health-check endpoint

Every page except `/login` and `/signup` is behind a client-side auth guard
(`src/app/(app)/layout.tsx`) that redirects signed-out users to `/login`.

See `../docs/DESIGN.md` for the UI design tokens (colors, layout, component
style) used throughout.

## Deployment (Vercel)

Import this repo in Vercel, set the **root directory** to `frontend/`, and
add the environment variables from `.env.example` in the Vercel project
settings — in particular, `NEXT_PUBLIC_API_BASE_URL` should point at your
deployed backend's `/api` path. Vercel auto-detects Next.js — no extra
build config needed, but `vercel.json` in this folder pins the framework
explicitly.

See the root `README.md`'s **Deployment** section for the full checklist
(deploy order, and wiring the backend's `CORS_ORIGIN`/
`TELEGRAM_WEBHOOK_BASE_URL` to match).
