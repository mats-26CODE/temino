"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Ticket } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TripBookingCardSkeleton } from "@/components/dashboard/trip-booking-card";
import { BookingListRow } from "@/components/dashboard/booking-list-row";
import { useBookings } from "@/hooks/use-bookings";
import { useTranslation } from "@/hooks/use-translation";

const isArchivedBooking = (b: Booking) => b.status === "cancelled" || b.status === "expired";

const MyTripsInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") === "past" ? "past" : "upcoming";
  const { t } = useTranslation();
  const { data: bookings, isLoading } = useBookings();
  const list = bookings ?? [];

  const upcoming = list.filter((b) => !isArchivedBooking(b));
  const past = list.filter((b) => isArchivedBooking(b));

  const onTabChange = (v: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (v === "past") next.set("tab", "past");
    else next.delete("tab");
    router.replace(`/dashboard/trips?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-foreground text-3xl font-bold tracking-tight text-balance md:text-4xl">
          {t("dashboard.myTrips")}
        </h1>
        <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
          {t("dashboard.myTripsSubtitle")}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <TripBookingCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <Tabs value={tab} onValueChange={onTabChange} className="gap-6">
          <TabsList className="bg-muted/50 border-border/60 inline-flex h-11 w-full max-w-md items-center justify-start gap-1 rounded-xl border p-1 md:w-auto">
            <TabsTrigger
              value="upcoming"
              className="data-[state=active]:bg-background rounded-lg px-5 data-[state=active]:shadow-sm"
            >
              {t("dashboard.tabUpcoming")} ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="data-[state=active]:bg-background rounded-lg px-5 data-[state=active]:shadow-sm"
            >
              {t("dashboard.tabPast")} ({past.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="upcoming"
            className="grid grid-cols-1 gap-4 focus-visible:outline-none sm:grid-cols-2 lg:grid-cols-3"
          >
            {upcoming.length === 0 ? (
              <div className="border-border/60 bg-muted/25 col-span-full rounded-xl border border-dashed p-12 text-center">
                <Ticket className="text-muted-foreground mx-auto mb-3 size-10" />
                <p className="text-foreground font-medium">{t("dashboard.noUpcoming")}</p>
                <p className="text-muted-foreground mt-1 text-sm">{t("trips.empty")}</p>
                <Link
                  href="/"
                  className="text-primary mt-4 inline-block text-sm font-semibold hover:underline"
                >
                  {t("dashboard.searchTrips")} →
                </Link>
              </div>
            ) : (
              upcoming.map((b) => <BookingListRow key={b.id} booking={b} variant="detailed" />)
            )}
          </TabsContent>

          <TabsContent
            value="past"
            className="grid grid-cols-1 gap-4 focus-visible:outline-none sm:grid-cols-2 lg:grid-cols-3"
          >
            {past.length === 0 ? (
              <div className="border-border/60 bg-muted/25 col-span-full rounded-xl border border-dashed p-12 text-center">
                <p className="text-muted-foreground text-sm">{t("dashboard.noPastTab")}</p>
              </div>
            ) : (
              past.map((b) => <BookingListRow key={b.id} booking={b} archived variant="detailed" />)
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

const MyTripsPage = () => (
  <Suspense
    fallback={
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <TripBookingCardSkeleton key={i} />
        ))}
      </div>
    }
  >
    <MyTripsInner />
  </Suspense>
);

export default MyTripsPage;
