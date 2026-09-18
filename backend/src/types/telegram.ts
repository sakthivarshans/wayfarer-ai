/** What we persist per user in the `users` Firestore collection. Never sent to the client as-is — `telegramBotTokenEncrypted` stays server-side. */
export interface StoredTelegramConfig {
  telegramBotTokenEncrypted: string;
  telegramWebhookSecret: string;
  telegramBotUsername: string;
  /** Set once the user sends their bot a first message; used for future outbound messages. */
  telegramChatId?: string;
  /** ISO 8601 string, set whenever the bot is (re)connected. */
  telegramConnectedAt: string;
}

/** What the frontend gets back — never the token or webhook secret. */
export interface TelegramConnectionStatus {
  connected: boolean;
  botUsername?: string;
  connectedAt?: string;
}

/**
 * The handful of fields we actually read off a Telegram webhook update.
 * Telegram sends many other update types and fields we don't care about
 * (edited_message, callback_query, ...); everything else is ignored, not
 * validated against.
 */
export interface TelegramWebhookUpdate {
  message?: {
    chat: { id: number | string };
    text?: string;
  };
}
