"use client";

import dayjs from "dayjs";
import { Bus as BusIcon, Calendar, MapPin, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/helpers/helpers";
import { useTranslation } from "@/hooks/use-translation";
import { useBookingStore } from "@/lib/stores/booking-store";
import { BookingPassengerMiniCard } from "@/components/shared/booking-passenger-mini-card";

interface BookingSummaryProps {
  trip: Trip;
  /** Single seat (legacy) when `seats` is not provided. */
  seat?: Seat | null;
  /** All selected seats — used for multi-seat bookings. */
  seats?: Seat[] | null;
  passenger?: PassengerInfo | null;
  /** When set with length ≥ 1, each entry is paired with `seats` by index. */
  party?: PassengerInfo[] | null;
  /** Deprecated: prefer rendering full `party` when available. */
  partySize?: number;
  className?: string;
}

/**
 * Booking summary card — used on the seat, payment, and confirmation screens
 * (and previously the passenger step) to show the user what they're paying for.
 */
export const BookingSummary = ({
  trip,
  seat,
  seats,
  passenger,
  party,
  partySize,
  className,
}: BookingSummaryProps) => {
  const { t } = useTranslation();
  const pickupStation = useBookingStore((s) => s.pickupStation);
  const dropoffStation = useBookingStore((s) => s.dropoffStation);
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

  const seatRows =
    seats && seats.length > 0 ? seats : seat ? [seat] : [];

  const seatLabel = (s: Seat) => (s.number?.trim() ? s.number : s.id);

  const linePrice = (s: Seat): number =>
    typeof s.price === "number"
      ? s.price
      : typeof s.price === "string"
        ? Number.parseFloat(s.price)
        : Number.NaN;

  const seatSubtotal =
    seatRows.length > 0
      ? seatRows.reduce((sum, s) => {
          const line = linePrice(s);
          return sum + (Number.isFinite(line) ? line : price);
        }, 0)
      : seat && Number.isFinite(linePrice(seat))
        ? linePrice(seat)
        : price;

  const total = seatSubtotal;

  const travellers: PassengerInfo[] =
    party && party.length > 0 ? party : passenger ? [passenger] : [];

  const passengerBlocks = travellers.map((p, index) => (
    <BookingPassengerMiniCard
      key={`booking-summary-traveller-${index}`}
      passenger={p}
      seatNumber={seatRows[index] ? seatLabel(seatRows[index]) : undefined}
    />
  ));

  /** Always surface chosen seats explicitly (payment UX); traveller cards stay seat-aware when paired. */
  const showStandaloneSeatSummary = seatRows.length > 0;

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

        {(pickupStation?.name ?? dropoffStation?.name) ? (
          <div className="flex items-start gap-3">
            <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              {pickupStation?.name ? (
                <div>
                  <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                    {t("bookingSummary.boardAt")}
                  </p>
                  <p className="text-foreground text-sm leading-snug font-medium">
                    {pickupStation.name}
                  </p>
                </div>
              ) : null}
              {dropoffStation?.name ? (
                <div>
                  <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                    {t("bookingSummary.arrivalAt")}
                  </p>
                  <p className="text-foreground text-sm leading-snug font-medium">
                    {dropoffStation.name}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="flex items-start gap-3">
          <Calendar className="text-muted-foreground mt-0.5 size-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-foreground font-medium">{departure.format("ddd, DD MMM YYYY")}</p>
            <p className="text-muted-foreground text-xs">
              Depart {departure.format("HH:mm")} · Arrive {arrival.format("HH:mm")}
            </p>
          </div>
        </div>

        {showStandaloneSeatSummary && seatRows.length === 1 && (
          <div className="flex items-start gap-3">
            <span className="bg-primary/10 text-primary mt-0.5 flex size-4 items-center justify-center rounded text-[10px] font-bold">
              S
            </span>
            <div>
              <p className="text-foreground font-medium">Seat {seatLabel(seatRows[0])}</p>
            </div>
          </div>
        )}
        {showStandaloneSeatSummary && seatRows.length > 1 && (
          <div className="flex items-start gap-3">
            <span className="bg-primary/10 text-primary mt-0.5 flex size-4 items-center justify-center rounded text-[10px] font-bold">
              S
            </span>
            <div className="min-w-0">
              <p className="text-foreground font-medium">{t("bookingSummary.seats")}</p>
              <p className="text-muted-foreground text-xs">
                {seatRows.map((s) => seatLabel(s)).join(" · ")}
              </p>
            </div>
          </div>
        )}

        {passengerBlocks.length > 0 ? (
          <div className="flex items-start gap-3">
            <User className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
              {passengerBlocks}
            </div>
          </div>
        ) : partySize !== undefined && partySize > 1 ? (
          <div className="text-muted-foreground flex items-start gap-3 text-xs">
            <User className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <span>
              {t("passenger.moreTravellersSummary", {
                count: partySize - 1,
              })}
            </span>
          </div>
        ) : null}

        <Separator />

        <div className="space-y-1.5">
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>Subtotal</span>
            <span>{formatCurrency(seatSubtotal, { code: "TZS", decimalDigits: 0 })}</span>
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
