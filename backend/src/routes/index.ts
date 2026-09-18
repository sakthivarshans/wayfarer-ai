import { Router } from "express";
import { healthRouter } from "./health.routes";
import { telegramRouter } from "./telegram.routes";
import { tripsRouter } from "./trips.routes";
import { usersRouter } from "./users.routes";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/trips", tripsRouter);
apiRouter.use("/telegram", telegramRouter);
apiRouter.use("/users", usersRouter);
