# Deployment

## Frontend → Vercel

1. Push this repo to GitHub.
2. In Vercel: **New Project** → import the repo.
3. **Root Directory**: set to `frontend` (this repo is a single monorepo with
   `/frontend` and `/backend` side by side — Vercel only needs to build the
   frontend folder). `vercel.json` at the repo root already sets the build/
   install commands relative to that root directory.
4. Framework preset: Next.js (auto-detected).
5. Environment variables (Project Settings → Environment Variables):
   - `NEXT_PUBLIC_API_BASE_URL` — the deployed backend's public URL, e.g.
     `https://wayfarer-ai-backend.onrender.com/api`
6. Deploy. Every push to `main` redeploys automatically.

## Backend → Render

1. In Render: **New** → **Web Service** → connect the same GitHub repo.
2. **Root Directory**: `backend`.
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `npm start`
5. **Environment**: Node.
6. Environment variables (Render dashboard → Environment): copy every key
   from `backend/.env.example` and fill in real values, at minimum:
   - `MONGODB_URI` (see MongoDB Atlas section below)
   - `CORS_ORIGIN` — the deployed Vercel frontend URL (no trailing slash),
     e.g. `https://wayfarer-ai.vercel.app`
   - `PORT` — Render sets this automatically; you don't need to set it
     yourself, but the app reads `process.env.PORT` so it works either way.
   - Everything else (`OPENTRIPMAP_API_KEY`, `AMADEUS_CLIENT_ID`, ...) can be
     left blank until the phase that needs it is built — the app doesn't
     read them yet.
7. Render's free tier spins the service down after inactivity; the first
   request after idling will be slow (cold start). Fine for a student
   project.
8. Once deployed, confirm `GET https://<your-service>.onrender.com/api/health`
   returns `{ "status": "ok", ... }`.

## MongoDB Atlas (free M0 cluster)

1. Create a free M0 cluster at https://www.mongodb.com/atlas.
2. **Database Access**: create a user with a strong password.
3. **Network Access**: add `0.0.0.0/0` (allow from anywhere) so Render's
   dynamic IPs can connect — acceptable for a free-tier student project;
   tighten this later if you upgrade to a static-IP hosting plan.
4. Copy the connection string, replace `<user>`/`<password>`, and set it as
   `MONGODB_URI` in Render.

## Telegram webhook (Phase 6, informational for now)

Once the backend is deployed, `TELEGRAM_WEBHOOK_BASE_URL` in Render should
be set to that service's public URL (e.g.
`https://wayfarer-ai-backend.onrender.com`) — Phase 6 uses this to register
each user's webhook with Telegram.
