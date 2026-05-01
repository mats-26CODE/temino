"use client";

import { useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";
import { BookingPhoneField } from "@/components/shared/booking-phone-field";
import { NationalityCountryField } from "@/components/shared/nationality-country-field";
import { formatNidaInput } from "@/helpers/nida";
import {
  PASSENGER_ID_TYPES,
  type PartyFormValues,
  type PassengerFormIdType,
} from "@/lib/passenger-forms";

type PassengerTravellerFieldsProps = {
  travellerIndex: number;
  /** Set when fields sit inside Tabs / padded shell — skips extra CardContent inset. */
  embedded?: boolean;
};

const field = (travellerIndex: number, key: keyof PartyFormValues["travellers"][number]) =>
  `travellers.${travellerIndex}.${key}` as const;

export const PassengerTravellerFields = ({
  travellerIndex: i,
  embedded = false,
}: PassengerTravellerFieldsProps) => {
  const { t } = useTranslation();
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<PartyFormValues>();

  const idType =
    useWatch({ control, name: field(i, "id_type") }) ?? ("none" as PassengerFormIdType);

  useEffect(() => {
    if (idType === "none") setValue(field(i, "id_number"), "");
  }, [idType, setValue, i]);

  const e = errors.travellers?.[i];

  const idPlaceholder = (): string => {
    switch (idType) {
      case "nida":
        return "12345678-12345-12345-12";
      case "passport":
        return t("passenger.id.placeholder.passport");
      case "drivers_licence":
        return t("passenger.id.placeholder.driversLicence");
      case "voters_id":
        return t("passenger.id.placeholder.votersId");
      default:
        return "";
    }
  };

  const idLabels: Record<PassengerFormIdType, string> = {
    nida: t("passenger.id.type.nida"),
    drivers_licence: t("passenger.id.type.driversLicence"),
    voters_id: t("passenger.id.type.votersId"),
    passport: t("passenger.id.type.passport"),
    none: t("passenger.id.type.none"),
  };

  return (
    <CardContent className={embedded ? "px-0" : undefined}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`tf-${i}-first`}>
              <span className="text-red-500">*</span> {t("passenger.firstName")}
            </Label>
            <Input
              id={`tf-${i}-first`}
              autoComplete="given-name"
              {...register(field(i, "first_name"))}
            />
            {e?.first_name && (
              <p className="text-destructive text-xs">{e.first_name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`tf-${i}-last`}>
              <span className="text-red-500">*</span> {t("passenger.lastName")}
            </Label>
            <Input
              id={`tf-${i}-last`}
              autoComplete="family-name"
              {...register(field(i, "last_name"))}
            />
            {e?.last_name && <p className="text-destructive text-xs">{e.last_name.message}</p>}
          </div>
        </div>

        <Controller
          name={field(i, "passenger_phone")}
          control={control}
          render={({ field: f }) => (
            <BookingPhoneField
              id={`tf-${i}-phone`}
              label={t("passenger.phone")}
              value={f.value ?? ""}
              onChange={f.onChange}
              defaultCountry="TZ"
              required
              showError={Boolean(e?.passenger_phone)}
              errorText={e?.passenger_phone?.message ?? "Enter a valid phone number"}
            />
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>
              <span className="text-red-500">*</span> {t("passenger.gender")}
            </Label>
            <Controller
              name={field(i, "gender")}
              control={control}
              render={({ field: f }) => (
                <Select value={f.value} onValueChange={f.onChange}>
                  <SelectTrigger className="border-input shadow-xs bg-background hover:bg-muted/40 h-11 w-full">
                    <SelectValue placeholder={t("passenger.gender.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t("passenger.gender.male")}</SelectItem>
                    <SelectItem value="female">{t("passenger.gender.female")}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {e?.gender && <p className="text-destructive text-xs">{e.gender.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>
              <span className="text-red-500">*</span> {t("passenger.travellerType")}
            </Label>
            <Controller
              name={field(i, "traveller_type")}
              control={control}
              render={({ field: f }) => (
                <Select value={f.value} onValueChange={f.onChange}>
                  <SelectTrigger className="border-input shadow-xs bg-background hover:bg-muted/40 h-11 w-full">
                    <SelectValue placeholder={t("passenger.traveller.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adult">{t("passenger.traveller.adult")}</SelectItem>
                    <SelectItem value="child">{t("passenger.traveller.child")}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {e?.traveller_type && (
              <p className="text-destructive text-xs">{e.traveller_type.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`tf-${i}-email`}>{t("passenger.email")}</Label>
          <Input id={`tf-${i}-email`} type="email" {...register(field(i, "passenger_email"))} />
          {e?.passenger_email && (
            <p className="text-destructive text-xs">{e.passenger_email.message}</p>
          )}
        </div>

        <Controller
          name={field(i, "nationality")}
          control={control}
          render={({ field: f }) => (
            <NationalityCountryField
              id={`tf-${i}-nationality`}
              label={t("passenger.nationality")}
              value={f.value ?? "TZ"}
              onChange={(code) => f.onChange(code)}
              required
              showError={Boolean(e?.nationality)}
              errorText={e?.nationality?.message ?? "Choose nationality"}
            />
          )}
        />

        <div className="space-y-1.5">
          <Label>
            <span className="text-red-500">*</span> {t("passenger.id.typeLabel")}
          </Label>
          <Controller
            name={field(i, "id_type")}
            control={control}
            render={({ field: f }) => (
              <Select value={f.value} onValueChange={f.onChange}>
                <SelectTrigger className="border-input shadow-xs bg-background hover:bg-muted/40 h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PASSENGER_ID_TYPES.map((k) => (
                    <SelectItem key={k} value={k}>
                      {idLabels[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {e?.id_type && <p className="text-destructive text-xs">{e.id_type.message}</p>}
        </div>

        {idType !== "none" ? (
          <Controller
            name={field(i, "id_number")}
            control={control}
            render={({ field: f }) => (
              <div className="space-y-1.5">
                <Label htmlFor={`tf-${i}-id`}>
                  <span className="text-red-500">*</span> {t("passenger.id.numberLabel")}
                </Label>
                <Input
                  id={`tf-${i}-id`}
                  value={f.value ?? ""}
                  onChange={(ev) => {
                    const next =
                      idType === "nida" ? formatNidaInput(ev.target.value) : ev.target.value;
                    f.onChange(next);
                  }}
                  placeholder={idPlaceholder()}
                  autoComplete="off"
                />
                {e?.id_number && (
                  <p className="text-destructive text-xs">{e.id_number.message}</p>
                )}
              </div>
            )}
          />
        ) : null}
      </div>
    </CardContent>
  );
};
