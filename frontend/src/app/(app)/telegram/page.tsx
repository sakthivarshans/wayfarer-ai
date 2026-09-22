"use client";

import { useState, type FormEvent } from "react";
import { CircleCheck, Send } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useTelegramConnection } from "@/features/telegram/useTelegramConnection";

export default function TelegramBotPage() {
  const { status, loading, error, connecting, connectError, connect } = useTelegramConnection();
  const [botToken, setBotToken] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!botToken.trim()) {
      return;
    }
    const succeeded = await connect(botToken.trim());
    if (succeeded) {
      setBotToken("");
    }
  }

  return (
    <div className="space-y-4 pt-2">
      {status?.connected && (
        <Card className="border-l-4 border-status-success">
          <div className="flex items-start gap-3">
            <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-status-success" strokeWidth={2} />
            <div>
              <p className="text-sm font-semibold text-text-heading">Connected to @{status.botUsername}</p>
              <p className="mt-1 text-sm text-text-body">
                Message your bot on Telegram any time to ask about your most recent trip&apos;s itinerary.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand-100 text-sand-700">
            <Send className="h-5 w-5" strokeWidth={2} />
          </div>
          <h2 className="font-display text-lg font-medium text-text-heading">
            {status?.connected ? "Reconnect a bot" : "Connect your Telegram bot"}
          </h2>
        </div>
        <ol className="mt-4 max-w-md list-decimal space-y-1 pl-4 text-sm text-text-body">
          <li>
            Open Telegram and message{" "}
            <a
              href="https://t.me/botfather"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ink-700 underline"
            >
              @BotFather
            </a>
            .
          </li>
          <li>
            Send <code className="rounded bg-ink-100 px-1 py-0.5 text-xs">/newbot</code> and follow the prompts to
            name your bot.
          </li>
          <li>BotFather will reply with a token that looks like 123456789:AAExample-Token. Copy it.</li>
          <li>Paste it below and connect.</li>
        </ol>

        {loading ? (
          <div className="mt-4 flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink-500 border-t-transparent" />
          </div>
        ) : error ? (
          <p className="mt-4 text-sm text-status-danger">{error}</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="botToken" className="text-sm font-medium text-text-heading">
                Bot token
              </label>
              <input
                id="botToken"
                type="password"
                required
                placeholder="123456789:AAExample-Token"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-text-heading outline-none focus:border-ink-500 focus:ring-2 focus:ring-ink-100"
              />
            </div>
            <button
              type="submit"
              disabled={connecting}
              className="w-fit rounded-full bg-ink-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {connecting ? "Connecting…" : status?.connected ? "Reconnect" : "Connect"}
            </button>
          </form>
        )}

        {connectError && <p className="mt-3 text-sm text-status-danger">{connectError}</p>}
      </Card>
    </div>
  );
}
