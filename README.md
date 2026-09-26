# Wayfarer AI

A free, web-based AI travel assistant. Enter an origin, destination, budget,
and number of days — get nearby places to visit, transport and hotel
options with "Book" deep links (redirect-only, no in-app payments), a
generated day-by-day itinerary, and a personal Telegram bot to ask
follow-up questions about the trip.

**Current status: Phase 0 + Phase 1 done.**
- Phase 0: project scaffolding — folder structure, app shell/navigation,
  health-check route, DB connection, deployment config.
- Phase 1: the real Trip Planner form (origin, destination, budget, days,
  transport preference) with client-side validation, wired to a new
  `POST /api/trips` backend route (zod-validated, saved to MongoDB via a
  `Trip` model), which redirects to the Results tabs with the new trip's id.

Results (Places/Transport/Hotels), Itinerary, and Telegram Bot Setup are
still shells/placeholders — those get real data in Phases 2–6.

## Repo layout

```
wayfarer-ai/
├── frontend/   Next.js 14 (App Router) + TypeScript + Tailwind CSS
├── backend/    Express + TypeScript + Mongoose
├── docs/       Deployment notes
└── vercel.json Root-level Vercel build config (points at /frontend)
```

Frontend and backend are two independent npm projects living side by side
in one repo (no workspace tooling) — each has its own `package.json`,
`node_modules`, and lockfile, and is deployed as its own service.

## Prerequisites

- Node.js 18+
- npm 9+
- A MongoDB Atlas account (free M0 cluster) for the database

## Running locally

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — at minimum set MONGODB_URI to your Atlas connection string.
npm install
npm run dev
```

The API starts on `http://localhost:4000`. Confirm it's up:

```bash
curl http://localhost:4000/api/health
# { "status": "ok", "timestamp": "..." }
```

### 2. Frontend

In a second terminal:

```bash
cd frontend
cp .env.example .env.local
# Defaults already point at the local backend above; edit if yours runs
# elsewhere.
npm install
npm run dev
```

The app starts on `http://localhost:3000`.

## Environment variables

Every environment variable the whole project will eventually need is
documented in `backend/.env.example` and `frontend/.env.example`, even
variables that later phases (Places, Transport, Hotels, Telegram bot)
introduce. Leave the ones you don't need yet blank — the current code
doesn't read them.

**All third-party API keys live only in `backend/.env`.** The frontend
never holds a secret; its only environment variable is the backend's
public base URL.

## Coding standards

- TypeScript strict mode on both apps
- Feature-based folders, not type-based dumping grounds
- All external API calls go through a `services/` layer (added as each
  phase needs one)
- Every API route validates input with `zod`
- Errors return a consistent JSON shape (`{ error: { code, message } }`),
  never a raw stack trace
- No commented-out dead code

## Deployment

See [`docs/DEPLOY.md`](./docs/DEPLOY.md) for step-by-step Vercel (frontend),
Render (backend), and MongoDB Atlas setup.
