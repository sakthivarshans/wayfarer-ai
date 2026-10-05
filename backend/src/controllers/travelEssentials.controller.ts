import type { Request, Response } from "express";
import { getRequestUser } from "../middleware/auth";
import * as tripsService from "../services/trips.service";
import * as travelEssentialsService from "../services/travelEssentials.service";
import type { TravelEssentialsQuery } from "../schemas/travelEssentials.schemas";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";

export const getTravelEssentialsForTrip = asyncHandler(async (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const trip = await tripsService.getTripById(user.uid, req.params.id ?? "");

  if (!trip) {
    throw ApiError.notFound("Trip not found");
  }

  // Already parsed/normalized by the `validate` middleware.
  const { passport } = req.query as TravelEssentialsQuery;
  const travelEssentials = await travelEssentialsService.getTravelEssentialsForTrip(trip, { passport });
  res.status(200).json({ travelEssentials });
});
