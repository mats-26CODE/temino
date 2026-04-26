"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { ArrowLeftRight, Calendar as CalendarIcon, MapPin, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { TZ_CITIES } from "@/constants/values";
import { cn } from "@/lib/utils";
import { useBookingStore } from "@/lib/stores/booking-store";
import { useTranslation } from "@/hooks/use-translation";
import { buildRouteCode } from "@/helpers/helpers";

interface SearchBarProps {
  /** "hero" = larger pill on landing. "compact" = used on /trips header. */
  variant?: "hero" | "compact";
  className?: string;
}

interface FieldShellProps {
  icon: React.ReactNode;
  label: string;
  className?: string;
  children: React.ReactNode;
}

const FieldShell = ({ icon, label, className, children }: FieldShellProps) => (
  <div className={cn("min-w-0 flex-1 px-4 py-2.5 md:py-3", className)}>
    <label className="text-muted-foreground mb-0.5 flex items-center gap-1.5 text-[11px] font-medium tracking-wide uppercase">
      <span className="inline-flex size-3.5 items-center justify-center">{icon}</span>
      {label}
    </label>
    {children}
  </div>
);

const Divider = () => (
  <div className="bg-border/70 hidden h-9 w-px shrink-0 md:block" aria-hidden />
);

export const SearchBar = ({ variant = "hero", className }: SearchBarProps) => {
  const router = useRouter();
  const { t } = useTranslation();
  const setSearch = useBookingStore((s) => s.setSearch);

  // Persisted booking fields must not seed initial state from the store: on the
  // client the store rehydrates from localStorage before paint, so the first
  // client render would disagree with SSR and Radix Select would mismatch.
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState<Date | undefined>(() => new Date());
  const [passengers, setPassengers] = useState(1);

  useEffect(() => {
    const applyFromStore = () => {
      const s = useBookingStore.getState();
      setOrigin(s.origin ?? "");
      setDestination(s.destination ?? "");
      setDate(s.date ? new Date(s.date) : new Date());
      setPassengers(s.passengers || 1);
    };

    if (useBookingStore.persist.hasHydrated()) {
      applyFromStore();
    }
    return useBookingStore.persist.onFinishHydration(applyFromStore);
  }, []);

  const swap = () => {
    const o = origin;
    setOrigin(destination);
    setDestination(o);
  };

  const handleSearch = () => {
    if (!origin || !destination) return;
    const isoDate = date ? dayjs(date).format("YYYY-MM-DD") : null;
    setSearch({ origin, destination, date: isoDate, passengers });
    const params = new URLSearchParams({
      origin,
      destination,
      ...(isoDate ? { date: isoDate } : {}),
      passengers: String(passengers),
      route_code: buildRouteCode(origin, destination),
    });
    router.push(`/trips?${params.toString()}`);
  };

  const isHero = variant === "hero";

  return (
    <Card
      className={cn(
        "ring-border/50 w-full gap-0 overflow-hidden rounded-2xl px-3 py-1 shadow-xs ring-1",
        className,
      )}
    >
      <div className="flex flex-col items-stretch md:flex-row md:items-center">
        {/* From */}
        <FieldShell
          icon={<MapPin className="size-3.5" />}
          label={t("landing.search.from")}
          className="md:pl-6"
        >
          <Select value={origin} onValueChange={setOrigin}>
            <SelectTrigger className="[&_svg:not([class*='text-'])]:text-muted-foreground/70 h-8 w-full border-0 bg-transparent! p-0 text-base font-bold tracking-tight shadow-none focus-visible:ring-0">
              <SelectValue placeholder={t("landing.search.fromPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {TZ_CITIES.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldShell>

        {/* Swap (between From/To) — desktop only */}
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={swap}
          disabled={!origin && !destination}
          aria-label="Swap origin and destination"
          className="text-muted-foreground hover:text-foreground -my-2 hidden shrink-0 self-center rounded-full md:inline-flex"
        >
          <ArrowLeftRight className="size-3.5" />
        </Button>

        {/* To */}
        <FieldShell icon={<MapPin className="size-3.5" />} label={t("landing.search.to")}>
          <Select value={destination} onValueChange={setDestination}>
            <SelectTrigger className="[&_svg:not([class*='text-'])]:text-muted-foreground/70 h-8 w-full border-0 bg-transparent! p-0 text-base font-bold tracking-tight shadow-none focus-visible:ring-0">
              <SelectValue placeholder={t("landing.search.toPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {TZ_CITIES.filter((c) => c !== origin).map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldShell>

        <Divider />

        {/* Date */}
        <FieldShell icon={<CalendarIcon className="size-3.5" />} label={t("landing.search.date")}>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="text-foreground hover:text-foreground h-8 w-full justify-start p-0 text-left text-base font-bold tracking-tight hover:bg-transparent focus-visible:ring-0"
              >
                {date ? dayjs(date).format("ddd, MMM D") : t("landing.search.datePlaceholder")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => d < dayjs().startOf("day").toDate()}
              />
            </PopoverContent>
          </Popover>
        </FieldShell>

        <Divider />

        {/* Passengers */}
        <FieldShell icon={<Users className="size-3.5" />} label={t("landing.search.passengers")}>
          <Select value={String(passengers)} onValueChange={(v) => setPassengers(Number(v))}>
            <SelectTrigger className="[&_svg:not([class*='text-'])]:text-muted-foreground/70 h-8 w-full border-0 bg-transparent! p-0 text-base font-bold tracking-tight shadow-none focus-visible:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} {n === 1 ? "passenger" : "passengers"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldShell>

        {/* Submit */}
        <div className="px-3 pt-1 pb-3 md:p-1.5">
          <Button
            type="button"
            onClick={handleSearch}
            disabled={!origin || !destination}
            size={isHero ? "lg" : "default"}
            className="w-full gap-2 rounded-full px-5 text-base font-semibold tracking-tight inline-flex items-center justify-center md:w-auto md:px-8"
          >
            <Search className="size-5" />
            <span>{t("landing.search.button")}</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};
