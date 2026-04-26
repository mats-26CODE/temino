"use client";

import { useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Download, Home, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookingSummary } from "@/components/shared/booking-summary";
import { useBookingStore } from "@/lib/stores/booking-store";
import { useTranslation } from "@/hooks/use-translation";

const ConfirmationContent = () => {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking");
  const { t } = useTranslation();

  const trip = useBookingStore((s) => s.selectedTrip);
  const seat = useBookingStore((s) => s.selectedSeat);
  const passenger = useBookingStore((s) => s.passenger);
  const lastBooking = useBookingStore((s) => s.lastBooking);
  const reset = useBookingStore((s) => s.reset);

  useEffect(() => {
    // Clear the booking-flow scratch state once the user lands on confirmation,
    // so going "back" doesn't leak old state. We delay slightly so the
    // summary card has a chance to read the values for this render.
    const timeout = setTimeout(() => reset(), 100);
    return () => clearTimeout(timeout);
  }, [reset]);

  return (
    <div className="container mx-auto px-4 py-12 md:max-w-3xl md:py-20">
      <div className="text-center">
        <div className="bg-primary/10 text-primary mx-auto flex size-16 items-center justify-center rounded-full">
          <CheckCircle2 className="size-8" />
        </div>
        <h1 className="text-foreground mt-4 text-4xl font-bold tracking-tight text-balance md:text-5xl">
          {t("confirmation.title")}
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">{t("confirmation.subtitle")}</p>
        {(bookingId || lastBooking?.reference) && (
          <p className="text-muted-foreground bg-muted mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs">
            <Ticket className="size-3.5" />
            {lastBooking?.reference ?? bookingId}
          </p>
        )}
      </div>

      {trip && seat && (
        <div className="mt-8">
          <BookingSummary trip={trip} seat={seat} passenger={passenger} />
        </div>
      )}

      {!trip && (
        <Card className="mt-8">
          <CardContent className="text-muted-foreground p-8 text-center text-sm">
            Your booking has been confirmed. We&apos;ve sent the ticket details to your phone.
          </CardContent>
        </Card>
      )}

      <div className="mt-6 flex flex-col gap-3 md:flex-row">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/dashboard/trips">
            <Ticket className="size-4" />
            {t("confirmation.cta")}
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1" disabled>
          <span>
            <Download className="size-4" />
            Download (soon)
          </span>
        </Button>
        <Button asChild className="flex-1">
          <Link href="/">
            <Home className="size-4" />
            Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

const ConfirmationPage = () => (
  <Suspense fallback={null}>
    <ConfirmationContent />
  </Suspense>
);

export default ConfirmationPage;
