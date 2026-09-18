import { apiFetch } from "@/lib/apiClient";
import type { TelegramConnectionStatus } from "./types";

export async function getTelegramStatus(token: string): Promise<TelegramConnectionStatus> {
  const { telegram } = await apiFetch<{ telegram: TelegramConnectionStatus }>("/users/me/telegram", { token });
  return telegram;
}

export async function connectTelegram(token: string, botToken: string): Promise<TelegramConnectionStatus> {
  const { telegram } = await apiFetch<{ telegram: TelegramConnectionStatus }>("/users/me/telegram", {
    method: "POST",
    token,
    body: { botToken },
  });
  return telegram;
}
