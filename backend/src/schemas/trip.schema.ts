import { z } from "zod";
import { TRANSPORT_MODES } from "../models/Trip";

export const createTripSchema = z.object({
  origin: z
    .string({ required_error: "Origin is required" })
    .trim()
    .min(1, "Origin is required")
    .max(200, "Origin is too long"),
  destination: z
    .string({ required_error: "Destination is required" })
    .trim()
    .min(1, "Destination is required")
    .max(200, "Destination is too long"),
  budget: z
    .number({ invalid_type_error: "Budget must be a number" })
    .positive("Budget must be greater than 0")
    .max(10_000_000, "Budget is unrealistically large"),
  days: z
    .number({ invalid_type_error: "Days must be a number" })
    .int("Days must be a whole number")
    .min(1, "Trip must be at least 1 day")
    .max(90, "Trip can be at most 90 days"),
  transportModePreference: z.enum(TRANSPORT_MODES, {
    errorMap: () => ({
      message: `Transport mode must be one of: ${TRANSPORT_MODES.join(", ")}`,
    }),
  }),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
