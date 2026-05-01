import parsePhoneNumberFromString from "libphonenumber-js/min";
import type { CountryCode } from "libphonenumber-js/core";
import { addCountryCode } from "@/helpers/helpers";

export const coerceE164PhoneValueForInput = (
  value: string | undefined,
  defaultCountry: CountryCode,
): string | undefined => {
  const t = (value ?? "").trim();
  if (!t) return undefined;
  if (/^(n\/a|none|unknown)$/i.test(t.replace(/[—−\s\-]/g, ""))) return undefined;

  const parsed =
    parsePhoneNumberFromString(t, defaultCountry) ??
    (t.startsWith("+") ? parsePhoneNumberFromString(t) : undefined) ??
    (!/^\+\d/.test(t) ? parsePhoneNumberFromString(`+${t.replace(/^\+/, "")}`) : undefined);

  const n = parsed?.number;
  return typeof n === "string" ? n : undefined;
};

/** Digits-only international number for Django `passenger_phone` (e.g. 255712345678). */
export const normalizePhoneForBookingApi = (value: string | undefined): string => {
  if (!value?.trim()) return "";
  const trimmed = value.trim();
  const parsed =
    parsePhoneNumberFromString(trimmed) ?? parsePhoneNumberFromString(trimmed, "TZ");
  const rawDigits = trimmed.replace(/\D/g, "");
  // Legacy TZ local 07… / 06… saved without CC
  if (
    !parsed &&
    trimmed.startsWith("0") &&
    rawDigits.length >= 10 &&
    rawDigits.startsWith("0")
  ) {
    return addCountryCode(trimmed.replace(/\s/g, ""));
  }
  if (parsed?.nationalNumber) {
    return String(parsed.countryCallingCode) + String(parsed.nationalNumber);
  }
  return addCountryCode(trimmed.replace(/^\+/, ""));
};
