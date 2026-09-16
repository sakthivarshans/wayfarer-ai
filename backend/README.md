# Wayfarer AI — Backend

Express + TypeScript API. See the root `README.md` for the full project
overview and `.env.example` for required configuration.

## Scripts

- `npm run dev` — start with hot reload (tsx watch)
- `npm run build` — compile to `dist/`
- `npm run start` — run the compiled build
- `npm run test` — run the test suite (vitest)
- `npm run lint` — lint the codebase

## Current routes

- `GET /api/health` — liveness check, returns `{ status: "ok", timestamp }`
- `POST /api/trips` — create a trip (auth required)
- `GET /api/trips` — list the authenticated user's trips, newest first
- `GET /api/trips/:id` — fetch a trip the authenticated user owns (404 otherwise)

All `/api/trips` routes require `Authorization: Bearer <Firebase ID token>`.

More routes (`/api/places`, `/api/telegram`, ...) are added in later phases —
see `../PHASES.md`.

## Deployment (Render)

`render.yaml` in this folder is a Render Blueprint. In the Render dashboard:
"New" → "Blueprint" → point at this repo → Render reads `render.yaml` and
creates the service. Fill in the env vars marked `sync: false` in the Render
dashboard (they're documented in `.env.example`).

Telegram webhook setup and the full deployment checklist are finalized in the
Polish phase (see `../PHASES.md`).
