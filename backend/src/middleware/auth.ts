import type { NextFunction, Request, Response } from "express";
import { getFirebaseAuth } from "../config/firebaseAdmin";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import type { AuthenticatedUser } from "../types/express";

const BEARER_PREFIX = "Bearer ";

function extractToken(req: Request): string {
  const header = req.headers.authorization;

  if (!header || !header.startsWith(BEARER_PREFIX)) {
    throw ApiError.unauthorized("Missing or malformed Authorization header");
  }

  const token = header.slice(BEARER_PREFIX.length).trim();

  if (!token) {
    throw ApiError.unauthorized("Missing bearer token");
  }

  return token;
}

/**
 * Verifies the Firebase ID token on the request and attaches `req.user`.
 * Any Firebase verification failure (expired, malformed, revoked, wrong
 * project, ...) is surfaced as a generic 401 — we never leak the underlying
 * Firebase error details to the client.
 */
export const requireAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);

  let decoded;
  try {
    decoded = await getFirebaseAuth().verifyIdToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid or expired authentication token");
  }

  req.user = { uid: decoded.uid, email: decoded.email };
  next();
});

/**
 * Reads `req.user` for a controller mounted behind `requireAuth`. Throws
 * instead of using a `req.user!` non-null assertion, so a misconfigured
 * route (missing `requireAuth`) fails loudly with a 401 rather than a
 * TypeError.
 */
export function getRequestUser(req: Request): AuthenticatedUser {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  return req.user;
}
