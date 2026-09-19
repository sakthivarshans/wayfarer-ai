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

Trips (all require `Authorization: Bearer <Firebase ID token>`, and every
`:id` route 404s for a trip the caller doesn't own):

- `POST /api/trips` — create a trip
- `GET /api/trips` — list the authenticated user's trips, newest first
- `GET /api/trips/:id` — fetch one trip
- `GET /api/trips/:id/places` — ranked nearby places for the trip
- `GET /api/trips/:id/transport` — transport option summary + deep links
- `GET /api/trips/:id/hotels` — hotel option summary + deep links
- `POST /api/trips/:id/itinerary/generate` — (re)generate the day-by-day itinerary
- `GET /api/trips/:id/itinerary` — fetch the saved itinerary (404 if none generated yet)

Telegram (also under auth):

- `POST /api/users/me/telegram` — connect (or reconnect) a Telegram bot by token
- `GET /api/users/me/telegram` — connection status (never the token itself)

Telegram webhook (public — no Firebase auth; Telegram calls this
directly, authenticated instead by the per-user secret in the path):

- `POST /api/telegram/webhook/:userId/:webhookSecret`

## Deployment (Render)

`render.yaml` in this folder is a Render Blueprint. In the Render dashboard:
"New" → "Blueprint" → point at this repo → Render reads `render.yaml` and
creates the service. Fill in the env vars marked `sync: false` in the Render
dashboard (they're documented in `.env.example`).

See the root `README.md`'s **Deployment** section for the full checklist,
including setting `TELEGRAM_WEBHOOK_BASE_URL` to this service's URL and
`CORS_ORIGIN` to the deployed frontend's URL.
