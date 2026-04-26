"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import Logo from "@/components/shared/logo";
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
  const verifyOtp = useVerifyOtp({ redirect });
  const sendOtp = useSendOtp();
  const { countdown, canResend, startCountdown } = useOtpCountdown(60);

  useEffect(() => {
    if (!phone) {
      router.replace("/login");
      return;
    }
    startCountdown();
  }, [phone, router, startCountdown]);

  const onResend = () => {
    sendOtp.mutate(
      { phone },
      {
        onSuccess: () => startCountdown(),
      },
    );
  };

  const onVerify = (code: string) => {
    if (code.length !== 6) return;
    verifyOtp.mutate({ phone, otp: code, fullName });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-8">
        <Logo size="md" />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground -ml-2 w-fit gap-1"
            onClick={() => router.back()}
          >
            <ArrowLeft className="size-3.5" /> Back
          </Button>
          <CardTitle className="text-3xl font-bold tracking-tight text-balance">
            {t("auth.otpTitle")}
          </CardTitle>
          <p className="text-muted-foreground text-base">
            {t("auth.otpDesc", { phone: formatPhoneForDisplay(phone) })}
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(v) => {
                setOtp(v);
                if (v.length === 6) onVerify(v);
              }}
            >
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            className="w-full"
            size="lg"
            isLoading={verifyOtp.isPending}
            onClick={() => onVerify(otp)}
            disabled={otp.length !== 6}
          >
            {t("auth.continue")}
          </Button>

          <div className="text-center text-sm">
            {canResend ? (
              <button
                type="button"
                onClick={onResend}
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                {t("auth.otpResend")}
              </button>
            ) : (
              <span className="text-muted-foreground">
                {t("auth.otpResendIn", { seconds: countdown })}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const VerifyOtpPage = () => (
  <Suspense fallback={null}>
    <VerifyOtpContent />
  </Suspense>
);

export default VerifyOtpPage;
