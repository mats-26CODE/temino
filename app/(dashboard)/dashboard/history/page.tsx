"use client";

import dayjs from "dayjs";
import { History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useBookings } from "@/hooks/use-bookings";
import { useTranslation } from "@/hooks/use-translation";

const DashboardHistoryPage = () => {
  const { t } = useTranslation();
  const { data: bookings = [] } = useBookings();
  const past = bookings.filter((b) => b.status === "cancelled" || b.status === "expired");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight text-balance md:text-4xl">
          Trip history
        </h1>
        <p className="text-muted-foreground mt-1">Your past and cancelled bookings.</p>
      </div>

      {past.length === 0 ? (
        <Card>
          <CardContent className="space-y-2 p-10 text-center">
            <History className="text-muted-foreground mx-auto size-8" />
            <p className="text-foreground font-medium">No past trips</p>
            <p className="text-muted-foreground text-sm">{t("trips.empty")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {past.map((b) => (
            <Card key={b.id}>
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-foreground font-medium">
                    {b.trip?.route.origin ?? "Trip"} → {b.trip?.route.destination ?? ""}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {b.trip ? dayjs(b.trip.departure_time).format("DD MMM YYYY") : "—"}
                  </p>
                </div>
                <span className="text-muted-foreground text-xs capitalize">{b.status}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardHistoryPage;
