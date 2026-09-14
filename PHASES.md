# Build Phases

Each phase is done in its own chat. This file is the source of truth for
what's shipped, what's next, and what to verify.

| # | Phase | Status |
|---|---|---|
| 1 | Repo scaffolding, config, env docs, Firebase setup guide | ✅ Done |
| 2 | Backend foundation (Express shell, Firebase Admin, auth/error/validation middleware, retry helper) | ⬜ Not started |
| 3 | Frontend foundation (Next.js shell, Firebase client, auth context, nav, page shells) | ⬜ Not started |
| 4 | Trips (create/list/fetch + Trip Planner form + My Trips page) | ⬜ Not started |
| 5 | Places (Geoapify + Overpass/Nominatim fallback) | ⬜ Not started |
| 6 | Transport & Hotels (deep-link builders) | ⬜ Not started |
| 7 | Itinerary generation | ⬜ Not started |
| 8 | Telegram bot (connect/webhook/Groq replies) | ⬜ Not started |
| 9 | Polish & deployment | ⬜ Not started |

## Phase 1 — Definition of Done

- [x] `frontend/` and `backend/` folder trees created matching the agreed structure
- [x] `backend/package.json`, `tsconfig.json`, `.eslintrc.json`, `Dockerfile`, `render.yaml`, `vitest.config.ts`
- [x] `frontend/package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `.eslintrc.json`, `Dockerfile`, `next.config.mjs`
- [x] `.env.example` for both apps, every variable commented with where to get it
- [x] `docs/FIREBASE_SETUP.md` — Firebase Console steps (no code)
- [x] Root `README.md` with local run instructions
- [x] Backend boots and responds on `GET /api/health`
- [x] Frontend boots and renders a placeholder landing page

**To verify locally:** run the backend and frontend as described in the root
README, then hit `http://localhost:4000/api/health` (should return JSON with
`status: "ok"`) and open `http://localhost:3000` (should render without
errors).

**Deferred to later phases (intentionally not built yet):** Firebase Admin
init, auth middleware, all real page content, all services/routes beyond
health.
