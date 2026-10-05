import { beforeEach, describe, expect, it, vi } from "vitest";

const completeChat = vi.fn();

vi.mock("../../src/services/ai/groq.provider", () => ({ completeChat }));
vi.mock("../../src/config/logger", () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

const { buildConnectivityMessages, buildVisaMessages, generateSummary } = await import(
  "../../src/services/travelEssentials/travelSummaryAi"
);

const facts = {
  passportName: "India",
  destinationName: "France",
  status: "visa-required" as const,
  entry: { status: "visa-required" as const, days: null, confidence: "high" as const },
};

describe("buildVisaMessages", () => {
  it("passes only the structured facts to the model", () => {
    const [system, user] = buildVisaMessages(facts);

    expect(system?.role).toBe("system");
    expect(user?.content).toContain("Passport country: India");
    expect(user?.content).toContain("Destination country: France");
    expect(user?.content).toContain("Requirement: visa-required");
  });

  it("forbids inventing fees, processing times, or documents, and asks to verify officially", () => {
    const system = buildVisaMessages(facts)[0]?.content.toLowerCase() ?? "";

    expect(system).toContain("only the facts provided");
    expect(system).toContain("fees");
    expect(system).toContain("processing times");
    expect(system).toContain("official");
  });

  it("tells the model when sources disagree", () => {
    const user = buildVisaMessages({
      ...facts,
      entry: { status: "visa-on-arrival", days: 60, confidence: "disputed" },
    })[1]?.content;

    expect(user).toContain("sources disagree");
  });
});

describe("buildConnectivityMessages", () => {
  it("asks for a hedged general overview with no prices or plan names", () => {
    const [system, user] = buildConnectivityMessages("Japan");

    expect(system?.content.toLowerCase()).toContain("do not state prices");
    expect(user?.content).toBe("Destination: Japan");
  });
});

describe("generateSummary", () => {
  beforeEach(() => {
    completeChat.mockReset();
  });

  it("strips markdown and collapses whitespace", async () => {
    completeChat.mockResolvedValue("**You'll need a visa.**\n\n  Check *official* sources.");

    await expect(generateSummary([], "test")).resolves.toBe("You'll need a visa. Check official sources.");
  });

  it("returns null instead of throwing when the model call fails", async () => {
    completeChat.mockRejectedValue(new Error("groq down"));

    await expect(generateSummary([], "test")).resolves.toBeNull();
  });

  it("returns null for an empty response", async () => {
    completeChat.mockResolvedValue("   ");

    await expect(generateSummary([], "test")).resolves.toBeNull();
  });

  it("clips overly long output at a sentence boundary", async () => {
    completeChat.mockResolvedValue(`${"This is a sentence. ".repeat(80)}`);

    const result = await generateSummary([], "test");

    expect(result).not.toBeNull();
    expect((result ?? "").length).toBeLessThanOrEqual(900);
    expect(result).toMatch(/\.$/);
  });
});
