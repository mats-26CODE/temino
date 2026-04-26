"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Booking flow store — holds the state of the multi-step booking wizard:
 * search → trip → seat → passenger → payment → confirmation.
 *
 * It's persisted so a refresh on /trips/[id]/payment doesn't lose the
 * passenger info. Cleared on completion via `reset()`.
 */
interface BookingFlowState {
  // Step 1: search
  origin: string | null;
  destination: string | null;
  date: string | null; // YYYY-MM-DD
  passengers: number;

  // Step 2: trip selection
  selectedTrip: Trip | null;

  // Step 3: seat
  selectedSeat: Seat | null;

  // Step 4: passenger info
  passenger: PassengerInfo | null;

  // Step 5: booking outcome
  lastBooking: Booking | null;

  // ── actions ────────────────────────────────────────────────────────────
  setSearch: (params: {
    origin: string | null;
    destination: string | null;
    date: string | null;
    passengers?: number;
  }) => void;
  setSelectedTrip: (trip: Trip | null) => void;
  setSelectedSeat: (seat: Seat | null) => void;
  setPassenger: (passenger: PassengerInfo | null) => void;
  setLastBooking: (booking: Booking | null) => void;
  reset: () => void;
}

const initialState = {
  origin: null,
  destination: null,
  date: null,
  passengers: 1,
  selectedTrip: null,
  selectedSeat: null,
  passenger: null,
  lastBooking: null,
};

export const useBookingStore = create<BookingFlowState>()(
  persist(
    (set) => ({
      ...initialState,
      setSearch: ({ origin, destination, date, passengers }) =>
        set({ origin, destination, date, passengers: passengers ?? 1 }),
      setSelectedTrip: (selectedTrip) => set({ selectedTrip, selectedSeat: null }),
      setSelectedSeat: (selectedSeat) => set({ selectedSeat }),
      setPassenger: (passenger) => set({ passenger }),
      setLastBooking: (lastBooking) => set({ lastBooking }),
      reset: () => set(initialState),
    }),
    {
      name: "temino-booking-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
