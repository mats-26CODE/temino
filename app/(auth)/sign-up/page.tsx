"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/shared/logo";
import { BookingPhoneField } from "@/components/shared/booking-phone-field";
import { AuthAsideArtwork } from "@/components/shared/auth-aside-artwork";
import { useTranslation } from "@/hooks/use-translation";
import { useSendOtp } from "@/hooks/use-auth";
import { normalizePhoneForBookingApi } from "@/helpers/booking-phone";
import { isValidPhoneNumber } from "react-phone-number-input";
import { ToastAlert } from "@/config/toast";
import { APP_NAME } from "@/constants/values";

const SignUpContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const { t } = useTranslation();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const sendOtp = useSendOtp();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      ToastAlert.error("Please enter your full name");
      return;
    }
    const trimmed = phone.trim();
    if (!trimmed || !isValidPhoneNumber(trimmed)) {
      const msg = t("payment.finalize.phoneInvalid");
      setPhoneError(msg);
      ToastAlert.error(msg);
      return;
    }
    const apiPhone = normalizePhoneForBookingApi(trimmed);
    if (!apiPhone) {
      const msg = t("payment.finalize.phoneInvalid");
      setPhoneError(msg);
      ToastAlert.error(msg);
      return;
    }
    sendOtp.mutate(
      { phone: apiPhone },
      {
        onSuccess: () => {
          const params = new URLSearchParams({ phone: apiPhone, fullName });
          if (redirect) params.set("redirect", redirect);
          router.push(`/verify-otp?${params.toString()}`);
        },
      },
    );
  };

  return (
    <div className="flex min-h-svh lg:h-svh lg:min-h-0 lg:overflow-hidden">
      <div className="bg-background flex min-h-0 flex-1 flex-col overflow-y-auto lg:h-full lg:min-h-0">
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="mb-2">
              <Logo size="md" />
            </div>

            <div className="space-y-2">
              <h1 className="text-foreground text-3xl font-bold tracking-tight">
                {t("auth.createAccount")}
              </h1>
              <p className="text-muted-foreground">{t("auth.signup.subtitle")}</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t("passenger.fullName")}</Label>
                <div className="bg-muted/50 border-primary/20 relative flex rounded-md border shadow-xs">
                  <User className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="border-0 bg-transparent pr-4 pl-10 shadow-none focus-visible:ring-0"
                    autoFocus
                  />
                </div>
              </div>

              <BookingPhoneField
                id="phone"
                label={t("auth.phoneLabel")}
                value={phone}
                onChange={(v) => {
                  setPhone(v ?? "");
                  setPhoneError("");
                }}
                defaultCountry="TZ"
                required
                showError={Boolean(phoneError)}
                errorText={phoneError || t("payment.finalize.phoneInvalid")}
              />

              <Button type="submit" isLoading={sendOtp.isPending} className="w-full" size="lg">
                {t("auth.continue")}
                <ArrowRight className="size-4" />
              </Button>
            </form>

            <p className="text-muted-foreground text-center text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                {t("nav.login")}
              </Link>
            </p>

            <p className="text-muted-foreground text-center text-xs leading-relaxed">
              By continuing, you agree to {APP_NAME}&apos;s{" "}
              <Link href="/terms" className="text-primary hover:underline">
                {t("footer.termsOfService")}
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                {t("footer.privacyPolicy")}
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      <AuthAsideArtwork />
    </div>
  );
};

const SignUpPage = () => (
  <Suspense fallback={null}>
    <SignUpContent />
  </Suspense>
);

export default SignUpPage;
