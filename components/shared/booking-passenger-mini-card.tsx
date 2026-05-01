"use client";

import { useTranslation } from "@/hooks/use-translation";
import { coerceE164PhoneValueForInput } from "@/helpers/booking-phone";
import { nationalityLabelForCountry } from "@/components/shared/nationality-country-field";
import { formatPhoneNumberIntl, isPossiblePhoneNumber } from "react-phone-number-input";

const formatBookingPhoneDisplay = (raw: string): string => {
  const trimmed = raw?.trim() ?? "";
  const e164 =
    coerceE164PhoneValueForInput(trimmed, "TZ") ??
    (trimmed.startsWith("+") ? trimmed : undefined);
  return e164 && isPossiblePhoneNumber(e164)
    ? formatPhoneNumberIntl(e164)
    : trimmed;
};

const documentTypeLabelKey = (
  k: PassengerDocumentType | undefined,
): "passenger.id.type.nida"
  | "passenger.id.type.driversLicence"
  | "passenger.id.type.votersId"
  | "passenger.id.type.passport" => {
  if (k === "drivers_licence") return "passenger.id.type.driversLicence";
  if (k === "voters_id") return "passenger.id.type.votersId";
  if (k === "nida") return "passenger.id.type.nida";
  return "passenger.id.type.passport";
};

const metaLineForPassenger = (
  p: PassengerInfo,
  t: (k: string, vars?: Record<string, string | number>) => string,
): string => {
  const parts: string[] = [];
  const phone = formatBookingPhoneDisplay(p.passenger_phone ?? "");
  if (phone) parts.push(phone);
  if (p.passenger_email?.trim()) parts.push(p.passenger_email.trim());
  if (p.nationality)
    parts.push(`${t("passenger.nationality")}: ${nationalityLabelForCountry(p.nationality)}`);
  if (p.gender) parts.push(`${t("passenger.gender")}: ${t(`passenger.gender.${p.gender}`)}`);
  if (p.traveller_type)
    parts.push(`${t("passenger.travellerType")}: ${t(`passenger.traveller.${p.traveller_type}`)}`);
  if (p.id_type && p.id_type !== "none" && p.id_number?.trim()) {
    parts.push(`${t(documentTypeLabelKey(p.id_type))}: ${p.id_number.trim()}`);
  }
  return parts.join(" · ");
};

export const BookingPassengerMiniCard = ({
  passenger: p,
  seatNumber,
}: {
  passenger: PassengerInfo;
  seatNumber?: string | null;
}) => {
  const { t } = useTranslation();
  const meta = metaLineForPassenger(p, t);
  const name = p.passenger_name?.trim() || "—";

  return (
    <div className="border-border/60 bg-background/60 flex min-w-0 flex-col gap-1 rounded-lg border px-2.5 py-2">
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
        {seatNumber ? (
          <span className="bg-primary/12 text-primary shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums leading-none">
            {seatNumber}
          </span>
        ) : null}
        <p className="text-foreground min-w-0 flex-1 font-medium leading-tight wrap-break-word">
          {name}
        </p>
      </div>
      {meta ? (
        <p className="text-muted-foreground line-clamp-2 text-[11px] leading-snug wrap-break-word">
          {meta}
        </p>
      ) : null}
    </div>
  );
};
