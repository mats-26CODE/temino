"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { initialBoardingSelectionForTrip } from "@/lib/boarding-stations";

/**
 * Booking flow store — holds the state of the multi-step booking wizard:
 * search → trip → seats (+ passenger details) → payment → confirmation.
 *
 * Search `passengers` = minimum available seats when filtering trips; map selection
 * is not capped. Party size must match `selectedSeats.length` before payment.
 * `pickupStation` / `dropoffStation` refine where the traveller boards and alights.
 */
interface BookingFlowState {
  origin: string | null;
  destination: string | null;
  date: string | null;
  /** From search: minimum free seats for trip listing (does not cap seat picks). */
  passengers: number;

  selectedTrip: Trip | null;

  pickupStation: Station | null;
  dropoffStation: Station | null;

  selectedSeats: Seat[];

  partyPassengers: PassengerInfo[];
  passenger: PassengerInfo | null;
  lastBooking: Booking | null;

  setSearch: (params: {
    origin: string | null;
    destination: string | null;
    date: string | null;
    passengers?: number;
  }) => void;
  setSelectedTrip: (trip: Trip | null) => void;
  setPickupStation: (station: Station | null) => void;
  setDropoffStation: (station: Station | null) => void;
  setSelectedSeats: (
    seats: Seat[] | ((prev: Seat[]) => Seat[]),
  ) => void;
  setPassenger: (passenger: PassengerInfo | null) => void;
  setPartyPassengers: (party: PassengerInfo[]) => void;
  setLastBooking: (booking: Booking | null) => void;
  reset: () => void;
}

type PersistedBookingShape = BookingFlowState & {
  selectedSeat?: Seat | null;
};

const initialState = {
  origin: null,
  destination: null,
  date: null,
  passengers: 1,
  selectedTrip: null,
  pickupStation: null,
  dropoffStation: null,
  selectedSeats: [] as Seat[],
  partyPassengers: [] as PassengerInfo[],
  passenger: null,
  lastBooking: null,
};

export const useBookingStore = create<BookingFlowState>()(
  persist(
    (set) => ({
      ...initialState,
      setSearch: ({ origin, destination, date, passengers: nextPassengers }) =>
        set((s) => {
          const passengers = Math.max(1, Math.floor(nextPassengers ?? 1));
          const baseParty =
            s.partyPassengers.length > 0
              ? s.partyPassengers
              : s.passenger
                ? [s.passenger]
                : [];
          const nextParty = baseParty.slice(0, passengers);
          return {
            origin,
            destination,
            date,
            passengers,
            partyPassengers: nextParty,
            passenger: nextParty[0] ?? null,
          };
        }),
      setSelectedTrip: (selectedTrip) =>
        set(() => {
          if (!selectedTrip) {
            return {
              selectedTrip: null,
              selectedSeats: [],
              pickupStation: null,
              dropoffStation: null,
            };
          }
          const { pickup, dropoff } = initialBoardingSelectionForTrip(selectedTrip);
          return {
            selectedTrip,
            selectedSeats: [],
            pickupStation: pickup,
            dropoffStation: dropoff,
          };
        }),
      setPickupStation: (pickupStation) => set({ pickupStation }),
      setDropoffStation: (dropoffStation) => set({ dropoffStation }),
      setSelectedSeats: (selectedSeats) =>
        set((s) => ({
          selectedSeats:
            typeof selectedSeats === "function"
              ? (selectedSeats as (prev: Seat[]) => Seat[])(s.selectedSeats)
              : selectedSeats,
        })),
      setPassenger: (passenger) => set({ passenger }),
      setPartyPassengers: (partyPassengers) =>
        set({
          partyPassengers,
          passenger: partyPassengers[0] ?? null,
        }),
      setLastBooking: (lastBooking) => set({ lastBooking }),
      reset: () => set(initialState),
    }),
    {
      name: "temino-booking-store",
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        const incoming = { ...current, ...(persisted as object) } as PersistedBookingShape;
        let selectedSeats = Array.isArray(incoming.selectedSeats) ? [...incoming.selectedSeats] : [];
        if (selectedSeats.length === 0 && incoming.selectedSeat) {
          selectedSeats = [incoming.selectedSeat];
        }
        let partyPassengers = incoming.partyPassengers;
        if (!partyPassengers?.length) {
          partyPassengers = incoming.passenger ? [incoming.passenger] : [];
        }

        let pickupStation = incoming.pickupStation ?? null;
        let dropoffStation = incoming.dropoffStation ?? null;
        if (
          incoming.selectedTrip &&
          (pickupStation == null || dropoffStation == null)
        ) {
          const seeded = initialBoardingSelectionForTrip(incoming.selectedTrip);
          pickupStation = pickupStation ?? seeded.pickup;
          dropoffStation = dropoffStation ?? seeded.dropoff;
        }

        const {
          selectedSeat: _legacy,
          ...rest
        } = incoming as PersistedBookingShape & { selectedSeat?: Seat | null };
        void _legacy;
        return {
          ...(rest as BookingFlowState),
          selectedSeats,
          partyPassengers,
          pickupStation,
          dropoffStation,
        };
      },
    },
  ),
);
