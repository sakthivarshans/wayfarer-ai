import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { apiRouter } from "./routes";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(pinoHttp({ logger }));

  app.use("/api", apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
