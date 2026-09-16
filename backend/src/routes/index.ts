import { Router } from "express";
import { healthRouter } from "./health.routes";
import { tripsRouter } from "./trips.routes";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/trips", tripsRouter);

// Mounted in later phases: places, telegram, ai, users.
