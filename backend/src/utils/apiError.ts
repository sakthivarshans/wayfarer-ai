/**
 * Thrown anywhere in the app to produce a consistent, typed JSON error
 * response. Never leak raw stack traces or third-party error shapes to
 * the client — catch those and re-throw as an ApiError instead.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(statusCode: number, code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: Record<string, unknown>): ApiError {
    return new ApiError(400, "BAD_REQUEST", message, details);
  }

  static unauthorized(message = "Authentication required"): ApiError {
    return new ApiError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "You do not have access to this resource"): ApiError {
    return new ApiError(403, "FORBIDDEN", message);
  }

  static notFound(message = "Resource not found"): ApiError {
    return new ApiError(404, "NOT_FOUND", message);
  }

  static upstream(message: string, details?: Record<string, unknown>): ApiError {
    return new ApiError(502, "UPSTREAM_SERVICE_ERROR", message, details);
  }

  static internal(message = "Something went wrong"): ApiError {
    return new ApiError(500, "INTERNAL_ERROR", message);
  }
}
