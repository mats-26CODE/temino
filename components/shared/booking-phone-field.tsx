"use client";

import { useEffect, type ReactNode } from "react";
import PhoneInput, { type Country } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "./booking-phone-field.css";
import { SearchablePhoneCountrySelect } from "@/components/shared/searchable-phone-country-select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { coerceE164PhoneValueForInput } from "@/helpers/booking-phone";

type BookingPhoneFieldProps = {
  id?: string;
  label: ReactNode;
  value: string;
  onChange: (value: string | undefined) => void;
  defaultCountry?: Country;
  countries?: Country[];
  required?: boolean;
  showError?: boolean;
  errorText?: string;
  disabled?: boolean;
};

export const BookingPhoneField = ({
  id,
  label,
  value,
  onChange,
  defaultCountry = "TZ",
  countries,
  required = false,
  showError = false,
  errorText = "This field is required.",
  disabled = false,
}: BookingPhoneFieldProps) => {
  const normalizedValue = coerceE164PhoneValueForInput(value, defaultCountry) || undefined;

  useEffect(() => {
    const t = (value ?? "").trim();
    if (/^n\/a$/i.test(t) || /^none$/i.test(t) || /^unknown$/i.test(t) || t === "—" || t === "-") {
      onChange(undefined);
    }
  }, [value, onChange]);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {required ? (
          <>
            <span className="text-red-500">*</span> {label}
          </>
        ) : (
          label
        )}
      </Label>
      <div
        className={cn(
          "booking-phone-field border-input shadow-xs flex h-9 min-h-9 items-center rounded-md border bg-background px-1",
          showError && "border-destructive aria-invalid:border-destructive",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <PhoneInput
          className={cn(
            "PhoneInput flex h-full min-h-0 w-full flex-1 items-center gap-1 [&_.PhoneInputCountry]:mr-1",
          )}
          id={id}
          international
          defaultCountry={defaultCountry}
          countries={countries}
          value={normalizedValue}
          onChange={onChange}
          disabled={disabled}
          addInternationalOption={false}
          countrySelectComponent={SearchablePhoneCountrySelect}
        />
      </div>
      {showError && <p className="text-destructive text-xs">{errorText}</p>}
    </div>
  );
};
