# Wayfarer AI

A free, production-ready AI travel assistant. A user enters origin, destination,
budget, and number of days; the app suggests nearby places, gives quick-compare
deep links for transport and hotels (redirect-only booking, no in-app payments),
builds a day-by-day itinerary, and lets the user chat with their own Telegram
bot about the trip.

This repo was built in phases; see `PHASES.md` for the detailed build
history and Definition of Done for each one.

## Features

- **Trip Planner** — origin, destination, budget, days, and a transport
  mode preference create a trip
- **Places** — nearby attractions (Geoapify, falling back to OSM
  Overpass), ranked and trimmed to fit the trip's budget/days
- **Transport & Hotels** — quick-compare deep links (Google
  Flights/Maps/Rome2Rio for transport; Booking.com/Google Hotels/
  Hostelworld for stays) rather than live pricing — see `PHASES.md`
  Phase 6 for why
- **Itinerary** — a generated day-by-day plan combining the trip's places,
  transport, and hotel, regeneratable any time
- **Telegram bot** — connect your own bot (via BotFather) from `/telegram`
  and ask it questions about your most recent trip's itinerary anywhere,
  answered by Groq using that itinerary as context

## Stack

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS — deploy on Vercel
- **Backend**: Node.js + Express + TypeScript — deploy on Render/Railway
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication (email/password), verified server-side with the Firebase Admin SDK
- **Places/Routing**: Geoapify (primary), OSM Overpass/Nominatim + OSRM (keyless fallbacks)
- **LLM**: Groq (Telegram bot replies)
- **Booking model**: redirect/deep-link only — no payment processing anywhere in this app

## Repo layout

```
frontend/   Next.js app
backend/    Express API
```

## Running locally

### Prerequisites

- Node.js 20+
- A Firebase project (Firestore + Authentication enabled) — see `docs/FIREBASE_SETUP.md`
- API keys for Geoapify and Groq (both free, instant signup, no card required)

### Backend

```bash
cd backend
cp .env.example .env   # fill in real values
npm install
npm run dev             # starts on http://localhost:4000
```

Confirm it's up:

```bash
curl http://localhost:4000/api/health
```

### Frontend

```bash
cd frontend
cp .env.example .env.local   # fill in real values
npm install
npm run dev             # starts on http://localhost:3000
```

## Environment variables

Every required variable is documented with a comment in:

- `backend/.env.example`
- `frontend/.env.example`

Never commit a real `.env` or `.env.local` file — both are gitignored.

## Testing

Both apps have their own automated test suite.

```bash
cd backend && npm test    # vitest — unit + integration (supertest against the real Express app)
cd frontend && npm test   # vitest + React Testing Library — apiClient, hooks, components
```

## Deployment

One-time setup, in order (each depends on the previous step's URL):

1. **Firebase** — follow `docs/FIREBASE_SETUP.md` (one project covers both
   dev and production).
2. **Backend → Render.** In the Render dashboard: New → Blueprint → point
   at this repo (Render reads `backend/render.yaml`). Fill in every env
   var marked `sync: false` — see `backend/.env.example` for what each
   one is and where to get it. Once deployed, note the service's public
   URL (`https://<your-service>.onrender.com`).
3. **Set `TELEGRAM_WEBHOOK_BASE_URL`** on the backend to that same Render
   URL (no trailing slash) and redeploy — this is the base the backend
   builds each user's `/api/telegram/webhook/:userId/:webhookSecret` URL
   from when they connect a bot from the `/telegram` page.
4. **Frontend → Vercel.** Import this repo, set the project's root
   directory to `frontend/`, and add the env vars from
   `frontend/.env.example` — `NEXT_PUBLIC_API_BASE_URL` should point at
   the Render URL from step 2 with `/api` appended
   (`https://<your-service>.onrender.com/api`). Vercel auto-detects
   Next.js; `vercel.json` just pins the framework explicitly.
5. **Set `CORS_ORIGIN`** on the backend to the resulting Vercel URL (or a
   comma-separated list if you also want `localhost:3000` to keep
   working) and redeploy the backend once more.
6. Open the deployed frontend, sign up, and connect a Telegram bot from
   `/telegram` — Telegram will now be able to reach the live webhook.

Free tiers throughout: Render's free web service, Vercel's hobby tier,
Firebase's Spark plan, and the free tiers of Geoapify/Groq/Telegram — see
`backend/README.md` and `frontend/README.md` for the per-service
breakdown.
