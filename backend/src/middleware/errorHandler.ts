import type { NextFunction, Request, Response } from "express";
import { isProduction } from "../config/env";

/**
 * Thrown by route handlers/services for expected, user-facing failures
 * (validation errors, not-found, upstream API failures, etc.). Anything
 * else is treated as an unexpected 500.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode = 400, code = "BAD_REQUEST") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}

/**
 * Handles requests to routes that don't exist. Must be registered after
 * all real routes and before the error handler.
 */
export function notFoundHandler(req: Request, res: Response): void {
  const body: ApiErrorBody = {
    error: {
      code: "NOT_FOUND",
      message: `No route matches ${req.method} ${req.originalUrl}`,
    },
  };
  res.status(404).json(body);
}

/**
 * Central error handler. Returns a consistent JSON shape and never leaks
 * raw stack traces or internal error messages to the client in production.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    const body: ApiErrorBody = {
      error: { code: err.code, message: err.message },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  // eslint-disable-next-line no-console
  console.error("Unhandled error:", err);

  const body: ApiErrorBody = {
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: isProduction
        ? "Something went wrong. Please try again."
        : err instanceof Error
          ? err.message
          : "Unknown error",
    },
  };
  res.status(500).json(body);
}
