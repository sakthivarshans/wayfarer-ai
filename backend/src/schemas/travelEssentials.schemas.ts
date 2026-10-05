import { z } from "zod";

/** `?passport=IN` lets the traveller override the passport guessed from the trip's origin. */
export const travelEssentialsQuerySchema = z.object({
  passport: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, "passport must be a 2-letter country code")
    .transform((value) => value.toUpperCase())
    .optional(),
});

export type TravelEssentialsQuery = z.infer<typeof travelEssentialsQuerySchema>;
