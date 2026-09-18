import { z } from "zod";

export const connectTelegramBodySchema = z.object({
  botToken: z.string().trim().min(1, "Bot token is required"),
});

export const telegramWebhookParamsSchema = z.object({
  userId: z.string().trim().min(1, "userId is required"),
  webhookSecret: z.string().trim().min(1, "webhookSecret is required"),
});

/**
 * Deliberately loose: Telegram sends many update types (message,
 * edited_message, callback_query, my_chat_member, ...) and we only care
 * about a plain text message. Anything else parses fine and is a no-op in
 * the controller — we never want an unfamiliar Telegram payload shape to
 * fail validation and make Telegram retry the webhook indefinitely.
 */
export const telegramUpdateBodySchema = z
  .object({
    message: z
      .object({
        chat: z.object({ id: z.union([z.number(), z.string()]) }),
        text: z.string().optional(),
      })
      .optional(),
  })
  .passthrough();
