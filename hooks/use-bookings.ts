"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { buildExampleDashboardBookings } from "@/lib/mocks/example-dashboard-bookings";

const shouldUseExampleDashboardBookings = () =>
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_SHOW_EXAMPLE_DASHBOARD_BOOKINGS === "true";

const withExampleBookingsWhenEmpty = (list: Booking[]): Booking[] => {
  if (!shouldUseExampleDashboardBookings() || list.length > 0) return list;
  return buildExampleDashboardBookings();
};

export const BOOKINGS_QUERY_KEY = ["bookings"] as const;

/**
 * POST /api/bookings/create/
 * Body: { trip_id, seat_id, passenger_name, passenger_phone, passenger_email, amount }
 */
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation<Booking, Error, CreateBookingPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<Booking | Record<string, unknown>>(
        "/api/bookings/create/",
        payload,
      );
      const body = data && typeof data === "object" ? data : {};
      if ("data" in body && body.data && typeof body.data === "object") {
        return body.data as Booking;
      }
      return data as Booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY });
    },
  });
};

/**
 * GET /api/bookings/ — current user's bookings (used by dashboard trip history).
 */
export const useBookings = () =>
  useQuery<Booking[]>({
    queryKey: [...BOOKINGS_QUERY_KEY, "list"],
    queryFn: async () => {
      const { data } = await api.get<Booking[] | ApiPaginated<Booking>>("/api/bookings/");
      const list = Array.isArray(data) ? data : data.results;
      return withExampleBookingsWhenEmpty(list);
    },
  });

/**
 * GET /api/bookings/{id}/ — used on the confirmation/ticket page.
 */
export const useBooking = (bookingId: string | null | undefined) =>
  useQuery<Booking>({
    queryKey: [...BOOKINGS_QUERY_KEY, "detail", bookingId],
    enabled: Boolean(bookingId),
    queryFn: async () => {
      const { data } = await api.get<Booking>(`/api/bookings/${bookingId}/`);
      return data;
    },
  });
