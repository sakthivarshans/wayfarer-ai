import { randomBytes } from "crypto";
import type { Firestore } from "firebase-admin/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeFirestore } from "../helpers/fakeFirestore";
import type { Trip } from "../../src/types/trip";
import type { Itinerary } from "../../src/types/itinerary";

let fakeDb: Firestore;
let webhookBaseUrl: string | undefined = "https://wayfarer-api.example.com";
const tokenEncryptionKey = randomBytes(32).toString("hex");

const getMe = vi.fn();
const setWebhook = vi.fn();
const sendMessage = vi.fn();
const listTripsForUser = vi.fn();
const getItineraryForTrip = vi.fn();
const answerItineraryQuestion = vi.fn();

vi.mock("../../src/config/firebaseAdmin", () => ({
  getFirestoreDb: () => fakeDb,
}));

vi.mock("../../src/config/env", () => ({
  env: new Proxy(
    {},
    {
      get: (_t, prop) => {
        if (prop === "TELEGRAM_WEBHOOK_BASE_URL") return webhookBaseUrl;
        if (prop === "TOKEN_ENCRYPTION_KEY") return tokenEncryptionKey;
        return undefined;
      },
    }
  ),
}));

vi.mock("../../src/services/telegram/api.provider", () => ({ getMe, setWebhook, sendMessage }));
vi.mock("../../src/services/trips.service", () => ({ listTripsForUser }));
vi.mock("../../src/services/itinerary.service", () => ({ getItineraryForTrip }));
vi.mock("../../src/services/ai/itineraryAssistant", () => ({ answerItineraryQuestion }));

const { connectTelegramBot, getTelegramStatus, handleIncomingWebhook } = await import(
  "../../src/services/telegram.service"
);

function trip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: "trip-1",
    userId: "user-1",
    origin: "Mumbai",
    destination: "Goa",
    budget: 20000,
    days: 2,
    transportModePreference: "flight",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

const fakeItinerary = { tripId: "trip-1", days: [] } as unknown as Itinerary;

describe("telegram.service", () => {
  beforeEach(() => {
    fakeDb = createFakeFirestore();
    webhookBaseUrl = "https://wayfarer-api.example.com";
    getMe.mockReset().mockResolvedValue({ id: 1, username: "MyTripBot", first_name: "Trip" });
    setWebhook.mockReset().mockResolvedValue(undefined);
    sendMessage.mockReset().mockResolvedValue(undefined);
    listTripsForUser.mockReset().mockResolvedValue([trip()]);
    getItineraryForTrip.mockReset().mockResolvedValue(fakeItinerary);
    answerItineraryQuestion.mockReset().mockResolvedValue("You should visit the fort!");
  });

  describe("connectTelegramBot", () => {
    it("validates the token, registers the webhook, and returns connected status", async () => {
      const status = await connectTelegramBot("user-1", "123:abc");

      expect(status.connected).toBe(true);
      expect(status.botUsername).toBe("MyTripBot");
      expect(setWebhook).toHaveBeenCalledWith(
        "123:abc",
        expect.stringContaining("https://wayfarer-api.example.com/api/telegram/webhook/user-1/")
      );
    });

    it("rejects an invalid token with a 400, not a raw Telegram error", async () => {
      getMe.mockRejectedValueOnce(new Error("Unauthorized"));

      await expect(connectTelegramBot("user-1", "bad-token")).rejects.toMatchObject({ statusCode: 400 });
      expect(setWebhook).not.toHaveBeenCalled();
    });

    it("throws a 500 when TELEGRAM_WEBHOOK_BASE_URL isn't configured", async () => {
      webhookBaseUrl = undefined;

      await expect(connectTelegramBot("user-1", "123:abc")).rejects.toMatchObject({ statusCode: 500 });
    });

    it("wraps a Telegram setWebhook failure as an upstream error", async () => {
      setWebhook.mockRejectedValueOnce(new Error("boom"));

      await expect(connectTelegramBot("user-1", "123:abc")).rejects.toMatchObject({ statusCode: 502 });
    });

    it("makes the connection visible via getTelegramStatus afterwards", async () => {
      await connectTelegramBot("user-1", "123:abc");
      const status = await getTelegramStatus("user-1");

      expect(status).toMatchObject({ connected: true, botUsername: "MyTripBot" });
    });
  });

  describe("getTelegramStatus", () => {
    it("returns not connected when nothing is stored", async () => {
      const status = await getTelegramStatus("user-1");
      expect(status).toEqual({ connected: false });
    });
  });

  describe("handleIncomingWebhook", () => {
    async function connect(): Promise<string> {
      await connectTelegramBot("user-1", "123:abc");
      const [, url] = setWebhook.mock.calls[0] as [string, string];
      return url.split("/").pop() as string;
    }

    it("throws 404 for an unknown user", async () => {
      await expect(
        handleIncomingWebhook("no-such-user", "whatever", { message: { chat: { id: 1 }, text: "hi" } })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("throws 404 when the webhook secret doesn't match", async () => {
      await connect();
      await expect(
        handleIncomingWebhook("user-1", "wrong-secret", { message: { chat: { id: 1 }, text: "hi" } })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("ignores updates with no text message (e.g. stickers) without sending a reply", async () => {
      const secret = await connect();
      await handleIncomingWebhook("user-1", secret, {});
      expect(sendMessage).not.toHaveBeenCalled();
      expect(answerItineraryQuestion).not.toHaveBeenCalled();
    });

    it("answers a question using the latest trip's itinerary and replies via Telegram", async () => {
      const secret = await connect();

      await handleIncomingWebhook("user-1", secret, { message: { chat: { id: 555 }, text: "What's on day 1?" } });

      expect(answerItineraryQuestion).toHaveBeenCalledWith(expect.objectContaining({ id: "trip-1" }), fakeItinerary, "What's on day 1?");
      expect(sendMessage).toHaveBeenCalledWith("123:abc", "555", "You should visit the fort!");
    });

    it("tells the user to plan a trip first when they have none", async () => {
      const secret = await connect();
      listTripsForUser.mockResolvedValueOnce([]);

      await handleIncomingWebhook("user-1", secret, { message: { chat: { id: 555 }, text: "hi" } });

      expect(sendMessage).toHaveBeenCalledWith("123:abc", "555", expect.stringContaining("don't have any trips"));
      expect(answerItineraryQuestion).not.toHaveBeenCalled();
    });

    it("tells the user to generate an itinerary first when none exists yet", async () => {
      const secret = await connect();
      getItineraryForTrip.mockResolvedValueOnce(null);

      await handleIncomingWebhook("user-1", secret, { message: { chat: { id: 555 }, text: "hi" } });

      expect(sendMessage).toHaveBeenCalledWith("123:abc", "555", expect.stringContaining("haven't generated an itinerary"));
      expect(answerItineraryQuestion).not.toHaveBeenCalled();
    });

    it("sends a friendly fallback message when Groq fails, instead of throwing", async () => {
      const secret = await connect();
      answerItineraryQuestion.mockRejectedValueOnce(new Error("Groq is down"));

      await expect(
        handleIncomingWebhook("user-1", secret, { message: { chat: { id: 555 }, text: "hi" } })
      ).resolves.toBeUndefined();

      expect(sendMessage).toHaveBeenCalledWith("123:abc", "555", expect.stringContaining("couldn't come up with an answer"));
    });
  });
});
