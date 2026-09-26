import { Router } from "express";

export const healthRouter = Router();

/**
 * GET /api/health
 * Simple liveness check used by Render and for local sanity-checking.
 * Intentionally has no dependency on the database so it stays fast and
 * always reflects "is the process up", not "is Mongo reachable".
 */
healthRouter.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});
