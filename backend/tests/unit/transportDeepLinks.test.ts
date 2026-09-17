import { describe, expect, it } from "vitest";
import { buildTransportOptions } from "../../src/services/transport/deepLinks";

describe("buildTransportOptions", () => {
  it("returns one option per mode with correctly encoded deep links", () => {
    const options = buildTransportOptions("Mumbai", "Goa", "any");

    expect(options).toHaveLength(3);
    expect(options.find((o) => o.mode === "flight")?.deepLink).toContain(
      encodeURIComponent("Flights from Mumbai to Goa")
    );
    expect(options.find((o) => o.mode === "train")?.deepLink).toContain("origin=Mumbai&destination=Goa");
    expect(options.find((o) => o.mode === "bus")?.deepLink).toBe("https://www.rome2rio.com/s/Mumbai/Goa");
  });

  it("marks nothing recommended and keeps default order for 'any'", () => {
    const options = buildTransportOptions("Mumbai", "Goa", "any");

    expect(options.every((o) => !o.recommended)).toBe(true);
    expect(options.map((o) => o.mode)).toEqual(["flight", "train", "bus"]);
  });

  it("moves the preferred mode to the front and marks it recommended", () => {
    const options = buildTransportOptions("Mumbai", "Goa", "bus");

    expect(options[0]).toMatchObject({ mode: "bus", recommended: true });
    expect(options.filter((o) => o.recommended)).toHaveLength(1);
    expect(options.map((o) => o.mode)).toEqual(["bus", "flight", "train"]);
  });

  it("handles names with spaces and special characters safely", () => {
    const options = buildTransportOptions("New York", "São Paulo", "flight");
    expect(options[0]?.deepLink).toContain(encodeURIComponent("New York"));
    expect(options[0]?.deepLink).toContain(encodeURIComponent("São Paulo"));
  });
});
