import { ComingSoonCard } from "@/components/ui/ComingSoonCard";

export default function TelegramBotPage() {
  return (
    <div className="pt-2">
      <ComingSoonCard
        title="Connect your Telegram bot"
        description="Paste a bot token from BotFather here to ask your bot questions about a saved itinerary at any time. Built in Phase 8, alongside the webhook and Groq-powered replies."
      />
    </div>
  );
}
