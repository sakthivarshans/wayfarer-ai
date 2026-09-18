import { withRetry } from "../../utils/retry";
import { ApiError } from "../../utils/apiError";

function telegramApiUrl(botToken: string, method: string): string {
  return `https://api.telegram.org/bot${botToken}/${method}`;
}

function isHttpError(status: number, description?: string): Error & { status: number } {
  const err = new Error(description ?? `Telegram API request failed with status ${status}`) as Error & {
    status: number;
  };
  err.status = status;
  return err;
}

interface TelegramApiResponse<T> {
  ok: boolean;
  result?: T;
  description?: string;
}

async function callTelegramApi<T>(botToken: string, method: string, body?: Record<string, unknown>): Promise<T> {
  const data = await withRetry(
    async () => {
      const res = await fetch(telegramApiUrl(botToken, method), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      const parsed = (await res.json()) as TelegramApiResponse<T>;
      if (!res.ok || !parsed.ok) {
        throw isHttpError(res.status, parsed.description);
      }
      return parsed;
    },
    { attempts: 3, baseDelayMs: 500 }
  );

  if (data.result === undefined) {
    throw ApiError.upstream("Telegram API returned an unexpected empty result");
  }
  return data.result;
}

export interface TelegramBotIdentity {
  id: number;
  username: string;
  first_name: string;
}

/** Validates a bot token and returns the bot's identity, per Telegram's getMe endpoint. */
export async function getMe(botToken: string): Promise<TelegramBotIdentity> {
  return callTelegramApi<TelegramBotIdentity>(botToken, "getMe");
}

/** Registers (or replaces) the webhook URL Telegram will POST updates to for this bot. */
export async function setWebhook(botToken: string, webhookUrl: string): Promise<void> {
  await callTelegramApi<boolean>(botToken, "setWebhook", { url: webhookUrl });
}

/** Sends a plain-text message to a chat, e.g. the bot's reply to the user's question. */
export async function sendMessage(botToken: string, chatId: string | number, text: string): Promise<void> {
  await callTelegramApi<Record<string, unknown>>(botToken, "sendMessage", { chat_id: chatId, text });
}
