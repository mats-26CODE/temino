"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { BookingSummary } from "@/components/shared/booking-summary";
import { FinalizePaymentModal } from "@/components/shared/finalize-payment-modal";
import { useBookingStore } from "@/lib/stores/booking-store";
import { useCreateBooking } from "@/hooks/use-bookings";
import { useSeatHold } from "@/hooks/use-seat-hold";
import { useTranslation } from "@/hooks/use-translation";
import { normalizePhoneForBookingApi } from "@/helpers/booking-phone";
import { formatCurrency } from "@/helpers/helpers";
import { PAYMENT_GATEWAY_NAME } from "@/constants/values";
import { ToastAlert } from "@/config/toast";

const partyRowsForSeats = (
  seatCount: number,
  summaryParty: PassengerInfo[] | undefined,
  lead: PassengerInfo | null,
): PassengerInfo[] => {
  if (seatCount < 1) return [];
  const base =
    summaryParty !== undefined && summaryParty.length > 0
      ? summaryParty
      : lead
        ? [lead]
        : [];
  const first = base[0];
  if (!first) return [];
  return Array.from({ length: seatCount }, (_, i) => base[i] ?? first);
};

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
  const seatHold = useSeatHold();
  const [policiesAccepted, setPoliciesAccepted] = useState(false);
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [holdExpiresAtIso, setHoldExpiresAtIso] = useState<string | null>(null);

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

  const totalDisplay = formatCurrency(Number.parseFloat(amount), { code: "TZS", decimalDigits: 0 });
  const finalizeParty = partyRowsForSeats(selectedSeats.length, summaryParty, passenger);

  const onPayNow = async () => {
    try {
      const r = await seatHold.mutateAsync({
        trip_id: trip.id,
        seat_ids: selectedSeats.map((s) => s.id),
      });
      setHoldExpiresAtIso(r.expires_at);
      setFinalizeOpen(true);
      ToastAlert.success(t("payment.seatsHeld"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      ToastAlert.error(message || "Could not reserve seats. Please try again.");
    }
  };

  const onFinalizePayment = (payerPhoneE164: string) => {
    const payerPhone = normalizePhoneForBookingApi(payerPhoneE164);
    ToastAlert.show({ message: t("payment.finalize.ussdToast") });
    window.setTimeout(() => {
      createBooking.mutate(
        {
          trip_id: trip.id,
          seat_id: primarySeat.id,
          passenger_name: passenger.passenger_name,
          passenger_phone: payerPhone,
          ...(passenger.passenger_email ? { passenger_email: passenger.passenger_email } : {}),
          amount,
        },
        {
          onSuccess: (booking) => {
            ToastAlert.success(t("confirmation.subtitle"));
            setFinalizeOpen(false);
            setHoldExpiresAtIso(null);
            setLastBooking(booking);
            router.push(`/trips/${tripId}/confirmation?booking=${booking.id}`);
          },
          onError: (err) => {
            ToastAlert.error(err.message || "Payment failed. Please try again.");
          },
        },
      );
    }, 750);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:max-w-6xl md:py-12">
      <div className="mb-4">
        <Button variant="outline" size="sm" className="gap-1.5 rounded-full" asChild>
          <Link href={`/trips/${tripId}/seat`}>
            <ArrowLeft className="size-4" />
            {t("payment.backToSeatSelection")}
          </Link>
        </Button>
      </div>

      <header className="mb-8 space-y-6">
        <div>
          <h1 className="text-foreground text-3xl font-bold tracking-tight text-balance md:text-4xl">
            {t("payment.title")}
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            {t("payment.subtitle", { gateway: PAYMENT_GATEWAY_NAME })}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[min(100%,28rem)_minmax(340px,1fr)] lg:items-start xl:gap-8">
        <div className="min-w-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("payment.chooseMethod")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-primary/35 bg-primary/5 flex items-center gap-3 rounded-xl border p-4">
                <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                  <Smartphone className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground font-medium">{t("payment.method.mobileMoney")}</p>
                  <p className="text-muted-foreground text-xs">
                    {t("payment.method.mobileMoneyHint")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="flex w-full min-w-0 flex-col gap-4 lg:sticky lg:top-24">
          <BookingSummary
            trip={trip}
            seats={selectedSeats}
            passenger={passenger}
            party={summaryParty}
          />
          <div className="flex items-start gap-3">
            <Checkbox
              id={`payment-consent-${trip.id}`}
              checked={policiesAccepted}
              onCheckedChange={(value) => setPoliciesAccepted(value === true)}
              className="border-primary/30 bg-primary/5 mt-0.5"
            />
            <p className="text-muted-foreground text-sm leading-snug">
              <label htmlFor={`payment-consent-${trip.id}`} className="inline cursor-pointer">
                {t("payment.termsAcceptLead")}
              </label>{" "}
              <Link
                href="/terms"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                {t("footer.termsOfService")}
              </Link>
              {t("payment.consentBetweenPolicies")}
              <Link
                href="/privacy"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                {t("footer.privacyPolicy")}
              </Link>
              {t("payment.termsAcceptTrail")}
            </p>
          </div>
          <Button
            onClick={onPayNow}
            isLoading={seatHold.isPending}
            className="w-full"
            size="lg"
            disabled={!policiesAccepted}
          >
            {t("payment.payNow")}
          </Button>
        </aside>
      </div>

      <FinalizePaymentModal
        open={finalizeOpen}
        onOpenChange={(open) => {
          setFinalizeOpen(open);
          if (!open) setHoldExpiresAtIso(null);
        }}
        trip={trip}
        seats={selectedSeats}
        party={finalizeParty}
        holdExpiresAtIso={holdExpiresAtIso}
        defaultPayerPhone={passenger.passenger_phone}
        totalAmountFormatted={totalDisplay}
        isSubmitting={createBooking.isPending}
        onFinalizePayment={onFinalizePayment}
      />
    </div>
  );
};

export default PaymentPage;
