# Wayfarer AI

A free, production-ready AI travel assistant. A user enters origin, destination,
budget, and number of days; the app suggests nearby places, gives quick-compare
deep links for transport and hotels (redirect-only booking, no in-app payments),
builds a day-by-day itinerary, and lets the user chat with their own Telegram
bot about the trip.

This repo is being built in phases. See `PHASES.md` for what's done and what's
next.

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

## Deployment

Deployment is finalized in a later phase; see `PHASES.md`. At a high level:
frontend → Vercel, backend → Render (`backend/render.yaml`), database/auth →
Firebase (no separate hosting needed).
