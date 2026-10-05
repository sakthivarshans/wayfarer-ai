import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConnectivityCard } from "@/features/travelEssentials/ConnectivityCard";
import type { ConnectivitySection } from "@/features/travelEssentials/types";

const connectivity: ConnectivitySection = {
  summary: "Travellers to Japan usually choose between a local SIM, an eSIM, or roaming.",
  summarySource: "ai",
  esimOptions: [
    { provider: "Airalo", label: "Browse Japan eSIM plans", deepLink: "https://www.airalo.com/japan-esim", countrySpecific: true },
    { provider: "Holafly", label: "Browse Japan eSIM plans", deepLink: "https://esim.holafly.com/esim-japan/", countrySpecific: true },
  ],
};

describe("ConnectivityCard", () => {
  it("shows the summary and both provider links", () => {
    render(<ConnectivityCard connectivity={connectivity} />);

    expect(screen.getByText(connectivity.summary)).toBeInTheDocument();
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "https://www.airalo.com/japan-esim");
    expect(links[1]).toHaveAttribute("href", "https://esim.holafly.com/esim-japan/");
  });

  it("opens provider links safely in a new tab", () => {
    render(<ConnectivityCard connectivity={connectivity} />);

    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link.getAttribute("rel")).toContain("noreferrer");
    }
  });
});
