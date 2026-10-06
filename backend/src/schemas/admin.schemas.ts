import { z } from "zod";

export const createLocalGuideSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  destination: z.string().trim().min(1, "Destination is required").max(120),
  languages: z
    .array(z.string().trim().min(1))
    .min(1, "At least one language is required")
    .max(10),
  specialty: z.string().trim().min(1, "Specialty is required").max(160),
  bio: z.string().trim().max(600).optional(),
  photoUrl: z.string().trim().url("photoUrl must be a valid URL").optional(),
  profileUrl: z.string().trim().url("profileUrl must be a valid URL"),
});

// Same shape, nothing required — a PATCH only sends the fields being changed.
export const updateLocalGuideSchema = createLocalGuideSchema.partial();

export const guideIdParamsSchema = z.object({
  guideId: z.string().trim().min(1),
});
