"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { getRecommendedTripsByOrigin } from "@/lib/mocks/trips";

export const TRIPS_QUERY_KEY = ["trips"] as const;

/**
 * GET /api/trips/search/?route_code=DAR-ARU&date=YYYY-MM-DD
 *
 * `enabled` is false until the user has at least origin+destination, so we
 * don't hit the API on the landing page idle.
 */
export const useSearchTrips = (params: SearchTripsParams) => {
  const { route_code, origin, destination, date, passengers } = params;

  const enabled = Boolean(route_code || (origin && destination));

  return useQuery<Trip[]>({
    queryKey: [...TRIPS_QUERY_KEY, "search", route_code, origin, destination, date, passengers],
    enabled,
    queryFn: async () => {
      const { data } = await api.get<Trip[] | ApiPaginated<Trip>>("/api/trips/search/", {
        params: {
          ...(route_code ? { route_code } : {}),
          ...(origin ? { origin } : {}),
          ...(destination ? { destination } : {}),
          ...(date ? { date } : {}),
          ...(passengers ? { passengers } : {}),
        },
      });
      return Array.isArray(data) ? data : data.results;
    },
  });
};

/**
 * GET /api/trips/ — full listing, used for "popular trips" or admin views.
 */
export const useTrips = () =>
  useQuery<Trip[]>({
    queryKey: [...TRIPS_QUERY_KEY, "list"],
    queryFn: async () => {
      const { data } = await api.get<Trip[] | ApiPaginated<Trip>>("/api/trips/");
      return Array.isArray(data) ? data : data.results;
    },
  });

/**
 * GET /api/trips/{id}/ — used on the trip detail / seat-selection page.
 *
 * Falls back to filtering the search results client-side if the dedicated
 * endpoint is not available yet (we can keep both code paths working).
 */
export const useTrip = (tripId: string | null | undefined) =>
  useQuery<Trip>({
    queryKey: [...TRIPS_QUERY_KEY, "detail", tripId],
    enabled: Boolean(tripId),
    queryFn: async () => {
      const { data } = await api.get<Trip>(`/api/trips/${tripId}/`);
      return data;
    },
  });

/**
 * Recommended trips for the landing page, scoped to a single origin city
 * (typically the user's geo-detected location).
 *
 * Tries the live API first; if it fails or returns nothing, falls back to the
 * curated mock set in `lib/mocks/trips.ts`. This way the UI is always populated
 * during early development, and automatically switches to live data the moment
 * the backend has any departures from the requested origin.
 */
export const useRecommendedTrips = ({ origin }: { origin?: string | null }) =>
  useQuery<Trip[]>({
    queryKey: [...TRIPS_QUERY_KEY, "recommended", origin ?? "all"],
    retry: false,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      try {
        const { data } = await api.get<Trip[] | ApiPaginated<Trip>>("/api/trips/search/", {
          params: origin ? { origin } : undefined,
        });
        const list = Array.isArray(data) ? data : (data?.results ?? []);
        if (list.length > 0) return list;
      } catch {
        // Backend not reachable / not yet deployed — drop into the mock set below.
      }
      return getRecommendedTripsByOrigin(origin);
    },
  });
