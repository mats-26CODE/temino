"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PassengerDetailsForm } from "@/components/shared/passenger-details-form";
import type { PassengerDetailsFormValues } from "@/lib/passenger-forms";
import { travellerDefaultsFromAuthUser } from "@/lib/passenger-forms";
import { useUser } from "@/hooks/use-auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { normalizePhoneForBookingApi } from "@/helpers/booking-phone";
import { useTranslation } from "@/hooks/use-translation";
import { ToastAlert } from "@/config/toast";

const PROFILE_TRAVELLER_FORM_ID = "profile-traveller-form";

const ProfilePage = () => {
  const { user } = useUser();
  const setUser = useAuthStore((s) => s.setUser);
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);

  const defaults = useMemo(() => travellerDefaultsFromAuthUser(user), [user]);

  const initials = (user?.full_name ?? user?.phone ?? "T")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const onSave = (data: PassengerDetailsFormValues) => {
    if (!user) return;
    setSaving(true);
    try {
      const phone = normalizePhoneForBookingApi(data.passenger_phone) || user.phone;
      const fullName = `${data.first_name} ${data.last_name}`.trim();
      setUser({
        ...user,
        full_name: fullName || user.full_name,
        phone,
        email: data.passenger_email?.trim() || null,
        traveller_profile: data,
      });
      ToastAlert.success(t("dashboard.profileSaved"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h1 className="text-foreground text-3xl font-bold tracking-tight text-balance md:text-4xl">
          {t("dashboard.profile")}
        </h1>
        <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
          {t("dashboard.profileSubtitle")}
        </p>
      </div>

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Avatar className="ring-primary/10 size-16 ring-2">
          {user?.avatar_url ? <AvatarImage src={user.avatar_url} alt="" /> : null}
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-foreground font-semibold">{user?.full_name ?? "—"}</p>
          <p className="text-muted-foreground text-sm tabular-nums">{user?.phone ?? ""}</p>
        </div>
      </div>

      <Card className="border-border/60 max-w-3xl rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t("passenger.title")}</CardTitle>
          <CardDescription>{t("passenger.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <PassengerDetailsForm
            formId={PROFILE_TRAVELLER_FORM_ID}
            defaultValues={defaults}
            onValidSubmit={onSave}
            showSubmitFooter
            submitLabel={t("dashboard.profileSave")}
            isSubmitting={saving}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
