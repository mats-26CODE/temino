/** Seat labels/count for dashboard / booking summaries. */

export type BookingSeatSummary = {
  count: number;
  /** Comma-separated seat labels, e.g. "12A, 14B" */
  list: string;
};

/**
 * Prefer API `seat_number`, nested passenger rows, then `trip.seats` lookup by `seat_id`.
 */
export const summarizeBookingSeats = (
  booking: Booking,
  trip: Trip | null | undefined,
): BookingSeatSummary => {
  type P = { seat_number?: string | null };
  type BExtra = Booking & { passengers?: unknown; seat_number?: string | null };
  const b = booking as BExtra;

  const rawPassengers = b.passengers;
  if (Array.isArray(rawPassengers) && rawPassengers.length > 0) {
    const labels = rawPassengers
      .map((row) =>
        typeof row === "object" && row !== null ? String((row as P).seat_number ?? "").trim() : "",
      )
      .filter(Boolean);
    const unique = [...new Set(labels)];
    if (unique.length > 0) {
      return { count: unique.length, list: unique.join(", ") };
    }
    return { count: rawPassengers.length, list: "" };
  }

  const direct = typeof b.seat_number === "string" ? b.seat_number.trim() : "";
  if (direct) {
    return { count: 1, list: direct };
  }

  if (trip?.seats?.length && b.seat_id) {
    const match = trip.seats.find((s) => s.id === b.seat_id);
    if (match?.number?.trim()) {
      return { count: 1, list: match.number.trim() };
    }
  }

  return { count: 0, list: "" };
};
