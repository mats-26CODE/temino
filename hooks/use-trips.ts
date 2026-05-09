"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { fetchAllPages } from "@/lib/fetch-all-pages";
import { apiTripSeatToSeat } from "@/lib/trip-seats";

export const TRIPS_QUERY_KEY = ["trips"] as const;

/**
 * GET /api/trips/search/
 */
export const useSearchTrips = (params: SearchTripsParams) => {
  const { route_code, origin, destination, date, passengers } = params;

  const enabled = Boolean(route_code || (origin && destination));

  return useQuery<Trip[]>({
    queryKey: [...TRIPS_QUERY_KEY, "search", route_code, origin, destination, date, passengers],
    enabled,
    retry: false,
    queryFn: async () => {
      const minPassengers = Math.max(1, passengers ?? 1);
      const filterByAvailability = (trips: Trip[]) =>
        trips.filter((t) => (t.available_seats ?? 0) >= minPassengers);

      const list = await fetchAllPages<Trip>("/api/trips/search/", {
        ...(route_code ? { route_code } : {}),
        ...(origin ? { origin } : {}),
        ...(destination ? { destination } : {}),
        ...(date ? { departure_date: date } : {}),
        ...(passengers ? { passengers } : {}),
      });

      return filterByAvailability(list);
    },
  });
};

/**
 * GET /api/trips/
 */
export const useTrips = () =>
  useQuery<Trip[]>({
    queryKey: [...TRIPS_QUERY_KEY, "list"],
    queryFn: () => fetchAllPages<Trip>("/api/trips/"),
  });

/**
 * GET /api/trips/{id}/ + seats list (paginated).
 */
export const useTrip = (tripId: string | null | undefined) =>
  useQuery<Trip>({
    queryKey: [...TRIPS_QUERY_KEY, "detail", tripId],
    enabled: Boolean(tripId),
    queryFn: async () => {
      if (!tripId) throw new Error("Missing trip id");

      const { data } = await api.get<Trip>(`/api/trips/${tripId}/`);

      let seats: Seat[] = [];
      try {
        const raw = await fetchAllPages<TripSeatApi>(`/api/trips/${tripId}/seats/`);
        seats = raw
          .filter((s) => s.is_active !== false)
          .map((s) => apiTripSeatToSeat(s));
      } catch {
        // Seats unavailable.
      }

      return { ...data, seats };
    },
  });

/**
 * Landing recommendations — search scoped by optional origin label.
 */
export const useRecommendedTrips = ({ origin }: { origin?: string | null }) =>
  useQuery<Trip[]>({
    queryKey: [...TRIPS_QUERY_KEY, "recommended", origin ?? "all"],
    retry: false,
    staleTime: 5 * 60 * 1000,
    queryFn: () =>
      fetchAllPages<Trip>("/api/trips/search/", origin ? { origin } : undefined),
  });
