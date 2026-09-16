# Build Phases

Each phase is done in its own chat. This file is the source of truth for
what's shipped, what's next, and what to verify.

| # | Phase | Status |
|---|---|---|
| 1 | Repo scaffolding, config, env docs, Firebase setup guide | ✅ Done |
| 2 | Backend foundation (Express shell, Firebase Admin, auth/error/validation middleware, retry helper) | ✅ Done |
| 3 | Frontend foundation (Next.js shell, Firebase client, auth context, nav, page shells) | ✅ Done |
| 4 | Trips (create/list/fetch + Trip Planner form + My Trips page) | ✅ Done |
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

## Phase 3 — Definition of Done

- [x] `docs/DESIGN.md` — design tokens (colors sampled from the reference
      image, layout, component patterns) written before any UI was built
- [x] `tailwind.config.ts` — `ink`/`sky`/`text`/`surface`/`status` color
      tokens, `rounded-card`, `shadow-card` added to match `docs/DESIGN.md`
- [x] `frontend/src/config/firebaseClient.ts` — browser-only Firebase client
      SDK singleton (guards against SSR misuse)
- [x] `frontend/src/features/auth/AuthContext.tsx` — `useAuth()` hook:
      `user`, `loading`, `signIn`, `signUp`, `signOutUser`, `getIdToken`
      (ready for Phase 4 routes to call the backend's `requireAuth`)
- [x] `/login`, `/signup` — public email/password auth pages
- [x] `frontend/src/app/(app)/layout.tsx` — client-side auth guard;
      redirects signed-out users to `/login`
- [x] `Sidebar`/`Topbar`/`AppShell` — icon-rail nav (Trip Planner, Results,
      Itinerary, Telegram Bot, My Trips, Settings) matching `docs/DESIGN.md`
- [x] Page shells for all six nav destinations, plus tabbed
      `/results/{places,transport,hotels}`, all behind the auth guard
- [x] `/settings` — genuinely functional (shows signed-in account, sign out),
      not just a placeholder, since auth context is this phase's own output
- [x] Old placeholder landing page removed; `/` is now the (protected) Trip
      Planner home
- [x] `not-found.tsx` / `error.tsx` / `loading.tsx` restyled onto the new
      design tokens (previously used a `brand-*` palette that no longer
      exists)
- [x] `npm run build` (all 13 routes prerender) and `npm run lint` clean in
      `frontend/`

**To verify locally:**
```
cd frontend
npm install
cp .env.example .env.local   # fill in real Firebase web-app config
npm run build   # next build — all routes compile, no errors
npm run lint     # next lint — no warnings or errors
npm run dev      # then visit http://localhost:3000 — redirects to /login
```
Create an account at `/signup` (requires a real Firebase project with
Email/Password auth enabled, per `docs/FIREBASE_SETUP.md`) to see the nav
shell and page placeholders.

**Deferred to later phases (intentionally not built yet):** any real page
content behind the shells (Trip Planner form and Trips API are Phase 4;
Places/Transport/Hotels data are Phases 5–6; Itinerary generation is Phase 7;
Telegram bot wiring is Phase 8); a server-verified session (current guard is
client-side only, matching this phase's scope — Phase 4's protected API
routes are the actual security boundary); no automated frontend test suite
exists yet (backend has one; frontend didn't have test infra in Phase 1
either, so this isn't a regression, just a gap worth flagging for Phase 9).

## Phase 4 — Definition of Done

- [x] Backend: `POST /api/trips`, `GET /api/trips`, `GET /api/trips/:id`,
      all behind `requireAuth`, validated with `createTripBodySchema` /
      `tripIdParamsSchema`
- [x] `services/trips.service.ts` — Firestore-backed; lists are sorted
      in-memory (newest first) rather than via Firestore `orderBy`, so no
      composite index needs to be created in the Firebase console
- [x] `getTripById` returns `null` both when a trip doesn't exist and when
      it belongs to another user — the controller turns either into an
      identical 404, so trip IDs can't be probed to confirm existence
- [x] `getRequestUser()` helper added to `middleware/auth.ts` (controllers
      no longer use a `req.user!` non-null assertion)
- [x] Backend tests: an in-memory fake Firestore test helper, unit tests for
      the service, integration tests for the routes (missing/invalid auth,
      body validation, cross-user ownership isolation) — all through the
      real Express app + real middleware, only Firestore/Firebase Auth faked
- [x] Frontend: `src/lib/apiClient.ts` — typed fetch wrapper matching the
      backend's `{ error: { code, message, details } }` shape
- [x] `src/features/trips/` — types, API calls, `TripPlannerForm`,
      `TripCard`, `useTrips` hook, `TripContext`
- [x] `/` — real Trip Planner form; creates a trip, redirects to `/trips/:id`
- [x] `/trips` — real My Trips list (loading/empty/error states), no longer
      a placeholder
- [x] Routing restructured to be trip-scoped, since "My Trips" only makes
      sense if Results/Itinerary can show a *specific* trip:
      `/trips/:tripId/results/{places,transport,hotels}` and
      `/trips/:tripId/itinerary`, sharing a layout with the trip summary +
      tab nav
- [x] Sidebar's `/results` and `/itinerary` links still work: they now
      smart-redirect to the most recently created trip's version of each,
      or show an empty state ("plan a trip first") if the user has none
- [x] `npm run build` (backend + frontend), `npm test` (33/33 backend),
      `npm run lint` (backend + frontend) all clean

**To verify locally:**
```
# backend
cd backend && npm install && npm run build && npm test && npm run lint

# frontend
cd frontend && npm install
cp .env.example .env.local   # fill in real Firebase web-app config
npm run build && npm run lint
npm run dev   # sign in, submit the Trip Planner form, see it land in My Trips
```

**Deferred to later phases (intentionally not built yet):** actual
places/transport/hotel data and the itinerary generator (Phases 5–7, the
shells just say so); editing or deleting a trip; pagination on `GET
/api/trips` (fine at this app's expected scale — a handful of trips per
user); no automated frontend test suite yet (same gap noted in Phase 3,
still deferred to Phase 9).
