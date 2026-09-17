import { withRetry } from "../../utils/retry";
import { env } from "../../config/env";
import type { GeoPoint } from "../../types/place";

const DEFAULT_OSRM_BASE_URL = "https://router.project-osrm.org";

export interface RoadRoute {
  distanceKm: number;
  durationMinutes: number;
}

interface OsrmResponse {
  code: string;
  routes?: Array<{ distance: number; duration: number }>;
}

function isHttpError(status: number): Error & { status: number } {
  const err = new Error(`OSRM request failed with status ${status}`) as Error & { status: number };
  err.status = status;
  return err;
}

/**
 * Estimates driving distance/duration between two points using OSRM. This
 * is a road-routing estimate, not a real train/bus/flight duration — it
 * exists to give the transport tab *some* concrete number for context
 * alongside the deep links, not to replace live schedules/pricing.
 */
export async function fetchRoadRoute(origin: GeoPoint, destination: GeoPoint): Promise<RoadRoute> {
  const baseUrl = env.OSRM_BASE_URL ?? DEFAULT_OSRM_BASE_URL;
  const url =
    `${baseUrl}/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
    `?overview=false&alternatives=false&steps=false`;

  const data = await withRetry(
    async () => {
      const res = await fetch(url);
      if (!res.ok) {
        throw isHttpError(res.status);
      }
      return (await res.json()) as OsrmResponse;
    },
    { attempts: 3, baseDelayMs: 500 }
  );

  const route = data.routes?.[0];
  if (data.code !== "Ok" || !route) {
    throw new Error(`OSRM returned no route (code: ${data.code})`);
  }

  return {
    distanceKm: Math.round(route.distance / 100) / 10,
    durationMinutes: Math.round(route.duration / 60),
  };
}
