import type { Request, Response } from "express";
import { getRequestUser } from "../middleware/auth";
import * as tripsService from "../services/trips.service";
import * as gettingAroundService from "../services/gettingAround.service";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";

export const getGettingAroundForTrip = asyncHandler(async (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const trip = await tripsService.getTripById(user.uid, req.params.id ?? "");

  if (!trip) {
    throw ApiError.notFound("Trip not found");
  }

  const gettingAround = await gettingAroundService.getGettingAroundForTrip(trip);
  res.status(200).json({ gettingAround });
});
