import { describe, expect, it } from "vitest";
import { buildItineraryPrompt } from "../../src/services/ai/buildItineraryPrompt";
import type { Itinerary } from "../../src/types/itinerary";
import type { Trip } from "../../src/types/trip";

const trip: Trip = {
  id: "trip-1",
  userId: "user-1",
  origin: "Mumbai",
  destination: "Goa",
  budget: 20000,
  days: 2,
  transportModePreference: "flight",
  createdAt: new Date().toISOString(),
};

const itinerary: Itinerary = {
  tripId: "trip-1",
  transport: { mode: "flight", provider: "Google Flights", label: "Search flights", deepLink: "flight-link", recommended: true },
  hotel: { provider: "Booking.com", label: "Search hotels", deepLink: "booking-link" },
  days: [
    {
      day: 1,
      activities: [
        { type: "arrival", label: "Arrive in Goa" },
        { type: "checkin", label: "Check in at your hotel" },
        {
          type: "place",
          label: "Visit Fort Aguada",
          place: { id: "p1", name: "Fort Aguada", description: null, category: "sights", estimatedCost: 0, lat: 15.5, lng: 73.8 },
        },
      ],
    },
    {
      day: 2,
      activities: [{ type: "free", label: "Free time to explore at your own pace" }, { type: "departure", label: "Depart from Goa" }],
    },
  ],
  generatedAt: new Date().toISOString(),
};

describe("buildItineraryPrompt", () => {
  it("puts the user's question as the final user message", () => {
    const messages = buildItineraryPrompt(trip, itinerary, "What should I do on day 2?");

    expect(messages).toHaveLength(2);
    expect(messages[1]).toEqual({ role: "user", content: "What should I do on day 2?" });
  });

  it("includes the trip, transport, hotel, and every day's activities in the system prompt", () => {
    const [systemMessage] = buildItineraryPrompt(trip, itinerary, "anything?");
    const content = systemMessage?.content ?? "";

    expect(content).toContain("Mumbai to Goa");
    expect(content).toContain("Google Flights");
    expect(content).toContain("Booking.com");
    expect(content).toContain("Day 1:");
    expect(content).toContain("Visit Fort Aguada");
    expect(content).toContain("Day 2:");
    expect(content).toContain("Depart from Goa");
  });

  it("instructs the model to stay grounded in the itinerary and keep replies short", () => {
    const [systemMessage] = buildItineraryPrompt(trip, itinerary, "anything?");
    expect(systemMessage?.content).toMatch(/only the itinerary/i);
    expect(systemMessage?.content).toMatch(/short/i);
  });
});
