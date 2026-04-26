/**
 * Mock trip seats for the seat-selection UI.
 *
 * Deck layout (when capacity allows): `n` full rows 2+aisle+2 (A–D), then a **back row**
 * of 5 (A–E) on the **same line, no aisle** (like a typical long-distance bus rear bench).
 * Condition: `capacity >= 5 && (capacity - 5) % 4 === 0` (e.g. 5, 9, 13, … 45, 49).
 *
 * Optional **restroom** (`restroom` amenity): remove `${midRow}A` from the 4-across block;
 * WC is drawn in `SeatMap` on that row’s left.
 *
 * Simpler buses use `generateSeatLabels` (4 across only).
 */

import { buildMockTrips } from "./trips";

const RESTROOM = "restroom";

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

const LETTER_COL: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 };

export const parseRowFromNumber = (seatNumber: string): number => {
  const m = /^(\d+)/.exec(seatNumber.trim());
  return m ? Number.parseInt(m[1], 10) : 0;
};

export const parseSeatLabelToGrid = (seatNumber: string): Pick<Seat, "row" | "column"> => {
  const m = /^(\d+)([A-Ea-e])$/.exec(seatNumber.trim());
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
 * 1-based row of the on-board toilet when the bus lists `restroom` in amenities
 * and there are at least 3 “body” rows in the 4-across section.
 */
export const getToiletRow1Based = (fullRowCount: number): number | null => {
  if (fullRowCount < 3) return null;
  return Math.max(1, Math.ceil(fullRowCount / 2));
};

/**
 * 5-across back row: `N`A–`N`E, after `(capacity-5)/4` full 4-ad rows.
 */
const hasRearRowOfFive = (cap: number) => cap >= 5 && (cap - 5) % 4 === 0;

const buildDeckLabels = (cap: number, hasWc: boolean): string[] => {
  const n4 = (cap - 5) / 4;
  const lastRow = n4 + 1;
  const labels: string[] = [];
  for (let r = 1; r <= n4; r++) {
    for (const L of ["A", "B", "C", "D"] as const) {
      labels.push(`${r}${L}`);
    }
  }
  const toiletR = hasWc && n4 >= 3 ? getToiletRow1Based(n4) : null;
  if (toiletR != null) {
    const rm = `${toiletR}A`.toUpperCase();
    const ix = labels.findIndex((l) => l.toUpperCase() === rm);
    if (ix >= 0) labels.splice(ix, 1);
  }
  for (const L of ["A", "B", "C", "D", "E"] as const) {
    labels.push(`${lastRow}${L}`);
  }
  return labels;
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
 * Build a full bus grid. Uses deck (4-ad + 5 back) when `capacity` fits, else 4 only.
 */
export const buildMockSeatsForTrip = (trip: Trip): Seat[] => {
  const capacity = trip.bus?.capacity && trip.bus.capacity > 0 ? trip.bus.capacity : 40;
  const amen = (trip.bus?.amenities ?? []).map((a) => a.toLowerCase());
  const hasWc = amen.includes(RESTROOM);

  const labels: string[] = hasRearRowOfFive(capacity)
    ? buildDeckLabels(capacity, hasWc)
    : generateSeatLabels(capacity);

  const n4 = hasRearRowOfFive(capacity) ? (capacity - 5) / 4 : 0;
  const lastRow = hasRearRowOfFive(capacity) ? n4 + 1 : 0;
  const wantAvailable = Math.min(Math.max(0, trip.available_seats), labels.length);

  return labels.map((number, i) => {
    const parsed = parseSeatLabelToGrid(number);
    const onBackFive =
      hasRearRowOfFive(capacity) && parsed.row === lastRow && /^\d+[A-E]$/i.test(number);
    const seat: Seat = {
      id: `mock-seat-${trip.id}-${number}`,
      number,
      status: (i < wantAvailable ? "available" : "booked") as SeatStatus,
      row: parsed.row,
      column: parsed.column,
    };
    if (onBackFive) seat.layout = "full_width_rear";
    return seat;
  });
};

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
