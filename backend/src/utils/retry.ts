export interface RetryOptions {
  /** Total attempts including the first call. Default 3. */
  attempts?: number;
  /** Base delay in ms before the first retry. Default 300. Doubles each retry. */
  baseDelayMs?: number;
  /** Cap on any single delay, in ms. Default 5000. */
  maxDelayMs?: number;
  /** Decide whether a given error should trigger a retry. Defaults to
   * retrying on network errors, HTTP 429, and HTTP 5xx (checked on
   * `err.status` / `err.response.status`, the common shapes for fetch-like
   * and axios-like clients). */
  shouldRetry?: (err: unknown) => boolean;
  /** Called before each wait, e.g. for logging. */
  onRetry?: (err: unknown, attempt: number, delayMs: number) => void;
}

function getHttpStatus(err: unknown): number | undefined {
  if (typeof err !== "object" || err === null) {
    return undefined;
  }
  const maybe = err as { status?: unknown; response?: { status?: unknown } };
  if (typeof maybe.status === "number") {
    return maybe.status;
  }
  if (typeof maybe.response?.status === "number") {
    return maybe.response.status;
  }
  return undefined;
}

function defaultShouldRetry(err: unknown): boolean {
  const status = getHttpStatus(err);
  if (status === undefined) {
    // No HTTP status found — treat as a network/transport-level error and retry.
    return true;
  }
  return status === 429 || (status >= 500 && status < 600);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retries an async operation with exponential backoff. Intended for every
 * outbound call to a third-party API (Geoapify, Groq, Telegram, ...) so a
 * transient 429/5xx doesn't fail the whole request.
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const attempts = options.attempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 300;
  const maxDelayMs = options.maxDelayMs ?? 5000;
  const shouldRetry = options.shouldRetry ?? defaultShouldRetry;

  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      const isLastAttempt = attempt === attempts;
      if (isLastAttempt || !shouldRetry(err)) {
        throw err;
      }

      const delayMs = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
      options.onRetry?.(err, attempt, delayMs);
      await sleep(delayMs);
    }
  }

  // Unreachable: the loop always returns or throws, but TypeScript can't
  // prove that, so keep it happy without silently swallowing an error.
  throw lastError;
}
