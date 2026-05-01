"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardOverviewStrip } from "@/components/dashboard/dashboard-overview-strip";
import {
  TripBookingCard,
  TripBookingCardSkeleton,
} from "@/components/dashboard/trip-booking-card";
import { useUser } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { useBookings } from "@/hooks/use-bookings";
import { getCasualGreeting } from "@/helpers/helpers";

const isArchivedBooking = (b: Booking) =>
  b.status === "cancelled" || b.status === "expired";

const DashboardOverviewPage = () => {
  const { user } = useUser();
  const { t } = useTranslation();
  const { data: bookings, isLoading } = useBookings();
  const list = bookings ?? [];

  const upcoming = list.filter((b) => !isArchivedBooking(b));
  const past = list.filter((b) => isArchivedBooking(b));

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <p className="text-muted-foreground text-sm font-medium">{getCasualGreeting()}</p>
        <h1 className="text-foreground text-3xl font-bold tracking-tight text-balance md:text-4xl">
          {t("dashboard.welcome", { name: user?.full_name ?? "Traveler" })}
        </h1>
        <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
          {t("dashboard.overviewSubtitle")}
        </p>
      </div>

      <DashboardOverviewStrip
        loading={isLoading}
        upcomingCount={upcoming.length}
        pastCount={past.length}
      />

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              {t("dashboard.sectionUpcoming")}
            </h2>
            <p className="text-muted-foreground text-sm">{t("dashboard.sectionUpcomingDesc")}</p>
          </div>
          <Link
            href="/dashboard/trips"
            className="text-primary shrink-0 text-sm font-semibold hover:underline"
          >
            {t("dashboard.viewAll")} →
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <TripBookingCardSkeleton key={i} />
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="border-border/60 bg-muted/25 rounded-2xl border border-dashed p-10 text-center">
            <Clock className="text-muted-foreground mx-auto mb-3 size-8" />
            <p className="text-foreground font-medium">{t("dashboard.noUpcoming")}</p>
            <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
              {t("dashboard.noUpcomingHint")}
            </p>
            <Button asChild className="mt-4 rounded-full" variant="outline" size="sm">
              <Link href="/">
                {t("dashboard.searchTrips")} <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.slice(0, 3).map((b) => (
              <TripBookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              {t("dashboard.sectionPast")}
            </h2>
            <p className="text-muted-foreground text-sm">{t("dashboard.sectionPastDesc")}</p>
          </div>
          <Link
            href="/dashboard/trips?tab=past"
            className="text-primary shrink-0 text-sm font-semibold hover:underline"
          >
            {t("dashboard.viewAll")} →
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <TripBookingCardSkeleton key={i} />
            ))}
          </div>
        ) : past.length === 0 ? (
          <div className="border-border/60 bg-muted/20 rounded-2xl border p-8 text-center">
            <p className="text-muted-foreground text-sm">{t("dashboard.noPastOverview")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {past.slice(0, 3).map((b) => (
              <TripBookingCard key={b.id} booking={b} archived />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardOverviewPage;
