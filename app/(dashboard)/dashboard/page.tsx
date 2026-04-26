"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Search, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { useBookings } from "@/hooks/use-bookings";
import { POPULAR_ROUTES } from "@/constants/values";
import { getCasualGreeting } from "@/helpers/helpers";

const DashboardOverviewPage = () => {
  const { user } = useUser();
  const { t } = useTranslation();
  const { data: bookings = [] } = useBookings();

  const upcoming = bookings.filter((b) => b.status !== "cancelled" && b.status !== "expired");

  return (
    <div className="space-y-8">
      <div>
        <p className="text-muted-foreground text-sm">{getCasualGreeting()}</p>
        <h1 className="text-foreground text-3xl font-bold tracking-tight text-balance md:text-4xl">
          {t("dashboard.welcome", { name: user?.full_name ?? "Traveler" })}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t("dashboard.upcomingTrips")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground text-3xl font-bold">{upcoming.length}</p>
            <p className="text-muted-foreground text-xs">Booked & ready to travel</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t("dashboard.pastTrips")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground text-3xl font-bold">
              {bookings.length - upcoming.length}
            </p>
            <p className="text-muted-foreground text-xs">Completed journeys</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Quick book</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" size="sm">
              <Link href="/">
                <Search className="size-4" /> Search trips
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-foreground text-2xl font-bold tracking-tight">Upcoming trips</h2>
          <Link
            href="/dashboard/trips"
            className="text-primary text-sm font-medium hover:underline"
          >
            View all
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <Card>
            <CardContent className="space-y-2 p-10 text-center">
              <Ticket className="text-muted-foreground mx-auto size-8" />
              <p className="text-foreground font-medium">No upcoming trips</p>
              <p className="text-muted-foreground text-sm">Book your first trip to see it here.</p>
              <Button asChild className="mt-2" size="sm">
                <Link href="/">
                  Search trips <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 3).map((b) => (
              <Card key={b.id}>
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                      <Ticket className="size-5" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">
                        {b.trip?.route.origin ?? "Trip"} → {b.trip?.route.destination ?? ""}
                      </p>
                      <p className="text-muted-foreground text-xs">{b.reference ?? b.id}</p>
                    </div>
                  </div>
                  <span className="text-primary text-sm font-medium capitalize">{b.status}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-foreground mb-3 text-2xl font-bold tracking-tight">Popular routes</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {POPULAR_ROUTES.slice(0, 4).map((route) => {
            const params = new URLSearchParams({
              origin: route.origin,
              destination: route.destination,
              route_code: route.code,
            });
            return (
              <Link key={route.code} href={`/trips?${params.toString()}`}>
                <Card className="hover:border-primary/40 transition-all hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                      <MapPin className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground truncate text-sm font-medium">
                        {route.origin} → {route.destination}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverviewPage;
