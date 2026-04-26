"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookingSummary } from "@/components/shared/booking-summary";
import { useBookingStore } from "@/lib/stores/booking-store";
import { useTranslation } from "@/hooks/use-translation";
import { useUser } from "@/hooks/use-auth";
import { validatePhoneNumber } from "@/helpers/helpers";

const passengerSchema = z.object({
  passenger_name: z.string().min(2, "Please enter your full name"),
  passenger_phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .refine((val) => validatePhoneNumber(val).isValid, {
      message: "Enter a valid TZ phone (e.g. 0712345678)",
    }),
  passenger_email: z.string().email("Enter a valid email").optional().or(z.literal("")),
});

type PassengerForm = z.infer<typeof passengerSchema>;

const PassengerInfoPage = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const tripId = params?.id;
  const { t } = useTranslation();
  const { user } = useUser();

  const trip = useBookingStore((s) => s.selectedTrip);
  const seat = useBookingStore((s) => s.selectedSeat);
  const passenger = useBookingStore((s) => s.passenger);
  const setPassenger = useBookingStore((s) => s.setPassenger);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PassengerForm>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      passenger_name: passenger?.passenger_name ?? user?.full_name ?? "",
      passenger_phone: passenger?.passenger_phone ?? user?.phone ?? "",
      passenger_email: passenger?.passenger_email ?? user?.email ?? "",
    },
  });

  useEffect(() => {
    if (!trip || trip.id !== tripId || !seat) {
      router.replace(`/trips/${tripId}/seat`);
    }
  }, [trip, tripId, seat, router]);

  const onSubmit = (data: PassengerForm) => {
    setPassenger({
      passenger_name: data.passenger_name.trim(),
      passenger_phone: data.passenger_phone.trim(),
      passenger_email: data.passenger_email?.trim() || undefined,
    });
    router.push(`/trips/${tripId}/payment`);
  };

  if (!trip || !seat) return null;

  return (
    <div className="container mx-auto px-4 py-8 md:max-w-6xl md:py-12">
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground mb-4 -ml-2 gap-1"
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-4" /> Back to seats
      </Button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
        <div>
          <h1 className="text-foreground text-3xl font-bold tracking-tight text-balance md:text-4xl">
            {t("passenger.title")}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            We&apos;ll use this to send your ticket and travel updates.
          </p>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Lead passenger</CardTitle>
            </CardHeader>
            <CardContent>
              <form id="passenger-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="passenger_name">{t("passenger.fullName")}</Label>
                  <Input id="passenger_name" {...register("passenger_name")} />
                  {errors.passenger_name && (
                    <p className="text-destructive text-xs">{errors.passenger_name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="passenger_phone">{t("passenger.phone")}</Label>
                    <Input
                      id="passenger_phone"
                      type="tel"
                      inputMode="tel"
                      placeholder="0712 345 678"
                      {...register("passenger_phone")}
                    />
                    {errors.passenger_phone && (
                      <p className="text-destructive text-xs">{errors.passenger_phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="passenger_email">{t("passenger.email")}</Label>
                    <Input
                      id="passenger_email"
                      type="email"
                      placeholder="you@example.com"
                      {...register("passenger_email")}
                    />
                    {errors.passenger_email && (
                      <p className="text-destructive text-xs">{errors.passenger_email.message}</p>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <BookingSummary trip={trip} seat={seat} />
          <Button form="passenger-form" type="submit" className="w-full" size="lg">
            {t("passenger.continue")} <ArrowRight className="size-4" />
          </Button>
        </aside>
      </div>
    </div>
  );
};

export default PassengerInfoPage;
