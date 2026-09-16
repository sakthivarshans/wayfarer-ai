import { env } from "@/config/env";

interface ApiErrorShape {
  error: { code: string; message: string; details?: unknown };
}

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface ApiFetchOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  /** Firebase ID token, from `useAuth().getIdToken()`. Omit for public calls. */
  token?: string | null;
}

/**
 * Calls the backend API, attaching the Firebase ID token (if given) and
 * parsing the backend's consistent `{ error: { code, message, details } }`
 * shape into an `ApiClientError` on failure.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${env.apiBaseUrl}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiClientError(0, "NETWORK_ERROR", "Couldn't reach the server. Check your connection.");
  }

  if (!res.ok) {
    let parsed: ApiErrorShape | undefined;
    try {
      parsed = await res.json();
    } catch {
      // Non-JSON error body — fall through to the generic message below.
    }
    const err = parsed?.error;
    throw new ApiClientError(
      res.status,
      err?.code ?? "UNKNOWN_ERROR",
      err?.message ?? "Something went wrong. Please try again.",
      err?.details
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
