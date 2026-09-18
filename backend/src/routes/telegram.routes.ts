import { Router } from "express";
import { telegramWebhook } from "../controllers/telegram.controller";
import { validate } from "../middleware/validate";
import { telegramUpdateBodySchema, telegramWebhookParamsSchema } from "../schemas/telegram.schemas";

export const telegramRouter = Router();

// Deliberately not behind requireAuth — Telegram, not our frontend, calls
// this, and can't send a Firebase bearer token. The webhookSecret in the
// path is the auth mechanism instead (verified in the service).
telegramRouter.post(
  "/webhook/:userId/:webhookSecret",
  validate({ params: telegramWebhookParamsSchema, body: telegramUpdateBodySchema }),
  telegramWebhook
);
