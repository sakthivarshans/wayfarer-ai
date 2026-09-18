import type { Itinerary } from "../../types/itinerary";
import type { Trip } from "../../types/trip";
import type { GroqChatMessage } from "./groq.provider";

function describeDay(day: Itinerary["days"][number]): string {
  const activities = day.activities.map((activity) => `- ${activity.label}`).join("\n");
  return `Day ${day.day}:\n${activities}`;
}

/**
 * Builds the messages sent to Groq for a single Telegram Q&A turn. Kept
 * pure and separate from the network call so the prompt itself is
 * unit-testable without mocking `fetch`.
 */
export function buildItineraryPrompt(trip: Trip, itinerary: Itinerary, question: string): GroqChatMessage[] {
  const itinerarySummary = itinerary.days.map(describeDay).join("\n\n");

  const systemPrompt = [
    "You are a friendly, concise travel assistant for a trip-planning app called Wayfarer AI.",
    "Answer the traveler's question about their own trip using only the itinerary details below.",
    "If the answer isn't covered by the itinerary, say so plainly rather than guessing.",
    "Keep replies short — a few sentences, suitable for a Telegram chat message. No markdown formatting.",
    "",
    `Trip: ${trip.origin} to ${trip.destination}, ${trip.days} day(s), budget ${trip.budget}.`,
    `Transport: ${itinerary.transport.label} (${itinerary.transport.provider}).`,
    `Hotel: ${itinerary.hotel.label} (${itinerary.hotel.provider}).`,
    "",
    "Day-by-day itinerary:",
    itinerarySummary,
  ].join("\n");

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: question },
  ];
}
