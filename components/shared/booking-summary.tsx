"use client";

import dayjs from "dayjs";
import { Bus as BusIcon, Calendar, MapPin, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/helpers/helpers";
import { useTranslation } from "@/hooks/use-translation";

interface BookingSummaryProps {
  trip: Trip;
  seat?: Seat | null;
  passenger?: PassengerInfo | null;
  className?: string;
}

/**
 * Booking summary card — used on the passenger info, payment, and
 * confirmation screens to show the user what they're paying for.
 */
export const BookingSummary = ({ trip, seat, passenger, className }: BookingSummaryProps) => {
  const { t } = useTranslation();
  const operatorName =
    trip.bus?.operator?.name ?? trip.operator?.name ?? t("trips.unknownOperator");
  const busClass = trip.bus?.bus_class ?? trip.bus?.bus_type ?? "standard";
  const plate = trip.bus?.plate_number ?? "—";
  const departure = dayjs(trip.departure_time);
  const arrival = dayjs(trip.arrival_time);
  const price =
    typeof (trip.base_price ?? trip.price) === "string"
      ? Number.parseFloat((trip.base_price ?? trip.price) as string)
      : (((trip.base_price ?? trip.price) as number) ?? 0);
  const seatPrice = seat?.price ?? price;
  const total = seatPrice;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-bold tracking-tight">Booking summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex items-start gap-3">
          <BusIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-foreground font-medium">{operatorName}</p>
            <p className="text-muted-foreground text-xs capitalize">
              {busClass} · {plate}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-foreground font-medium">
              {trip.route.origin} → {trip.route.destination}
            </p>
            <p className="text-muted-foreground text-xs">
              {trip.route.route_code ?? trip.route.code}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Calendar className="text-muted-foreground mt-0.5 size-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-foreground font-medium">{departure.format("ddd, DD MMM YYYY")}</p>
            <p className="text-muted-foreground text-xs">
              Depart {departure.format("HH:mm")} · Arrive {arrival.format("HH:mm")}
            </p>
          </div>
        </div>

        {seat && (
          <div className="flex items-start gap-3">
            <span className="bg-primary/10 text-primary mt-0.5 flex size-4 items-center justify-center rounded text-[10px] font-bold">
              S
            </span>
            <div>
              <p className="text-foreground font-medium">Seat {seat.number}</p>
            </div>
          </div>
        )}

        {passenger && (
          <div className="flex items-start gap-3">
            <User className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <div>
              <p className="text-foreground font-medium">{passenger.passenger_name}</p>
              <p className="text-muted-foreground text-xs">
                {passenger.passenger_phone}
                {passenger.passenger_email ? ` · ${passenger.passenger_email}` : ""}
              </p>
            </div>
          </div>
        )}

        <Separator />

        <div className="space-y-1.5">
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>Subtotal</span>
            <span>{formatCurrency(seatPrice, { code: "TZS", decimalDigits: 0 })}</span>
          </div>
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>Booking fee</span>
            <span>{formatCurrency(0, { code: "TZS", decimalDigits: 0 })}</span>
          </div>
          <div className="text-foreground flex items-center justify-between pt-2 text-lg font-extrabold tracking-tight">
            <span>Total</span>
            <span>{formatCurrency(total, { code: "TZS", decimalDigits: 0 })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
