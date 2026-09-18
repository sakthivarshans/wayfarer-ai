import { randomBytes } from "crypto";
import type { Firestore } from "firebase-admin/firestore";
import { env } from "../config/env";
import { getFirestoreDb } from "../config/firebaseAdmin";
import type { StoredTelegramConfig, TelegramConnectionStatus, TelegramWebhookUpdate } from "../types/telegram";
import { ApiError } from "../utils/apiError";
import { decryptSecret, encryptSecret } from "../utils/tokenCipher";
import { answerItineraryQuestion } from "./ai/itineraryAssistant";
import { getItineraryForTrip } from "./itinerary.service";
import { getMe, sendMessage, setWebhook } from "./telegram/api.provider";
import { listTripsForUser } from "./trips.service";

const COLLECTION = "users";

function docToConfig(data: Record<string, unknown> | undefined): StoredTelegramConfig | null {
  if (!data || typeof data.telegramBotTokenEncrypted !== "string" || typeof data.telegramWebhookSecret !== "string") {
    return null;
  }
  return data as unknown as StoredTelegramConfig;
}

function buildWebhookUrl(userId: string, webhookSecret: string): string {
  if (!env.TELEGRAM_WEBHOOK_BASE_URL) {
    throw ApiError.internal("Telegram integration isn't configured — TELEGRAM_WEBHOOK_BASE_URL is not set");
  }
  const base = env.TELEGRAM_WEBHOOK_BASE_URL.replace(/\/$/, "");
  return `${base}/api/telegram/webhook/${userId}/${webhookSecret}`;
}

/**
 * Validates the bot token against Telegram, registers our webhook for it,
 * and persists the (encrypted) token. Calling this again — e.g. to fix a
 * mistyped token — simply overwrites the previous connection, including
 * dropping any previously-seen `telegramChatId`: a new connection means the
 * user needs to message the bot again before we can proactively reach them.
 */
export async function connectTelegramBot(userId: string, botToken: string): Promise<TelegramConnectionStatus> {
  let identity;
  try {
    identity = await getMe(botToken);
  } catch {
    throw ApiError.badRequest(
      "That doesn't look like a valid Telegram bot token. Double-check it was copied from BotFather and try again."
    );
  }

  const webhookSecret = randomBytes(24).toString("hex");
  const webhookUrl = buildWebhookUrl(userId, webhookSecret);

  try {
    await setWebhook(botToken, webhookUrl);
  } catch {
    throw ApiError.upstream("Couldn't register the webhook with Telegram. Please try again in a moment.");
  }

  const config: StoredTelegramConfig = {
    telegramBotTokenEncrypted: encryptSecret(botToken),
    telegramWebhookSecret: webhookSecret,
    telegramBotUsername: identity.username,
    telegramConnectedAt: new Date().toISOString(),
  };

  const db: Firestore = getFirestoreDb();
  await db.collection(COLLECTION).doc(userId).set(config);

  return { connected: true, botUsername: config.telegramBotUsername, connectedAt: config.telegramConnectedAt };
}

/** Returns the user's current Telegram connection status, never the token itself. */
export async function getTelegramStatus(userId: string): Promise<TelegramConnectionStatus> {
  const db: Firestore = getFirestoreDb();
  const doc = await db.collection(COLLECTION).doc(userId).get();

  const config = doc.exists ? docToConfig(doc.data()) : null;
  if (!config) {
    return { connected: false };
  }

  return { connected: true, botUsername: config.telegramBotUsername, connectedAt: config.telegramConnectedAt };
}

/**
 * Handles one incoming Telegram webhook call. `userId`/`webhookSecret` come
 * from the URL path (see routes/telegram.routes.ts) and must match the
 * stored connection — this is the auth mechanism for a webhook, which
 * Telegram calls directly and can't send a Firebase bearer token.
 *
 * Never throws for "normal" reasons a user might see repeated retries from
 * Telegram — Groq/Telegram failures are caught and turned into a friendly
 * message sent back to the user's chat instead of a 500.
 */
export async function handleIncomingWebhook(
  userId: string,
  webhookSecret: string,
  update: TelegramWebhookUpdate
): Promise<void> {
  const db: Firestore = getFirestoreDb();
  const doc = await db.collection(COLLECTION).doc(userId).get();
  const config = doc.exists ? docToConfig(doc.data()) : null;

  if (!config || config.telegramWebhookSecret !== webhookSecret) {
    // Same 404 either way — never reveal whether a userId is known.
    throw ApiError.notFound("Unknown Telegram connection");
  }

  const message = update.message;
  if (!message || !message.text) {
    // Non-text update (sticker, edited message, channel post, ...) — nothing to reply to.
    return;
  }

  const chatId = String(message.chat.id);
  if (config.telegramChatId !== chatId) {
    await db.collection(COLLECTION).doc(userId).set({ ...config, telegramChatId: chatId });
  }

  const botToken = decryptSecret(config.telegramBotTokenEncrypted);

  try {
    const trips = await listTripsForUser(userId);
    const latestTrip = trips[0];

    if (!latestTrip) {
      await sendMessage(botToken, chatId, "You don't have any trips planned yet — create one on Wayfarer AI first!");
      return;
    }

    const itinerary = await getItineraryForTrip(latestTrip);
    if (!itinerary) {
      await sendMessage(
        botToken,
        chatId,
        `You haven't generated an itinerary for your trip to ${latestTrip.destination} yet — open the Itinerary tab and generate one first!`
      );
      return;
    }

    const reply = await answerItineraryQuestion(latestTrip, itinerary, message.text);
    await sendMessage(botToken, chatId, reply);
  } catch {
    try {
      await sendMessage(
        botToken,
        chatId,
        "Sorry, I couldn't come up with an answer just now. Please try again in a moment."
      );
    } catch {
      // Nothing more we can do if even the fallback message fails to send.
    }
  }
}
