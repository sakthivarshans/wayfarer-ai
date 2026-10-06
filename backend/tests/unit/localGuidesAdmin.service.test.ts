import type { Firestore } from "firebase-admin/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeFirestore } from "../helpers/fakeFirestore";

let fakeDb: Firestore;

vi.mock("../../src/config/firebaseAdmin", () => ({ getFirestoreDb: () => fakeDb }));

const { createGuide, deleteGuide, listGuides, updateGuide } = await import(
  "../../src/services/admin/localGuides.service"
);

const VALID_INPUT = {
  name: "Amira Haddad",
  destination: "Marrakech",
  languages: ["Arabic", "French", "English"],
  specialty: "Medina food tours",
  profileUrl: "https://www.toursbylocals.com/guides/amira",
};

describe("localGuides.service", () => {
  beforeEach(() => {
    fakeDb = createFakeFirestore();
  });

  it("creates a guide with timestamps and null defaults for optional fields", async () => {
    const guide = await createGuide(VALID_INPUT);

    expect(guide).toMatchObject({ name: "Amira Haddad", destination: "Marrakech", bio: null, photoUrl: null });
    expect(guide.id).toBeTruthy();
    expect(guide.createdAt).toBe(guide.updatedAt);
  });

  it("preserves bio and photoUrl when provided", async () => {
    const guide = await createGuide({ ...VALID_INPUT, bio: "Grew up in the medina.", photoUrl: "https://example.com/a.jpg" });

    expect(guide.bio).toBe("Grew up in the medina.");
    expect(guide.photoUrl).toBe("https://example.com/a.jpg");
  });

  it("lists every created guide, newest first", async () => {
    const first = await createGuide(VALID_INPUT);
    await new Promise((r) => setTimeout(r, 2));
    const second = await createGuide({ ...VALID_INPUT, name: "Second Guide" });

    const guides = await listGuides();

    expect(guides.map((g) => g.id)).toEqual([second.id, first.id]);
  });

  it("updates only the given fields, leaving the rest untouched", async () => {
    const guide = await createGuide(VALID_INPUT);

    const updated = await updateGuide(guide.id, { specialty: "Rooftop photography tours" });

    expect(updated?.specialty).toBe("Rooftop photography tours");
    expect(updated?.name).toBe(VALID_INPUT.name);
    expect(updated?.destination).toBe(VALID_INPUT.destination);
  });

  it("bumps updatedAt (but not createdAt) on update", async () => {
    const guide = await createGuide(VALID_INPUT);
    await new Promise((r) => setTimeout(r, 2));

    const updated = await updateGuide(guide.id, { specialty: "New specialty" });

    expect(updated?.createdAt).toBe(guide.createdAt);
    expect(updated?.updatedAt).not.toBe(guide.createdAt);
  });

  it("returns null when updating a guide that doesn't exist", async () => {
    expect(await updateGuide("does-not-exist", { specialty: "X" })).toBeNull();
  });

  it("deletes a guide and returns true, then returns false on a repeat delete", async () => {
    const guide = await createGuide(VALID_INPUT);

    expect(await deleteGuide(guide.id)).toBe(true);
    expect(await listGuides()).toHaveLength(0);
    expect(await deleteGuide(guide.id)).toBe(false);
  });

  it("returns false when deleting a guide that never existed", async () => {
    expect(await deleteGuide("never-existed")).toBe(false);
  });
});
