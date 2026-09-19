import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/lib/apiClient";
import { useItinerary } from "@/features/itinerary/useItinerary";

const getIdToken = vi.fn();
const getItinerary = vi.fn();
const generateItinerary = vi.fn();

vi.mock("@/features/auth/AuthContext", () => ({
  useAuth: () => ({ getIdToken }),
}));

vi.mock("@/features/itinerary/api", () => ({
  getItinerary: (...args: unknown[]) => getItinerary(...args),
  generateItinerary: (...args: unknown[]) => generateItinerary(...args),
}));

const fakeItinerary = {
  tripId: "trip-1",
  transport: { mode: "flight", provider: "Google Flights", label: "Search flights", deepLink: "link", recommended: true },
  hotel: { provider: "Booking.com", label: "Search hotels", deepLink: "link" },
  days: [{ day: 1, activities: [] }],
  generatedAt: new Date().toISOString(),
};

describe("useItinerary", () => {
  beforeEach(() => {
    getIdToken.mockReset().mockResolvedValue("fake-token");
    getItinerary.mockReset();
    generateItinerary.mockReset().mockResolvedValue(fakeItinerary);
  });

  it("treats a 404 from GET as 'not generated yet', not an error", async () => {
    getItinerary.mockRejectedValueOnce(new ApiClientError(404, "NOT_FOUND", "no itinerary yet"));

    const { result } = renderHook(() => useItinerary("trip-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.itinerary).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("surfaces a non-404 load failure as a real error", async () => {
    getItinerary.mockRejectedValueOnce(new ApiClientError(500, "INTERNAL_ERROR", "server exploded"));

    const { result } = renderHook(() => useItinerary("trip-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.itinerary).toBeNull();
    expect(result.current.error).toBe("server exploded");
  });

  it("loads an existing itinerary", async () => {
    getItinerary.mockResolvedValueOnce(fakeItinerary);

    const { result } = renderHook(() => useItinerary("trip-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.itinerary).toEqual(fakeItinerary);
  });

  it("generate() populates the itinerary and clears generating state", async () => {
    getItinerary.mockRejectedValueOnce(new ApiClientError(404, "NOT_FOUND", "none yet"));

    const { result } = renderHook(() => useItinerary("trip-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.generate();
    });

    expect(generateItinerary).toHaveBeenCalledWith("fake-token", "trip-1");
    expect(result.current.itinerary).toEqual(fakeItinerary);
    expect(result.current.generating).toBe(false);
    expect(result.current.generateError).toBeNull();
  });
});
