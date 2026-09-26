import { Router } from "express";
import { AppError } from "../middleware/errorHandler";
import { createTripSchema } from "../schemas/trip.schema";
import { createTrip } from "../services/trips.service";

export const tripsRouter = Router();

/**
 * POST /api/trips
 * Validates the trip-planner form submission and persists it. Returns the
 * new trip's id so the frontend can carry it forward into the Results tabs.
 */
tripsRouter.post("/", async (req, res, next) => {
  try {
    const parseResult = createTripSchema.safeParse(req.body);

    if (!parseResult.success) {
      const message = parseResult.error.issues.map((issue) => issue.message).join("; ");
      throw new AppError(message, 400, "VALIDATION_ERROR");
    }

    const trip = await createTrip(parseResult.data);

    res.status(201).json({
      id: trip._id.toString(),
      trip: {
        id: trip._id.toString(),
        origin: trip.origin,
        destination: trip.destination,
        budget: trip.budget,
        days: trip.days,
        transportModePreference: trip.transportModePreference,
        createdAt: trip.createdAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});
