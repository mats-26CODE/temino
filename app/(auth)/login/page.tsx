"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/shared/logo";
import { BookingPhoneField } from "@/components/shared/booking-phone-field";
import { AuthAsideArtwork } from "@/components/shared/auth-aside-artwork";
import { useTranslation } from "@/hooks/use-translation";
import { useSendOtp } from "@/hooks/use-auth";
import { normalizePhoneForBookingApi } from "@/helpers/booking-phone";
import { isValidPhoneNumber } from "react-phone-number-input";
import { ToastAlert } from "@/config/toast";
import { APP_NAME } from "@/constants/values";

const LoginContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const { t } = useTranslation();
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const sendOtp = useSendOtp();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
          const params = new URLSearchParams({ phone: apiPhone });
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
              <h1 className="text-foreground text-3xl font-bold tracking-tight">{t("auth.welcomeBack")}</h1>
              <p className="text-muted-foreground">{t("auth.login.subtitle")}</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
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
              New here?{" "}
              <Link href="/sign-up" className="text-primary font-medium underline-offset-4 hover:underline">
                {t("nav.signup")}
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

const LoginPage = () => (
  <Suspense fallback={null}>
    <LoginContent />
  </Suspense>
);

export default LoginPage;
