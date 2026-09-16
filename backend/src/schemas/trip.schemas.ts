import { z } from "zod";
import { TRANSPORT_MODES } from "../types/trip";

export const createTripBodySchema = z.object({
  origin: z.string().trim().min(1, "Origin is required"),
  destination: z.string().trim().min(1, "Destination is required"),
  budget: z.number().positive("Budget must be greater than 0"),
  days: z.number().int().positive("Days must be at least 1"),
  transportModePreference: z.enum(TRANSPORT_MODES),
});

export const tripIdParamsSchema = z.object({
  id: z.string().trim().min(1, "Trip id is required"),
});
