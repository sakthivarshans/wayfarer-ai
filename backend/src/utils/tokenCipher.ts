import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { env } from "../config/env";
import { ApiError } from "./apiError";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH_BYTES = 32;
const IV_LENGTH_BYTES = 12;

function getKey(): Buffer {
  if (!env.TOKEN_ENCRYPTION_KEY) {
    throw ApiError.internal("Telegram bot tokens can't be stored — TOKEN_ENCRYPTION_KEY is not configured");
  }

  const key = Buffer.from(env.TOKEN_ENCRYPTION_KEY, "hex");
  if (key.length !== KEY_LENGTH_BYTES) {
    throw ApiError.internal("TOKEN_ENCRYPTION_KEY must be a 32-byte (64 hex char) key");
  }

  return key;
}

/**
 * Encrypts a secret (the user's Telegram bot token) for storage. Returns a
 * single base64 string packing `iv:authTag:ciphertext` so `decryptSecret`
 * only needs the one stored value back.
 */
export function encryptSecret(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, ciphertext]).toString("base64");
}

/** Reverses `encryptSecret`. Throws `ApiError.internal` on any tampering/corruption rather than leaking a raw crypto error. */
export function decryptSecret(encoded: string): string {
  const key = getKey();
  const raw = Buffer.from(encoded, "base64");

  const iv = raw.subarray(0, IV_LENGTH_BYTES);
  const authTag = raw.subarray(IV_LENGTH_BYTES, IV_LENGTH_BYTES + 16);
  const ciphertext = raw.subarray(IV_LENGTH_BYTES + 16);

  try {
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plaintext.toString("utf8");
  } catch {
    throw ApiError.internal("Couldn't decrypt the stored Telegram bot token");
  }
}
