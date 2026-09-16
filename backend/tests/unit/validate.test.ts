import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { z, ZodError } from "zod";
import { validate } from "../../src/middleware/validate";

function mockReq(overrides: Partial<Request> = {}): Request {
  return { body: {}, params: {}, query: {}, ...overrides } as Request;
}

describe("validate", () => {
  it("parses and replaces req.body, calling next() with no error", () => {
    const middleware = validate({ body: z.object({ name: z.string() }) });
    const req = mockReq({ body: { name: "Wayfarer" } });
    const next = vi.fn() as NextFunction;

    middleware(req, {} as Response, next);

    expect(req.body).toEqual({ name: "Wayfarer" });
    expect(next).toHaveBeenCalledWith();
  });

  it("applies defaults/coercion from the schema", () => {
    const middleware = validate({ query: z.object({ page: z.coerce.number().default(1) }) });
    const req = mockReq({ query: {} });
    const next = vi.fn() as NextFunction;

    middleware(req, {} as Response, next);

    expect(req.query).toEqual({ page: 1 });
    expect(next).toHaveBeenCalledWith();
  });

  it("forwards a ZodError to next() on invalid body, without throwing", () => {
    const middleware = validate({ body: z.object({ name: z.string() }) });
    const req = mockReq({ body: { name: 123 } });
    const next = vi.fn() as NextFunction;

    expect(() => middleware(req, {} as Response, next)).not.toThrow();
    expect(next).toHaveBeenCalledTimes(1);
    expect((next as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]).toBeInstanceOf(ZodError);
  });

  it("validates params and query together, only touching the schemas provided", () => {
    const middleware = validate({
      params: z.object({ id: z.string().uuid() }),
      query: z.object({ limit: z.coerce.number().default(10) }),
    });
    const id = "123e4567-e89b-12d3-a456-426614174000";
    const req = mockReq({ params: { id }, query: {}, body: { untouched: true } });
    const next = vi.fn() as NextFunction;

    middleware(req, {} as Response, next);

    expect(req.params).toEqual({ id });
    expect(req.query).toEqual({ limit: 10 });
    expect(req.body).toEqual({ untouched: true });
    expect(next).toHaveBeenCalledWith();
  });
});
