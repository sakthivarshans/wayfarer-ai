import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LocalTransportCard } from "@/features/gettingAround/LocalTransportCard";
import type { LocalTransportOption } from "@/features/gettingAround/types";

const option: LocalTransportOption = {
  kind: "cab",
  provider: "Uber",
  label: "Book a ride with Uber",
  deepLink: "https://m.uber.com/ul/?action=setPickup&dropoff%5Bformatted_address%5D=Paris",
};

describe("LocalTransportCard", () => {
  it("shows the provider name and the action label", () => {
    const { container } = render(<LocalTransportCard option={option} />);

    expect(container.textContent).toContain("Uber");
    expect(container.textContent).toContain("Book a ride with Uber");
  });

  it("opens the deep link in a new tab without leaking the opener", () => {
    render(<LocalTransportCard option={option} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", option.deepLink);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
    expect(link.getAttribute("rel")).toContain("noreferrer");
  });
});
