import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { ApiError } from "../utils/apiError";
import { getRequestUser } from "./auth";

/**
 * Checks an email against the `ADMIN_EMAILS` allowlist. Exported separately
 * from the middleware so the `/admin/session` endpoint can use the same
 * check to answer "am I an admin?" without throwing — a 403 is the right
 * response for "you tried to do something you can't," not for "the UI is
 * asking whether to show you a link."
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }
  return env.adminEmails.includes(email.toLowerCase());
}

/**
 * Gates every admin-only route. Must run after `requireAuth`, which
 * attaches `req.user`. An unset `ADMIN_EMAILS` means nobody is an admin,
 * not "everybody is" — `isAdminEmail` returns false for every email when
 * the list is empty.
 */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  const user = getRequestUser(req);
  if (!isAdminEmail(user.email)) {
    throw ApiError.forbidden("Admin access required");
  }
  next();
}
