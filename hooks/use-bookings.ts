"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { ToastAlert } from "@/config/toast";

export const BOOKINGS_QUERY_KEY = ["bookings"] as const;

/**
 * POST /api/bookings/create/
 * Body: { trip_id, seat_id, passenger_name, passenger_phone, passenger_email, amount }
 */
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation<Booking, Error, CreateBookingPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<Booking>("/api/bookings/create/", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY });
      ToastAlert.success("Booking confirmed!");
    },
    onError: (error) => {
      ToastAlert.error(error.message || "Failed to create booking");
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
      return Array.isArray(data) ? data : data.results;
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
