import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../src/utils/apiError";

const verifyIdToken = vi.fn();

vi.mock("../../src/config/firebaseAdmin", () => ({
  getFirebaseAuth: () => ({ verifyIdToken }),
}));

// Imported after the mock so `requireAuth` picks up the mocked module.
const { requireAuth } = await import("../../src/middleware/auth");

function mockReq(headers: Record<string, string> = {}): Request {
  return { headers } as Request;
}

async function flush(): Promise<void> {
  await new Promise((resolve) => setImmediate(resolve));
}

describe("requireAuth", () => {
  beforeEach(() => {
    verifyIdToken.mockReset();
  });

  it("rejects with 401 when the Authorization header is missing", async () => {
    const req = mockReq();
    const next = vi.fn() as NextFunction;

    requireAuth(req, {} as Response, next);
    await flush();

    expect(next).toHaveBeenCalledTimes(1);
    const err = (next as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).statusCode).toBe(401);
  });

  it("rejects with 401 when the header doesn't start with 'Bearer '", async () => {
    const req = mockReq({ authorization: "Token abc123" });
    const next = vi.fn() as NextFunction;

    requireAuth(req, {} as Response, next);
    await flush();

    const err = (next as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).statusCode).toBe(401);
  });

  it("rejects with 401 without leaking details when Firebase verification fails", async () => {
    verifyIdToken.mockRejectedValue(new Error("Firebase internal detail that must not leak"));
    const req = mockReq({ authorization: "Bearer bad-token" });
    const next = vi.fn() as NextFunction;

    requireAuth(req, {} as Response, next);
    await flush();

    const err = (next as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.statusCode).toBe(401);
    expect(err.message).not.toContain("Firebase internal detail");
  });

  it("attaches req.user and calls next() with no error on a valid token", async () => {
    verifyIdToken.mockResolvedValue({ uid: "user-123", email: "traveler@example.com" });
    const req = mockReq({ authorization: "Bearer good-token" });
    const next = vi.fn() as NextFunction;

    requireAuth(req, {} as Response, next);
    await flush();

    expect(req.user).toEqual({ uid: "user-123", email: "traveler@example.com" });
    expect(next).toHaveBeenCalledWith();
    expect(verifyIdToken).toHaveBeenCalledWith("good-token");
  });
});
