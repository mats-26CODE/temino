"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import { Bus as BusIcon, Calendar, Clock, LayoutGrid, MapPin, User } from "lucide-react";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import { BookingPassengerMiniCard } from "@/components/shared/booking-passenger-mini-card";
import { BookingPhoneField } from "@/components/shared/booking-phone-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/use-translation";
import { useBookingStore } from "@/lib/stores/booking-store";
import { coerceE164PhoneValueForInput } from "@/helpers/booking-phone";
import { cn } from "@/lib/utils";

const formatRemain = (remainMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(remainMs / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m)}:${String(s).padStart(2, "0")}`;
};

const seatLabel = (s: Seat) => (s.number?.trim() ? s.number : s.id);

type PaymentMethodLogo = {
  label: string;
  src: string;
};

/** Logos in `/public` — filenames match assets you added. */
const PAYMENT_METHOD_LOGOS: PaymentMethodLogo[] = [
  { label: "M-Pesa", src: "/mpesa_logo.png" },
  { label: "Mixx by Yas", src: "/mixxbyyas_logo.png" },
  { label: "Airtel Money", src: "/airtelmoney_logo.png" },
  { label: "Halopesa", src: "/halopesa_logo.png" },
  { label: "T-Pesa", src: "/tpesa_logo.png" },
];

const paymentMethodRowClass =
  "border-border/60 bg-muted/30 text-foreground ring-black/5 flex items-center gap-2 rounded-full border px-2 py-1.5 pr-3 text-xs font-medium shadow-xs ring-1 dark:bg-muted/20 dark:ring-white/10";

const sectionCardClass =
  "rounded-2xl border border-border/60 bg-card/40 p-4 shadow-xs ring-0.5 ring-black/5 dark:ring-white/10";

export const FinalizePaymentModal = ({
  open,
  onOpenChange,
  trip,
  seats,
  party,
  holdExpiresAtIso,
  defaultPayerPhone,
  totalAmountFormatted,
  isSubmitting,
  onFinalizePayment,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: Trip;
  seats: Seat[];
  party: PassengerInfo[];
  holdExpiresAtIso: string | null;
  /** E.164 or local digits prefilled into the payer phone field */
  defaultPayerPhone?: string | null;
  totalAmountFormatted: string;
  isSubmitting?: boolean;
  onFinalizePayment: (payerPhoneE164OrLocal: string) => void;
}) => {
  const { t } = useTranslation();
  const pickupStation = useBookingStore((s) => s.pickupStation);
  const dropoffStation = useBookingStore((s) => s.dropoffStation);
  const [payerPhone, setPayerPhone] = useState("");

  const operatorName =
    trip.bus?.operator?.name ?? trip.operator?.name ?? t("trips.unknownOperator");
  const busClass = trip.bus?.bus_class ?? trip.bus?.bus_type ?? "standard";
  const plate = trip.bus?.plate_number ?? "—";
  const departure = dayjs(trip.departure_time);
  const arrival = dayjs(trip.arrival_time);

  useEffect(() => {
    if (!open) return;
    const lead = party[0];
    const fromParty = lead?.passenger_phone?.trim() ?? "";
    const fallback = defaultPayerPhone?.trim() ?? "";
    setPayerPhone(fromParty || fallback);
  }, [open, party, defaultPayerPhone]);

  const [remainMs, setRemainMs] = useState(0);

  useEffect(() => {
    if (!open || !holdExpiresAtIso) {
      setRemainMs(0);
      return;
    }
    const end = new Date(holdExpiresAtIso).getTime();
    const tick = () => setRemainMs(Math.max(0, end - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [open, holdExpiresAtIso]);

  const payerE164 =
    coerceE164PhoneValueForInput(payerPhone.trim(), "TZ") ??
    (payerPhone.trim().startsWith("+") ? payerPhone.trim() : undefined);
  const payerValid = payerE164 ? isPossiblePhoneNumber(payerE164) : false;

  const expired = Boolean(holdExpiresAtIso) && remainMs <= 0;
  const visiblePassengers = party.slice(0, 2);
  const overflow = party.length - visiblePassengers.length;

  const seatLabels = seats
    .map((s) => seatLabel(s))
    .filter(Boolean)
    .join(" · ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex h-[90vh] max-h-[90vh] w-[min(calc(100vw-1.25rem),1200px)] max-w-[min(calc(100vw-1.25rem),1200px)] translate-x-[-50%] translate-y-[-50%] flex-col gap-0 overflow-hidden rounded-2xl border-0 p-0 shadow-2xl ring-1 ring-black/5 sm:rounded-3xl dark:ring-white/10",
        )}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div
          className="from-primary/[0.07] via-background to-background relative shrink-0 border-b bg-linear-to-b px-6 pt-6 pr-14 pb-4"
          data-slot="finalize-modal-header"
        >
          <DialogHeader className="space-y-0 text-left">
            <DialogTitle className="mb-3 text-xl font-bold tracking-tight md:text-2xl">
              {t("payment.finalize.title")}
            </DialogTitle>
            <div className="flex w-full flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-start sm:gap-5">
              <DialogDescription className="text-muted-foreground min-w-0 flex-1 text-sm leading-relaxed">
                {t("payment.finalize.intro", { amount: totalAmountFormatted })}
              </DialogDescription>
              <div
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 sm:max-w-44",
                  expired
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-primary/20 bg-primary/5 dark:bg-primary/10",
                )}
              >
                <span className="bg-background/80 text-primary ring-border/50 flex size-9 items-center justify-center rounded-lg shadow-sm ring-1">
                  <Clock className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-[10px] leading-none font-bold tracking-wider uppercase">
                    {t("payment.finalize.timeLeft")}
                  </p>
                  <p
                    className={cn(
                      "font-mono font-bold tracking-tight tabular-nums",
                      expired ? "text-destructive" : "text-foreground",
                    )}
                  >
                    {expired ? t("payment.finalize.timerExpired") : formatRemain(remainMs)}
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5"
          data-slot="finalize-modal-scroll"
        >
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
            <div className={sectionCardClass}>
              <BookingPhoneField
                id="finalize-payment-payer-phone"
                label={t("payment.finalize.payerPhoneLabel")}
                value={payerPhone}
                onChange={(v) => setPayerPhone(v ?? "")}
                defaultCountry="TZ"
                required
                showError={payerPhone.length > 6 && !payerValid}
                errorText={t("payment.finalize.phoneInvalid")}
                disabled={isSubmitting}
              />
            </div>

            <div className={cn(sectionCardClass, "space-y-3")}>
              <div className="text-muted-foreground flex items-center gap-2">
                <User className="size-4 shrink-0" />
                <p className="text-[11px] font-bold tracking-wider uppercase">
                  {t("payment.finalize.passengersHeading")}
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {visiblePassengers.map((p, i) => (
                  <BookingPassengerMiniCard
                    key={`finalize-pax-${seats[i]?.id ?? i}`}
                    passenger={p}
                    seatNumber={seats[i] ? seatLabel(seats[i]) : undefined}
                  />
                ))}
                {overflow > 0 ? (
                  <span className="border-border/80 bg-muted/25 text-muted-foreground flex items-center justify-center rounded-xl border border-dashed px-2 py-3.5 text-xs font-semibold">
                    {t("payment.finalize.morePassengers", { count: overflow })}
                  </span>
                ) : null}
              </div>
            </div>

            <div className={cn(sectionCardClass, "space-y-4")}>
              <div className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                {t("payment.finalize.tripHeading")}
              </div>
              <div className="flex items-start gap-3">
                <BusIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground leading-snug font-semibold">{operatorName}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs capitalize">
                    {busClass} · {plate}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 border-t border-dashed pt-4">
                <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground font-semibold wrap-break-word">
                    {trip.route.origin} → {trip.route.destination}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {trip.route.route_code ?? trip.route.code}
                  </p>
                </div>
              </div>
              {(pickupStation?.name ?? dropoffStation?.name) ? (
                <div className="flex items-start gap-3 border-t border-dashed pt-4">
                  <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                  <div className="flex min-w-0 flex-1 flex-col gap-2.5 text-sm">
                    {pickupStation?.name ? (
                      <div>
                        <p className="text-muted-foreground mb-0.5 text-[10px] font-bold tracking-wider uppercase">
                          {t("bookingSummary.boardAt")}
                        </p>
                        <p className="text-foreground font-medium">{pickupStation.name}</p>
                      </div>
                    ) : null}
                    {dropoffStation?.name ? (
                      <div>
                        <p className="text-muted-foreground mb-0.5 text-[10px] font-bold tracking-wider uppercase">
                          {t("bookingSummary.arrivalAt")}
                        </p>
                        <p className="text-foreground font-medium">{dropoffStation.name}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
              <div className="flex items-start gap-3 border-t border-dashed pt-4">
                <Calendar className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground font-medium">
                    {departure.format("ddd, DD MMM YYYY")}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {t("trips.depart")} {departure.format("HH:mm")} · {t("trips.arrive")}{" "}
                    {arrival.format("HH:mm")}
                  </p>
                </div>
              </div>
            </div>

            <div className={cn(sectionCardClass)}>
              <div className="flex items-start gap-3">
                <LayoutGrid className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground mb-1 text-[11px] font-bold tracking-wider uppercase">
                    {t("bookingSummary.seats")}
                  </p>
                  <p className="text-foreground text-base font-semibold tracking-tight">
                    {seatLabels || "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-primary/20 bg-primary/6 rounded-2xl border px-4 py-3.5 text-sm leading-relaxed">
              {t("payment.finalize.ussdHint")}
            </div>

            <div className={cn(sectionCardClass, "space-y-3")}>
              <p className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                {t("payment.finalize.supportedMethods")}
              </p>
              <div className="flex flex-wrap gap-2">
                {PAYMENT_METHOD_LOGOS.map((method) => (
                  <div key={method.src} title={method.label} className={paymentMethodRowClass}>
                    <Image
                      src={method.src}
                      alt=""
                      width={96}
                      height={32}
                      className="max-h-6 w-auto max-w-full object-contain object-center dark:opacity-95"
                      aria-hidden
                    />
                    <span>{method.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className="bg-background/85 supports-backdrop-filter:bg-background/75 shrink-0 border-t px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md"
          data-slot="finalize-modal-footer"
        >
          <Button
            type="button"
            className="shadow-primary/15 h-11 w-full rounded-xl text-[15px] font-semibold shadow-md"
            size="lg"
            isLoading={isSubmitting}
            disabled={expired || !payerValid}
            onClick={() => {
              if (!payerValid || !payerE164) return;
              onFinalizePayment(payerE164);
            }}
          >
            {t("payment.finalize.confirmCta")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
