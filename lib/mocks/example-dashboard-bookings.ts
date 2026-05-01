import dayjs from "dayjs";
import { buildMockTrips } from "@/lib/mocks/trips";

const demoPassenger = {
  passenger_name: "Asha Mwalimu",
  passenger_phone: "255712345678",
  passenger_email: "asha@example.com",
};

/**
 * Rich sample bookings for dashboard / trips UI when the API returns none.
 * Trips reuse `buildMockTrips()` graphs (routes, buses, operators) — only IDs
 * and dates are synthesized for predictable demos.
 *
 * Toggle via `NEXT_PUBLIC_SHOW_EXAMPLE_DASHBOARD_BOOKINGS=true` or automatic
 * in development (see `useBookings`).
 */
export const buildExampleDashboardBookings = (): Booking[] => {
  const trips = buildMockTrips();
  if (trips.length < 3) return [];

  const upcomingA = trips[0];
  const upcomingB = trips[1];

  const base = trips[2];
  const depPast = dayjs().subtract(20, "day").hour(8).minute(15).second(0).millisecond(0);
  const arrPast = depPast.add(base.route.estimated_duration_minutes, "minute");
  const archivedTrip: Trip = {
    ...base,
    departure_time: depPast.toISOString(),
    arrival_time: arrPast.toISOString(),
    status: "arrived",
  };

  return [
    {
      id: "demo-booking-paid-1",
      trip_id: upcomingA.id,
      seat_id: "demo-seat-1",
      amount: upcomingA.base_price,
      status: "paid",
      reference: "TMN-7K2M",
      created_at: dayjs().subtract(5, "day").toISOString(),
      ...demoPassenger,
      trip: upcomingA,
      seat_number: "12A",
    },
    {
      id: "demo-booking-confirmed-1",
      trip_id: upcomingB.id,
      seat_id: "demo-seat-2",
      amount: upcomingB.base_price,
      status: "confirmed",
      reference: "TMN-9QPL",
      created_at: dayjs().subtract(2, "day").toISOString(),
      ...demoPassenger,
      trip: upcomingB,
      seat_number: "4B",
    },
    {
      id: "demo-booking-archived-1",
      trip_id: archivedTrip.id,
      seat_id: "demo-seat-3",
      amount: archivedTrip.base_price,
      status: "cancelled",
      reference: "TMN-3HJX",
      created_at: dayjs().subtract(25, "day").toISOString(),
      ...demoPassenger,
      trip: archivedTrip,
      seat_number: "22C",
    },
  ];
};
