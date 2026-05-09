"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { fetchAllPages } from "@/lib/fetch-all-pages";
import { useAuthStore } from "@/lib/stores/auth-store";

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
 * GET /api/bookings/mine/ — authenticated user's bookings.
 */
export const useBookings = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery<Booking[]>({
    queryKey: [...BOOKINGS_QUERY_KEY, "mine"],
    enabled: Boolean(token),
    queryFn: () => fetchAllPages<Booking>("/api/bookings/mine/"),
  });
};
