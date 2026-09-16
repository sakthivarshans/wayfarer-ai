import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { env } from "./env";

/**
 * Lazily-initialized Firebase client SDK singleton. Only ever call this from
 * client components (inside effects/handlers, not at module top-level of a
 * file that might render on the server) — the Auth SDK depends on browser
 * globals that don't exist during SSR.
 */
let app: FirebaseApp | undefined;
let auth: Auth | undefined;

function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("Firebase client SDK can only be used in the browser.");
  }

  if (app) {
    return app;
  }

  const existing = getApps();
  if (existing[0]) {
    app = existing[0];
    return app;
  }

  app = initializeApp({
    apiKey: env.firebase.apiKey,
    authDomain: env.firebase.authDomain,
    projectId: env.firebase.projectId,
    storageBucket: env.firebase.storageBucket,
    messagingSenderId: env.firebase.messagingSenderId,
    appId: env.firebase.appId,
  });

  return app;
}

export function getFirebaseAuthClient(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}
