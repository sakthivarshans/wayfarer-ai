import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnalyticsSummaryCards } from "@/features/admin/AnalyticsSummaryCards";
import type { AnalyticsSummary } from "@/features/admin/types";

const analytics: AnalyticsSummary = {
  totalUsers: 42,
  totalTrips: 17,
  topDestinations: [
    { destination: "Paris", count: 5 },
    { destination: "Tokyo", count: 3 },
  ],
};

describe("AnalyticsSummaryCards", () => {
  it("shows the user and trip counts", () => {
    render(<AnalyticsSummaryCards analytics={analytics} />);

    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("17")).toBeInTheDocument();
    expect(screen.getByText("Total users")).toBeInTheDocument();
    expect(screen.getByText("Trips created")).toBeInTheDocument();
  });

  it("lists destinations ranked by count", () => {
    render(<AnalyticsSummaryCards analytics={analytics} />);

    expect(screen.getByText("Paris")).toBeInTheDocument();
    expect(screen.getByText("Tokyo")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows an empty state instead of an empty list", () => {
    render(<AnalyticsSummaryCards analytics={{ totalUsers: 0, totalTrips: 0, topDestinations: [] }} />);

    expect(screen.getByText("No trips yet.")).toBeInTheDocument();
  });
});
