import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import { requireAdmin } from "../middleware/adminAuth";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createLocalGuideSchema, guideIdParamsSchema, updateLocalGuideSchema } from "../schemas/admin.schemas";

export const adminRouter = Router();

adminRouter.use(requireAuth);

// Deliberately NOT behind requireAdmin — see the handler's own comment.
adminRouter.get("/session", adminController.getSession);

adminRouter.use(requireAdmin);

adminRouter.get("/analytics", adminController.getAnalytics);

adminRouter.get("/local-guides", adminController.listLocalGuides);
adminRouter.post(
  "/local-guides",
  validate({ body: createLocalGuideSchema }),
  adminController.createLocalGuide
);
adminRouter.patch(
  "/local-guides/:guideId",
  validate({ params: guideIdParamsSchema, body: updateLocalGuideSchema }),
  adminController.updateLocalGuide
);
adminRouter.delete(
  "/local-guides/:guideId",
  validate({ params: guideIdParamsSchema }),
  adminController.deleteLocalGuide
);
