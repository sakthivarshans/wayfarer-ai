import type { Request, Response } from "express";
import { getRequestUser } from "../middleware/auth";
import * as itineraryService from "../services/itinerary.service";
import * as tripsService from "../services/trips.service";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";

export const generateItinerary = asyncHandler(async (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const trip = await tripsService.getTripById(user.uid, req.params.id ?? "");

  if (!trip) {
    throw ApiError.notFound("Trip not found");
  }

  const itinerary = await itineraryService.generateItineraryForTrip(trip);
  res.status(201).json({ itinerary });
});

export const getItinerary = asyncHandler(async (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const trip = await tripsService.getTripById(user.uid, req.params.id ?? "");

  if (!trip) {
    throw ApiError.notFound("Trip not found");
  }

  const itinerary = await itineraryService.getItineraryForTrip(trip);

  if (!itinerary) {
    throw ApiError.notFound("This trip doesn't have an itinerary yet. Generate one first.");
  }

  res.status(200).json({ itinerary });
});
