"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

const SeatSelectionPage = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const tripId = params?.id;
  const { t } = useTranslation();

  const storedTrip = useBookingStore((s) => s.selectedTrip);
  const storedSeat = useBookingStore((s) => s.selectedSeat);
  const setSelectedTrip = useBookingStore((s) => s.setSelectedTrip);
  const setSelectedSeat = useBookingStore((s) => s.setSelectedSeat);

  const useStoredTrip = storedTrip?.id === tripId && storedTrip.seats?.length;
  const { data: fetchedTrip, isLoading } = useTrip(useStoredTrip ? null : tripId);

  const trip = useStoredTrip ? storedTrip : fetchedTrip;

  const [selected, setSelected] = useState<Seat | null>(storedSeat?.id ? storedSeat : null);

  useEffect(() => {
    if (fetchedTrip && !useStoredTrip) setSelectedTrip(fetchedTrip);
  }, [fetchedTrip, useStoredTrip, setSelectedTrip]);

  if (isLoading || !trip) {
    return (
      <div className="container mx-auto px-4 py-10 md:max-w-6xl">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const operatorName =
    trip.bus?.operator?.name ?? trip.operator?.name ?? t("trips.unknownOperator");
  const seats = trip.seats ?? [];

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
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground mb-4 -ml-2 gap-1"
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-4" /> Back to trips
      </Button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
        <div>
          <h1 className="text-foreground text-3xl font-bold tracking-tight text-balance md:text-4xl">
            {t("seat.title")}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {operatorName} · {trip.route.origin} → {trip.route.destination}
          </p>

          <div className="mt-6">
            {seats.length > 0 ? (
              <SeatMap
                seats={seats}
                selectedSeatId={selected?.id ?? null}
                onSelect={(seat) => setSelected(seat)}
              />
            ) : (
              <Card>
                <CardContent className="text-muted-foreground p-8 text-center text-sm">
                  Seat map will appear here once the operator publishes seat layout.
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
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
