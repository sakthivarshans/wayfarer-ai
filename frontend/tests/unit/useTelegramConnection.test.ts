import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTelegramConnection } from "@/features/telegram/useTelegramConnection";

const getIdToken = vi.fn();
const getTelegramStatus = vi.fn();
const connectTelegram = vi.fn();

vi.mock("@/features/auth/AuthContext", () => ({
  useAuth: () => ({ getIdToken }),
}));

vi.mock("@/features/telegram/api", () => ({
  getTelegramStatus: (...args: unknown[]) => getTelegramStatus(...args),
  connectTelegram: (...args: unknown[]) => connectTelegram(...args),
}));

describe("useTelegramConnection", () => {
  beforeEach(() => {
    getIdToken.mockReset().mockResolvedValue("fake-token");
    getTelegramStatus.mockReset().mockResolvedValue({ connected: false });
    connectTelegram.mockReset().mockResolvedValue({ connected: true, botUsername: "MyTripBot" });
  });

  it("loads the initial connection status", async () => {
    const { result } = renderHook(() => useTelegramConnection());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.status).toEqual({ connected: false });
    expect(getTelegramStatus).toHaveBeenCalledWith("fake-token");
  });

  it("surfaces a load error without crashing", async () => {
    getTelegramStatus.mockRejectedValueOnce(new Error("boom"));

    const { result } = renderHook(() => useTelegramConnection());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Couldn't load your Telegram connection.");
  });

  it("connects and updates status on success", async () => {
    const { result } = renderHook(() => useTelegramConnection());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let succeeded = false;
    await act(async () => {
      succeeded = await result.current.connect("123:abc");
    });

    expect(succeeded).toBe(true);
    expect(connectTelegram).toHaveBeenCalledWith("fake-token", "123:abc");
    expect(result.current.status).toEqual({ connected: true, botUsername: "MyTripBot" });
    expect(result.current.connecting).toBe(false);
  });

  it("surfaces a connect error and leaves status untouched", async () => {
    connectTelegram.mockRejectedValueOnce(new Error("bad token"));

    const { result } = renderHook(() => useTelegramConnection());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let succeeded = true;
    await act(async () => {
      succeeded = await result.current.connect("bad");
    });

    expect(succeeded).toBe(false);
    expect(result.current.connectError).toBe("Couldn't connect your bot.");
    expect(result.current.status).toEqual({ connected: false });
  });
});
