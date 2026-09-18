import { env } from "../../config/env";
import { ApiError } from "../../utils/apiError";
import { withRetry } from "../../utils/retry";

const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";
// See PHASES.md Phase 8 for why this model: Groq's standard general-purpose
// production model at the time of writing, free tier. Override with
// GROQ_MODEL if Groq retires/renames it.
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export interface GroqChatMessage {
  role: "system" | "user";
  content: string;
}

interface GroqChatCompletionResponse {
  choices: Array<{ message: { content: string } }>;
}

function isHttpError(status: number, description?: string): Error & { status: number } {
  const err = new Error(description ?? `Groq request failed with status ${status}`) as Error & { status: number };
  err.status = status;
  return err;
}

/** Sends a chat completion request to Groq and returns the assistant's reply text. */
export async function completeChat(messages: GroqChatMessage[]): Promise<string> {
  if (!env.GROQ_API_KEY) {
    throw ApiError.internal("Telegram Q&A isn't configured — GROQ_API_KEY is not set");
  }

  const response = await withRetry(
    async () => {
      const res = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: env.GROQ_MODEL ?? DEFAULT_MODEL,
          messages,
          temperature: 0.4,
          max_tokens: 500,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => undefined)) as { error?: { message?: string } } | undefined;
        throw isHttpError(res.status, body?.error?.message);
      }

      return (await res.json()) as GroqChatCompletionResponse;
    },
    { attempts: 3, baseDelayMs: 500 }
  );

  const content = response.choices[0]?.message.content;
  if (!content) {
    throw ApiError.upstream("Groq returned an empty response");
  }

  return content.trim();
}
