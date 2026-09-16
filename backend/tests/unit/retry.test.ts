import { describe, expect, it, vi } from "vitest";
import { withRetry } from "../../src/utils/retry";

function httpError(status: number): Error & { status: number } {
  const err = new Error(`HTTP ${status}`) as Error & { status: number };
  err.status = status;
  return err;
}

describe("withRetry", () => {
  it("returns the result on the first successful attempt without retrying", async () => {
    const fn = vi.fn().mockResolvedValue("ok");

    const result = await withRetry(fn, { baseDelayMs: 1 });

    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on a 503 and succeeds on a later attempt", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(httpError(503))
      .mockRejectedValueOnce(httpError(429))
      .mockResolvedValueOnce("recovered");

    const result = await withRetry(fn, { attempts: 3, baseDelayMs: 1 });

    expect(result).toBe("recovered");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("throws the last error once attempts are exhausted", async () => {
    const err = httpError(500);
    const fn = vi.fn().mockRejectedValue(err);

    await expect(withRetry(fn, { attempts: 2, baseDelayMs: 1 })).rejects.toThrow("HTTP 500");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("does not retry when shouldRetry returns false, e.g. for a 400", async () => {
    const err = httpError(400);
    const fn = vi.fn().mockRejectedValue(err);

    await expect(withRetry(fn, { attempts: 3, baseDelayMs: 1 })).rejects.toThrow("HTTP 400");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries transport-level errors with no HTTP status", async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error("ECONNRESET")).mockResolvedValueOnce("ok");

    const result = await withRetry(fn, { attempts: 2, baseDelayMs: 1 });

    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("calls onRetry with the error, attempt number, and delay", async () => {
    const onRetry = vi.fn();
    const fn = vi.fn().mockRejectedValueOnce(httpError(429)).mockResolvedValueOnce("ok");

    await withRetry(fn, { attempts: 2, baseDelayMs: 10, onRetry });

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(expect.objectContaining({ status: 429 }), 1, 10);
  });

  it("honors a custom shouldRetry predicate", async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error("special")).mockResolvedValueOnce("ok");

    const result = await withRetry(fn, {
      attempts: 2,
      baseDelayMs: 1,
      shouldRetry: (err) => err instanceof Error && err.message === "special",
    });

    expect(result).toBe("ok");
  });
});
