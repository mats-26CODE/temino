"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SeatMap } from "@/components/shared/seat-map";
import { BookingSummary } from "@/components/shared/booking-summary";
import { useTrip } from "@/hooks/use-trips";
import { useBookingStore } from "@/lib/stores/booking-store";
import { useTranslation } from "@/hooks/use-translation";
import { ToastAlert } from "@/config/toast";
import { resolveTripStopLabels } from "@/helpers/helpers";

const SeatSelectionPage = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const tripId = params?.id;
  const { t } = useTranslation();

  const originParam = useBookingStore((s) => s.origin);
  const destinationParam = useBookingStore((s) => s.destination);
  const searchDate = useBookingStore((s) => s.date);
  const passengers = useBookingStore((s) => s.passengers);

  const storedTrip = useBookingStore((s) => s.selectedTrip);
  const storedSeat = useBookingStore((s) => s.selectedSeat);
  const setSelectedTrip = useBookingStore((s) => s.setSelectedTrip);
  const setSelectedSeat = useBookingStore((s) => s.setSelectedSeat);

  const tripsListHref = useMemo(() => {
    const p = new URLSearchParams();
    if (originParam) p.set("origin", originParam);
    if (destinationParam) p.set("destination", destinationParam);
    if (searchDate) p.set("date", searchDate);
    if (passengers && passengers > 1) p.set("passengers", String(passengers));
    const q = p.toString();
    return q ? `/trips?${q}` : "/trips";
  }, [originParam, destinationParam, searchDate, passengers]);

  const useStoredTrip = storedTrip?.id === tripId && storedTrip.seats?.length;
  const { data: fetchedTrip, isLoading } = useTrip(useStoredTrip ? null : tripId);

  const trip = useStoredTrip ? storedTrip : fetchedTrip;

  const [selected, setSelected] = useState<Seat | null>(storedSeat?.id ? storedSeat : null);

  useEffect(() => {
    if (fetchedTrip && !useStoredTrip) setSelectedTrip(fetchedTrip);
  }, [fetchedTrip, useStoredTrip, setSelectedTrip]);

  if (isLoading || !trip) {
    return (
      <div className="container mx-auto px-4 py-8 md:max-w-6xl md:py-12">
        <div className="mb-4">
          <Skeleton className="h-8 w-40 rounded-full" />
        </div>
        <div className="mb-8 space-y-3">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-20 w-full max-w-sm" />
            <Skeleton className="h-20 w-full max-w-sm" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
          <Skeleton className="h-80 w-full max-w-md rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  const operatorName =
    trip.bus?.operator?.name ?? trip.operator?.name ?? t("trips.unknownOperator");
  const busClass = (trip.bus?.bus_class ?? trip.bus?.bus_type ?? "").toString();
  const busPlate = trip.bus?.plate_number;
  const seats = trip.seats ?? [];
  const { origin: originLabel, destination: destLabel } = resolveTripStopLabels(trip);
  const routeShape = trip.route as unknown as Route | string;
  const fallbackO =
    typeof routeShape === "object" && routeShape?.origin ? routeShape.origin : originLabel;
  const fallbackD =
    typeof routeShape === "object" && routeShape?.destination ? routeShape.destination : destLabel;
  const departure = dayjs(trip.departure_time);

  const onContinue = () => {
    if (!selected) {
      ToastAlert.error("Please select a seat to continue");
      return;
    }
    setSelectedSeat(selected);
    router.push(`/trips/${tripId}/passenger`);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:max-w-6xl md:py-12">
      <div className="mb-4">
        <Button variant="outline" size="sm" className="gap-1.5 rounded-full" asChild>
          <Link href={tripsListHref}>
            <ArrowLeft className="size-4" />
            {t("seat.backToTrips")}
          </Link>
        </Button>
      </div>

      {/* Page title + trip context: full width, above the seat / summary split */}
      <header className="mb-8 space-y-6">
        <h1 className="text-foreground text-3xl font-bold tracking-tight text-balance md:text-4xl">
          {t("seat.title")}
        </h1>

        <div className="flex gap-10">
          <div className="space-y-1.5">
            <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              {t("seat.busInfoLabel")}
            </p>
            <p className="text-foreground text-lg leading-snug font-semibold">{operatorName}</p>
            {busClass ? (
              <p className="text-muted-foreground text-sm capitalize">
                {busClass.replace(/_/g, " ")}
                {busPlate ? ` · ${busPlate}` : ""}
              </p>
            ) : busPlate ? (
              <p className="text-muted-foreground text-sm">{busPlate}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase sm:ml-auto">
              {t("seat.tripInfoLabel")}
            </p>
            <p className="text-foreground text-lg leading-snug font-semibold sm:ml-auto sm:max-w-md">
              {fallbackO} → {fallbackD}
            </p>
            <p className="text-muted-foreground text-sm sm:ml-auto">
              {departure.format("ddd, DD MMM YYYY")} · {t("trips.depart")}{" "}
              {departure.format("HH:mm")}
            </p>
          </div>
        </div>
      </header>

      {/* Left: seat map only · Right: summary + CTA */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
        <div className="min-w-0">
          {seats.length > 0 ? (
            <SeatMap
              seats={seats}
              selectedSeatId={selected?.id ?? null}
              onSelect={(se) => setSelected(se)}
              busAmenities={trip.bus?.amenities}
            />
          ) : (
            <Card>
              <CardContent className="text-muted-foreground p-8 text-center text-sm">
                Seat map will appear here once the operator publishes seat layout.
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
          <BookingSummary trip={trip} seat={selected} />
          <Button onClick={onContinue} className="w-full" size="lg" disabled={!selected}>
            {t("passenger.continue")} <ArrowRight className="size-4" />
          </Button>
        </aside>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
