import { CircleAlert } from "lucide-react";
import { Card } from "./Card";

/**
 * Consistent error-state card — icon + message, matching the icon-circle
 * language used elsewhere (Transport/Hotel cards, Settings, Telegram)
 * instead of bare red text. Used for both full API failures (e.g. a
 * trip failing to load) and inline generation errors.
 */
export function ErrorState({
  message,
  className = "",
  bare = false,
}: {
  message: string;
  className?: string;
  /** Skip the Card wrapper for use inside a card that already exists
   * (e.g. an error branch nested inside a page's own Card). */
  bare?: boolean;
}) {
  const content = (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-status-danger/10 text-status-danger">
        <CircleAlert className="h-5 w-5" strokeWidth={2} />
      </div>
      <p className="pt-2 text-sm text-text-body">{message}</p>
    </div>
  );

  if (bare) {
    return <div className={className}>{content}</div>;
  }

  return <Card className={className}>{content}</Card>;
}
