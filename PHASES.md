# Build Phases

Each phase is done in its own chat. This file is the source of truth for
what's shipped, what's next, and what to verify.

| # | Phase | Status |
|---|---|---|
| 1 | Repo scaffolding, config, env docs, Firebase setup guide | ✅ Done |
| 2 | Backend foundation (Express shell, Firebase Admin, auth/error/validation middleware, retry helper) | ✅ Done |
| 3 | Frontend foundation (Next.js shell, Firebase client, auth context, nav, page shells) | ✅ Done |
| 4 | Trips (create/list/fetch + Trip Planner form + My Trips page) | ✅ Done |
| 5 | Places (Geoapify + Overpass/Nominatim fallback) | ✅ Done |
| 6 | Transport & Hotels (deep-link builders) | ✅ Done |
| 7 | Itinerary generation | ✅ Done |
| 8 | Telegram bot (connect/webhook/Groq replies) | ✅ Done |
| 9 | Polish & deployment | ✅ Done |

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

## Phase 5 — Definition of Done

- [x] `backend/src/types/place.ts` — typed `Place`/`PlaceCategory`, with
      `estimatedCost` documented as a heuristic (neither provider exposes
      real pricing on its free tier), not a live price
- [x] `services/places/geocode.provider.ts` — OSM Nominatim geocoding
      (destination string → `{ lat, lng }`), identifying `User-Agent` per
      Nominatim's usage policy, wrapped in `withRetry`
- [x] `services/places/geoapifyPlaces.provider.ts` — Geoapify Places API
      (primary source when `GEOAPIFY_API_KEY` is set), mapped to typed
      `Place[]`, unnamed features skipped
- [x] `services/places/overpassPlaces.provider.ts` — OSM Overpass API
      (fully free, no key), used as the fallback source
- [x] `services/places/estimateCost.ts` — per-category cost heuristic
      (`sights`/`nature`/`religion` → free, `museum`/`entertainment` → a
      rough positive estimate, `other` → `null`/unknown)
- [x] `services/places/rankPlaces.ts` — ranks cheap-first (treating `null`
      as free/unknown, never as expensive) and trims to ~3 places/day,
      capped at 15
- [x] `services/places.service.ts` — orchestrates geocode → Geoapify (if
      configured) → Overpass fallback → rank/trim → Firestore cache (new
      `placeResults` collection, one doc per trip); only throws a 502
      `ApiError` if *both* providers fail; supports a `forceRefresh` option
      for future use
- [x] `GET /api/trips/:id/places` — nested onto the existing `tripsRouter`,
      reusing `requireAuth` and `tripIdParamsSchema`; 404s identically for a
      missing trip or one owned by another user, matching Phase 4's
      ownership-isolation behavior
- [x] Backend tests: unit tests for the cost heuristic, ranking, and all
      three providers (mocking `fetch`, including retry-then-succeed and
      exhausted-retries cases); unit tests for the places service (provider
      fallback, cache hit/miss, `forceRefresh`, both-providers-fail);
      integration tests for the route through the real Express app
      (success, cross-user 404, missing-trip 404, missing auth)
- [x] `tests/helpers/fakeFirestore.ts` extended with `doc(id).set()` so the
      places cache can be tested against the same fake used everywhere else
- [x] Frontend: `src/features/places/` — `Place`/`PlaceCategory` types,
      typed `getPlaces` API call, `usePlaces` hook (same loading/error
      pattern as `useTrips`), `PlaceCard` (category badge using the
      existing `ink.100`/`sky.100` tokens from `docs/DESIGN.md`, cost shown
      as "Free" / "~N est." / "Cost unknown")
- [x] `/trips/:tripId/results/places` — real tab: spinner while loading,
      error card on failure, empty-state card when a destination has no
      matches, otherwise a responsive grid of `PlaceCard`s
- [x] `npm run build` (backend + frontend), `npm test` (58/58 backend),
      `npm run lint` (backend + frontend) all clean

**To verify locally:**
```
# backend
cd backend && npm install && npm run build && npm test && npm run lint

# frontend
cd frontend && npm install
cp .env.example .env.local   # fill in real Firebase web-app config + API URL
npm run build && npm run lint
npm run dev   # open a trip's Results > Places tab, see real nearby places
```
To exercise the Geoapify path specifically, set `GEOAPIFY_API_KEY` in
`backend/.env`; leave it unset to exercise the Overpass-only path (both are
covered by the automated tests either way).

**Deferred to later phases (intentionally not built yet):** a "refresh
places" button in the UI (the service supports `forceRefresh`, just not
wired to anything yet); transport/hotel data (Phase 6); the itinerary
generator (Phase 7); a map view of place pins (nice-to-have, not scoped);
no automated frontend test suite yet (same longstanding gap, still
deferred to Phase 9).

## Phase 6 — Definition of Done

This phase deliberately does **not** integrate a live flights/hotels
pricing API (see the root README: "quick-compare deep links for transport
and hotels — redirect-only booking, no in-app payments"). There is no
real free-tier API that returns live flight/train/bus/hotel prices
without a card or a lengthy approval process, and fabricating price
numbers would be actively misleading. Instead, this phase builds:
comparison-ready deep links straight to each provider's own search
results (where real pricing lives), plus one piece of real, free data —
an OSRM road-distance/duration estimate — for context.

- [x] `backend/src/types/transport.ts` / `types/hotel.ts` — typed
      `TransportOption`/`TransportSummary` and `HotelOption`/`HotelSummary`
- [x] `services/transport/deepLinks.ts` — pure builders for
      flight (Google Flights), train (Google Maps transit directions), and
      bus (Rome2Rio, a keyless global aggregator); orders options with the
      trip's `transportModePreference` first and marks it `recommended`
      (no reordering for `"any"`)
- [x] `services/hotels/deepLinks.ts` — pure builders for Booking.com,
      Google Hotels, and Hostelworld searches, keyed only on destination
      (trips don't carry travel dates, so dates are picked on the
      provider's own site)
- [x] `services/transport/osrmRoute.provider.ts` — real road
      distance/duration between origin and destination via OSRM's public
      demo server; explicitly documented as a driving-route estimate for
      context, not a substitute for real train/bus/flight schedules
- [x] `services/transport.service.ts` — geocodes origin+destination
      (reusing Phase 5's Nominatim provider), calls OSRM, builds the deep
      links, and caches the summary in a new `transportResults` Firestore
      collection (one doc per trip); OSRM/geocoding failures degrade to
      `distanceKm`/`drivingDurationMinutes: null` rather than failing the
      whole request — the deep links never depend on OSRM succeeding
- [x] `services/hotels.service.ts` — pure computation (per-night budget
      hint = `budget / days`, plus the deep links); no external call, so
      no cache needed, unlike places/transport
- [x] `GET /api/trips/:id/transport` and `GET /api/trips/:id/hotels` —
      nested onto the existing `tripsRouter`, same auth/ownership/404
      behavior as Phase 5's places route
- [x] `OSRM_BASE_URL` documented as an optional env var (defaults to
      OSRM's public demo server; swappable for a self-hosted instance
      later if the demo server's fair-use limits bite)
- [x] Backend tests: unit tests for both deep-link builders (encoding,
      preference ordering), the OSRM provider (unit conversion, retry,
      no-route error), and both services (fallback/degrade behavior,
      Firestore cache hit/miss/forceRefresh for transport); integration
      tests for both routes through the real Express app (success,
      cross-user 404, missing auth)
- [x] Frontend: `src/features/transport/` and `src/features/hotels/` —
      typed API calls, `useTransport`/`useHotels` hooks (same
      loading/error pattern as `usePlaces`), `TransportOptionCard` (mode +
      provider + a "Your preference" badge) and `HotelOptionCard`, each
      with an "Open" link to the deep link (`target="_blank"`)
- [x] `/trips/:tripId/results/transport` — real tab: optional
      distance/duration context line (only shown when OSRM succeeded),
      then a grid of transport option cards, preferred mode first
- [x] `/trips/:tripId/results/hotels` — real tab: a per-night budget hint
      line, then a grid of hotel provider cards
- [x] `npm run build` (backend + frontend), `npm test` (79/79 backend),
      `npm run lint` (backend + frontend) all clean

**To verify locally:**
```
# backend
cd backend && npm install && npm run build && npm test && npm run lint

# frontend
cd frontend && npm install
cp .env.example .env.local   # fill in real Firebase web-app config + API URL
npm run build && npm run lint
npm run dev   # open a trip's Results > Transport and > Hotels tabs
```
The distance/duration line on the Transport tab depends on reaching
OSRM's public demo server from the backend; if it's unreachable the tab
still renders correctly (just without that line) — this is covered by an
automated test, not just manual observation.

**Deferred to later phases (intentionally not built yet):** live
flight/train/bus/hotel pricing (no viable free-tier API exists for this;
revisit only if/when moving to a paid provider like Amadeus, out of
scope for this project's zero-cost goal); a "refresh transport" button in
the UI (the service supports `forceRefresh`, not wired to a control yet);
the itinerary generator, which will consume these options (Phase 7); no
automated frontend test suite yet (same longstanding gap, still deferred
to Phase 9).

## Phase 7 — Definition of Done

Neither the Transport nor Hotels tab has a real per-item selection —
Phase 6 deliberately only builds provider-level deep links (a mode, e.g.
"Flight" via Google Flights; a provider, e.g. "Booking.com"), never
priced individual flights or hotels, so there was nothing to add a
"select" action onto. Rather than inventing priced entities that don't
exist in this app's data model, the itinerary's "chosen transport" and
"chosen hotel" are derived deterministically from data that already
exists: the first option in each summary's existing order (transport
options are already sorted with the trip's `transportModePreference`
first; hotels default to the first provider listed, Booking.com). This
means generating an itinerary needs no new input at all — it's a pure
function of the trip's existing places/transport/hotels data — so
"regenerate" is simply calling generate again.

- [x] `backend/src/types/itinerary.ts` — typed `Itinerary` /
      `ItineraryDay` / `ItineraryActivity` (`arrival` / `checkin` /
      `place` / `free` / `departure`)
- [x] `services/itinerary/build.ts` — pure, deterministic builder:
      `buildDayPlans` opens day 1 with arrival + hotel check-in, closes
      the last day with departure, and distributes the trip's
      already-ranked places (Phase 5) round-robin across days starting
      on day 1; any day with no place landed on it (only possible when
      there are fewer places than days) gets a "free time" filler
      instead of being left empty; `chooseTransport`/`chooseHotel` pick
      the first option from each summary (see rationale above)
- [x] `services/itinerary.service.ts` — `generateItineraryForTrip` calls
      the existing Phase 5/6 services (`getPlacesForTrip`,
      `getTransportForTrip`, `getHotelsForTrip`) in parallel, builds the
      itinerary, and persists it to a new `itineraries` Firestore
      collection (one doc per trip), overwriting any previous version;
      `getItineraryForTrip` only ever reads the cache — it never
      generates one implicitly
- [x] `POST /api/trips/:id/itinerary/generate` and
      `GET /api/trips/:id/itinerary` — nested onto the existing
      `tripsRouter`, same auth/ownership/404 behavior as Phases 5–6; GET
      returns a 404 (not an auto-generated itinerary) when nothing has
      been generated yet, so the frontend knows to show a "Generate"
      prompt instead of treating it as a failure
- [x] Backend tests: unit tests for the pure builder (day distribution,
      round-robin wraparound, free-time filler, single-day trips, chosen
      transport/hotel), unit tests for the service (orchestration,
      cache hit, regenerate-overwrites-cache), integration tests for
      both routes through the real Express app (generate + fetch
      round-trip, 404 before generation, cross-user 404, missing trip
      404, missing auth)
- [x] Frontend: `src/features/itinerary/` — types mirroring the backend
      shape, typed `getItinerary`/`generateItinerary` API calls,
      `useItinerary` hook (treats a 404 from GET as "not generated yet,"
      not an error state, and exposes a separate `generating`/
      `generateError` pair for the generate action), `ItineraryDayCard`
      (day timeline with per-activity-type markers), `ItinerarySummaryCard`
      (chosen transport + hotel with their deep links, shown at the top)
- [x] `/trips/:tripId/itinerary` — real page: spinner while loading, a
      "Generate itinerary" prompt when none exists yet, the day-by-day
      timeline plus a "Regenerate" control once one does
- [x] `npm run build` (backend + frontend), `npm test` (96/96 backend),
      `npm run lint` (backend + frontend) all clean

**To verify locally:**
```
# backend
cd backend && npm install && npm run build && npm test && npm run lint

# frontend
cd frontend && npm install
cp .env.example .env.local   # fill in real Firebase web-app config + API URL
npm run build && npm run lint
npm run dev   # open a trip's Itinerary tab, click "Generate itinerary"
```

**Deferred to later phases (intentionally not built yet):** a real
per-item "select this flight/hotel" feature (would require inventing
priced entities the app's data model doesn't have — revisit only if/when
moving to a paid provider like Amadeus, same call as Phase 6); the
Telegram bot, which will read this saved itinerary to answer questions
(Phase 8); no automated frontend test suite yet (same longstanding gap,
still deferred to Phase 9).

## Phase 8 — Definition of Done

**Data model:** a new `users` Firestore collection, one doc per Firebase
uid, holding the AES-256-GCM-encrypted bot token, a random per-user
webhook secret, the connected bot's username, an optional Telegram
`chatId` (learned the first time the user messages their bot), and a
connected-at timestamp. Nothing here is ever sent to the frontend as-is —
the public shape (`connected`, `botUsername`, `connectedAt`) is a
separate type, and the raw token/secret never leave the backend.

**Auth model for the webhook:** Telegram calls
`POST /api/telegram/webhook/:userId/:webhookSecret` directly and can't
send a Firebase bearer token, so this route is deliberately *not* behind
`requireAuth` — the random `webhookSecret` baked into the registered
webhook URL is the auth mechanism instead, checked against the stored
value inside the service. A wrong/unknown pair gets a 404 either way (never
reveals whether a `userId` exists). The authenticated connect/status
endpoints live on a new top-level `/api/users` router instead, since
they're user-scoped settings, not trip-scoped.

- [x] `types/telegram.ts`, `schemas/telegram.schemas.ts` — stored config
      vs. public status kept as separate types; the webhook body schema is
      deliberately loose (`.passthrough()`) since Telegram sends several
      update types we don't care about and a validation failure would just
      make Telegram retry the webhook forever
- [x] `utils/tokenCipher.ts` — AES-256-GCM `encryptSecret`/`decryptSecret`
      keyed off `TOKEN_ENCRYPTION_KEY` (32-byte hex); a missing/wrong-length
      key or tampered ciphertext throws a clear internal error rather than
      silently returning garbage
- [x] `services/telegram/api.provider.ts` — thin Telegram Bot API wrapper
      (`getMe`, `setWebhook`, `sendMessage`) on `withRetry`, same
      429/5xx-retry pattern as every other external provider
- [x] `services/ai/groq.provider.ts` — Groq (OpenAI-compatible) chat
      completions wrapper; model defaults to `llama-3.3-70b-versatile`
      (Groq's standard general-purpose production model, free tier) and is
      overridable via `GROQ_MODEL` in case Groq retires/renames it;
      `services/ai/buildItineraryPrompt.ts` is a pure, separately-tested
      function turning a trip + itinerary + question into the actual
      messages sent, kept apart from the network call on purpose
- [x] `services/telegram.service.ts` — `connectTelegramBot` (validate via
      `getMe`, generate a webhook secret, register it with Telegram,
      encrypt + persist; an invalid token becomes a 400, a Telegram outage
      becomes a 502, no `TELEGRAM_WEBHOOK_BASE_URL` becomes a 500);
      `getTelegramStatus`; `handleIncomingWebhook` (verifies the
      userId/secret pair, ignores non-text updates, looks up the user's
      most recent trip via the existing `listTripsForUser` and its saved
      itinerary via Phase 7's `getItineraryForTrip` — never generates one
      on the bot's behalf, it tells the user to do that in the app first —
      then answers via Groq and replies through Telegram). Reconnecting
      (e.g. to fix a mistyped token) fully overwrites the previous config,
      including dropping any previously-learned `chatId`, since a new
      connection needs a fresh first message to learn it again
- [x] Any failure past the auth check (Groq down, Telegram send failing)
      is caught inside the service and turned into a friendly message sent
      to the user's chat, then the webhook still returns 200 — so Telegram
      never retries a webhook call that already "succeeded" from its point
      of view
- [x] `POST /api/users/me/telegram`, `GET /api/users/me/telegram`
      (authenticated) and `POST /api/telegram/webhook/:userId/:webhookSecret`
      (public) — mounted via two new routers in `routes/index.ts`
- [x] Backend tests: unit tests for the token cipher, both HTTP providers
      (success, non-retryable failure, retry-then-succeed), the pure
      prompt builder, and the full service (connect success/failure paths,
      status, and every webhook branch: unknown user, wrong secret,
      non-text update, no trips yet, no itinerary yet, Groq failure
      fallback, happy path); integration tests for both route groups
      through the real Express app (connect → status round-trip, token
      never leaked in the response, validation, missing auth, webhook
      auth failures, end-to-end text-message handling, confirming the
      webhook route needs no Authorization header)
- [x] Frontend: `src/features/telegram/` — status type, typed
      `getTelegramStatus`/`connectTelegram` API calls, `useTelegramConnection`
      hook (separate `loading`/`error` for the initial status fetch vs.
      `connecting`/`connectError` for the connect action)
- [x] `/telegram` — real page: BotFather setup instructions, a token input
      + Connect button, a "Connected to @botname" summary once connected,
      and a reconnect flow that reuses the same form
- [x] `.env.example` documents the new optional `GROQ_MODEL` override
- [x] `npm run build` (backend + frontend), `npm test` (137/137 backend),
      `npm run lint` (backend + frontend) all clean

**To verify locally:**
```
# backend
cd backend && npm install && npm run build && npm test && npm run lint

# frontend
cd frontend && npm install
cp .env.example .env.local   # fill in real Firebase web-app config + API URL
npm run build && npm run lint
npm run dev   # open /telegram, paste a real BotFather token, click Connect,
               # then message your bot on Telegram and ask about your trip
```

**Deferred to later phases (intentionally not built yet):** a disconnect/
revoke-bot action (reconnecting with a new token already supersedes the
old webhook registration, so this wasn't scoped — revisit if it turns out
to matter in practice); proactively messaging the user (e.g. day-of
reminders) — `chatId` is captured for this but nothing sends unprompted
messages yet; no automated frontend test suite yet (same longstanding gap,
now deferred to Phase 9, which is also everything else — error handling
review, rate-limit/backoff polish, My Trips-list decision, deployment
verification, and the final README).

## Phase 9 — Definition of Done

An audit of every prior phase's deferred items, done before writing any
code, found most of the original Polish-phase scope was already satisfied
in practice — the real gaps were narrower than the phase name suggests:

- **Error handling & loading/error states** — already consistent
  everywhere: one `errorHandler` middleware turns every error into
  `{ error: { code, message, details? } }`, every route validates input
  with zod, and every frontend tab already has its own loading spinner +
  error card (built phase-by-phase, not something Phase 9 needed to add).
  No changes made here beyond confirming it during the audit.
- **Rate-limit/backoff on external calls** — already done: `withRetry`
  (exponential backoff on 429/5xx) is used in *every* provider
  (Geoapify/Overpass/Nominatim/OSRM/Telegram/Groq) — confirmed via `grep
  -rL withRetry` across every `*.provider.ts` returning nothing. No
  changes needed.
- **"My Trips" + login decision** — already resolved in Phase 2–4: real
  Firebase Authentication (not local-storage sessions) and a fully
  functional `/trips` list page. Nothing left to decide or build.
- **Frontend automated test suite** — the one genuine, substantial gap,
  flagged as deferred in every phase's DoD since Phase 3. Added:
  - `vitest` + `jsdom` + `@testing-library/react` +
    `@testing-library/jest-dom` + `@testing-library/user-event`,
    `vitest.config.ts` (esbuild's automatic JSX transform instead of
    `@vitejs/plugin-react`, which pulled in an ESM/CJS version mismatch
    with this vitest version), `tests/setup.ts` (jest-dom matchers +
    RTL `cleanup()` between tests, since this repo doesn't use vitest's
    `globals: true` — matches the backend's explicit-import convention),
    mirroring the backend's top-level `tests/unit/` layout
  - `apiClient.test.ts` — success, error-shape parsing, network failure,
    204 handling, auth header attachment (8 tests)
  - `TripCard.test.tsx`, `ItineraryDayCard.test.tsx` — presentational
    component rendering (8 tests)
  - `useTelegramConnection.test.ts`, `useItinerary.test.ts` — hook state
    machines with mocked `AuthContext`/API modules, including the
    404-means-not-generated-yet branch in `useItinerary` (8 tests)
  - Not an attempt at full coverage of every component — the backend
    already thoroughly tests all business logic; these validate the
    client-side glue (fetch/error handling, rendering, hook state) that
    had zero coverage before
- **Settings page** — removed a stale "Preferences & saved API keys"
  placeholder describing scope that doesn't exist in this app (all
  provider keys are backend env vars; the one user-supplied credential,
  the Telegram bot token, already has its own `/telegram` page). Replaced
  with a real "Connections" card linking there. Deleted the now-unused
  `ComingSoonCard` component.
- **Deployment finalization** — `backend/render.yaml` was missing the
  `GROQ_MODEL` env var; added. Root `README.md`'s Deployment section
  rewritten from "finalized in a later phase" into a concrete, ordered
  checklist (Firebase → Render → set `TELEGRAM_WEBHOOK_BASE_URL` →
  Vercel → set `CORS_ORIGIN` → connect a bot), since the two backend env
  vars each depend on a URL the other deployment step produces. Added a
  root **Features** section and a **Testing** section covering both
  suites.
- **`docs/FIREBASE_SETUP.md`** — corrected a stale forward-reference to
  writing Firestore security rules "in the Trips phase." That never
  happened and turns out not to be needed: the frontend never touches
  Firestore directly (confirmed via `grep -rl firestore frontend/src` —
  only Firebase *Auth* is used client-side), so the console's default
  deny-all rules are correct and final for this architecture, not a
  placeholder.
- Both READMEs' route/page lists updated to reflect every route/page
  actually built (they still described Phase 1/4-era state).
- [x] `npm run build`, `npm test` (3 runs each, no flakiness), and
      `npm run lint` all clean on **both** apps at the final commit —
      backend 137/137 tests, frontend 24/24 tests (net new this phase)

**To verify locally:**
```
# backend
cd backend && npm install && npm run build && npm test && npm run lint

# frontend
cd frontend && npm install
cp .env.example .env.local   # fill in real Firebase web-app config + API URL
npm run build && npm test && npm run lint
```

**Deferred (still, intentionally):** a disconnect/revoke-bot action and
proactive Telegram messaging (same reasoning as Phase 8); a real
per-item flight/hotel selection (same reasoning as Phase 7); production
observability (structured logs already exist via `pino`, but no
external log aggregation/alerting — reasonable to add only once this
moves past a student project). Nothing else remains unbuilt against the
original PRD's redirect-booking, zero-cost scope.
