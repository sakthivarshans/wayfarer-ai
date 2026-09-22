"use client";

import { useEffect, useState } from "react";

/**
 * Fetches a representative photo for a place name via Wikipedia's public
 * search+pageimages API — no API key or account required (unlike a stock
 * photo API such as Pexels/Unsplash), and named landmarks get their actual
 * real photo rather than a generic keyword match. Places without a
 * reasonable Wikipedia match resolve to `null`, and callers should fall
 * back to a non-photo treatment rather than guessing.
 *
 * One request per unique place name for the whole session — results are
 * cached in a module-level map so scrolling a results grid or revisiting a
 * page doesn't refetch the same place repeatedly.
 */

const photoCache = new Map<string, string | null>();
const inFlight = new Map<string, Promise<string | null>>();

async function fetchPlacePhoto(query: string): Promise<string | null> {
  const cached = photoCache.get(query);
  if (cached !== undefined) return cached;

  const existing = inFlight.get(query);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const url = new URL("https://en.wikipedia.org/w/api.php");
      url.search = new URLSearchParams({
        action: "query",
        format: "json",
        origin: "*",
        generator: "search",
        gsrsearch: query,
        gsrlimit: "1",
        prop: "pageimages",
        piprop: "thumbnail",
        pithumbsize: "600",
      }).toString();

      const res = await fetch(url.toString());
      if (!res.ok) return null;

      const data = await res.json();
      const pages = data?.query?.pages;
      if (!pages) return null;

      const page = Object.values(pages)[0] as { thumbnail?: { source?: string } } | undefined;
      return page?.thumbnail?.source ?? null;
    } catch {
      // Network failure, CORS hiccup, malformed response, etc. — treat as
      // "no photo available" rather than surfacing an error for a
      // decorative image.
      return null;
    }
  })();

  inFlight.set(query, promise);
  const result = await promise;
  photoCache.set(query, result);
  inFlight.delete(query);
  return result;
}

export function usePlacePhoto(query: string): { photoUrl: string | null; loading: boolean } {
  const [photoUrl, setPhotoUrl] = useState<string | null>(() => photoCache.get(query) ?? null);
  const [loading, setLoading] = useState(() => !photoCache.has(query));

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }
    if (photoCache.has(query)) {
      setPhotoUrl(photoCache.get(query) ?? null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchPlacePhoto(query).then((url) => {
      if (!cancelled) {
        setPhotoUrl(url);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [query]);

  return { photoUrl, loading };
}
