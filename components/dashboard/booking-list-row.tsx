"use client";

import {
  TripBookingCard,
  type TripBookingCardProps,
} from "@/components/dashboard/trip-booking-card";

export type BookingListRowProps = {
  booking: Booking;
  variant?: "compact" | "detailed";
  /** When set (e.g. past tab), card uses muted “archived” styling. Otherwise derived from booking status. */
  archived?: boolean;
};

export const BookingListRow = ({
  booking,
  variant: _variant,
  archived,
}: BookingListRowProps) => (
  <TripBookingCard
    booking={booking}
    archived={
      archived ?? (booking.status === "cancelled" || booking.status === "expired")
    }
  />
);

export type { TripBookingCardProps as DashboardBookingGridCardProps };
