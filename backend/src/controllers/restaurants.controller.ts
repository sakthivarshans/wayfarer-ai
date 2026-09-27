import type { Request, Response } from "express";
import { getRequestUser } from "../middleware/auth";
import * as tripsService from "../services/trips.service";
import * as restaurantsService from "../services/restaurants.service";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";

export const getRestaurantsForTrip = asyncHandler(async (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const trip = await tripsService.getTripById(user.uid, req.params.id ?? "");

  if (!trip) {
    throw ApiError.notFound("Trip not found");
  }

  const restaurants = await restaurantsService.getRestaurantsForTrip(trip);
  res.status(200).json({ restaurants });
});
