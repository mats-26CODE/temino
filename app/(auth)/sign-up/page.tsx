"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/shared/logo";
import { useTranslation } from "@/hooks/use-translation";
import { useSendOtp } from "@/hooks/use-auth";
import { validatePhoneNumber } from "@/helpers/helpers";
import { ToastAlert } from "@/config/toast";

const SignUpContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const { t } = useTranslation();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const sendOtp = useSendOtp();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      ToastAlert.error("Please enter your full name");
      return;
    }
    const validation = validatePhoneNumber(phone);
    if (!validation.isValid) {
      ToastAlert.error(validation.error ?? "Invalid phone");
      return;
    }
    sendOtp.mutate(
      { phone },
      {
        onSuccess: () => {
          const params = new URLSearchParams({ phone, fullName });
          if (redirect) params.set("redirect", redirect);
          router.push(`/verify-otp?${params.toString()}`);
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-8">
        <Logo size="md" />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight text-balance">
            {t("auth.createAccount")}
          </CardTitle>
          <p className="text-muted-foreground text-base">
            Just two fields. We&apos;ll text you a verification code.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">{t("passenger.fullName")}</Label>
              <div className="relative">
                <User className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  id="fullName"
                  placeholder="Asha Mwangi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">{t("auth.phoneLabel")}</Label>
              <div className="relative">
                <Phone className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="0712 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" isLoading={sendOtp.isPending} className="w-full" size="lg">
              {t("auth.continue")} <ArrowRight className="size-4" />
            </Button>

            <p className="text-muted-foreground text-center text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                {t("nav.login")}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const SignUpPage = () => (
  <Suspense fallback={null}>
    <SignUpContent />
  </Suspense>
);

export default SignUpPage;
