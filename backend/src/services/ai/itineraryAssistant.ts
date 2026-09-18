import type { Itinerary } from "../../types/itinerary";
import type { Trip } from "../../types/trip";
import { buildItineraryPrompt } from "./buildItineraryPrompt";
import { completeChat } from "./groq.provider";

/** Answers a free-text question about a trip, grounded in its saved itinerary. */
export async function answerItineraryQuestion(trip: Trip, itinerary: Itinerary, question: string): Promise<string> {
  const messages = buildItineraryPrompt(trip, itinerary, question);
  return completeChat(messages);
}
