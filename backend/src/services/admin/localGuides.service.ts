import type { Firestore } from "firebase-admin/firestore";
import { getFirestoreDb } from "../../config/firebaseAdmin";
import type { LocalGuide } from "../../types/admin";
import type { createLocalGuideSchema, updateLocalGuideSchema } from "../../schemas/admin.schemas";
import type { z } from "zod";

const COLLECTION = "localGuides";

type CreateInput = z.infer<typeof createLocalGuideSchema>;
type UpdateInput = z.infer<typeof updateLocalGuideSchema>;

function docToGuide(id: string, data: Record<string, unknown>): LocalGuide {
  return {
    id,
    name: String(data.name),
    destination: String(data.destination),
    languages: Array.isArray(data.languages) ? data.languages.map(String) : [],
    specialty: String(data.specialty),
    bio: typeof data.bio === "string" ? data.bio : null,
    photoUrl: typeof data.photoUrl === "string" ? data.photoUrl : null,
    profileUrl: String(data.profileUrl),
    createdAt: String(data.createdAt),
    updatedAt: String(data.updatedAt),
  };
}

export async function createGuide(input: CreateInput): Promise<LocalGuide> {
  const db: Firestore = getFirestoreDb();
  const now = new Date().toISOString();
  const record = { ...input, bio: input.bio ?? null, photoUrl: input.photoUrl ?? null, createdAt: now, updatedAt: now };

  const ref = await db.collection(COLLECTION).add(record);
  return docToGuide(ref.id, record);
}

/**
 * Sorted in memory, same reasoning as `trips.service.ts`: at this app's
 * scale, avoiding an `orderBy` means avoiding a composite-index setup step
 * in the Firebase console.
 */
export async function listGuides(): Promise<LocalGuide[]> {
  const db: Firestore = getFirestoreDb();
  const snapshot = await db.collection(COLLECTION).get();
  const guides = snapshot.docs.map((doc) => docToGuide(doc.id, doc.data()));
  return guides.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Returns null if the guide doesn't exist, rather than throwing — the controller turns that into a 404. */
export async function updateGuide(id: string, input: UpdateInput): Promise<LocalGuide | null> {
  const db: Firestore = getFirestoreDb();
  const ref = db.collection(COLLECTION).doc(id);
  const existing = await ref.get();

  if (!existing.exists) {
    return null;
  }

  const updatedAt = new Date().toISOString();
  await ref.set({ ...input, updatedAt }, { merge: true });

  const updated = await ref.get();
  return docToGuide(updated.id, updated.data() ?? {});
}

/** Returns false if the guide didn't exist, true if it was deleted. */
export async function deleteGuide(id: string): Promise<boolean> {
  const db: Firestore = getFirestoreDb();
  const ref = db.collection(COLLECTION).doc(id);
  const existing = await ref.get();

  if (!existing.exists) {
    return false;
  }

  await ref.delete();
  return true;
}
