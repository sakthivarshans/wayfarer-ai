import { randomBytes } from "crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

let tokenEncryptionKey: string | undefined = randomBytes(32).toString("hex");

vi.mock("../../src/config/env", () => ({
  env: new Proxy({}, { get: (_t, prop) => (prop === "TOKEN_ENCRYPTION_KEY" ? tokenEncryptionKey : undefined) }),
}));

const { decryptSecret, encryptSecret } = await import("../../src/utils/tokenCipher");

beforeEach(() => {
  tokenEncryptionKey = randomBytes(32).toString("hex");
});

describe("tokenCipher", () => {
  it("round-trips a secret through encrypt/decrypt", () => {
    const encrypted = encryptSecret("123456:ABC-my-telegram-bot-token");
    expect(encrypted).not.toContain("123456:ABC-my-telegram-bot-token");

    const decrypted = decryptSecret(encrypted);
    expect(decrypted).toBe("123456:ABC-my-telegram-bot-token");
  });

  it("produces a different ciphertext each time (random IV)", () => {
    const first = encryptSecret("same-plaintext");
    const second = encryptSecret("same-plaintext");
    expect(first).not.toBe(second);
  });

  it("throws a clear internal error when TOKEN_ENCRYPTION_KEY is missing", () => {
    tokenEncryptionKey = undefined;
    expect(() => encryptSecret("secret")).toThrowError(/TOKEN_ENCRYPTION_KEY/);
  });

  it("throws a clear internal error when TOKEN_ENCRYPTION_KEY is the wrong length", () => {
    tokenEncryptionKey = "tooshort";
    expect(() => encryptSecret("secret")).toThrowError(/32-byte/);
  });

  it("throws rather than returning garbage when the ciphertext is tampered with", () => {
    const encrypted = encryptSecret("secret-value");
    const tampered = `${encrypted.slice(0, -4)}abcd`;
    expect(() => decryptSecret(tampered)).toThrowError(/decrypt/);
  });
});
