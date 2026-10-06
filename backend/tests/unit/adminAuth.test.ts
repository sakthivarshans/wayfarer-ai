import type { NextFunction, Request, Response } from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const originalAdminEmails = process.env.ADMIN_EMAILS;

async function withAdminEmails<T>(value: string | undefined, run: () => Promise<T>): Promise<T> {
  vi.resetModules();
  if (value === undefined) {
    delete process.env.ADMIN_EMAILS;
  } else {
    process.env.ADMIN_EMAILS = value;
  }
  return run();
}

afterEach(() => {
  if (originalAdminEmails === undefined) {
    delete process.env.ADMIN_EMAILS;
  } else {
    process.env.ADMIN_EMAILS = originalAdminEmails;
  }
  vi.resetModules();
});

describe("isAdminEmail", () => {
  it("matches an email on the allowlist case-insensitively", async () => {
    await withAdminEmails("admin@example.com, second@example.com", async () => {
      const { isAdminEmail } = await import("../../src/middleware/adminAuth");
      expect(isAdminEmail("Admin@Example.com")).toBe(true);
      expect(isAdminEmail("second@example.com")).toBe(true);
    });
  });

  it("rejects an email not on the allowlist", async () => {
    await withAdminEmails("admin@example.com", async () => {
      const { isAdminEmail } = await import("../../src/middleware/adminAuth");
      expect(isAdminEmail("nobody@example.com")).toBe(false);
    });
  });

  it("rejects everybody — not everybody — when ADMIN_EMAILS is unset", async () => {
    await withAdminEmails(undefined, async () => {
      const { isAdminEmail } = await import("../../src/middleware/adminAuth");
      expect(isAdminEmail("admin@example.com")).toBe(false);
      expect(isAdminEmail("anyone@example.com")).toBe(false);
    });
  });

  it("rejects null/undefined/empty email without throwing", async () => {
    await withAdminEmails("admin@example.com", async () => {
      const { isAdminEmail } = await import("../../src/middleware/adminAuth");
      expect(isAdminEmail(null)).toBe(false);
      expect(isAdminEmail(undefined)).toBe(false);
      expect(isAdminEmail("")).toBe(false);
    });
  });

  it("ignores stray whitespace in the configured list", async () => {
    await withAdminEmails("  admin@example.com  ,second@example.com", async () => {
      const { isAdminEmail } = await import("../../src/middleware/adminAuth");
      expect(isAdminEmail("admin@example.com")).toBe(true);
      expect(isAdminEmail("second@example.com")).toBe(true);
    });
  });
});

describe("requireAdmin", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("calls next() for an admin user", async () => {
    await withAdminEmails("admin@example.com", async () => {
      const { requireAdmin } = await import("../../src/middleware/adminAuth");
      const req = { user: { uid: "u1", email: "admin@example.com" } } as unknown as Request;
      const next = vi.fn() as NextFunction;

      requireAdmin(req, {} as Response, next);

      expect(next).toHaveBeenCalledWith();
    });
  });

  it("throws a 403 ApiError for a signed-in non-admin user", async () => {
    await withAdminEmails("admin@example.com", async () => {
      const { requireAdmin } = await import("../../src/middleware/adminAuth");
      const req = { user: { uid: "u2", email: "someone-else@example.com" } } as unknown as Request;

      expect(() => requireAdmin(req, {} as Response, vi.fn() as NextFunction)).toThrowError(
        expect.objectContaining({ statusCode: 403 })
      );
    });
  });

  it("throws a 401 (not a 403) when there's no authenticated user at all", async () => {
    await withAdminEmails("admin@example.com", async () => {
      const { requireAdmin } = await import("../../src/middleware/adminAuth");
      const req = {} as unknown as Request;

      expect(() => requireAdmin(req, {} as Response, vi.fn() as NextFunction)).toThrowError(
        expect.objectContaining({ statusCode: 401 })
      );
    });
  });

  it("never grants access when ADMIN_EMAILS is unset, even to a user whose email happens to be empty-matching", async () => {
    await withAdminEmails(undefined, async () => {
      const { requireAdmin } = await import("../../src/middleware/adminAuth");
      const req = { user: { uid: "u3", email: "" } } as unknown as Request;

      expect(() => requireAdmin(req, {} as Response, vi.fn() as NextFunction)).toThrowError(
        expect.objectContaining({ statusCode: 403 })
      );
    });
  });
});
