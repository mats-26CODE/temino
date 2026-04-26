"use client";

import dayjs from "dayjs";
import Link from "next/link";
import { Bus as BusIcon, Ticket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useBookings } from "@/hooks/use-bookings";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency } from "@/helpers/helpers";

const DashboardTripsPage = () => {
  const { t } = useTranslation();
  const { data: bookings, isLoading } = useBookings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight text-balance md:text-4xl">
          My trips
        </h1>
        <p className="text-muted-foreground mt-1">All your bookings, in one place.</p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {!isLoading && (!bookings || bookings.length === 0) && (
        <Card>
          <CardContent className="space-y-2 p-10 text-center">
            <Ticket className="text-muted-foreground mx-auto size-8" />
            <p className="text-foreground font-medium">No trips yet</p>
            <p className="text-muted-foreground text-sm">{t("trips.empty")}</p>
            <Link
              href="/"
              className="text-primary inline-block text-sm font-medium hover:underline"
            >
              Search trips →
            </Link>
          </CardContent>
        </Card>
      )}

      {bookings && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((b) => {
            const amount = typeof b.amount === "string" ? Number.parseFloat(b.amount) : b.amount;
            return (
              <Card key={b.id}>
                <CardContent className="flex flex-col items-start justify-between gap-3 p-4 md:flex-row md:items-center md:gap-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-lg">
                      <BusIcon className="size-6" />
                    </div>
                    <div>
                      <p className="text-foreground font-semibold">
                        {b.trip?.route.origin ?? "Trip"} → {b.trip?.route.destination ?? ""}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {b.trip ? dayjs(b.trip.departure_time).format("DD MMM, YYYY HH:mm") : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="secondary" className="capitalize">
                      {b.status}
                    </Badge>
                    <p className="text-foreground font-semibold">
                      {formatCurrency(amount, { code: "TZS", decimalDigits: 0 })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardTripsPage;
