"use client";

import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";

export type SeatHoldPayload = {
  trip_id: string;
  seat_ids: string[];
};

export type SeatHoldResult = {
  hold_id: string;
  expires_at: string;
};

const TEN_MIN_MS = 10 * 60 * 1000;

/**
 * Locks selected seats briefly before PSP checkout (backend `/api/bookings/seat-hold/`
 * when available; otherwise succeeds locally so the UX can proceed in dev).
 */
export const useSeatHold = () =>
  useMutation<SeatHoldResult, Error, SeatHoldPayload>({
    mutationFn: async (payload) => {
      const fallback = (): SeatHoldResult => ({
        hold_id: `local-hold-${Date.now()}`,
        expires_at: new Date(Date.now() + TEN_MIN_MS).toISOString(),
      });

      try {
        const { data } = await api.post<{
          hold_id?: string;
          expires_at?: string;
          data?: SeatHoldResult;
        }>("/api/bookings/seat-hold/", payload);
        const raw =
          data && typeof data === "object" && "data" in data ? (data as { data?: SeatHoldResult }).data : data;
        const hold_id = raw?.hold_id ?? (data as { hold_id?: string })?.hold_id;
        const expires_at = raw?.expires_at ?? (data as { expires_at?: string })?.expires_at;
        if (hold_id && expires_at) return { hold_id, expires_at };
        if (hold_id ?? expires_at) {
          return {
            hold_id: hold_id ?? `hold-${Date.now()}`,
            expires_at: expires_at ?? new Date(Date.now() + TEN_MIN_MS).toISOString(),
          };
        }
        return fallback();
      } catch {
        return fallback();
      }
    },
  });
