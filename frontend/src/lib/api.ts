export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}

export class ApiRequestError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

/**
 * Thin fetch wrapper around the backend API. Throws ApiRequestError with the
 * backend's consistent { error: { code, message } } shape so callers can
 * show a real message instead of a generic "failed to fetch".
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiRequestError(
      "Couldn't reach the server. Check your connection and try again.",
      "NETWORK_ERROR",
      0
    );
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiRequestError(
      body?.error.message ?? "Something went wrong. Please try again.",
      body?.error.code ?? "UNKNOWN_ERROR",
      response.status
    );
  }

  return response.json() as Promise<T>;
}
