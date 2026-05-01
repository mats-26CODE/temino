"use client";

import { useEffect, useMemo, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SeatMap } from "@/components/shared/seat-map";
import { BookingSummary } from "@/components/shared/booking-summary";
import { BoardingStationsCard } from "@/components/shared/boarding-stations-card";
import { PassengerPartyCard } from "@/components/shared/passenger-party-card";
import { useTrip } from "@/hooks/use-trips";
import { useUser } from "@/hooks/use-auth";
import { useBookingStore } from "@/lib/stores/booking-store";
import { useTranslation } from "@/hooks/use-translation";
import { ToastAlert } from "@/config/toast";
import { resolveTripStopLabels } from "@/helpers/helpers";
import { buildPartyFormDefaults } from "@/lib/passenger-forms";

const BOOKING_PASSENGER_FORM_ID = "booking-passenger-form";

const SeatSelectionPage = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const tripId = params?.id;
  const { t } = useTranslation();

  const originParam = useBookingStore((s) => s.origin);
  const destinationParam = useBookingStore((s) => s.destination);
  const searchDate = useBookingStore((s) => s.date);
  const passengers = useBookingStore((s) => s.passengers);
  const partyPassengers = useBookingStore((s) => s.partyPassengers);
  const selectedSeats = useBookingStore((s) => s.selectedSeats);
  const setSelectedSeats = useBookingStore((s) => s.setSelectedSeats);

  const storedTrip = useBookingStore((s) => s.selectedTrip);
  const pickupStation = useBookingStore((s) => s.pickupStation);
  const dropoffStation = useBookingStore((s) => s.dropoffStation);
  const passengerStored = useBookingStore((s) => s.passenger);
  const setSelectedTrip = useBookingStore((s) => s.setSelectedTrip);
  const setPartyPassengers = useBookingStore((s) => s.setPartyPassengers);

  const { user } = useUser();

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

  const seats = trip?.seats ?? [];

  const selectedSeatIds = useMemo(() => selectedSeats.map((s) => s.id), [selectedSeats]);

  const partyCount = selectedSeats.length;

  const seatedPartySlice = useMemo(
    () => partyPassengers.slice(0, partyCount),
    [partyPassengers, partyCount],
  );

  const initialTravellers = useMemo(
    () =>
      partyCount < 1
        ? []
        : buildPartyFormDefaults({
            partyCount,
            partyStored: seatedPartySlice,
            legacyPassenger: passengerStored,
            user,
          }),
    [partyCount, seatedPartySlice, passengerStored, user],
  );

  const toggleSeat = useCallback(
    (seat: Seat) => {
      if (seat.status !== "available") return;
      setSelectedSeats((prev) => {
        const exists = prev.some((s) => s.id === seat.id);
        if (exists) return prev.filter((s) => s.id !== seat.id);
        return [...prev, seat];
      });
    },
    [setSelectedSeats],
  );

  useEffect(() => {
    if (!seats.length) return;
    const byId = new Map(seats.map((s) => [s.id, s]));
    setSelectedSeats((prev) => {
      const next = prev
        .map((picked) => byId.get(picked.id))
        .filter((s): s is Seat => Boolean(s && s.status === "available"));
      if (
        prev.length === next.length &&
        prev.every((s, i) => s.id === next[i]?.id && s.number === next[i]?.number)
      ) {
        return prev;
      }
      return next;
    });
  }, [seats, setSelectedSeats]);

  const onPartyValid = useCallback(
    (party: PassengerInfo[]) => {
      if (!tripId) return;
      if (selectedSeats.length < 1 || party.length !== selectedSeats.length) {
        ToastAlert.error(t("seat.selectSeatsMismatch"));
        return;
      }
      setPartyPassengers(party);
      router.push(`/trips/${tripId}/payment`);
    },
    [router, selectedSeats.length, setPartyPassengers, t, tripId],
  );

  useEffect(() => {
    if (fetchedTrip && !useStoredTrip) setSelectedTrip(fetchedTrip);
  }, [fetchedTrip, useStoredTrip, setSelectedTrip]);

  const partyCardKey = `${tripId}-${selectedSeatIds.join("|")}`;
  const [partyFormValid, setPartyFormValid] = useState(false);

  useEffect(() => {
    if (partyCount === 0) setPartyFormValid(false);
  }, [partyCount]);

  /** Avoid one frame where the old validity carries over after seats / traveller form remount. */
  useEffect(() => {
    setPartyFormValid(false);
  }, [partyCardKey]);

  if (isLoading || !trip) {
    return (
      <div className="container mx-auto px-4 py-8 md:max-w-6xl md:py-12">
        <div className="mb-4">
          <Skeleton className="h-8 w-40 rounded-full" />
        </div>

        <header className="mb-8 space-y-6">
          <Skeleton className="h-10 w-[min(18rem,100%)] max-w-sm md:h-11" />
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-6 w-full max-w-xs" />
              <Skeleton className="h-4 w-48 max-w-full" />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[min(100%,28rem)_minmax(340px,1fr)] lg:items-start xl:gap-8">
          <Skeleton className="h-88 w-full max-w-md rounded-2xl md:h-104" />
          <aside className="flex w-full min-w-0 flex-col gap-4">
            <Skeleton className="border-border min-h-44 w-full rounded-xl border" />
            <div className="border-border rounded-xl border p-0 shadow-none">
              <div className="space-y-2 border-b p-6 pb-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full max-w-sm" />
              </div>
              <div className="space-y-4 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Skeleton className="h-10 w-full rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <Skeleton className="h-11 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md sm:w-2/5" />
              </div>
            </div>
            <div className="border-border rounded-xl border p-6">
              <Skeleton className="mb-4 h-6 w-40" />
              <div className="space-y-3">
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-11 w-full rounded-md" />
          </aside>
        </div>
      </div>
    );
  }

  const operatorName =
    trip.bus?.operator?.name ?? trip.operator?.name ?? t("trips.unknownOperator");
  const busClass = (trip.bus?.bus_class ?? trip.bus?.bus_type ?? "").toString();
  const busPlate = trip.bus?.plate_number;
  const { origin: originLabel, destination: destLabel } = resolveTripStopLabels(trip);
  const routeShape = trip.route as unknown as Route | string;
  const fallbackO =
    typeof routeShape === "object" && routeShape?.origin ? routeShape.origin : originLabel;
  const fallbackD =
    typeof routeShape === "object" && routeShape?.destination ? routeShape.destination : destLabel;
  const departure = dayjs(trip.departure_time);

  const seatsReady = selectedSeats.length > 0;
  const boardingReady = Boolean(pickupStation?.id && dropoffStation?.id);
  const canContinueToPayment = seatsReady && partyFormValid && boardingReady;

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

      <header className="mb-8 space-y-6">
        <h1 className="text-foreground text-3xl font-bold tracking-tight text-balance md:text-4xl">
          {t("seat.title")}
        </h1>

        <div className="flex flex-col gap-8 sm:flex-row sm:gap-10">
          <div className="min-w-0 space-y-1.5">
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

          <div className="min-w-0 space-y-1.5">
            <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase sm:ml-auto lg:ml-0">
              {t("seat.tripInfoLabel")}
            </p>
            <p className="text-foreground text-lg leading-snug font-semibold sm:ml-auto sm:max-w-md lg:ml-0">
              {fallbackO} → {fallbackD}
            </p>
            <p className="text-muted-foreground text-sm sm:ml-auto lg:ml-0">
              {departure.format("ddd, DD MMM YYYY")} · {t("trips.depart")}{" "}
              {departure.format("HH:mm")}
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[min(100%,28rem)_minmax(340px,1fr)] lg:items-start xl:gap-8">
        <div className="min-w-0">
          {seats.length > 0 ? (
            <SeatMap
              seats={seats}
              selectedSeatIds={selectedSeatIds}
              onToggleSeat={toggleSeat}
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

        <aside className="flex w-full min-w-0 flex-col gap-4 lg:sticky lg:top-24">
          <BoardingStationsCard trip={trip} />
          {partyCount > 0 ? (
            <PassengerPartyCard
              key={partyCardKey}
              formId={BOOKING_PASSENGER_FORM_ID}
              partyCount={partyCount}
              initialTravellers={initialTravellers}
              onSubmitParty={onPartyValid}
              onPartyFormValidChange={setPartyFormValid}
            />
          ) : null}

          <BookingSummary
            trip={trip}
            seats={selectedSeats.length > 0 ? selectedSeats : undefined}
            passenger={passengerStored}
            party={partyCount >= 1 ? seatedPartySlice : undefined}
          />
          <Button
            form={BOOKING_PASSENGER_FORM_ID}
            type="submit"
            className="w-full"
            size="lg"
            disabled={!canContinueToPayment}
          >
            {t("passenger.continue")} <ArrowRight className="size-4" />
          </Button>
        </aside>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
