import { describe, expect, it } from "vitest";
import { buildHotelOptions } from "../../src/services/hotels/deepLinks";

describe("buildHotelOptions", () => {
  it("returns Booking.com, Google Hotels, and Hostelworld links for the destination", () => {
    const options = buildHotelOptions("Goa");

    expect(options.map((o) => o.provider)).toEqual(["Booking.com", "Google Hotels", "Hostelworld"]);
    expect(options.every((o) => o.deepLink.includes("Goa"))).toBe(true);
  });

  it("URL-encodes destinations with spaces and special characters", () => {
    const options = buildHotelOptions("São Paulo");
    for (const option of options) {
      expect(option.deepLink).toContain(encodeURIComponent("São Paulo"));
    }
  });
});
