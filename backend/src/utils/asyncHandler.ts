import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Wraps an async Express handler so a thrown/rejected error is forwarded to
 * next(), instead of crashing the process or being silently swallowed.
 */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
