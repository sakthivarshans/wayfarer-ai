import type { Request, Response } from "express";
import { getRequestUser } from "../middleware/auth";
import * as telegramService from "../services/telegram.service";
import type { TelegramWebhookUpdate } from "../types/telegram";
import { asyncHandler } from "../utils/asyncHandler";

export const connectTelegram = asyncHandler(async (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const { botToken } = req.body as { botToken: string };

  const status = await telegramService.connectTelegramBot(user.uid, botToken);
  res.status(200).json({ telegram: status });
});

export const getTelegramConnectionStatus = asyncHandler(async (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const status = await telegramService.getTelegramStatus(user.uid);
  res.status(200).json({ telegram: status });
});

/**
 * Telegram calls this directly (no Firebase auth header) — the userId +
 * webhookSecret in the URL path are the auth mechanism here, verified
 * inside the service against the stored connection.
 */
export const telegramWebhook = asyncHandler(async (req: Request, res: Response) => {
  const { userId, webhookSecret } = req.params as { userId: string; webhookSecret: string };
  const update = req.body as TelegramWebhookUpdate;

  await telegramService.handleIncomingWebhook(userId, webhookSecret, update);

  // Always 200 once we've handled it — Telegram retries a webhook that
  // doesn't return 2xx, and we've already told the user about any failure
  // via a chat message inside the service.
  res.status(200).json({ ok: true });
});
