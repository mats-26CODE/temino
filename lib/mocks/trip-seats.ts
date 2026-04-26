/**
 * Mock trip seats for the seat-selection UI.
 *
 * Mirrors `temino-api` `apps/trips/models.py`:
 * - `generate_seat_labels()` — 4 seats per row (A–D): 1A, 1B, … until `count`.
 * - `TripSeat.seat_number`, `TripSeat.status` — `available` | `reserved` | `booked` | `blocked`.
 *
 * `SeatMap` expects `Seat` with optional `row` / `column` for stable ordering.
 */

import { buildMockTrips } from "./trips";

/**
 * Same algorithm as Django `generate_seat_labels(total_seats)`.
 */
export const generateSeatLabels = (count: number): string[] => {
  const labels: string[] = [];
  let row = 1;
  const letters = ["A", "B", "C", "D"];
  const n = Math.max(0, Math.min(count, 200));
  while (labels.length < n) {
    for (const letter of letters) {
      if (labels.length < n) labels.push(`${row}${letter}`);
    }
    row += 1;
  }
  return labels;
};

const LETTER_COL: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };

export const parseSeatLabelToGrid = (seatNumber: string): Pick<Seat, "row" | "column"> => {
  const m = /^(\d+)([A-Da-d])$/.exec(seatNumber.trim());
  if (!m) {
    const row = Number.parseInt(seatNumber, 10);
    return {
      row: Number.isFinite(row) ? row : 0,
      column: 0,
    };
  }
  const col = LETTER_COL[m[2].toUpperCase()] ?? 0;
  return { row: Number.parseInt(m[1], 10), column: col };
};

/**
 * Map a DRF `TripSeat` payload to the frontend `Seat` shape.
 */
export const apiTripSeatToSeat = (raw: TripSeatApi): Seat => ({
  id: String(raw.id),
  number: raw.seat_number,
  status: raw.status,
  ...parseSeatLabelToGrid(raw.seat_number),
});

/**
 * Build a full bus grid for a trip. Marks the first `available_seats` labels as
 * `available` and the remainder as `booked` so counts line up with the trip.
 */
export const buildMockSeatsForTrip = (trip: Trip): Seat[] => {
  const capacity = trip.bus?.capacity && trip.bus.capacity > 0 ? trip.bus.capacity : 40;
  const labels = generateSeatLabels(capacity);
  const wantAvailable = Math.min(Math.max(0, trip.available_seats), labels.length);

  return labels.map((number, i) => ({
    id: `mock-seat-${trip.id}-${number}`,
    number,
    status: (i < wantAvailable ? "available" : "booked") as SeatStatus,
    ...parseSeatLabelToGrid(number),
  }));
};

/**
 * Dev mock for `/trips/[id]/seat` when the API is off or the id is not in mocks
 * (e.g. a real backend UUID) — reuses a template trip, swaps `id`, attaches seats.
 */
export const getMockTripWithSeatsById = (tripId: string): Trip => {
  const all = buildMockTrips();
  const found = all.find((t) => t.id === tripId);
  const base: Trip = found
    ? found
    : {
        ...all[0],
        id: tripId,
        trip_code: `${all[0].trip_code}-UI`,
      };
  return { ...base, seats: buildMockSeatsForTrip(base) };
};
