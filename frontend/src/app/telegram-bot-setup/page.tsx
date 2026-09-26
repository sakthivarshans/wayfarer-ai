/**
 * Telegram Bot Setup shell. Real token input, "Connect" validation against
 * Telegram's getMe endpoint, and webhook registration are built in Phase 6.
 */
export default function TelegramBotSetupPage(): JSX.Element {
  return (
    <section>
      <h1 className="text-2xl font-bold">Telegram bot setup</h1>
      <p className="mt-2 text-slate-600">
        Connect your own Telegram bot (created via BotFather) here to ask
        questions about your trip anytime.
      </p>
      <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">
        Bot token input and connection status placeholder — wired up in
        Phase 6.
      </div>
    </section>
  );
}
