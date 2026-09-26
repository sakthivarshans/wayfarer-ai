import { Router } from "express";
import { healthRouter } from "./health.route";
import { tripsRouter } from "./trips.route";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/trips", tripsRouter);

// Future phases will mount additional routers here, e.g.:
// apiRouter.use("/trips/:id/places", placesRouter);
