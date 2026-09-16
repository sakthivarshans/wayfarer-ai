import type { Request, Response } from "express";
import { getRequestUser } from "../middleware/auth";
import * as tripsService from "../services/trips.service";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";

export const createTrip = asyncHandler(async (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const trip = await tripsService.createTrip(user.uid, req.body);
  res.status(201).json({ trip });
});

export const listTrips = asyncHandler(async (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const trips = await tripsService.listTripsForUser(user.uid);
  res.status(200).json({ trips });
});

export const getTrip = asyncHandler(async (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const trip = await tripsService.getTripById(user.uid, req.params.id ?? "");

  if (!trip) {
    throw ApiError.notFound("Trip not found");
  }

  res.status(200).json({ trip });
});
