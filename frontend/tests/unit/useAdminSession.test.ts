import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAdminSession } from "@/features/admin/useAdminSession";

const getIdToken = vi.fn();
let mockUser: { uid: string } | null = { uid: "user-1" };

vi.mock("@/features/auth/AuthContext", () => ({
  useAuth: () => ({ user: mockUser, getIdToken }),
}));

const getAdminSession = vi.fn();
vi.mock("@/features/admin/api", () => ({
  getAdminSession: (...args: unknown[]) => getAdminSession(...args),
}));

describe("useAdminSession", () => {
  beforeEach(() => {
    mockUser = { uid: "user-1" };
    getIdToken.mockReset().mockResolvedValue("fake-token");
    getAdminSession.mockReset();
  });

  it("starts as unknown (null), not false, while loading", () => {
    getAdminSession.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useAdminSession());

    expect(result.current.isAdmin).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it("reports isAdmin: true when the backend confirms it", async () => {
    getAdminSession.mockResolvedValue({ isAdmin: true });

    const { result } = renderHook(() => useAdminSession());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.isAdmin).toBe(true);
  });

  it("reports isAdmin: false for a regular user", async () => {
    getAdminSession.mockResolvedValue({ isAdmin: false });

    const { result } = renderHook(() => useAdminSession());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.isAdmin).toBe(false);
  });

  it("fails closed (isAdmin: false) when the session check errors, never granting access on failure", async () => {
    getAdminSession.mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useAdminSession());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.isAdmin).toBe(false);
  });

  it("fails closed when there's no token to send", async () => {
    getIdToken.mockResolvedValue(null);

    const { result } = renderHook(() => useAdminSession());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.isAdmin).toBe(false);
    expect(getAdminSession).not.toHaveBeenCalled();
  });

  it("reports isAdmin: false immediately for a signed-out user, without calling the API", async () => {
    mockUser = null;

    const { result } = renderHook(() => useAdminSession());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.isAdmin).toBe(false);
    expect(getAdminSession).not.toHaveBeenCalled();
  });
});
