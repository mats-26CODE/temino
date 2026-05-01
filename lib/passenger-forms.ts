import * as z from "zod";
import type { Country } from "react-phone-number-input";
import { isSupportedCountry, isValidPhoneNumber } from "react-phone-number-input";
import { formatNidaInput, isCompleteNida } from "@/helpers/nida";
import { coerceE164PhoneValueForInput } from "@/helpers/booking-phone";

export const PASSENGER_ID_TYPES = [
  "nida",
  "drivers_licence",
  "voters_id",
  "passport",
  "none",
] as const;

export type PassengerFormIdType = (typeof PASSENGER_ID_TYPES)[number];

export const buildPassengerDetailsSchema = () =>
  z
    .object({
      first_name: z.string().min(1, "Enter first name"),
      last_name: z.string().min(1, "Enter last name"),
      passenger_phone: z.string().refine((v) => Boolean(v?.trim()) && isValidPhoneNumber(v), {
        message: "Enter a valid phone number",
      }),
      nationality: z
        .string()
        .min(2, "Choose nationality")
        .refine((v) => isSupportedCountry(v as Country), { message: "Invalid country" }),
      gender: z.enum(["male", "female"]),
      traveller_type: z.enum(["adult", "child"]),
      passenger_email: z.string().email("Enter a valid email").optional().or(z.literal("")),
      id_type: z.enum(PASSENGER_ID_TYPES),
      id_number: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.id_type !== "none") {
        const n = (data.id_number ?? "").trim();
        if (!n) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "ID number is required for this ID type",
            path: ["id_number"],
          });
          return;
        }
        if (data.id_type === "nida" && !isCompleteNida(formatNidaInput(n))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Use NIDA format 8-5-5-2 digits",
            path: ["id_number"],
          });
        }
      }
    });

export type PassengerDetailsFormValues = z.infer<ReturnType<typeof buildPassengerDetailsSchema>>;

export const partyFormSchema = (count: number) =>
  z.object({
    travellers: z.array(buildPassengerDetailsSchema()).length(count),
  });

export type PartyFormValues = z.infer<ReturnType<typeof partyFormSchema>>;

export const emptyPassengerDetailsFormValues = (): PassengerDetailsFormValues => ({
  first_name: "",
  last_name: "",
  passenger_phone: "",
  nationality: "TZ",
  gender: "male",
  traveller_type: "adult",
  passenger_email: "",
  id_type: "none",
  id_number: "",
});

export const passengerFormToPassengerInfo = (d: PassengerDetailsFormValues): PassengerInfo => ({
  first_name: d.first_name.trim(),
  last_name: d.last_name.trim(),
  passenger_name: `${d.first_name.trim()} ${d.last_name.trim()}`.trim(),
  passenger_phone: d.passenger_phone.trim(),
  nationality: d.nationality,
  gender: d.gender,
  traveller_type: d.traveller_type,
  passenger_email: d.passenger_email?.trim() || undefined,
  id_type: d.id_type,
  id_number: d.id_type === "none" ? undefined : d.id_number?.trim(),
});

const splitFullName = (full: string | undefined) => {
  const s = full?.trim() ?? "";
  const i = s.indexOf(" ");
  if (i <= 0) return { first: s, last: "" };
  return { first: s.slice(0, i).trim(), last: s.slice(i + 1).trim() };
};

export const passengerInfoToFormValues = (
  p: PassengerInfo,
): PassengerDetailsFormValues => ({
  first_name: p.first_name ?? splitFullName(p.passenger_name).first,
  last_name: p.last_name ?? splitFullName(p.passenger_name).last,
  passenger_phone: coerceE164PhoneValueForInput(p.passenger_phone, "TZ") ?? "",
  nationality: p.nationality ?? "TZ",
  gender: p.gender ?? "male",
  traveller_type: p.traveller_type ?? "adult",
  passenger_email: p.passenger_email ?? "",
  id_type: p.id_type ?? "none",
  id_number: p.id_number ?? "",
});

type AppUserLite = {
  full_name?: string;
  phone?: string;
  email?: string | null;
};

export const buildPartyFormDefaults = ({
  partyCount,
  partyStored,
  legacyPassenger,
  user,
}: {
  partyCount: number;
  partyStored: PassengerInfo[];
  legacyPassenger: PassengerInfo | null;
  user?: AppUserLite | null;
}): PassengerDetailsFormValues[] => {
  const list: PassengerDetailsFormValues[] = [];
  for (let i = 0; i < partyCount; i++) {
    const saved = partyStored[i];
    if (saved) {
      list.push(passengerInfoToFormValues(saved));
      continue;
    }
    if (i === 0) {
      const legacy = legacyPassenger;
      const hasSplitFields =
        Boolean(legacy?.first_name?.trim()) || Boolean(legacy?.last_name?.trim());
      const fromName = splitFullName(legacy?.passenger_name ?? user?.full_name);
      const phoneHint = legacy?.passenger_phone ?? user?.phone ?? "";
      list.push({
        first_name: hasSplitFields
          ? (legacy?.first_name ?? "").trim() || fromName.first
          : fromName.first,
        last_name: hasSplitFields ? (legacy?.last_name ?? "").trim() || fromName.last : fromName.last,
        passenger_phone: coerceE164PhoneValueForInput(phoneHint, "TZ") ?? "",
        nationality: legacy?.nationality ?? "TZ",
        gender: legacy?.gender ?? "male",
        traveller_type: legacy?.traveller_type ?? "adult",
        passenger_email: legacy?.passenger_email ?? user?.email ?? "",
        id_type: legacy?.id_type ?? "none",
        id_number: legacy?.id_number ?? "",
      });
      continue;
    }
    list.push(emptyPassengerDetailsFormValues());
  }
  return list;
};
