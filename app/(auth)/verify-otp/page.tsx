"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import Logo from "@/components/shared/logo";
import { AuthAsideArtwork } from "@/components/shared/auth-aside-artwork";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { useTranslation } from "@/hooks/use-translation";
import { useSendOtp, useVerifyOtp } from "@/hooks/use-auth";
import { useOtpCountdown } from "@/hooks/use-otp-countdown";
import { formatPhoneForDisplay } from "@/helpers/helpers";

const VerifyOtpContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") ?? "";
  const fullName = searchParams.get("fullName") ?? undefined;
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const { t } = useTranslation();

  const [otp, setOtp] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const verifyOtp = useVerifyOtp({ redirect, suppressVerifyErrorToast: true });
  const sendOtp = useSendOtp();
  const { countdown, canResend, startCountdown } = useOtpCountdown(60);

  const displayedPhone = formatPhoneForDisplay(phone);

  useEffect(() => {
    if (!phone) {
      router.replace("/login");
      return;
    }
    startCountdown();
  }, [phone, router, startCountdown]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!phone.trim()) {
      setFormError(t("auth.verifyOtp.phoneRequired"));
      return;
    }
    if (otp.length < 6) {
      setFormError(t("auth.verifyOtp.fillAllFields"));
      return;
    }
    verifyOtp.mutate({ phone, otp, fullName });
  };

  const onResend = () => {
    if (!phone.trim()) {
      setFormError(t("auth.verifyOtp.phoneRequired"));
      return;
    }
    if (!canResend) return;
    setFormError(null);
    sendOtp.mutate(
      { phone },
      {
        onSuccess: () => startCountdown(),
      },
    );
  };

  const hasMutationError = verifyOtp.isError || sendOtp.isError;
  const errorMessage =
    formError ??
    (verifyOtp.error instanceof Error
      ? verifyOtp.error.message
      : sendOtp.error instanceof Error
        ? sendOtp.error.message
        : t("auth.verifyOtp.error"));
  const hasError = Boolean(formError) || hasMutationError;

  return (
    <div className="flex min-h-svh lg:h-svh lg:min-h-0 lg:overflow-hidden">
      <div className="bg-background flex min-h-0 flex-1 flex-col overflow-y-auto lg:h-full lg:min-h-0">
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="flex w-full max-w-md flex-col items-center space-y-8">
            <div className="text-center">
              <Logo size="md" />
            </div>

            <div className="space-y-2 text-center">
              <h1 className="text-foreground text-3xl font-bold">{t("auth.verifyOtp.title")}</h1>
              <p className="text-muted-foreground">
                {t("auth.verifyOtp.subtitle")} <strong>{displayedPhone}</strong>
              </p>
            </div>

            {hasError && (
              <div className="text-destructive bg-destructive/10 border-destructive/20 w-fit max-w-full rounded-md border p-3 text-center text-sm">
                {errorMessage}
              </div>
            )}

            <form onSubmit={onSubmit} className="flex w-full flex-col items-center space-y-6">
              <div className="flex flex-col items-center space-y-3">
                <InputOTP
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  value={otp}
                  onChange={(v) => {
                    setOtp(v);
                    setFormError(null);
                    verifyOtp.reset();
                    sendOtp.reset();
                  }}
                  disabled={verifyOtp.isPending}
                  autoFocus
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <p className="text-muted-foreground text-center text-xs">{t("auth.verifyOtp.codeHint")}</p>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!phone.trim() || otp.length < 6}
                isLoading={verifyOtp.isPending}
              >
                {t("auth.verifyOtp.verify")}
              </Button>
            </form>

            <p className="text-muted-foreground text-center text-sm">
              {t("auth.verifyOtp.noCode")}{" "}
              {canResend ? (
                <button
                  type="button"
                  onClick={onResend}
                  disabled={sendOtp.isPending}
                  className="text-primary font-medium hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sendOtp.isPending ? t("auth.verifyOtp.sending") : t("auth.verifyOtp.resend")}
                </button>
              ) : (
                <span className="text-muted-foreground">
                  {t("auth.verifyOtp.resendIn", { seconds: String(countdown) })}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <AuthAsideArtwork />
    </div>
  );
};

const VerifyOtpPage = () => (
  <Suspense fallback={null}>
    <VerifyOtpContent />
  </Suspense>
);

export default VerifyOtpPage;
