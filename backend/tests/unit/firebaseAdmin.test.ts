import { describe, expect, it } from "vitest";
import { getFirebaseAuth, getFirestoreDb } from "../../src/config/firebaseAdmin";

// In the test environment, env.ts intentionally does not require
// FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY (see the superRefine in
// src/config/env.ts), so these should stay unset here and we can assert
// the clear, actionable error instead of a confusing Firebase SDK crash.
describe("firebaseAdmin", () => {
  it("throws a clear error from getFirebaseAuth when credentials are missing", () => {
    expect(() => getFirebaseAuth()).toThrow(/Firebase Admin credentials are missing/);
  });

  it("throws a clear error from getFirestoreDb when credentials are missing", () => {
    expect(() => getFirestoreDb()).toThrow(/Firebase Admin credentials are missing/);
  });
});
