import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { env } from "./env";

/**
 * Lazily-initialized Firebase Admin singleton. `firebaseAuth` and `firestore`
 * are only touched by code that actually needs them (auth middleware, and
 * Firestore-backed services in later phases), so the health-check-only test
 * suite never has to provide real credentials.
 */
let app: App | undefined;

function getFirebaseApp(): App {
  if (app) {
    return app;
  }

  const existing = getApps();
  if (existing[0]) {
    app = existing[0];
    return app;
  }

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new Error(
      "Firebase Admin credentials are missing. Set FIREBASE_PROJECT_ID, " +
        "FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY (see .env.example)."
    );
  }

  app = initializeApp({
    credential: cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      // The .env file stores the key with literal "\n" escapes; Firebase
      // needs real newlines.
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });

  return app;
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function getFirestoreDb(): Firestore {
  return getFirestore(getFirebaseApp());
}
