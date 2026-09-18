import { describe, expect, it } from "vitest";
import { buildItinerary } from "../../src/services/itinerary/build";
import type { HotelSummary } from "../../src/types/hotel";
import type { Place } from "../../src/types/place";
import type { Trip } from "../../src/types/trip";
import type { TransportSummary } from "../../src/types/transport";

function trip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: "trip-1",
    userId: "user-1",
    origin: "Mumbai",
    destination: "Goa",
    budget: 20000,
    days: 3,
    transportModePreference: "flight",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function place(overrides: Partial<Place> = {}): Place {
  return {
    id: "p1",
    name: "Fort Aguada",
    description: null,
    category: "sights",
    estimatedCost: 0,
    lat: 15.5,
    lng: 73.8,
    ...overrides,
  };
}

function transportSummary(overrides: Partial<TransportSummary> = {}): TransportSummary {
  return {
    distanceKm: 582.3,
    drivingDurationMinutes: 552,
    options: [
      { mode: "flight", provider: "Google Flights", label: "Search flights", deepLink: "flight-link", recommended: true },
      { mode: "train", provider: "Google Maps", label: "Search trains & transit", deepLink: "train-link", recommended: false },
      { mode: "bus", provider: "Rome2Rio", label: "Compare buses & trains", deepLink: "bus-link", recommended: false },
    ],
    ...overrides,
  };
}

function hotelSummary(overrides: Partial<HotelSummary> = {}): HotelSummary {
  return {
    perNightBudgetHint: 5000,
    options: [
      { provider: "Booking.com", label: "Search hotels", deepLink: "booking-link" },
      { provider: "Google Hotels", label: "Compare hotels", deepLink: "google-hotels-link" },
      { provider: "Hostelworld", label: "Search budget stays", deepLink: "hostelworld-link" },
    ],
    ...overrides,
  };
}

describe("buildItinerary", () => {
  it("chooses the first transport option and first hotel option as the trip-level summary", () => {
    const itinerary = buildItinerary(trip(), [], transportSummary(), hotelSummary());

    expect(itinerary.tripId).toBe("trip-1");
    expect(itinerary.transport).toMatchObject({ mode: "flight", provider: "Google Flights" });
    expect(itinerary.hotel).toMatchObject({ provider: "Booking.com" });
  });

  it("opens day 1 with arrival + check-in and closes the last day with departure", () => {
    const itinerary = buildItinerary(trip({ days: 3 }), [], transportSummary(), hotelSummary());

    expect(itinerary.days).toHaveLength(3);
    expect(itinerary.days[0]?.activities[0]).toMatchObject({ type: "arrival", label: "Arrive in Goa" });
    expect(itinerary.days[0]?.activities[1]).toMatchObject({ type: "checkin" });

    const lastDay = itinerary.days[itinerary.days.length - 1];
    expect(lastDay?.activities.at(-1)).toMatchObject({ type: "departure", label: "Depart from Goa" });
  });

  it("distributes places round-robin across days, starting on day 1", () => {
    const places = [place({ id: "p1", name: "A" }), place({ id: "p2", name: "B" }), place({ id: "p3", name: "C" })];
    const itinerary = buildItinerary(trip({ days: 3 }), places, transportSummary(), hotelSummary());

    const placesByDay = itinerary.days.map((day) => day.activities.filter((a) => a.type === "place").map((a) => a.place?.id));
    expect(placesByDay).toEqual([["p1"], ["p2"], ["p3"]]);
  });

  it("wraps places round-robin when there are more places than days", () => {
    const places = [
      place({ id: "p1" }),
      place({ id: "p2" }),
      place({ id: "p3" }),
      place({ id: "p4" }),
      place({ id: "p5" }),
    ];
    const itinerary = buildItinerary(trip({ days: 2 }), places, transportSummary(), hotelSummary());

    const placesByDay = itinerary.days.map((day) => day.activities.filter((a) => a.type === "place").map((a) => a.place?.id));
    expect(placesByDay).toEqual([
      ["p1", "p3", "p5"],
      ["p2", "p4"],
    ]);
  });

  it("fills a day with no assigned place with free time instead of leaving it empty", () => {
    const places = [place({ id: "p1" })];
    const itinerary = buildItinerary(trip({ days: 3 }), places, transportSummary(), hotelSummary());

    expect(itinerary.days[0]?.activities.some((a) => a.type === "place")).toBe(true);
    expect(itinerary.days[1]?.activities.some((a) => a.type === "free")).toBe(true);
    // Day 3 gets free time too, plus the departure activity appended after it.
    expect(itinerary.days[2]?.activities.some((a) => a.type === "free")).toBe(true);
    expect(itinerary.days[2]?.activities.some((a) => a.type === "departure")).toBe(true);
  });

  it("handles a single-day trip: arrival, check-in, places, then departure all on day 1", () => {
    const itinerary = buildItinerary(trip({ days: 1 }), [place()], transportSummary(), hotelSummary());

    expect(itinerary.days).toHaveLength(1);
    const types = itinerary.days[0]?.activities.map((a) => a.type);
    expect(types).toEqual(["arrival", "checkin", "place", "departure"]);
  });

  it("sets generatedAt to an ISO timestamp", () => {
    const itinerary = buildItinerary(trip(), [], transportSummary(), hotelSummary());
    expect(() => new Date(itinerary.generatedAt).toISOString()).not.toThrow();
  });
});
