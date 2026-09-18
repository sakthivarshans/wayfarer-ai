import { afterEach, describe, expect, it, vi } from "vitest";
import { getMe, sendMessage, setWebhook } from "../../src/services/telegram/api.provider";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("telegram api.provider", () => {
  describe("getMe", () => {
    it("returns the bot identity on success", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, result: { id: 1, username: "MyTripBot", first_name: "Trip" } }),
      });
      vi.stubGlobal("fetch", fetchMock);

      const identity = await getMe("test-token");

      expect(identity).toEqual({ id: 1, username: "MyTripBot", first_name: "Trip" });
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.telegram.org/bottest-token/getMe",
        expect.objectContaining({ method: "POST" })
      );
    });

    it("throws when Telegram rejects the token (401 Unauthorized)", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 401,
          json: async () => ({ ok: false, description: "Unauthorized" }),
        })
      );

      await expect(getMe("bad-token")).rejects.toThrow("Unauthorized");
    });

    it("retries on a 503 and eventually succeeds", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({ ok: false }) })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true, result: { id: 2, username: "Bot2", first_name: "Two" } }),
        });
      vi.stubGlobal("fetch", fetchMock);

      const identity = await getMe("test-token");

      expect(identity.username).toBe("Bot2");
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  describe("setWebhook", () => {
    it("posts the webhook url", async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, result: true }) });
      vi.stubGlobal("fetch", fetchMock);

      await setWebhook("test-token", "https://example.com/api/telegram/webhook/u1/secret");

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.telegram.org/bottest-token/setWebhook",
        expect.objectContaining({ body: JSON.stringify({ url: "https://example.com/api/telegram/webhook/u1/secret" }) })
      );
    });
  });

  describe("sendMessage", () => {
    it("posts the chat id and text", async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, result: {} }) });
      vi.stubGlobal("fetch", fetchMock);

      await sendMessage("test-token", "12345", "Hello!");

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.telegram.org/bottest-token/sendMessage",
        expect.objectContaining({ body: JSON.stringify({ chat_id: "12345", text: "Hello!" }) })
      );
    });
  });
});
