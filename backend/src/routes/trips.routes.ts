import { Router } from "express";
import { createTrip, getTrip, listTrips } from "../controllers/trips.controller";
import { getPlacesForTrip } from "../controllers/places.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createTripBodySchema, tripIdParamsSchema } from "../schemas/trip.schemas";

export const tripsRouter = Router();

tripsRouter.use(requireAuth);

tripsRouter.post("/", validate({ body: createTripBodySchema }), createTrip);
tripsRouter.get("/", listTrips);
tripsRouter.get("/:id", validate({ params: tripIdParamsSchema }), getTrip);
tripsRouter.get("/:id/places", validate({ params: tripIdParamsSchema }), getPlacesForTrip);
