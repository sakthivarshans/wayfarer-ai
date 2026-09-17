import { Router } from "express";
import { createTrip, getTrip, listTrips } from "../controllers/trips.controller";
import { getPlacesForTrip } from "../controllers/places.controller";
import { getTransportForTrip } from "../controllers/transport.controller";
import { getHotelsForTrip } from "../controllers/hotels.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createTripBodySchema, tripIdParamsSchema } from "../schemas/trip.schemas";

export const tripsRouter = Router();

tripsRouter.use(requireAuth);

tripsRouter.post("/", validate({ body: createTripBodySchema }), createTrip);
tripsRouter.get("/", listTrips);
tripsRouter.get("/:id", validate({ params: tripIdParamsSchema }), getTrip);
tripsRouter.get("/:id/places", validate({ params: tripIdParamsSchema }), getPlacesForTrip);
tripsRouter.get("/:id/transport", validate({ params: tripIdParamsSchema }), getTransportForTrip);
tripsRouter.get("/:id/hotels", validate({ params: tripIdParamsSchema }), getHotelsForTrip);
