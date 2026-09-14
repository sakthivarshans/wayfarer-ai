import type { Server } from "http";
import type { Application } from "express";
import { env } from "./config/env";
import { logger } from "./config/logger";

export function startServer(app: Application): Server {
  const server = app.listen(env.PORT, () => {
    logger.info(`Wayfarer AI backend listening on port ${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully`);
    server.close(() => {
      logger.info("HTTP server closed");
      process.exit(0);
    });
    // Force-exit if something hangs.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  return server;
}
