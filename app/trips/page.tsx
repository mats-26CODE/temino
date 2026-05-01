"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchBar } from "@/components/shared/search-bar";
import { TripCard, TripCardSkeleton } from "@/components/shared/trip-card";
import { useSearchTrips } from "@/hooks/use-trips";
import { useTranslation } from "@/hooks/use-translation";
import { useBookingStore } from "@/lib/stores/booking-store";
import { useRouter } from "next/navigation";

const TripsContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const setSelectedTrip = useBookingStore((s) => s.setSelectedTrip);

  const origin = searchParams.get("origin") ?? undefined;
  const destination = searchParams.get("destination") ?? undefined;
  const route_code = searchParams.get("route_code") ?? undefined;
  const date = searchParams.get("date") ?? undefined;
  const passengersRaw = Number.parseInt(searchParams.get("passengers") ?? "1", 10);
  const passengers =
    Number.isFinite(passengersRaw) && passengersRaw >= 1 ? passengersRaw : 1;

  const setSearch = useBookingStore((s) => s.setSearch);

  useEffect(() => {
    if (!origin || !destination) return;

    const syncFromUrlToStore = () => {
      setSearch({
        origin,
        destination,
        date: date ?? null,
        passengers,
      });
    };

    if (useBookingStore.persist.hasHydrated()) syncFromUrlToStore();
    return useBookingStore.persist.onFinishHydration(() => syncFromUrlToStore());
  }, [origin, destination, date, passengers, setSearch]);

  const {
    data: trips,
    isLoading,
    isError,
    error,
    refetch,
  } = useSearchTrips({
    origin,
    destination,
    route_code,
    date,
    passengers,
  });

  const handleSelect = (trip: Trip) => {
    setSelectedTrip(trip);
    router.push(`/trips/${trip.id}/seat`);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:max-w-6xl md:py-12">
      <div className="mb-4">
        <Button variant="outline" size="sm" className="gap-1.5 rounded-full" asChild>
          <Link href="/">
            <ArrowLeft className="size-4" />
            {t("trips.backToHome")}
          </Link>
        </Button>
      </div>
      <div className="mb-6">
        <SearchBar variant="compact" />
      </div>

      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-foreground text-3xl font-bold tracking-tight text-balance md:text-4xl">
          {origin && destination ? `${origin} → ${destination}` : t("trips.title")}
        </h1>
        {date && (
          <p className="text-muted-foreground text-sm">{dayjs(date).format("ddd, DD MMM YYYY")}</p>
        )}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <TripCardSkeleton key={i} />
          ))}
        </div>
      )}

      {isError && (
        <Card className="border-destructive/30">
          <CardContent className="space-y-2 p-5 text-center">
            <p className="text-foreground font-medium">Couldn&apos;t load trips</p>
            <p className="text-muted-foreground text-sm">{error?.message}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="text-primary text-sm font-medium hover:underline"
            >
              Try again
            </button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && (!trips || trips.length === 0) && (
        <Card>
          <CardContent className="space-y-2 p-10 text-center">
            <p className="text-foreground font-medium">{t("trips.empty")}</p>
            <p className="text-muted-foreground text-sm">Try a nearby date or different cities.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && trips && trips.length > 0 && (
        <div className="border-border/80 space-y-3 overflow-hidden rounded-2xl shadow-xs">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} onSelect={handleSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

const TripsPage = () => (
  <Suspense fallback={null}>
    <TripsContent />
  </Suspense>
);

export default TripsPage;
