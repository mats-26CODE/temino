"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingSummary } from "@/components/shared/booking-summary";
import { useBookingStore } from "@/lib/stores/booking-store";
import { useCreateBooking } from "@/hooks/use-bookings";
import { useTranslation } from "@/hooks/use-translation";
import { normalizePhoneForBookingApi } from "@/helpers/booking-phone";
import { PAYMENT_GATEWAY_NAME } from "@/constants/values";
import { ToastAlert } from "@/config/toast";

const PaymentPage = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const tripId = params?.id;
  const { t } = useTranslation();

  const trip = useBookingStore((s) => s.selectedTrip);
  const selectedSeats = useBookingStore((s) => s.selectedSeats);
  const passenger = useBookingStore((s) => s.passenger);
  const partyPassengers = useBookingStore((s) => s.partyPassengers);
  const setLastBooking = useBookingStore((s) => s.setLastBooking);

  const createBooking = useCreateBooking();

  useEffect(() => {
    if (!trip || trip.id !== tripId || selectedSeats.length < 1 || !passenger) {
      router.replace(`/trips/${tripId}/seat`);
    }
  }, [trip, tripId, selectedSeats.length, passenger, router]);

  if (!trip || selectedSeats.length < 1 || !passenger) return null;

  const summaryParty =
    partyPassengers.length >= selectedSeats.length
      ? partyPassengers.slice(0, selectedSeats.length)
      : partyPassengers.length > 0
        ? partyPassengers
        : undefined;

  const primarySeat = selectedSeats[0];
  const rawPrice = trip.base_price ?? trip.price ?? 0;
  const price = typeof rawPrice === "string" ? Number.parseFloat(rawPrice) : rawPrice;
  const amount = selectedSeats
    .reduce((sum, s) => sum + (typeof s.price === "number" ? s.price : price), 0)
    .toFixed(2);

  const onPay = () => {
    createBooking.mutate(
      {
        trip_id: trip.id,
        seat_id: primarySeat.id,
        passenger_name: passenger.passenger_name,
        passenger_phone: normalizePhoneForBookingApi(passenger.passenger_phone),
        ...(passenger.passenger_email ? { passenger_email: passenger.passenger_email } : {}),
        amount,
      },
      {
        onSuccess: (booking) => {
          setLastBooking(booking);
          router.push(`/trips/${tripId}/confirmation?booking=${booking.id}`);
        },
        onError: (err) => {
          ToastAlert.error(err.message || "Payment failed. Please try again.");
        },
      },
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 md:max-w-6xl md:py-12">
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground mb-4 -ml-2 gap-1"
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-4" /> Back
      </Button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
        <div>
          <h1 className="text-foreground text-3xl font-bold tracking-tight text-balance md:text-4xl">
            {t("payment.title")}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Powered by {PAYMENT_GATEWAY_NAME}. Mock for now — real integration coming soon.
          </p>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Choose payment method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="border-border hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary/5 flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors">
                <input type="radio" name="method" defaultChecked className="accent-primary" />
                <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                  <Smartphone className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground font-medium">Mobile Money</p>
                  <p className="text-muted-foreground text-xs">M-Pesa, Tigo Pesa, Airtel Money</p>
                </div>
              </label>

              <label className="border-border hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary/5 flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors">
                <input type="radio" name="method" className="accent-primary" disabled />
                <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-lg">
                  <CreditCard className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground font-medium">Card</p>
                  <p className="text-muted-foreground text-xs">Coming soon</p>
                </div>
              </label>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <BookingSummary
            trip={trip}
            seats={selectedSeats}
            passenger={passenger}
            party={summaryParty}
          />
          <Button onClick={onPay} isLoading={createBooking.isPending} className="w-full" size="lg">
            {t("payment.payNow")}
          </Button>
        </aside>
      </div>
    </div>
  );
};

export default PaymentPage;
