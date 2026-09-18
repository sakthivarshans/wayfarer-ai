import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let groqApiKey: string | undefined = "test-groq-key";
let groqModel: string | undefined;

vi.mock("../../src/config/env", () => ({
  env: new Proxy(
    {},
    {
      get: (_t, prop) => {
        if (prop === "GROQ_API_KEY") return groqApiKey;
        if (prop === "GROQ_MODEL") return groqModel;
        return undefined;
      },
    }
  ),
}));

const { completeChat } = await import("../../src/services/ai/groq.provider");

afterEach(() => {
  vi.unstubAllGlobals();
});

beforeEach(() => {
  groqApiKey = "test-groq-key";
  groqModel = undefined;
});

describe("groq.provider completeChat", () => {
  it("throws a clear internal error when GROQ_API_KEY isn't configured", async () => {
    groqApiKey = undefined;

    await expect(completeChat([{ role: "user", content: "hi" }])).rejects.toMatchObject({ statusCode: 500 });
  });

  it("returns the assistant's reply text on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "  Visit the fort on day 1.  " } }] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const reply = await completeChat([{ role: "user", content: "What's on day 1?" }]);

    expect(reply).toBe("Visit the fort on day 1.");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.groq.com/openai/v1/chat/completions",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer test-groq-key" }),
      })
    );
  });

  it("throws an upstream ApiError on a non-retryable failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: { message: "invalid request" } }),
      })
    );

    await expect(completeChat([{ role: "user", content: "hi" }])).rejects.toThrow("invalid request");
  });

  it("retries on a 429 and eventually succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 429, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ choices: [{ message: { content: "ok" } }] }) });
    vi.stubGlobal("fetch", fetchMock);

    const reply = await completeChat([{ role: "user", content: "hi" }]);

    expect(reply).toBe("ok");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
