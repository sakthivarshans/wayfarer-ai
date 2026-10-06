import type { Request, Response } from "express";
import { isAdminEmail } from "../middleware/adminAuth";
import { getRequestUser } from "../middleware/auth";
import * as analyticsService from "../services/admin/analytics.service";
import * as localGuidesService from "../services/admin/localGuides.service";
import type {
  createLocalGuideSchema,
  guideIdParamsSchema,
  updateLocalGuideSchema,
} from "../schemas/admin.schemas";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import type { z } from "zod";

/**
 * GET /api/admin/session
 * Mounted behind `requireAuth` only (not `requireAdmin`) — this is how the
 * frontend asks "should I show the Admin link?" without a 403 on every
 * page load for the other 99% of signed-in users.
 */
export const getSession = asyncHandler(async (req: Request, res: Response) => {
  const user = getRequestUser(req);
  res.status(200).json({ session: { isAdmin: isAdminEmail(user.email) } });
});

export const getAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const analytics = await analyticsService.getAnalyticsSummary();
  res.status(200).json({ analytics });
});

export const listLocalGuides = asyncHandler(async (_req: Request, res: Response) => {
  const guides = await localGuidesService.listGuides();
  res.status(200).json({ guides });
});

export const createLocalGuide = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as z.infer<typeof createLocalGuideSchema>;
  const guide = await localGuidesService.createGuide(input);
  res.status(201).json({ guide });
});

export const updateLocalGuide = asyncHandler(async (req: Request, res: Response) => {
  const { guideId } = req.params as z.infer<typeof guideIdParamsSchema>;
  const input = req.body as z.infer<typeof updateLocalGuideSchema>;

  const guide = await localGuidesService.updateGuide(guideId, input);
  if (!guide) {
    throw ApiError.notFound("Guide not found");
  }
  res.status(200).json({ guide });
});

export const deleteLocalGuide = asyncHandler(async (req: Request, res: Response) => {
  const { guideId } = req.params as z.infer<typeof guideIdParamsSchema>;

  const deleted = await localGuidesService.deleteGuide(guideId);
  if (!deleted) {
    throw ApiError.notFound("Guide not found");
  }
  res.status(204).send();
});
