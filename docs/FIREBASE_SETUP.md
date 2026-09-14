# Firebase Setup

Console steps only — no code. Do this once per environment (you can reuse
one Firebase project for local dev and production, or make a second project
later for production; a single project is fine for a student project).

## 1. Create the project

1. Go to https://console.firebase.google.com/ → **Add project**.
2. Name it (e.g. `wayfarer-ai`). Google Analytics is optional — skip it.

## 2. Enable Authentication

1. In the left sidebar: **Build → Authentication → Get started**.
2. Under **Sign-in method**, enable **Email/Password**.

## 3. Enable Firestore

1. **Build → Firestore Database → Create database**.
2. Start in **production mode** (we'll write real security rules in the
   Trips phase — production mode just means "deny by default" until then).
3. Pick a region close to where most users will be.

## 4. Get the frontend (client) config

1. **Project settings** (gear icon) → scroll to **Your apps** → **Web** (`</>`).
2. Register an app (nickname doesn't matter, no hosting needed).
3. Copy the `firebaseConfig` values into `frontend/.env.local` as the
   `NEXT_PUBLIC_FIREBASE_*` variables. These are safe to expose to the
   browser — Firebase security comes from Firestore/Auth rules, not from
   hiding this config.

## 5. Get the backend (Admin SDK) credentials

1. **Project settings → Service accounts → Generate new private key**.
2. This downloads a JSON file. From it, copy into `backend/.env`:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` sequences exactly
     as they appear in the JSON — don't reformat into real newlines)
3. **Never commit this JSON file or its contents.** Delete the downloaded
   file once you've copied the values into your `.env`.

## 6. Firestore security rules (placeholder for now)

Real per-user rules (a user can only read/write their own `trips` and
`itineraries` documents) are written in the Trips phase, once the data
model's access patterns are finalized. Until then, the console's default
production-mode rules (deny all client access) are fine — all access in
this phase goes through the backend using the Admin SDK, which bypasses
security rules entirely.
