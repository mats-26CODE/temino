"use client";

import dayjs from "dayjs";
import Link from "next/link";
import {
  ArrowRight,
  Armchair,
  ChevronRight,
  Coffee,
  DoorClosed,
  Plug,
  Snowflake,
  Tv,
  Usb,
  Wifi,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency, formatTripDuration } from "@/helpers/helpers";
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

export type RecommendationTag = "cheapest" | "fastest" | "recommended" | "popular";

interface RecommendationCardProps {
  trip: Trip;
  tag?: RecommendationTag;
  className?: string;
}

const TAG_STYLES: Record<RecommendationTag, string> = {
  cheapest: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  fastest: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  recommended: "bg-primary/15 text-primary",
  popular: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
};

// ── Operator brand palette ───────────────────────────────────────────────────
// Curated brand colors for known operators, with a deterministic fallback
// so any operator code resolves to a consistent, visually-distinct pill.
const OPERATOR_BRANDS: Record<string, { bg: string; fg: string }> = {
  KEX: { bg: "bg-emerald-600", fg: "text-white" }, // Kilimanjaro Express
  SHB: { bg: "bg-rose-600", fg: "text-white" }, // Shabiby
  RCH: { bg: "bg-amber-500", fg: "text-zinc-900" }, // Royal Coach
  SUM: { bg: "bg-sky-600", fg: "text-white" }, // Sumry
  DEX: { bg: "bg-violet-600", fg: "text-white" }, // Dar Express
  ABD: { bg: "bg-orange-600", fg: "text-white" }, // Abood
};

const FALLBACK_PALETTE: { bg: string; fg: string }[] = [
  { bg: "bg-emerald-600", fg: "text-white" },
  { bg: "bg-rose-600", fg: "text-white" },
  { bg: "bg-amber-500", fg: "text-zinc-900" },
  { bg: "bg-sky-600", fg: "text-white" },
  { bg: "bg-violet-600", fg: "text-white" },
  { bg: "bg-orange-600", fg: "text-white" },
  { bg: "bg-teal-600", fg: "text-white" },
  { bg: "bg-pink-600", fg: "text-white" },
];

const getOperatorBrand = (code?: string) => {
  if (!code) return { bg: "bg-zinc-800", fg: "text-white" };
  if (OPERATOR_BRANDS[code]) return OPERATOR_BRANDS[code];
  let hash = 0;
  for (let i = 0; i < code.length; i++) hash = (hash * 31 + code.charCodeAt(i)) >>> 0;
  return FALLBACK_PALETTE[hash % FALLBACK_PALETTE.length];
};

// ── Operator logo (image when available, otherwise a branded wordmark pill) ─
const OperatorLogo = ({ operator }: { operator: Operator }) => {
  if (operator.logo_url) {
    // Use the raw <img> tag (logo_url may be any external host); object-contain
    // keeps the logo's natural aspect within a fixed height.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={operator.logo_url}
        alt={operator.name}
        className="h-7 max-w-full rounded object-contain object-left"
      />
    );
  }

  const brand = getOperatorBrand(operator.code);
  return (
    <div
      className={cn("inline-flex max-w-full items-center rounded-md px-2 py-1 shadow-sm", brand.bg)}
      title={operator.name}
    >
      <span
        className={cn(
          "truncate text-[11px] font-extrabold tracking-wider uppercase md:text-xs",
          brand.fg,
        )}
      >
        {operator.name}
      </span>
    </div>
  );
};

export const RecommendationCard = ({ trip, tag, className }: RecommendationCardProps) => {
  const { t } = useTranslation();
  const departure = dayjs(trip.departure_time);
  const arrival = dayjs(trip.arrival_time);
  const rawPrice = trip.base_price ?? trip.price ?? 0;
  const price = typeof rawPrice === "string" ? Number.parseFloat(rawPrice) : rawPrice;
  const operator = trip.operator ?? trip.bus.operator;
  const amenities = (trip.bus.amenities ?? []).filter((a) => a in AMENITY_META).slice(0, 4);

  const originStation = trip.route.origin_station?.name ?? trip.route.origin;
  const destStation = trip.route.destination_station?.name ?? trip.route.destination;

  return (
    <Card
      className={cn(
        "ring-border/70 hover:ring-foreground/20 group rounded-2xl px-5 py-4 shadow-none ring-1 transition-all hover:shadow-md md:px-6 md:py-5",
        className,
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
        {/* Operator logo + amenities */}
        <div className="flex min-w-0 flex-col gap-2 md:w-44 md:shrink-0 lg:w-48">
          <OperatorLogo operator={operator} />
          {amenities.length > 0 ? (
            <div className="text-muted-foreground/70 flex items-center gap-2">
              {amenities.map((a) => {
                const Icon = AMENITY_META[a].icon;
                return (
                  <Icon
                    key={a}
                    className="size-4"
                    strokeWidth={2}
                    aria-label={t(AMENITY_META[a].key)}
                  />
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Departure */}
        <div className="min-w-0 md:w-44 lg:w-48">
          <p className="text-foreground text-xl leading-none font-bold tracking-tight tabular-nums md:text-2xl">
            {departure.format("h:mma")}
          </p>
          <p className="text-muted-foreground mt-1.5 truncate text-sm">{originStation}</p>
        </div>

        {/* Duration / arrow */}
        <div className="flex flex-row items-center gap-2 md:w-20 md:shrink-0 md:flex-col md:gap-1">
          <ArrowRight className="text-muted-foreground/60 size-5" strokeWidth={1.75} />
          <span className="text-muted-foreground text-sm font-medium whitespace-nowrap md:text-xs">
            {formatTripDuration(trip.departure_time, trip.arrival_time)}
          </span>
        </div>

        {/* Arrival */}
        <div className="min-w-0 md:w-44 lg:w-48">
          <p className="text-foreground text-xl leading-none font-bold tracking-tight tabular-nums md:text-2xl">
            {arrival.format("h:mma")}
          </p>
          <p className="text-muted-foreground mt-1.5 truncate text-sm">{destStation}</p>
        </div>

        {/* Tag + Price CTA */}
        <div className="flex items-center justify-between gap-3 md:ml-auto md:gap-4">
          <div className="flex min-w-0 md:w-24 md:justify-center">
            {tag ? (
              <Badge
                className={cn(
                  "rounded-full border-none px-3 py-1 text-[11px] font-semibold tracking-tight",
                  TAG_STYLES[tag],
                )}
              >
                {t(`landing.tags.${tag}`)}
              </Badge>
            ) : null}
          </div>

          <Link
            href={`/trips/${trip.id}/seat`}
            className="bg-primary text-primary-foreground hover:bg-primary/90 group/btn inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-base font-bold tracking-tight tabular-nums shadow-sm transition-all hover:shadow-md md:shrink-0"
          >
            <span>{formatCurrency(price, { code: "TZS", decimalDigits: 0 })}</span>
            <ChevronRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
};
