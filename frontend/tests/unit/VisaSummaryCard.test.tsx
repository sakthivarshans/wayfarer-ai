import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VisaSummaryCard } from "@/features/travelEssentials/VisaSummaryCard";
import type { VisaSection } from "@/features/travelEssentials/types";

const baseVisa: VisaSection = {
  status: "visa-required",
  days: null,
  confidence: "high",
  sourcesDisagree: false,
  headline: "Visa required — apply before you travel",
  summary: "India passport holders generally need to apply for a visa before travelling to France.",
  summarySource: "template",
  officialLinks: [
    { label: "IATA Travel Centre — check entry rules", url: "https://www.iatatravelcentre.com/" },
    { label: "Search for France's official visa page", url: "https://www.google.com/search?q=test" },
  ],
};

describe("VisaSummaryCard", () => {
  it("shows the headline, passport name, and summary text", () => {
    render(<VisaSummaryCard visa={baseVisa} passportName="India" />);

    expect(screen.getByText(baseVisa.headline)).toBeInTheDocument();
    expect(screen.getByText(baseVisa.summary)).toBeInTheDocument();
    expect(screen.getByText(/For India passport holders/)).toBeInTheDocument();
  });

  it("renders every official link opening in a new tab safely", () => {
    render(<VisaSummaryCard visa={baseVisa} passportName="India" />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link.getAttribute("rel")).toContain("noopener");
    }
  });

  it("shows the disputed-sources warning only when sourcesDisagree is true", () => {
    const { rerender } = render(<VisaSummaryCard visa={baseVisa} passportName="India" />);
    expect(screen.queryByText(/sources disagree/)).not.toBeInTheDocument();

    rerender(<VisaSummaryCard visa={{ ...baseVisa, sourcesDisagree: true }} passportName="India" />);
    expect(screen.getByText(/sources disagree/)).toBeInTheDocument();
  });

  it("doesn't claim a passport name when none is known", () => {
    render(<VisaSummaryCard visa={baseVisa} passportName={null} />);
    expect(screen.queryByText(/For .* passport holders/)).not.toBeInTheDocument();
  });
});
