import { logger } from "../../config/logger";
import { completeChat, type GroqChatMessage } from "../ai/groq.provider";
import type { VisaEntry, VisaSectionStatus } from "../../types/travelEssentials";

const MAX_SUMMARY_CHARS = 900;

interface VisaPromptFacts {
  passportName: string;
  destinationName: string;
  status: VisaSectionStatus;
  entry: VisaEntry | null;
}

/**
 * The model is only allowed to rephrase the structured facts we give it. A
 * hallucinated fee, processing time, or document list on a visa page could
 * genuinely hurt someone, so the prompt forbids adding anything and the UI
 * shows the deterministic headline separately from this text.
 */
export function buildVisaMessages(facts: VisaPromptFacts): GroqChatMessage[] {
  const disputed = facts.entry?.confidence === "disputed";
  const factLines = [
    `Passport country: ${facts.passportName}`,
    `Destination country: ${facts.destinationName}`,
    `Requirement: ${facts.status}`,
    `Permitted stay in days: ${facts.entry?.days ?? "not specified"}`,
    `Data confidence: ${facts.entry?.confidence ?? "unknown"}${disputed ? " (our sources disagree about this route)" : ""}`,
  ];

  return [
    {
      role: "system",
      content:
        "You explain travel entry requirements in plain, friendly language. Use ONLY the facts provided. Do NOT " +
        "mention fees, processing times, required documents, passport validity, or exceptions — you were not given " +
        "them. If the facts say sources disagree, say the information is uncertain. Write 2 to 3 sentences, no " +
        "markdown, no lists. End by telling the traveller to verify with the destination's official government or " +
        "embassy website before booking.",
    },
    { role: "user", content: factLines.join("\n") },
  ];
}

export function buildConnectivityMessages(destinationName: string): GroqChatMessage[] {
  return [
    {
      role: "system",
      content:
        "You give a brief, general overview of getting mobile data as a tourist. Speak in general terms and hedge " +
        "('often', 'typically', 'usually'). Do NOT state prices, specific plan names, or operator details, and do " +
        "not promise availability. Cover: physical SIM versus eSIM, and whether SIMs are typically sold at airports. " +
        "3 to 4 sentences, no markdown, no lists.",
    },
    { role: "user", content: `Destination: ${destinationName}` },
  ];
}

function tidy(text: string): string | null {
  const cleaned = text
    .replace(/[*_#`>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) {
    return null;
  }
  if (cleaned.length <= MAX_SUMMARY_CHARS) {
    return cleaned;
  }
  const clipped = cleaned.slice(0, MAX_SUMMARY_CHARS);
  const lastStop = clipped.lastIndexOf(". ");
  return lastStop > 200 ? clipped.slice(0, lastStop + 1) : `${clipped.trimEnd()}…`;
}

/** Runs a Groq completion, returning null (never throwing) on any failure. */
export async function generateSummary(messages: GroqChatMessage[], context: string): Promise<string | null> {
  try {
    return tidy(await completeChat(messages));
  } catch (err) {
    logger.warn({ err, context }, "AI travel summary failed; falling back to the template summary");
    return null;
  }
}
