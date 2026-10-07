import { Router } from "express";
import { createTrip, getTrip, listTrips } from "../controllers/trips.controller";
import { getPlacesForTrip } from "../controllers/places.controller";
import { getRestaurantsForTrip } from "../controllers/restaurants.controller";
import { getTransportForTrip } from "../controllers/transport.controller";
import { getGettingAroundForTrip } from "../controllers/gettingAround.controller";
import { getTravelEssentialsForTrip } from "../controllers/travelEssentials.controller";
import { getLocalGuidesForTrip } from "../controllers/localGuides.controller";
import { getHotelsForTrip } from "../controllers/hotels.controller";
import { generateItinerary, getItinerary } from "../controllers/itinerary.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createTripBodySchema, tripIdParamsSchema } from "../schemas/trip.schemas";
import { travelEssentialsQuerySchema } from "../schemas/travelEssentials.schemas";

export const tripsRouter = Router();

tripsRouter.use(requireAuth);

tripsRouter.post("/", validate({ body: createTripBodySchema }), createTrip);
tripsRouter.get("/", listTrips);
tripsRouter.get("/:id", validate({ params: tripIdParamsSchema }), getTrip);
tripsRouter.get("/:id/places", validate({ params: tripIdParamsSchema }), getPlacesForTrip);
tripsRouter.get(
  "/:id/restaurants",
  validate({ params: tripIdParamsSchema }),
  getRestaurantsForTrip
);
tripsRouter.get("/:id/transport", validate({ params: tripIdParamsSchema }), getTransportForTrip);
tripsRouter.get(
  "/:id/getting-around",
  validate({ params: tripIdParamsSchema }),
  getGettingAroundForTrip
);
tripsRouter.get(
  "/:id/travel-essentials",
  validate({ params: tripIdParamsSchema, query: travelEssentialsQuerySchema }),
  getTravelEssentialsForTrip
);
tripsRouter.get(
  "/:id/local-guides",
  validate({ params: tripIdParamsSchema }),
  getLocalGuidesForTrip
);
tripsRouter.get("/:id/hotels", validate({ params: tripIdParamsSchema }), getHotelsForTrip);
tripsRouter.post(
  "/:id/itinerary/generate",
  validate({ params: tripIdParamsSchema }),
  generateItinerary
);
tripsRouter.get("/:id/itinerary", validate({ params: tripIdParamsSchema }), getItinerary);
