"use client";

import dayjs from "dayjs";
import Link from "next/link";
import { Armchair, ArrowRight, Bus as BusIcon, MapPin, Star, Ticket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BusAmenityPills } from "@/components/shared/bus-amenity-pills";
import { cn } from "@/lib/utils";
import { summarizeBookingSeats } from "@/helpers/booking-seats";
import { formatCurrency, formatTripDuration, resolveTripStopLabels } from "@/helpers/helpers";
import { useTranslation } from "@/hooks/use-translation";

const BookingTimelineRail = () => (
  <div className="relative flex h-10 w-full items-center" role="presentation" aria-hidden="true">
    <div className="bg-primary/20 absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2" />
    <div className="relative flex w-full items-center justify-between">
      <div className="text-primary-foreground flex size-4 shrink-0 items-center justify-center rounded-full bg-gray-200 md:size-8">
        <BusIcon className="size-3 text-gray-500 md:size-4" />
      </div>
      <div className="text-primary-foreground flex size-4 shrink-0 items-center justify-center rounded-full bg-gray-200 md:size-8">
        <MapPin className="size-3 text-gray-500 md:size-4" />
      </div>
    </div>
  </div>
);

const bookingPublicRef = (b: Booking) => b.reference ?? b.booking_reference ?? b.id;

export type PassengerBookingCardProps = {
  booking: Booking;
  density?: "compact" | "comfortable";
  className?: string;
};

const isArchivedBooking = (b: Booking) =>
  b.status === "cancelled" || b.status === "expired";

export const PassengerBookingCard = ({
  booking: b,
  density = "comfortable",
  className,
}: PassengerBookingCardProps) => {
  const { t } = useTranslation();
  const archived = isArchivedBooking(b);
  const trip = b.trip;
  const amount = typeof b.amount === "string" ? Number.parseFloat(b.amount) : b.amount;
  const seatSummary = summarizeBookingSeats(b, trip ?? null);
  const confirmationHref =
    trip?.id ? `/trips/${trip.id}/confirmation?booking=${encodeURIComponent(b.id)}` : null;

  const compact = density === "compact";
  const p = compact ? "p-4" : "p-5";
  const timeClass = compact
    ? "text-2xl md:text-3xl leading-none font-bold tabular-nums"
    : "text-3xl md:text-4xl leading-none font-bold tabular-nums";
  const amenityMax = compact ? 4 : 6;

  const seatLine = () => {
    if (seatSummary.count === 0) {
      return (
        <span className="text-muted-foreground inline-flex items-center gap-1.5">
          <Armchair className="size-3.5 shrink-0 opacity-80" strokeWidth={2} />
          {t("dashboard.bookingSeatPending")}
        </span>
      );
    }
    if (seatSummary.count === 1) {
      return (
        <span className="text-muted-foreground inline-flex items-center gap-1.5">
          <Armchair className="size-3.5 shrink-0 opacity-80" strokeWidth={2} />
          {seatSummary.list
            ? t("dashboard.bookingSeatOne", { seat: seatSummary.list })
            : t("dashboard.bookingSeatPending")}
        </span>
      );
    }
    return (
      <span className="text-muted-foreground inline-flex items-center gap-1.5">
        <Armchair className="size-3.5 shrink-0 opacity-80" strokeWidth={2} />
        {seatSummary.list
          ? t("dashboard.bookingSeatMany", {
              count: String(seatSummary.count),
              list: seatSummary.list,
            })
          : t("dashboard.bookingSeatCountOnly", { count: String(seatSummary.count) })}
      </span>
    );
  };

  const paidBlock = (size: "md" | "lg") => (
    <div className="text-right leading-tight">
      <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
        {t("dashboard.bookingTotalPaid")}
      </p>
      <p
        className={cn(
          "text-primary font-bold tracking-tight tabular-nums",
          size === "lg" ? "text-xl md:text-2xl" : "text-lg md:text-xl",
        )}
      >
        {formatCurrency(amount, { code: "TZS", decimalDigits: 0 })}{" "}
        <span className="text-muted-foreground text-xs font-normal normal-case tracking-normal">
          · {t("trips.includesFees")}
        </span>
      </p>
    </div>
  );

  const metaFooter = (busClass: string | undefined, amenities: readonly string[]) => (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {busClass ? (
            <Badge
              variant="secondary"
              className="text-muted-foreground h-7 shrink-0 rounded-md px-2.5 text-xs font-semibold capitalize"
            >
              {String(busClass).replace(/_/g, " ")}
            </Badge>
          ) : null}
          <BusAmenityPills amenities={amenities} compact={compact} maxVisible={amenityMax} />
        </div>
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {seatLine()}
          <span className="text-border hidden sm:inline">|</span>
          <span className="font-mono">{bookingPublicRef(b)}</span>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-4 md:gap-6">
        {paidBlock(compact ? "md" : "lg")}
        {confirmationHref ? (
          <Button asChild size="sm" className="gap-1.5 rounded-md">
            <Link href={confirmationHref}>
              {t("dashboard.viewTicket")} <ArrowRight className="size-4" />
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );

  if (!trip) {
    return (
      <Card
        className={cn(
          "border-border/60 group overflow-hidden p-0 shadow-none transition-all hover:shadow-sm",
          archived && "opacity-90",
          className,
        )}
      >
        <CardContent className={cn(p, "space-y-3")}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-full">
                <Ticket className="size-5 shrink-0" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-foreground truncate text-base font-bold tracking-tight">
                  {t("dashboard.bookingCard.title")}
                </p>
                <p className="text-muted-foreground mt-0.5 truncate font-mono text-xs">
                  {bookingPublicRef(b)}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="capitalize">
              {b.status}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">{t("dashboard.bookingNoTripMeta")}</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-muted-foreground text-xs">
              {dayjs(b.created_at).format("ddd D MMM YYYY · HH:mm")}
            </span>
            {paidBlock("md")}
          </div>
        </CardContent>
      </Card>
    );
  }

  const routeShape = trip.route as unknown as Route | string | undefined;
  const fallbackOrigin =
    typeof routeShape === "object" && routeShape?.origin ? routeShape.origin : "";
  const fallbackDest =
    typeof routeShape === "object" && routeShape?.destination ? routeShape.destination : "";
  const routeCode =
    trip.route_code?.trim() ||
    (typeof routeShape === "object" && routeShape?.route_code
      ? String(routeShape.route_code).trim()
      : "") ||
    (typeof routeShape === "object" && routeShape?.code ? String(routeShape.code).trim() : "");

  const fromApiStations = resolveTripStopLabels(trip);
  const fromLabel = fromApiStations.origin || fallbackOrigin || t("dashboard.bookingRouteFallback");
  const toLabel = fromApiStations.destination || fallbackDest || "";

  const operator = trip.bus?.operator ?? trip.operator;
  const operatorName = operator?.name?.trim() || t("trips.unknownOperator");
  const operatorRating = operator?.rating;
  const busClass = trip.bus?.bus_class ?? trip.bus?.bus_type;
  const amenities = trip.bus?.amenities ?? [];

  const routeTitleRow = (
    <div className="flex flex-wrap items-center gap-2">
      <p className="text-foreground flex min-w-0 flex-wrap items-center text-sm font-semibold">
        <span className="truncate">{fromLabel}</span>
        <ArrowRight className="text-muted-foreground mx-1.5 size-3.5 shrink-0" strokeWidth={2.5} />
        <span className="truncate">{toLabel}</span>
      </p>
      {routeCode ? (
        <Badge variant="outline" className="font-mono text-[10px] font-semibold tracking-tight">
          {routeCode}
        </Badge>
      ) : null}
    </div>
  );

  if (!trip.departure_time || !trip.arrival_time) {
    return (
      <Card
        className={cn(
          "border-border/60 group overflow-hidden p-0 shadow-none transition-all hover:shadow-sm",
          archived && "opacity-90",
          className,
        )}
      >
        <CardContent className={cn(p, "space-y-4")}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              {operator?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={operator.logo_url}
                  alt=""
                  className="border-border/60 bg-background size-10 shrink-0 rounded-full border object-contain p-1"
                />
              ) : (
                <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
                  <BusIcon className="size-5" strokeWidth={2} />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <p className="text-foreground truncate text-base font-bold tracking-tight">
                    {operatorName}
                  </p>
                  <Badge variant="outline" className="h-5 shrink-0 px-2 text-[10px] font-semibold capitalize">
                    {b.status}
                  </Badge>
                </div>
                {operatorRating != null && operatorRating > 0 ? (
                  <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-0.5">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      {operatorRating.toFixed(1)}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          {routeTitleRow}
          <p className="text-muted-foreground text-xs">
            {dayjs(b.created_at).format("ddd D MMM YYYY · HH:mm")}
          </p>
          {metaFooter(busClass, amenities)}
        </CardContent>
      </Card>
    );
  }

  const departure = dayjs(trip.departure_time);
  const arrival = dayjs(trip.arrival_time);
  const durationLabel = formatTripDuration(trip.departure_time, trip.arrival_time);
  const dateFmt = (d: dayjs.Dayjs) => d.format("ddd D MMM");

  return (
    <Card
      className={cn(
        "border-border/60 group overflow-hidden p-0 shadow-none transition-all hover:shadow-sm",
        archived && "opacity-[0.92]",
        className,
      )}
    >
      <CardContent className={cn(p, archived ? "space-y-3" : "space-y-4")}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {operator?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={operator.logo_url}
                alt=""
                className="border-border/60 bg-background size-10 shrink-0 rounded-full border object-contain p-1"
              />
            ) : (
              <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
                <BusIcon className="size-5" strokeWidth={2} />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <p className="text-foreground truncate text-base font-bold tracking-tight">
                  {operatorName}
                </p>
                <Badge variant="outline" className="h-5 shrink-0 px-2 text-[10px] font-semibold capitalize">
                  {b.status}
                </Badge>
              </div>
              {operatorRating != null && operatorRating > 0 ? (
                <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-0.5">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    {operatorRating.toFixed(1)}
                  </span>
                  <span className="font-mono text-[11px] opacity-90">{bookingPublicRef(b)}</span>
                </div>
              ) : (
                <p className="text-muted-foreground mt-0.5 truncate font-mono text-[11px]">
                  {bookingPublicRef(b)}
                </p>
              )}
            </div>
          </div>
          <div className="text-muted-foreground shrink-0 space-y-0.5 text-right text-xs">
            <p className="font-medium tracking-tight">
              {t("trips.duration")} {durationLabel}
            </p>
          </div>
        </div>

        {routeTitleRow}

        <div className={cn(archived ? "space-y-2" : "space-y-2.5")}>
          <div className="flex items-center gap-4 md:gap-6">
            <p className={cn("text-foreground shrink-0 tracking-tight", timeClass)}>
              {departure.format("HH:mm")}
            </p>
            <BookingTimelineRail />
            <p className={cn("text-foreground shrink-0 tracking-tight", timeClass)}>
              {arrival.format("HH:mm")}
            </p>
          </div>
          <div className="flex items-baseline justify-between gap-6">
            <p className="text-muted-foreground max-w-[48%] min-w-0 truncate text-sm">
              <span className="text-foreground font-semibold">{fromApiStations.origin || fallbackOrigin}</span>
              <span className="mx-1.5 opacity-60">·</span>
              <span>{dateFmt(departure)}</span>
            </p>
            <p className="text-muted-foreground max-w-[48%] min-w-0 truncate text-right text-sm">
              <span className="text-foreground font-semibold">
                {fromApiStations.destination || fallbackDest}
              </span>
              <span className="mx-1.5 opacity-60">·</span>
              <span>{dateFmt(arrival)}</span>
            </p>
          </div>
        </div>

        {metaFooter(busClass, amenities)}
      </CardContent>
    </Card>
  );
};

export const PassengerBookingCardSkeleton = ({ className }: { className?: string }) => (
  <Card
    className={cn("border-border/60 overflow-hidden border p-0 shadow-none", className)}
    aria-hidden
  >
    <CardContent className="space-y-4 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="bg-muted size-10 shrink-0 rounded-full" />
          <div className="min-w-0 space-y-2">
            <div className="bg-muted h-5 w-40 rounded-md" />
            <div className="bg-muted h-3 w-28 rounded-md" />
          </div>
        </div>
        <div className="bg-muted h-4 w-20 shrink-0 rounded-md" />
      </div>
      <div className="bg-muted h-4 w-52 max-w-full rounded-md" />
      <div className="flex items-center gap-4 md:gap-6">
        <div className="bg-muted h-9 w-14 shrink-0 rounded-md md:h-11" />
        <div className="bg-muted relative h-10 flex-1 rounded-full opacity-70" />
        <div className="bg-muted h-9 w-14 shrink-0 rounded-md md:h-11" />
      </div>
      <div className="flex justify-between gap-4">
        <div className="bg-muted h-4 flex-1 rounded-md" />
        <div className="bg-muted h-4 flex-1 rounded-md" />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <div className="bg-muted h-7 w-24 shrink-0 rounded-md" />
          <div className="bg-muted h-7 w-16 rounded-full" />
          <div className="bg-muted h-7 w-16 rounded-full" />
        </div>
        <div className="flex gap-4">
          <div className="bg-muted h-10 w-32 rounded-md" />
          <div className="bg-muted h-9 w-28 shrink-0 rounded-md" />
        </div>
      </div>
    </CardContent>
  </Card>
);
