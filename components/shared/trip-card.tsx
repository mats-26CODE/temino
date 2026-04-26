"use client";

/**
 * Search results card for `/trips`.
 *
 * Layout mirrors the British Rail / Busbud journey card:
 *   • Header     — operator avatar + name (left) · duration (right)
 *   • Journey    — big departure time · timeline rail (bus → pin) · big arrival time
 *   • Stations   — origin station + date (left) · destination station + date (right)
 *   • Footer     — bus type (left) · amenity chips (left) · price + select CTA (right)
 *
 * Direct bus trips have no intermediate stops, so the rail is a single segment
 * between the bus icon and the pin icon. If we add multi-leg journeys later,
 * we can render dots + chips between the two endpoints without changing the
 * outer structure.
 */

import dayjs from "dayjs";
import Link from "next/link";
import {
  Armchair,
  ArrowRight,
  Bus as BusIcon,
  Coffee,
  DoorClosed,
  MapPin,
  Plug,
  Snowflake,
  Star,
  Tv,
  Usb,
  Wifi,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatCurrency, formatTripDuration, resolveTripStopLabels } from "@/helpers/helpers";
import { useTranslation } from "@/hooks/use-translation";

const AMENITY_META: Record<string, { icon: LucideIcon; key: string }> = {
  wifi: { icon: Wifi, key: "bus.amenities.wifi" },
  socket: { icon: Plug, key: "bus.amenities.socket" },
  usb: { icon: Usb, key: "bus.amenities.usb" },
  ac: { icon: Snowflake, key: "bus.amenities.ac" },
  meal: { icon: Coffee, key: "bus.amenities.meal" },
  tv: { icon: Tv, key: "bus.amenities.tv" },
  restroom: { icon: DoorClosed, key: "bus.amenities.restroom" },
  reclining: { icon: Armchair, key: "bus.amenities.reclining" },
};

interface TripCardProps {
  trip: Trip;
  onSelect?: (trip: Trip) => void;
}

export const TripCardSkeleton = ({ className }: { className?: string }) => (
  <Card
    className={cn("border-border/60 group overflow-hidden border p-0 shadow-none", className)}
    aria-hidden
  >
    <CardContent className="space-y-4 p-5">
      {/* Header — avatar + operator (one line) · duration */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="min-w-0 space-y-0">
            <Skeleton className="h-5 w-44 max-w-full" />
          </div>
        </div>
        <Skeleton className="mt-0.5 h-4 w-32 shrink-0" />
      </div>

      {/* Journey — big times + rail · station + date row */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-4 md:gap-6">
          <Skeleton className="h-9 w-17 shrink-0 md:h-11 md:w-19" />
          <div className="relative h-10 min-w-0 flex-1">
            <Skeleton className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full" />
            <div className="relative flex h-full w-full items-center justify-between">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <Skeleton className="size-8 shrink-0 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-9 w-17 shrink-0 md:h-11 md:w-19" />
        </div>
        <div className="flex items-baseline justify-between gap-6">
          <Skeleton className="h-4 max-w-[48%] min-w-0 flex-1" />
          <Skeleton className="h-4 max-w-[48%] min-w-0 flex-1" />
        </div>
      </div>

      {/* Footer — bus type + amenity pills · price block + CTA (gap-8 like TripCard) */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Skeleton className="h-7 w-22 shrink-0 rounded-md" />
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-7 w-18 shrink-0 rounded-full" />
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-8">
          {/* Single bar: large price + small “/ includes fees” on one baseline (see TripCard) */}
          <Skeleton className="h-8 w-36 shrink-0 md:h-9 md:w-40" />
          <Skeleton className="h-9 w-44 shrink-0 rounded-md" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const TimelineRail = () => (
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

export const TripCard = ({ trip, onSelect }: TripCardProps) => {
  const { t } = useTranslation();
  const operator = trip.bus?.operator ?? trip.operator;
  const operatorName = operator?.name?.trim() || t("trips.unknownOperator");
  const operatorRating = operator?.rating;
  const busClass = trip.bus?.bus_class ?? trip.bus?.bus_type;
  const departure = dayjs(trip.departure_time);
  const arrival = dayjs(trip.arrival_time);
  const rawPrice = trip.base_price ?? trip.price ?? 0;
  const price = typeof rawPrice === "string" ? Number.parseFloat(rawPrice) : rawPrice;
  const { origin: originStation, destination: destStation } = resolveTripStopLabels(trip);
  const durationLabel = formatTripDuration(trip.departure_time, trip.arrival_time);
  const amenities = (trip.bus?.amenities ?? []).filter((a) => a in AMENITY_META).slice(0, 6);

  const routeShape = trip.route as unknown as Route | string;
  const fallbackOrigin =
    typeof routeShape === "object" && routeShape?.origin ? routeShape.origin : "";
  const fallbackDest =
    typeof routeShape === "object" && routeShape?.destination ? routeShape.destination : "";

  const dateFmt = (d: dayjs.Dayjs) => d.format("ddd D MMM");

  return (
    <Card className="border-border/60 hover:primary/40 group overflow-hidden p-0 shadow-none transition-all hover:shadow-sm">
      <CardContent className="space-y-4 p-5">
        {/* ── Header ─────────────────────────────────────────── */}
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
              <p className="text-foreground truncate text-base font-bold tracking-tight">
                {operatorName}
              </p>
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
          <p className="text-muted-foreground shrink-0 text-sm font-medium tracking-tight">
            {t("trips.duration")} {durationLabel}
          </p>
        </div>

        {/* ── Journey: times row, then stations row ──────────── */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-4 md:gap-6">
            <p className="text-foreground shrink-0 text-3xl leading-none font-bold tracking-tight tabular-nums md:text-4xl">
              {departure.format("HH:mm")}
            </p>
            <TimelineRail />
            <p className="text-foreground shrink-0 text-3xl leading-none font-bold tracking-tight tabular-nums md:text-4xl">
              {arrival.format("HH:mm")}
            </p>
          </div>
          <div className="flex items-baseline justify-between gap-6">
            <p className="text-muted-foreground max-w-[48%] min-w-0 truncate text-sm">
              <span className="text-foreground font-semibold">
                {originStation || fallbackOrigin}
              </span>
              <span className="mx-1.5 opacity-60">·</span>
              <span>{dateFmt(departure)}</span>
            </p>
            <p className="text-muted-foreground max-w-[48%] min-w-0 truncate text-right text-sm">
              <span className="text-foreground font-semibold">{destStation || fallbackDest}</span>
              <span className="mx-1.5 opacity-60">·</span>
              <span>{dateFmt(arrival)}</span>
            </p>
          </div>
        </div>

        {/* ── Footer: bus type + amenities (left) · price + CTA (right) — single row ── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {busClass ? (
              <Badge
                variant="secondary"
                className="text-muted-foreground h-7 shrink-0 rounded-md px-2.5 text-xs font-semibold capitalize"
              >
                {String(busClass).replace(/_/g, " ")}
              </Badge>
            ) : null}
            {amenities.map((a) => {
              const Icon = AMENITY_META[a].icon;
              return (
                <span
                  key={a}
                  className="bg-muted/60 text-muted-foreground inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                >
                  <Icon className="size-3.5 shrink-0" strokeWidth={2} />
                  {t(AMENITY_META[a].key)}
                </span>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-8">
            <div className="text-right leading-tight">
              <p className="text-primary text-xl font-bold tracking-tight tabular-nums md:text-2xl">
                {formatCurrency(price, { code: "TZS", decimalDigits: 0 })}{" "}
                <span className="text-muted-foreground text-xs">/ {t("trips.includesFees")}</span>
              </p>
            </div>

            {onSelect ? (
              <Button onClick={() => onSelect(trip)} size="sm" className="gap-1.5 rounded-md">
                {t("trips.selectSeatWithCount", { count: trip.available_seats })}{" "}
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button asChild size="sm" className="gap-1.5 rounded-md">
                <Link href={`/trips/${trip.id}/seat`}>
                  {t("trips.selectSeatWithCount", { count: trip.available_seats })}{" "}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
