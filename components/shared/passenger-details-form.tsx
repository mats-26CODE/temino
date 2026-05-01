"use client";

import { useEffect, useMemo, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { BookingPhoneField } from "@/components/shared/booking-phone-field";
import { NationalityCountryField } from "@/components/shared/nationality-country-field";
import { formatNidaInput, isCompleteNida } from "@/helpers/nida";
import {
  buildPassengerDetailsSchema,
  type PassengerDetailsFormValues,
  PASSENGER_ID_TYPES,
} from "@/lib/passenger-forms";

export type { PassengerDetailsFormValues } from "@/lib/passenger-forms";
export { PASSENGER_ID_TYPES } from "@/lib/passenger-forms";
export type PassengerIdType = (typeof PASSENGER_ID_TYPES)[number];

export type PassengerDetailsFormProps = {
  formId: string;
  defaultValues: PassengerDetailsFormValues;
  onValidSubmit: (data: PassengerDetailsFormValues) => void;
  showSubmitFooter?: boolean;
  submitLabel?: string;
  isSubmitting?: boolean;
};

export const PassengerDetailsForm = ({
  formId,
  defaultValues,
  onValidSubmit,
  showSubmitFooter = false,
  submitLabel,
  isSubmitting = false,
}: PassengerDetailsFormProps) => {
  const { t } = useTranslation();

  const schema = useMemo(() => buildPassengerDetailsSchema(), []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PassengerDetailsFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const defaultsSignatureRef = useRef("");
  const signature = useMemo(() => JSON.stringify(defaultValues), [defaultValues]);
  useEffect(() => {
    if (defaultsSignatureRef.current === signature) return;
    defaultsSignatureRef.current = signature;
    reset(defaultValues);
  }, [defaultValues, reset, signature]);

  const idType = watch("id_type");

  useEffect(() => {
    if (idType === "none") setValue("id_number", "");
  }, [idType, setValue]);

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

  const idLabels: Record<(typeof PASSENGER_ID_TYPES)[number], string> = {
    nida: t("passenger.id.type.nida"),
    drivers_licence: t("passenger.id.type.driversLicence"),
    voters_id: t("passenger.id.type.votersId"),
    passport: t("passenger.id.type.passport"),
    none: t("passenger.id.type.none"),
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onValidSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="first_name">
            <span className="text-red-500">*</span> {t("passenger.firstName")}
          </Label>
          <Input id="first_name" autoComplete="given-name" {...register("first_name")} />
          {errors.first_name && (
            <p className="text-destructive text-xs">{errors.first_name.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="last_name">
            <span className="text-red-500">*</span> {t("passenger.lastName")}
          </Label>
          <Input id="last_name" autoComplete="family-name" {...register("last_name")} />
          {errors.last_name && (
            <p className="text-destructive text-xs">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      <Controller
        name="passenger_phone"
        control={control}
        render={({ field }) => (
          <BookingPhoneField
            id="passenger_phone"
            label={t("passenger.phone")}
            value={field.value ?? ""}
            onChange={field.onChange}
            defaultCountry="TZ"
            required
            showError={Boolean(errors.passenger_phone)}
            errorText={errors.passenger_phone?.message ?? "Enter a valid phone number"}
          />
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>
            <span className="text-red-500">*</span> {t("passenger.gender")}
          </Label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
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
          {errors.gender && (
            <p className="text-destructive text-xs">{errors.gender.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>
            <span className="text-red-500">*</span> {t("passenger.travellerType")}
          </Label>
          <Controller
            name="traveller_type"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
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
          {errors.traveller_type && (
            <p className="text-destructive text-xs">{errors.traveller_type.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="passenger_email">{t("passenger.email")}</Label>
        <Input id="passenger_email" type="email" {...register("passenger_email")} />
        {errors.passenger_email && (
          <p className="text-destructive text-xs">{errors.passenger_email.message}</p>
        )}
      </div>

      <Controller
        name="nationality"
        control={control}
        render={({ field }) => (
          <NationalityCountryField
            id="nationality"
            label={t("passenger.nationality")}
            value={field.value}
            onChange={(code) => field.onChange(code)}
            required
            showError={Boolean(errors.nationality)}
            errorText={errors.nationality?.message ?? "Choose nationality"}
          />
        )}
      />

      <div className="space-y-1.5">
        <Label>
          <span className="text-red-500">*</span> {t("passenger.id.typeLabel")}
        </Label>
        <Controller
          name="id_type"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
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
        {errors.id_type && (
          <p className="text-destructive text-xs">{errors.id_type.message}</p>
        )}
      </div>

      {idType !== "none" ? (
        <Controller
          name="id_number"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <Label htmlFor="id_number">
                <span className="text-red-500">*</span> {t("passenger.id.numberLabel")}
              </Label>
              <Input
                id="id_number"
                value={field.value ?? ""}
                onChange={(e) => {
                  const next =
                    idType === "nida"
                      ? formatNidaInput(e.target.value)
                      : e.target.value;
                  field.onChange(next);
                }}
                placeholder={idPlaceholder()}
                autoComplete="off"
              />
              {errors.id_number && (
                <p className="text-destructive text-xs">{errors.id_number.message}</p>
              )}
            </div>
          )}
        />
      ) : null}

      {showSubmitFooter ? (
        <div className="flex justify-end pt-2">
          <Button type="submit" size="lg" isLoading={isSubmitting}>
            {submitLabel ?? "Save"}
          </Button>
        </div>
      ) : null}
    </form>
  );
};
