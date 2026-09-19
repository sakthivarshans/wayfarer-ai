import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TripCard } from "@/features/trips/TripCard";
import type { Trip } from "@/features/trips/types";

const trip: Trip = {
  id: "trip-1",
  userId: "user-1",
  origin: "Mumbai",
  destination: "Goa",
  budget: 20000,
  days: 3,
  transportModePreference: "flight",
  createdAt: "2026-01-15T00:00:00.000Z",
};

describe("TripCard", () => {
  it("shows the origin, destination, days, and budget", () => {
    const { container } = render(<TripCard trip={trip} />);

    expect(container.textContent).toContain("Mumbai");
    expect(container.textContent).toContain("Goa");
    expect(container.textContent).toContain("3 days");
    expect(container.textContent).toContain("Budget 20,000");
  });

  it("links to the trip's detail page", () => {
    render(<TripCard trip={trip} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/trips/trip-1");
  });

  it("shows the transport mode preference label", () => {
    render(<TripCard trip={{ ...trip, transportModePreference: "any" }} />);
    expect(screen.getByText("Any")).toBeInTheDocument();
  });
});
