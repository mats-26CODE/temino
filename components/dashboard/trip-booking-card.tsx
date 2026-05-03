"use client";

import type { ReactNode } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { ArrowRight, Bus, Plug, Star, Wifi, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { summarizeBookingSeats } from "@/helpers/booking-seats";
import { BUS_AMENITY_META } from "@/components/shared/bus-amenity-pills";
import { formatCurrency, formatTripDuration, resolveTripStopLabels } from "@/helpers/helpers";
import { useTranslation } from "@/hooks/use-translation";

const bookingPublicRef = (b: Booking) => b.reference ?? b.booking_reference ?? b.id;

const formatBusClass = (bus: Bus | null | undefined) =>
  bus ? String(bus.bus_class ?? bus.bus_type ?? "").replace(/_/g, " ") : "";

const busPrimaryLabel = (bus: Bus | null | undefined) =>
  bus?.bus_number?.trim() || bus?.plate_number || "Bus";

/** Matches `DashboardOverviewStrip` stat / quick-book cards: `rounded-2xl border shadow-sm`. */
const shellClass = (archived: boolean | undefined, className?: string) =>
  cn(
    "bg-muted/15 border-border/50 w-full rounded-2xl border p-3 shadow-sm transition-transform hover:scale-[1.02]",
    archived && "opacity-90 border-muted-foreground/35",
    className,
  );

/**
 * Decorative / marketing snapshot — JSX matches `HeroIllustration` `MiniTripCard`
 * verbatim (stacked Wifi + Zap cues, star rating, price chip, centered duration rail).
 */
export type MarketingTripCardProps = {
  title: string;
  origin: string;
  destination: string;
  depart: string;
  arrive: string;
  duration: string;
  price: string;
  rating: number;
  className?: string;
};

export const MarketingTripCard = ({
  title,
  origin,
  destination,
  depart,
  arrive,
  duration,
  price,
  rating,
  className,
}: MarketingTripCardProps) => (
  <div className={cn(shellClass(false, undefined), "max-w-[20rem]", className)}>
    <div className="flex items-center gap-2.5">
      <div className="bg-primary/15 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
        <Bus className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-[13px] leading-tight font-semibold">{title}</p>
        <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            {rating.toFixed(1)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Wifi className="size-3" />
          </span>
          <span className="inline-flex items-center gap-1">
            <Zap className="size-3" />
          </span>
        </div>
      </div>
      <div className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold">
        {price}
      </div>
    </div>

    <div className="mt-3 flex items-center gap-2">
      <div className="text-left">
        <p className="text-foreground text-[15px] leading-none font-bold">{depart}</p>
        <p className="text-muted-foreground mt-0.5 truncate text-[10px]">{origin}</p>
      </div>
      <div className="flex flex-1 flex-col items-center gap-0.5">
        <span className="text-muted-foreground text-[10px]">{duration}</span>
        <div className="bg-border relative h-px w-full">
          <div className="bg-primary absolute top-1/2 left-0 size-1 -translate-y-1/2 rounded-full" />
          <div className="bg-primary absolute top-1/2 right-0 size-1 -translate-y-1/2 rounded-full" />
        </div>
        <ArrowRight className="text-muted-foreground/70 size-3" />
      </div>
      <div className="text-right">
        <p className="text-foreground text-[15px] leading-none font-bold">{arrive}</p>
        <p className="text-muted-foreground mt-0.5 truncate text-[10px]">{destination}</p>
      </div>
    </div>
  </div>
);

const AmenityOrFallbackIcons = ({ amenities }: { amenities: readonly string[] }) => {
  const picks = [...amenities].filter((a) => a in BUS_AMENITY_META).slice(0, 2);
  if (picks.length === 0) {
    return (
      <>
        <span className="inline-flex items-center gap-1">
          <Wifi className="size-3" />
        </span>
        <span className="inline-flex items-center gap-1">
          <Plug className="size-3" />
        </span>
      </>
    );
  }
  if (picks.length === 1) {
    const Icon = BUS_AMENITY_META[picks[0]].icon;
    return (
      <>
        <span className="inline-flex items-center gap-1">
          <Icon className="size-3" strokeWidth={2} />
        </span>
        <span className="inline-flex items-center gap-1">
          <Zap className="size-3" />
        </span>
      </>
    );
  }
  return (
    <>
      {picks.map((a) => {
        const Icon = BUS_AMENITY_META[a].icon;
        return (
          <span key={a} className="inline-flex items-center gap-1">
            <Icon className="size-3" strokeWidth={2} />
          </span>
        );
      })}
    </>
  );
};

export type TripBookingCardProps = {
  booking: Booking;
  archived?: boolean;
  className?: string;
};

/**
 * Booking tile for dashboards — shell + rhythm match `MarketingTripCard` / hero mini trips.
 */
export const TripBookingCard = ({
  booking: b,
  archived = false,
  className,
}: TripBookingCardProps) => {
  const { t } = useTranslation();
  const trip = b.trip;
  const amount = typeof b.amount === "string" ? Number.parseFloat(b.amount) : b.amount;
  const seatSummary = summarizeBookingSeats(b, trip ?? null);
  const confirmationHref = trip?.id
    ? `/trips/${trip.id}/confirmation?booking=${encodeURIComponent(b.id)}`
    : null;

  const seatLabel =
    seatSummary.count === 0
      ? t("dashboard.gridCard.seatPending")
      : seatSummary.count === 1 && seatSummary.list
        ? seatSummary.list
        : seatSummary.list
          ? `${seatSummary.count} · ${seatSummary.list}`
          : t("dashboard.gridCard.seatCount", { count: String(seatSummary.count) });

  if (!trip) {
    const priceChip = (
      <div className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold tabular-nums">
        {formatCurrency(amount, { code: "TZS", decimalDigits: 0 })}
      </div>
    );
    return (
      <div className={shellClass(archived, className)}>
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/15 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
            <Bus className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-[13px] leading-tight font-semibold">
              {t("dashboard.gridCard.fallbackTitle")}
            </p>
            <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="font-mono">{bookingPublicRef(b)}</span>
              <span className="capitalize opacity-90">{b.status}</span>
            </div>
          </div>
          {priceChip}
        </div>
        <p className="text-muted-foreground mt-3 text-[10px] leading-relaxed">
          {t("dashboard.bookingNoTripMeta")}
        </p>
        <div className="text-muted-foreground border-border/40 mt-3 flex flex-wrap justify-between gap-2 border-t pt-3 text-[11px]">
          <span>{t("dashboard.gridCard.seats")}</span>
          <span className="text-foreground font-medium tabular-nums">{seatLabel}</span>
        </div>
      </div>
    );
  }

  const bus = trip.bus ?? null;
  const amenities = bus?.amenities ?? [];
  const busClass = formatBusClass(bus).trim();
  const operator = trip.bus?.operator ?? trip.operator;
  const rating = operator?.rating;

  const routeShape = trip.route as unknown as Route | string | undefined;
  const fallbackOrigin =
    typeof routeShape === "object" && routeShape?.origin ? routeShape.origin : "";
  const fallbackDest =
    typeof routeShape === "object" && routeShape?.destination ? routeShape.destination : "";

  const stops = resolveTripStopLabels(trip);
  const fromCity = stops.origin || fallbackOrigin || t("dashboard.bookingRouteFallback");
  const toCity = stops.destination || fallbackDest || "—";

  const hasSchedule = Boolean(trip.departure_time && trip.arrival_time);
  const departure = hasSchedule ? dayjs(trip.departure_time) : null;
  const arrival = hasSchedule ? dayjs(trip.arrival_time) : null;
  const durationLabel = hasSchedule
    ? formatTripDuration(trip.departure_time, trip.arrival_time)
    : "";

  const title =
    bus != null
      ? busPrimaryLabel(bus)
      : trip.trip_code?.trim() || t("dashboard.gridCard.fallbackTitle");

  const dotColor = archived ? "bg-muted-foreground" : "bg-primary";

  const metaLead: ReactNode =
    rating != null && rating > 0 ? (
      <span className="inline-flex items-center gap-1">
        <Star className="size-3 fill-amber-400 text-amber-400" />
        {rating.toFixed(1)}
      </span>
    ) : null;

  const priceChip = (
    <div className="bg-primary/10 text-primary inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold tabular-nums">
      {formatCurrency(amount, { code: "TZS", decimalDigits: 0 })}
    </div>
  );

  return (
    <div className={shellClass(archived, className)}>
      <div className="flex items-center gap-2.5">
        <div className="bg-primary/15 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
          <Bus className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-[13px] leading-tight font-semibold">
            {title}
          </p>
          <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2 text-[11px]">
            {metaLead}
            <AmenityOrFallbackIcons amenities={amenities} />
            {busClass ? <span className="truncate capitalize opacity-90">{busClass}</span> : null}
            <span className="capitalize opacity-90">{b.status}</span>
          </div>
        </div>
        {priceChip}
      </div>

      {hasSchedule && departure && arrival ? (
        <div className="mt-3 flex items-center gap-2">
          <div className="text-left">
            <p className="text-foreground text-[15px] leading-none font-bold">
              {departure.format("HH:mm")}
            </p>
            <p className="text-muted-foreground mt-0.5 truncate text-[10px]">{fromCity}</p>
          </div>
          <div className="flex flex-1 flex-col items-center gap-0.5">
            <span className="text-muted-foreground text-[10px]">{durationLabel}</span>
            <div className="bg-border relative h-px w-full">
              <div
                className={cn(
                  "absolute top-1/2 left-0 size-1 -translate-y-1/2 rounded-full",
                  dotColor,
                )}
              />
              <div
                className={cn(
                  "absolute top-1/2 right-0 size-1 -translate-y-1/2 rounded-full",
                  dotColor,
                )}
              />
            </div>
            <ArrowRight className="text-muted-foreground/70 size-3" />
          </div>
          <div className="text-right">
            <p className="text-foreground text-[15px] leading-none font-bold">
              {arrival.format("HH:mm")}
            </p>
            <p className="text-muted-foreground mt-0.5 truncate text-[10px]">{toCity}</p>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground mt-3 text-center text-[11px]">
          {t("dashboard.gridCard.schedulePending")}
        </p>
      )}

      <div className="text-muted-foreground border-border/40 mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-[11px]">
        <span className="min-w-0 flex-1 truncate">
          <span className="text-[10px] font-medium tracking-wide uppercase opacity-90">
            {t("dashboard.gridCard.seats")}
          </span>
          <span className="text-foreground ml-1.5 font-medium tabular-nums">{seatLabel}</span>
        </span>
        {confirmationHref ? (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-primary h-auto shrink-0 gap-1 px-2 py-1 text-[11px] font-semibold"
          >
            <Link href={confirmationHref}>
              {t("dashboard.viewTicket")}
              <ArrowRight className="size-3 opacity-70" />
            </Link>
          </Button>
        ) : (
          <span className="text-muted-foreground shrink-0 font-mono text-[10px]">
            {bookingPublicRef(b)}
          </span>
        )}
      </div>
    </div>
  );
};

/** Loading placeholder aligned with hero mini trip proportions */
export const TripBookingCardSkeleton = ({ className }: { className?: string }) => (
  <div
    className={cn(shellClass(undefined, undefined), "shadow-inner brightness-95", className)}
    aria-hidden
  >
    <div className="flex animate-pulse items-center gap-2.5">
      <div className="bg-muted-foreground/20 size-9 shrink-0 rounded-lg" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="bg-muted-foreground/20 h-[13px] w-[60%] rounded" />
        <div className="bg-muted-foreground/15 flex h-[11px] w-28 gap-2 rounded">
          <div className="bg-muted-foreground/25 size-3 rounded-full" />
          <div className="bg-muted-foreground/25 size-3 rounded-full" />
        </div>
      </div>
      <div className="bg-muted-foreground/25 h-[26px] w-16 shrink-0 rounded-full" />
    </div>
    <div className="mt-3 flex gap-2">
      <div className="flex-1 space-y-1.5 pt-0.5">
        <div className="bg-muted-foreground/20 h-4 w-12 rounded" />
        <div className="bg-muted-foreground/18 h-2 w-full rounded" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-start gap-1 pt-2">
        <div className="bg-muted-foreground/20 h-2 w-[40%] rounded" />
        <div className="bg-muted-foreground/30 h-px w-full rounded-full" />
      </div>
      <div className="flex-1 space-y-1.5 pt-0.5 text-right">
        <div className="bg-muted-foreground/20 ml-auto h-4 w-12 rounded" />
        <div className="bg-muted-foreground/18 ml-auto h-2 w-full rounded" />
      </div>
    </div>
    <div className="border-border/40 mt-3 flex gap-3 border-t pt-3">
      <div className="bg-muted-foreground/18 h-[14px] flex-1 rounded" />
      <div className="bg-muted-foreground/20 h-[14px] w-24 rounded-full" />
    </div>
  </div>
);

export type DashboardTripBookingCardProps = TripBookingCardProps;
export const DashboardTripBookingCard = TripBookingCard;
export const DashboardTripBookingCardSkeleton = TripBookingCardSkeleton;
export const DashboardBookingGridCard = TripBookingCard;
export const DashboardBookingGridCardSkeleton = TripBookingCardSkeleton;
