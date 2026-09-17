import type { HotelOption } from "../../types/hotel";

/**
 * Trips don't carry travel dates (see types/trip.ts — only origin,
 * destination, budget, and a day count), so these links search by
 * destination only; the provider's own site is where the user picks
 * dates and actually books.
 */
export function buildHotelOptions(destination: string): HotelOption[] {
  return [
    {
      provider: "Booking.com",
      label: "Search hotels",
      deepLink: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}`,
    },
    {
      provider: "Google Hotels",
      label: "Compare hotels",
      deepLink: `https://www.google.com/travel/hotels?q=${encodeURIComponent(`hotels in ${destination}`)}`,
    },
    {
      provider: "Hostelworld",
      label: "Search budget stays",
      deepLink: `https://www.hostelworld.com/search?search=${encodeURIComponent(destination)}`,
    },
  ];
}
