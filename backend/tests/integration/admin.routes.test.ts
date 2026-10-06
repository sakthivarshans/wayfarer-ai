import type { Firestore } from "firebase-admin/firestore";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeFirestore } from "../helpers/fakeFirestore";

let fakeDb: Firestore;
const listUsers = vi.fn();

const TOKENS: Record<string, { uid: string; email: string }> = {
  "token-admin": { uid: "admin-uid", email: "admin@example.com" },
  "token-user": { uid: "user-uid", email: "regular@example.com" },
};

vi.mock("../../src/config/firebaseAdmin", () => ({
  getFirestoreDb: () => fakeDb,
  getFirebaseAuth: () => ({
    verifyIdToken: async (token: string) => {
      const decoded = TOKENS[token];
      if (!decoded) {
        throw new Error("invalid token");
      }
      return decoded;
    },
    listUsers,
  }),
}));

const ORIGINAL_ADMIN_EMAILS = process.env.ADMIN_EMAILS;

function authed(token: string) {
  return { Authorization: `Bearer ${token}` };
}

const VALID_GUIDE = {
  name: "Amira Haddad",
  destination: "Marrakech",
  languages: ["Arabic", "French"],
  specialty: "Medina food tours",
  profileUrl: "https://www.toursbylocals.com/guides/amira",
};

describe("admin routes", () => {
  let createApp: () => import("express").Express;

  beforeEach(async () => {
    vi.resetModules();
    process.env.ADMIN_EMAILS = "admin@example.com";
    fakeDb = createFakeFirestore();
    listUsers.mockReset().mockResolvedValue({ users: [], pageToken: undefined });
    ({ createApp } = await import("../../src/app"));
  });

  afterEach(() => {
    if (ORIGINAL_ADMIN_EMAILS === undefined) {
      delete process.env.ADMIN_EMAILS;
    } else {
      process.env.ADMIN_EMAILS = ORIGINAL_ADMIN_EMAILS;
    }
  });

  describe("GET /api/admin/session", () => {
    it("reports isAdmin: true for an admin, without requiring admin access to ask", async () => {
      const res = await request(createApp()).get("/api/admin/session").set(authed("token-admin"));
      expect(res.status).toBe(200);
      expect(res.body.session).toEqual({ isAdmin: true });
    });

    it("reports isAdmin: false for a regular signed-in user (200, not 403)", async () => {
      const res = await request(createApp()).get("/api/admin/session").set(authed("token-user"));
      expect(res.status).toBe(200);
      expect(res.body.session).toEqual({ isAdmin: false });
    });

    it("still requires authentication", async () => {
      const res = await request(createApp()).get("/api/admin/session");
      expect(res.status).toBe(401);
    });
  });

  describe.each([
    ["GET", "/api/admin/analytics"],
    ["GET", "/api/admin/local-guides"],
    ["POST", "/api/admin/local-guides"],
    ["PATCH", "/api/admin/local-guides/some-id"],
    ["DELETE", "/api/admin/local-guides/some-id"],
  ])("%s %s — access control", (method, url) => {
    function issueRequest(app: ReturnType<typeof createApp>) {
      const agent = request(app);
      const verb = method.toLowerCase() as "get" | "post" | "patch" | "delete";
      return agent[verb](url);
    }

    it("returns 403 for a signed-in non-admin user", async () => {
      const res = await issueRequest(createApp()).set(authed("token-user")).send(VALID_GUIDE);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("returns 401 with no Authorization header at all", async () => {
      const res = await issueRequest(createApp()).send(VALID_GUIDE);

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/admin/analytics", () => {
    it("returns the summary for an admin", async () => {
      await request(createApp()).post("/api/trips").set(authed("token-admin")).send({
        origin: "Chennai",
        destination: "Paris",
        budget: 50000,
        days: 4,
        transportModePreference: "flight",
      });

      const res = await request(createApp()).get("/api/admin/analytics").set(authed("token-admin"));

      expect(res.status).toBe(200);
      expect(res.body.analytics.totalTrips).toBe(1);
      expect(res.body.analytics.topDestinations[0]).toMatchObject({ destination: "Paris" });
    });
  });

  describe("local guides CRUD, as an admin", () => {
    it("creates, lists, updates, and deletes a guide end to end", async () => {
      const app = createApp();

      const created = await request(app).post("/api/admin/local-guides").set(authed("token-admin")).send(VALID_GUIDE);
      expect(created.status).toBe(201);
      const guideId = created.body.guide.id;

      const listed = await request(app).get("/api/admin/local-guides").set(authed("token-admin"));
      expect(listed.body.guides).toHaveLength(1);

      const updated = await request(app)
        .patch(`/api/admin/local-guides/${guideId}`)
        .set(authed("token-admin"))
        .send({ specialty: "Rooftop photography tours" });
      expect(updated.status).toBe(200);
      expect(updated.body.guide.specialty).toBe("Rooftop photography tours");

      const deleted = await request(app).delete(`/api/admin/local-guides/${guideId}`).set(authed("token-admin"));
      expect(deleted.status).toBe(204);

      const afterDelete = await request(app).get("/api/admin/local-guides").set(authed("token-admin"));
      expect(afterDelete.body.guides).toHaveLength(0);
    });

    it("rejects an invalid create payload with 400", async () => {
      const res = await request(createApp())
        .post("/api/admin/local-guides")
        .set(authed("token-admin"))
        .send({ name: "", destination: "Marrakech", languages: [], specialty: "x", profileUrl: "not-a-url" });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 404 updating or deleting a guide that doesn't exist", async () => {
      const app = createApp();

      const update = await request(app)
        .patch("/api/admin/local-guides/nope")
        .set(authed("token-admin"))
        .send({ specialty: "X" });
      expect(update.status).toBe(404);

      const del = await request(app).delete("/api/admin/local-guides/nope").set(authed("token-admin"));
      expect(del.status).toBe(404);
    });
  });
});
