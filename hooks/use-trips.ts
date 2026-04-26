"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  AMENITIES_BY_CLASS,
  getRecommendedTripsByOrigin,
  getSearchTripsFromMocks,
} from "@/lib/mocks/trips";
import {
  apiTripSeatToSeat,
  buildMockSeatsForTrip,
  getMockTripWithSeatsById,
} from "@/lib/mocks/trip-seats";

export const TRIPS_QUERY_KEY = ["trips"] as const;

/**
 * Backfill `bus.amenities` from the bus class when the live API doesn't send
 * the field. Keeps the trip-card amenity row populated for any trip we can
 * resolve a class for, while preserving real amenities when present.
 *
 * Handles three shapes the backend may return:
 *   1. `bus` as a full nested object (preferred — see `TripSerializer`).
 *   2. `bus` as a string PK (older `__all__` flat serialization).
 *   3. `bus` missing entirely.
 *
 * For (2) and (3) we substitute a synthetic Bus-shaped object using the
 * `executive` recipe — a sensible mid-tier default — so the trip card always
 * has *something* to render.
 */
const DEFAULT_BUS_CLASS: keyof typeof AMENITIES_BY_CLASS = "executive";

const withAmenitiesFromClass = (trip: Trip): Trip => {
  const bus = trip.bus as unknown;

  // Case 1 — already a fully-nested bus with amenities. Nothing to do.
  if (bus && typeof bus === "object" && Array.isArray((bus as Bus).amenities)) {
    const existing = (bus as Bus).amenities ?? [];
    if (existing.length > 0) return trip;
  }

  // Case 2 — bus is a string PK; build a minimal Bus shape so downstream
  // components (which read `trip.bus.bus_class`, etc.) stop receiving
  // undefined.
  if (typeof bus === "string" || bus == null) {
    return {
      ...trip,
      bus: {
        id: typeof bus === "string" ? bus : "",
        operator: trip.operator ?? ({} as Operator),
        plate_number: "",
        bus_type: DEFAULT_BUS_CLASS,
        capacity: trip.available_seats ?? 0,
        is_active: true,
        bus_class: DEFAULT_BUS_CLASS,
        amenities: AMENITIES_BY_CLASS[DEFAULT_BUS_CLASS],
        total_seats: trip.available_seats ?? 0,
      } as Bus,
    };
  }

  // Case 3 — nested bus, but no amenities yet. Derive from class/type.
  const busObj = bus as Bus;
  const cls = (busObj.bus_class ?? busObj.bus_type) as keyof typeof AMENITIES_BY_CLASS | undefined;
  const fallback = (cls && AMENITIES_BY_CLASS[cls]) || AMENITIES_BY_CLASS[DEFAULT_BUS_CLASS];
  return { ...trip, bus: { ...busObj, amenities: fallback } };
};

const enrichTrips = (trips: Trip[]): Trip[] => trips.map(withAmenitiesFromClass);

/**
 * GET /api/trips/search/?route_code=DAR-ARU&date=YYYY-MM-DD
 *
 * `enabled` is false until the user has at least origin+destination, so we
 * don't hit the API on the landing page idle.
 *
 * Falls back to the curated mock set in `lib/mocks/trips.ts` when the live
 * API is unavailable or returns nothing, so the search results UI is always
 * populated with feature-rich buses during development.
 */
export const useSearchTrips = (params: SearchTripsParams) => {
  const { route_code, origin, destination, date, passengers } = params;

  const enabled = Boolean(route_code || (origin && destination));

  return useQuery<Trip[]>({
    queryKey: [...TRIPS_QUERY_KEY, "search", route_code, origin, destination, date, passengers],
    enabled,
    retry: false,
    queryFn: async () => {
      try {
        const { data } = await api.get<Trip[] | ApiPaginated<Trip>>("/api/trips/search/", {
          params: {
            ...(route_code ? { route_code } : {}),
            ...(origin ? { origin } : {}),
            ...(destination ? { destination } : {}),
            ...(date ? { date } : {}),
            ...(passengers ? { passengers } : {}),
          },
        });
        const list = Array.isArray(data) ? data : (data?.results ?? []);
        if (list.length > 0) return enrichTrips(list);
      } catch {
        // Backend not reachable / not yet deployed — drop into the mock set below.
      }
      return enrichTrips(getSearchTripsFromMocks({ route_code, origin, destination }));
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
      return enrichTrips(Array.isArray(data) ? data : data.results);
    },
  });

/**
 * GET /api/trips/{id}/ + GET /api/trips/{id}/seats/
 *
 * Used on the seat-selection page. Seats come from the list endpoint
 * (`TripSeatListAPIView` in `temino-api`). If the trip or seats request fails,
 * or the seats list is empty, we attach a mock grid from
 * `lib/mocks/trip-seats.ts` (same 1A–4D layout as the backend).
 */
export const useTrip = (tripId: string | null | undefined) =>
  useQuery<Trip>({
    queryKey: [...TRIPS_QUERY_KEY, "detail", tripId],
    enabled: Boolean(tripId),
    queryFn: async () => {
      if (!tripId) throw new Error("Missing trip id");

      const mergeSeats = async (trip: Trip): Promise<Trip> => {
        const enriched = withAmenitiesFromClass(trip);
        let seats: Seat[] = [];
        try {
          const { data } = await api.get<TripSeatApi[] | ApiPaginated<TripSeatApi>>(
            `/api/trips/${tripId}/seats/`,
          );
          const raw = Array.isArray(data) ? data : (data?.results ?? []);
          seats = raw
            .filter((s) => s.is_active !== false)
            .map((s) => apiTripSeatToSeat(s));
        } catch {
          // Backend down or seats route not deployed.
        }
        if (seats.length === 0) {
          seats = buildMockSeatsForTrip(enriched);
        }
        return { ...enriched, seats };
      };

      try {
        const { data } = await api.get<Trip>(`/api/trips/${tripId}/`);
        return mergeSeats(data);
      } catch {
        return withAmenitiesFromClass(getMockTripWithSeatsById(tripId));
      }
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
        if (list.length > 0) return enrichTrips(list);
      } catch {
        // Backend not reachable / not yet deployed — drop into the mock set below.
      }
      return enrichTrips(getRecommendedTripsByOrigin(origin));
    },
  });
