import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ItineraryDayCard } from "@/features/itinerary/ItineraryDayCard";
import type { ItineraryDay } from "@/features/itinerary/types";

const day: ItineraryDay = {
  day: 1,
  activities: [
    { type: "arrival", label: "Arrive in Goa" },
    { type: "checkin", label: "Check in at your hotel" },
    {
      type: "place",
      label: "Visit Fort Aguada",
      place: {
        id: "p1",
        name: "Fort Aguada",
        description: "A 17th-century Portuguese fort",
        category: "sights",
        estimatedCost: 0,
        lat: 15.5,
        lng: 73.8,
      },
    },
  ],
};

describe("ItineraryDayCard", () => {
  it("shows the day number", () => {
    render(<ItineraryDayCard day={day} />);
    expect(screen.getByText("Day 1")).toBeInTheDocument();
  });

  it("lists every activity's label", () => {
    render(<ItineraryDayCard day={day} />);
    expect(screen.getByText("Arrive in Goa")).toBeInTheDocument();
    expect(screen.getByText("Check in at your hotel")).toBeInTheDocument();
    expect(screen.getByText("Visit Fort Aguada")).toBeInTheDocument();
  });

  it("shows a place's description and cost hint", () => {
    render(<ItineraryDayCard day={day} />);
    expect(screen.getByText("A 17th-century Portuguese fort")).toBeInTheDocument();
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("shows an estimated cost figure for a paid place", () => {
    const paidDay: ItineraryDay = {
      day: 2,
      activities: [
        {
          type: "place",
          label: "Visit a museum",
          place: {
            id: "p2",
            name: "Museum",
            description: null,
            category: "sights",
            estimatedCost: 500,
            lat: 15.5,
            lng: 73.8,
          },
        },
      ],
    };

    render(<ItineraryDayCard day={paidDay} />);
    expect(screen.getByText("~500 est.")).toBeInTheDocument();
  });

  it("renders free-time and departure activities without a place", () => {
    const lastDay: ItineraryDay = {
      day: 3,
      activities: [
        { type: "free", label: "Free time to explore at your own pace" },
        { type: "departure", label: "Depart from Goa" },
      ],
    };

    render(<ItineraryDayCard day={lastDay} />);
    expect(screen.getByText("Free time to explore at your own pace")).toBeInTheDocument();
    expect(screen.getByText("Depart from Goa")).toBeInTheDocument();
  });
});
