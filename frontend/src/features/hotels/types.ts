export interface HotelOption {
  provider: string;
  label: string;
  deepLink: string;
}

export interface HotelSummary {
  perNightBudgetHint: number;
  options: HotelOption[];
}
