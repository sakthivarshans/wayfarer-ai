import type { NextFunction, Request, Response } from "express";
import { getFirebaseAuth } from "../config/firebaseAdmin";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";

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
