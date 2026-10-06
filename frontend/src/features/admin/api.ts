import { apiFetch } from "@/lib/apiClient";
import type { AdminSession, AnalyticsSummary, LocalGuide, LocalGuideInput } from "./types";

export async function getAdminSession(token: string): Promise<AdminSession> {
  const { session } = await apiFetch<{ session: AdminSession }>("/admin/session", { token });
  return session;
}

export async function getAnalytics(token: string): Promise<AnalyticsSummary> {
  const { analytics } = await apiFetch<{ analytics: AnalyticsSummary }>("/admin/analytics", { token });
  return analytics;
}

export async function listLocalGuides(token: string): Promise<LocalGuide[]> {
  const { guides } = await apiFetch<{ guides: LocalGuide[] }>("/admin/local-guides", { token });
  return guides;
}

export async function createLocalGuide(token: string, input: LocalGuideInput): Promise<LocalGuide> {
  const { guide } = await apiFetch<{ guide: LocalGuide }>("/admin/local-guides", {
    token,
    method: "POST",
    body: input,
  });
  return guide;
}

export async function updateLocalGuide(
  token: string,
  guideId: string,
  input: Partial<LocalGuideInput>
): Promise<LocalGuide> {
  const { guide } = await apiFetch<{ guide: LocalGuide }>(`/admin/local-guides/${guideId}`, {
    token,
    method: "PATCH",
    body: input,
  });
  return guide;
}

export async function deleteLocalGuide(token: string, guideId: string): Promise<void> {
  await apiFetch<void>(`/admin/local-guides/${guideId}`, { token, method: "DELETE" });
}
