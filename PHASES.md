# Build Phases

Each phase is done in its own chat. This file is the source of truth for
what's shipped, what's next, and what to verify.

| # | Phase | Status |
|---|---|---|
| 1 | Repo scaffolding, config, env docs, Firebase setup guide | ✅ Done |
| 2 | Backend foundation (Express shell, Firebase Admin, auth/error/validation middleware, retry helper) | ✅ Done |
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

## Phase 2 — Definition of Done

- [x] `backend/src/config/firebaseAdmin.ts` — singleton Firebase Admin init,
      exposing `getFirebaseAuth()` and `getFirestoreDb()`; throws a clear
      error (not a raw SDK crash) if credentials are missing
- [x] `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY`
      required in `env.ts` outside `NODE_ENV=test`
- [x] `backend/src/middleware/auth.ts` — `requireAuth` verifies a Firebase ID
      token from `Authorization: Bearer <token>`, attaches `req.user`, and
      never leaks Firebase's internal error details to the client
- [x] `backend/src/types/express.d.ts` — typed `req.user` augmentation
- [x] `backend/src/middleware/validate.ts` — generic zod `body`/`params`/`query`
      validation middleware, reusable by every future route
- [x] `backend/src/utils/retry.ts` — exponential backoff `withRetry` helper
      (configurable attempts/delay/predicate), ready for Places/Transport/
      Hotels/Groq services in later phases
- [x] Unit tests for all four pieces above, with Firebase mocked where needed
- [x] Bug fix: `backend/.eslintrc.json` typed-linting `project` pointed at
      `tsconfig.json`, which excludes `tests/` — added `tsconfig.eslint.json`
      so `npm run lint` actually covers test files instead of erroring on
      every one of them
- [x] `npm run build`, `npm test` (18/18 passing), and `npm run lint` all
      clean in `backend/`

**To verify locally:**
```
cd backend
npm install
npm run build   # tsc — no errors
npm test        # vitest — 5 files / 18 tests passing
npm run lint    # eslint — no errors or warnings
```
No new routes are exposed yet — `requireAuth`/`validate`/`withRetry` are
plumbing that Phase 4+ routes will import.

**Deferred to later phases (intentionally not built yet):** any route that
actually uses `requireAuth`/`validate` (Trips is Phase 4), any service that
uses `withRetry` (Places/Transport/Hotels/Telegram), Firestore data models,
frontend Firebase client/auth context (Phase 3).
