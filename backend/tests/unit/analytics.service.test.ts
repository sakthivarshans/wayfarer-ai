import type { Firestore } from "firebase-admin/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeFirestore } from "../helpers/fakeFirestore";

let fakeDb: Firestore;
const listUsers = vi.fn();

vi.mock("../../src/config/firebaseAdmin", () => ({
  getFirestoreDb: () => fakeDb,
  getFirebaseAuth: () => ({ listUsers }),
}));

const { getAnalyticsSummary } = await import("../../src/services/admin/analytics.service");

async function seedTrip(destination: string): Promise<void> {
  await fakeDb.collection("trips").add({
    userId: "u1",
    origin: "Chennai",
    destination,
    budget: 1000,
    days: 3,
    transportModePreference: "flight",
    createdAt: new Date().toISOString(),
  });
}

describe("analytics.service", () => {
  beforeEach(() => {
    fakeDb = createFakeFirestore();
    listUsers.mockReset();
  });

  it("returns zero counts when there's no data", async () => {
    listUsers.mockResolvedValue({ users: [], pageToken: undefined });

    const result = await getAnalyticsSummary();

    expect(result).toEqual({ totalUsers: 0, totalTrips: 0, topDestinations: [] });
  });

  it("counts total trips and users", async () => {
    listUsers.mockResolvedValue({ users: [{ uid: "a" }, { uid: "b" }, { uid: "c" }], pageToken: undefined });
    await seedTrip("Paris");
    await seedTrip("Tokyo");

    const result = await getAnalyticsSummary();

    expect(result.totalUsers).toBe(3);
    expect(result.totalTrips).toBe(2);
  });

  it("paginates through Firebase Auth's user list", async () => {
    listUsers
      .mockResolvedValueOnce({ users: Array.from({ length: 1000 }, (_, i) => ({ uid: `u${i}` })), pageToken: "next" })
      .mockResolvedValueOnce({ users: [{ uid: "last" }], pageToken: undefined });

    const result = await getAnalyticsSummary();

    expect(result.totalUsers).toBe(1001);
    expect(listUsers).toHaveBeenCalledTimes(2);
  });

  it("ranks destinations by trip count, most-planned first", async () => {
    listUsers.mockResolvedValue({ users: [], pageToken: undefined });
    await seedTrip("Paris");
    await seedTrip("Paris");
    await seedTrip("Tokyo");
    await seedTrip("Goa");

    const result = await getAnalyticsSummary();

    expect(result.topDestinations[0]).toMatchObject({ destination: "Paris", count: 2 });
    expect(result.topDestinations.map((d) => d.destination)).toEqual(expect.arrayContaining(["Tokyo", "Goa"]));
  });

  it("merges destinations case-insensitively, keeping the first-seen casing", async () => {
    listUsers.mockResolvedValue({ users: [], pageToken: undefined });
    await seedTrip("paris");
    await seedTrip("Paris");
    await seedTrip("PARIS");

    const result = await getAnalyticsSummary();

    expect(result.topDestinations).toHaveLength(1);
    expect(result.topDestinations[0]).toMatchObject({ destination: "paris", count: 3 });
  });

  it("caps the top-destinations list at 10 and ignores blank destinations", async () => {
    listUsers.mockResolvedValue({ users: [], pageToken: undefined });
    for (let i = 0; i < 12; i++) {
      await seedTrip(`City${i}`);
    }
    await seedTrip("   ");

    const result = await getAnalyticsSummary();

    expect(result.totalTrips).toBe(13);
    expect(result.topDestinations).toHaveLength(10);
  });
});
