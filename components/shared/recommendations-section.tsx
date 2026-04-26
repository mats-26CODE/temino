"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { ArrowRight, Locate, MapPin, MoreHorizontal } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useRecommendedTrips } from "@/hooks/use-trips";
import { useTranslation } from "@/hooks/use-translation";
import { TZ_CITIES } from "@/constants/values";
import { cn } from "@/lib/utils";
import {
  RecommendationCard,
  RecommendationCardSkeleton,
  type RecommendationTag,
} from "./recommendation-card";

const FALLBACK_CITY = "Dar es Salaam";
const VISIBLE_DATE_PILLS = 7; // Today + next 6 days

const tripPrice = (t: Trip): number => {
  const raw = t.base_price ?? t.price ?? 0;
  return typeof raw === "string" ? Number.parseFloat(raw) : raw;
};

const tripDurationMs = (t: Trip): number => dayjs(t.arrival_time).diff(dayjs(t.departure_time));

const tripOperatorRating = (t: Trip): number => (t.bus?.operator ?? t.operator)?.rating ?? 0;

const pickTags = (trips: Trip[]): Map<string, RecommendationTag> => {
  const tags = new Map<string, RecommendationTag>();
  if (trips.length === 0) return tags;

  const cheapest = [...trips].sort((a, b) => tripPrice(a) - tripPrice(b))[0];
  if (cheapest) tags.set(cheapest.id, "cheapest");

  const fastest = [...trips].sort((a, b) => tripDurationMs(a) - tripDurationMs(b))[0];
  if (fastest && !tags.has(fastest.id)) tags.set(fastest.id, "fastest");

  const recommended = [...trips].sort((a, b) => tripOperatorRating(b) - tripOperatorRating(a))[0];
  if (recommended && !tags.has(recommended.id)) tags.set(recommended.id, "recommended");

  return tags;
};

const dateLabel = (date: dayjs.Dayjs, today: dayjs.Dayjs, t: (k: string) => string): string => {
  const suffix = date.format("MMM D");
  if (date.isSame(today, "day")) return `${t("landing.recommendations.dateToday")}, ${suffix}`;
  if (date.isSame(today.add(1, "day"), "day"))
    return `${t("landing.recommendations.dateTomorrow")}, ${suffix}`;
  return date.format("ddd, MMM D");
};

export const RecommendationsSection = () => {
  const { t } = useTranslation();
  const geo = useGeolocation();
  const [overrideCity, setOverrideCity] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);

  const detectedCity = geo.city;
  const activeCity = overrideCity ?? detectedCity ?? FALLBACK_CITY;
  const isAutoDetected = !overrideCity && Boolean(detectedCity);

  const { data: trips, isLoading, isError } = useRecommendedTrips({ origin: activeCity });

  // Date pills: today + next 6 days.
  const today = useMemo(() => dayjs().startOf("day"), []);
  const datePills = useMemo(
    () => Array.from({ length: VISIBLE_DATE_PILLS }, (_, i) => today.add(i, "day")),
    [today],
  );

  const visibleDate = customDate ?? selectedDate;

  const filteredTrips = useMemo(() => {
    if (!trips || trips.length === 0) return [];
    const target = dayjs(visibleDate).startOf("day");
    const onDate = trips.filter((trip) => dayjs(trip.departure_time).startOf("day").isSame(target));
    // If we don't have trips for the selected day in our (mock) data, fall
    // through to the full set so the UI is never empty.
    return (onDate.length > 0 ? onDate : trips).slice(0, 6);
  }, [trips, visibleDate]);

  const tagsById = useMemo(() => pickTags(filteredTrips), [filteredTrips]);

  // Once geo resolves, clear any prior manual override so we honour the live signal.
  useEffect(() => {
    if (geo.status === "ready" && geo.city) setOverrideCity(null);
  }, [geo.status, geo.city]);

  const isPillSelected = (d: dayjs.Dayjs) =>
    !customDate && dayjs(selectedDate).startOf("day").isSame(d, "day");

  return (
    <section
      id="recommendations"
      className="container mx-auto px-4 pt-10 pb-16 md:max-w-6xl md:pt-16 md:pb-24"
    >
      {/* Header */}
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <h2 className="text-foreground text-3xl font-bold tracking-tight text-balance md:text-5xl">
          {activeCity
            ? t("landing.recommendations.title", { city: activeCity })
            : t("landing.recommendations.titleFallback")}
        </h2>

        {/* Location subtitle + selectors (small, centered) */}
        <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-2 text-xs md:text-sm">
          {geo.status === "requesting"
            ? t("landing.recommendations.detecting")
            : isAutoDetected
              ? t("landing.recommendations.fromYourLocation")
              : t("landing.recommendations.fromCity", { city: activeCity })}

          <Select value={activeCity} onValueChange={(v) => setOverrideCity(v)}>
            <SelectTrigger
              size="sm"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "max-w-[min(18rem,85vw)] gap-1.5 rounded-lg border-gray-200 px-2.5 py-4.5 text-xs font-semibold tracking-tight shadow-xs md:px-3 md:text-sm",
              )}
            >
              <MapPin className="text-primary size-3.5 shrink-0" aria-hidden />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TZ_CITIES.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(geo.status === "denied" ||
            geo.status === "unsupported" ||
            geo.status === "error" ||
            geo.status === "idle") && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground h-7 gap-1.5 rounded-full px-3 text-xs"
              onClick={() => geo.request()}
            >
              <Locate className="size-3" />
              {t("landing.recommendations.useMyLocation")}
            </Button>
          )}
        </div>
      </div>

      {/* Date pills */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2 md:mb-8">
        {datePills.map((d) => {
          const isActive = isPillSelected(d);
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => {
                setCustomDate(undefined);
                setSelectedDate(d.toDate());
              }}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                isActive
                  ? "bg-card border-primary text-foreground shadow-sm"
                  : "bg-muted/60 text-foreground/80 hover:bg-muted hover:text-foreground border-transparent",
              )}
            >
              {dateLabel(d, today, t)}
            </button>
          );
        })}

        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "gap-1.5 font-semibold tracking-tight",
                customDate
                  ? "bg-card border-primary text-foreground shadow-sm"
                  : "bg-muted/60 text-foreground/80 hover:bg-muted hover:text-foreground border-transparent",
              )}
            >
              <MoreHorizontal className="size-3.5" />
              {customDate
                ? dayjs(customDate).format("ddd, MMM D")
                : t("landing.recommendations.moreDates")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={customDate}
              onSelect={(d) => setCustomDate(d ?? undefined)}
              disabled={(d) => d < today.toDate()}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Body */}
      {isLoading || geo.status === "requesting" ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <RecommendationCardSkeleton key={i} />
          ))}
        </div>
      ) : null}

      {!isLoading && !isError && filteredTrips.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="space-y-3 p-10 text-center">
            <div className="bg-muted text-muted-foreground mx-auto flex size-12 items-center justify-center rounded-full">
              <MapPin className="size-5" />
            </div>
            <p className="text-foreground font-medium">
              {t("landing.recommendations.empty.title")}
            </p>
            <p className="text-muted-foreground mx-auto max-w-md text-sm">
              {t("landing.recommendations.empty.subtitle", { city: activeCity })}
            </p>
            <Button asChild size="sm" className="mt-2 rounded-full">
              <Link href="#top">
                {t("landing.recommendations.empty.cta")} <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {isError ? (
        <Card className="border-destructive/30">
          <CardContent className="p-8 text-center">
            <p className="text-foreground font-medium">{t("landing.recommendations.error")}</p>
            <p className="text-muted-foreground mt-1 text-sm">
              {t("landing.recommendations.errorSubtitle")}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && filteredTrips.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredTrips.map((trip) => (
            <RecommendationCard key={trip.id} trip={trip} tag={tagsById.get(trip.id)} />
          ))}
        </div>
      ) : null}
    </section>
  );
};
