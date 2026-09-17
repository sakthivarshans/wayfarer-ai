export interface HotelOption {
  /** Human-readable provider name, e.g. "Booking.com". */
  provider: string;
  /** Short label describing what the link does, shown as the button text. */
  label: string;
  /** Deep link to the provider's own search results — booking happens there. */
  deepLink: string;
}

export interface HotelSummary {
  /** Rough per-night budget hint (trip.budget / trip.days), for display only. */
  perNightBudgetHint: number;
  options: HotelOption[];
}
