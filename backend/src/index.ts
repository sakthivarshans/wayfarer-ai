import cors from "cors";
import express from "express";
import { connectToDatabase } from "./config/db";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { apiRouter } from "./routes";

async function main(): Promise<void> {
  await connectToDatabase();

  const app = express();

  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());

  app.use("/api", apiRouter);

  // Must be registered after all real routes.
  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.info(`Wayfarer AI backend listening on port ${env.port} (${env.nodeEnv})`);
  });
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", error);
  process.exit(1);
});
