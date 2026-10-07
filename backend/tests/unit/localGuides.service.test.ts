import type { Firestore } from "firebase-admin/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeFirestore } from "../helpers/fakeFirestore";

let fakeDb: Firestore;

vi.mock("../../src/config/firebaseAdmin", () => ({ getFirestoreDb: () => fakeDb }));

const { getLocalGuidesForDestination, matchesDestination } = await import(
  "../../src/services/localGuides.service"
);

async function seedGuide(destination: string, name = "Guide"): Promise<void> {
  await fakeDb.collection("localGuides").add({
    name,
    destination,
    languages: ["English"],
    specialty: "City tours",
    bio: null,
    photoUrl: null,
    profileUrl: "https://www.toursbylocals.com/guides/x",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

describe("matchesDestination", () => {
  it("matches exact destinations case-insensitively", () => {
    expect(matchesDestination("Marrakech", "marrakech")).toBe(true);
    expect(matchesDestination("  Kyoto  ", "kyoto")).toBe(true);
  });

  it("matches when the trip destination is more specific than the guide's", () => {
    expect(matchesDestination("Marrakech, Morocco", "Marrakech")).toBe(true);
  });

  it("matches when the guide's destination is more specific than the trip's", () => {
    expect(matchesDestination("Marrakech", "Marrakech Medina")).toBe(true);
  });

  it("does not match unrelated destinations", () => {
    expect(matchesDestination("Paris", "Marrakech")).toBe(false);
  });

  it("does not match on empty strings", () => {
    expect(matchesDestination("", "Marrakech")).toBe(false);
    expect(matchesDestination("Marrakech", "")).toBe(false);
    expect(matchesDestination("", "")).toBe(false);
  });
});

describe("getLocalGuidesForDestination", () => {
  beforeEach(() => {
    fakeDb = createFakeFirestore();
  });

  it("returns only guides matching the destination", async () => {
    await seedGuide("Marrakech", "Amira");
    await seedGuide("Kyoto", "Kenji");

    const guides = await getLocalGuidesForDestination("Marrakech, Morocco");

    expect(guides).toHaveLength(1);
    expect(guides[0]?.name).toBe("Amira");
  });

  it("returns an empty array, not an error, when nothing matches", async () => {
    await seedGuide("Kyoto");

    await expect(getLocalGuidesForDestination("Reykjavik")).resolves.toEqual([]);
  });

  it("returns an empty array when there are no guides at all", async () => {
    await expect(getLocalGuidesForDestination("Paris")).resolves.toEqual([]);
  });

  it("returns multiple matching guides for the same destination", async () => {
    await seedGuide("Marrakech", "Amira");
    await seedGuide("Marrakech", "Youssef");

    const guides = await getLocalGuidesForDestination("Marrakech");

    expect(guides.map((g) => g.name).sort()).toEqual(["Amira", "Youssef"]);
  });
});
