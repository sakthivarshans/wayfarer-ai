import type { Firestore } from "firebase-admin/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeFirestore } from "../helpers/fakeFirestore";
import type { Trip } from "../../src/types/trip";

let fakeDb: Firestore;

const getPlacesForTrip = vi.fn();
const getTransportForTrip = vi.fn();
const getHotelsForTrip = vi.fn();

vi.mock("../../src/config/firebaseAdmin", () => ({
  getFirestoreDb: () => fakeDb,
}));

vi.mock("../../src/services/places.service", () => ({ getPlacesForTrip }));
vi.mock("../../src/services/transport.service", () => ({ getTransportForTrip }));
vi.mock("../../src/services/hotels.service", () => ({ getHotelsForTrip }));

const { generateItineraryForTrip, getItineraryForTrip } = await import("../../src/services/itinerary.service");

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

const transportSummary = {
  distanceKm: 582.3,
  drivingDurationMinutes: 552,
  options: [{ mode: "flight", provider: "Google Flights", label: "Search flights", deepLink: "flight-link", recommended: true }],
};

const hotelSummary = {
  perNightBudgetHint: 5000,
  options: [{ provider: "Booking.com", label: "Search hotels", deepLink: "booking-link" }],
};

describe("itinerary.service", () => {
  beforeEach(() => {
    fakeDb = createFakeFirestore();
    getPlacesForTrip.mockReset().mockResolvedValue([]);
    getTransportForTrip.mockReset().mockResolvedValue(transportSummary);
    getHotelsForTrip.mockReset().mockReturnValue(hotelSummary);
  });

  describe("getItineraryForTrip", () => {
    it("returns null when nothing has been generated yet", async () => {
      const itinerary = await getItineraryForTrip(trip());
      expect(itinerary).toBeNull();
      expect(getPlacesForTrip).not.toHaveBeenCalled();
    });
  });

  describe("generateItineraryForTrip", () => {
    it("combines places/transport/hotels into an itinerary and persists it", async () => {
      const itinerary = await generateItineraryForTrip(trip());

      expect(itinerary.tripId).toBe("trip-1");
      expect(itinerary.days).toHaveLength(3);
      expect(itinerary.transport).toMatchObject({ mode: "flight" });
      expect(itinerary.hotel).toMatchObject({ provider: "Booking.com" });
    });

    it("makes the generated itinerary fetchable via getItineraryForTrip", async () => {
      const generated = await generateItineraryForTrip(trip());
      const fetched = await getItineraryForTrip(trip());

      expect(fetched).toEqual(generated);
    });

    it("overwrites a previously generated itinerary on the next call (regenerate)", async () => {
      getPlacesForTrip.mockResolvedValueOnce([]);
      await generateItineraryForTrip(trip());

      getPlacesForTrip.mockResolvedValueOnce([
        { id: "p1", name: "Fort Aguada", description: null, category: "sights", estimatedCost: 0, lat: 15.5, lng: 73.8 },
      ]);
      const regenerated = await generateItineraryForTrip(trip());
      const fetched = await getItineraryForTrip(trip());

      expect(regenerated.days.some((d) => d.activities.some((a) => a.type === "place"))).toBe(true);
      expect(fetched).toEqual(regenerated);
    });
  });
});
