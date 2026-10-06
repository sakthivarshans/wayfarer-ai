import type { Firestore } from "firebase-admin/firestore";

interface FakeDoc {
  id: string;
  data: Record<string, unknown>;
}

/**
 * Implements just the slice of the Firestore Admin SDK our services use
 * (`collection().add()`, `collection().doc(id).get()`,
 * `collection().where(field, "==", value).get()`), backed by an in-memory
 * array per collection. Good enough for unit/integration tests without
 * hitting a real Firestore project.
 */
export function createFakeFirestore(): Firestore {
  const collections = new Map<string, FakeDoc[]>();
  let nextId = 1;

  function docsFor(name: string): FakeDoc[] {
    let docs = collections.get(name);
    if (!docs) {
      docs = [];
      collections.set(name, docs);
    }
    return docs;
  }

  const db = {
    collection(name: string) {
      return {
        add: async (data: Record<string, unknown>) => {
          const id = `fake-${nextId++}`;
          docsFor(name).push({ id, data });
          return { id };
        },
        // Lists every doc in the collection — used by services that scan a
        // whole (small, student-project-scale) collection, e.g. admin
        // analytics and listing all local guides.
        get: async () => {
          const docs = docsFor(name).map((d) => ({ id: d.id, data: () => d.data }));
          return { docs };
        },
        doc: (id: string) => ({
          get: async () => {
            const found = docsFor(name).find((d) => d.id === id);
            return {
              exists: Boolean(found),
              id,
              data: () => found?.data,
            };
          },
          set: async (data: Record<string, unknown>, options?: { merge?: boolean }) => {
            const docs = docsFor(name);
            const existing = docs.find((d) => d.id === id);
            if (existing) {
              existing.data = options?.merge ? { ...existing.data, ...data } : data;
            } else {
              docs.push({ id, data });
            }
          },
          delete: async () => {
            const docs = docsFor(name);
            const index = docs.findIndex((d) => d.id === id);
            if (index !== -1) {
              docs.splice(index, 1);
            }
          },
        }),
        where: (field: string, op: string, value: unknown) => ({
          get: async () => {
            if (op !== "==") {
              throw new Error(`fake firestore only supports '==', got '${op}'`);
            }
            const docs = docsFor(name)
              .filter((d) => d.data[field] === value)
              .map((d) => ({ id: d.id, data: () => d.data }));
            return { docs };
          },
        }),
      };
    },
  };

  return db as unknown as Firestore;
}
