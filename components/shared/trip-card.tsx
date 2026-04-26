"use client";

import dayjs from "dayjs";
import Link from "next/link";
import { ArrowRight, Bus as BusIcon, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatTripDuration } from "@/helpers/helpers";
import { useTranslation } from "@/hooks/use-translation";

interface TripCardProps {
  trip: Trip;
  onSelect?: (trip: Trip) => void;
}

export const TripCard = ({ trip, onSelect }: TripCardProps) => {
  const { t } = useTranslation();
  const departure = dayjs(trip.departure_time);
  const arrival = dayjs(trip.arrival_time);
  const rawPrice = trip.base_price ?? trip.price ?? 0;
  const price = typeof rawPrice === "string" ? Number.parseFloat(rawPrice) : rawPrice;

  return (
    <Card className="border-border hover:border-primary/40 hover:shadow-primary/5 group overflow-hidden border transition-all hover:shadow-md">
      <CardContent className="grid grid-cols-1 items-center gap-4 p-4 md:grid-cols-[1.5fr_2fr_1fr] md:p-5">
        {/* Operator */}
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-lg">
            <BusIcon className="size-6" />
          </div>
          <div className="min-w-0">
            <p className="text-foreground truncate text-base font-bold tracking-tight">
              {trip.bus.operator.name}
            </p>
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              {trip.bus.bus_class && (
                <Badge variant="secondary" className="capitalize">
                  {trip.bus.bus_class}
                </Badge>
              )}
              {trip.bus.operator.rating ? (
                <span className="inline-flex items-center gap-0.5">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  {trip.bus.operator.rating.toFixed(1)}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Times */}
        <div className="flex items-center justify-between gap-3">
          <div className="text-center">
            <p className="text-foreground text-2xl font-bold tracking-tight">
              {departure.format("HH:mm")}
            </p>
            <p className="text-muted-foreground text-sm">{trip.route.origin}</p>
          </div>
          <div className="text-muted-foreground flex flex-1 flex-col items-center gap-1">
            <span className="inline-flex items-center gap-1 text-xs">
              <Clock className="size-3" />
              {formatTripDuration(trip.departure_time, trip.arrival_time)}
            </span>
            <div className="bg-border h-px w-full max-w-32" />
            <span className="text-xs">Direct</span>
          </div>
          <div className="text-center">
            <p className="text-foreground text-2xl font-bold tracking-tight">
              {arrival.format("HH:mm")}
            </p>
            <p className="text-muted-foreground text-sm">{trip.route.destination}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-end gap-1.5 md:items-stretch">
          <p className="text-foreground text-right text-2xl font-extrabold tracking-tight md:text-3xl">
            {formatCurrency(price, { code: "TZS", decimalDigits: 0 })}
          </p>
          <p className="text-muted-foreground text-right text-xs">
            {t("trips.seatsLeft", { count: trip.available_seats })}
          </p>
          {onSelect ? (
            <Button onClick={() => onSelect(trip)} className="w-full">
              {t("trips.selectSeat")} <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button asChild className="w-full">
              <Link href={`/trips/${trip.id}/seat`}>
                {t("trips.selectSeat")} <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
