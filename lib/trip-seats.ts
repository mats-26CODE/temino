/**
 * Seat grid helpers aligned with backend seat numbering (`TripSeat.seat_number`).
 */

const LETTER_COL: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 };

/**
 * Same algorithm as Django `generate_seat_labels(total_seats)` for simple 4-across decks.
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
 * Map a DRF `TripSeat` payload to the frontend `Seat` shape.
 */
export const apiTripSeatToSeat = (raw: TripSeatApi): Seat => ({
  id: String(raw.id),
  number: raw.seat_number,
  status: raw.status,
  ...parseSeatLabelToGrid(raw.seat_number),
});
