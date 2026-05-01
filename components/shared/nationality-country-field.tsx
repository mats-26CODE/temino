"use client";

import { useMemo, useId, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { Country } from "react-phone-number-input";
import { getCountries, isSupportedCountry } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const regionNames =
  typeof Intl !== "undefined" ? new Intl.DisplayNames(["en"], { type: "region" }) : null;

export const nationalityLabelForCountry = (code: string): string =>
  regionNames?.of(code.toUpperCase()) ?? code.toUpperCase();

export type NationalityCountryFieldProps = {
  id?: string;
  label: ReactNode;
  value: string;
  onChange: (code: Country) => void;
  placeholder?: string;
  required?: boolean;
  showError?: boolean;
  errorText?: string;
  disabled?: boolean;
};

const FlagBadge = ({
  country,
  className,
}: {
  country?: Country | string;
  className?: string;
}) => {
  if (!country || !isSupportedCountry(country as Country)) return null;
  const Cmp = flags[country as keyof typeof flags] as React.ComponentType<{
    title?: string;
    className?: string;
  }>;
  if (!Cmp)
    return <span className="text-muted-foreground text-[10px]">{String(country)}</span>;
  return (
    <Cmp title={nationalityLabelForCountry(String(country))} className={cn("size-8", className)} />
  );
};

export const NationalityCountryField = ({
  id,
  label,
  value,
  onChange,
  placeholder = "Choose country…",
  required = false,
  showError = false,
  errorText = "This field is required.",
  disabled = false,
}: NationalityCountryFieldProps) => {
  const listId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const sorted = useMemo(() => {
    const list = [...getCountries()] as Country[];
    return list.sort((a, b) =>
      nationalityLabelForCountry(a).localeCompare(nationalityLabelForCountry(b)),
    );
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((c) => {
      const n = nationalityLabelForCountry(c).toLowerCase();
      return n.includes(q) || String(c).toLowerCase().includes(q);
    });
  }, [sorted, query]);

  const chosen = value && isSupportedCountry(value as Country) ? (value as Country) : undefined;
  const chosenLabel = chosen ? nationalityLabelForCountry(chosen) : "";

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
      <Popover
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setQuery("");
        }}
      >
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-expanded={open}
            className={cn(
              "border-input text-foreground h-9 min-h-9 w-full justify-between px-3 font-normal",
              showError && "border-destructive",
              !chosen && "text-muted-foreground",
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="flex size-8 shrink-0 items-center overflow-hidden rounded-sm">
                {chosen ? (
                  <FlagBadge country={chosen} />
                ) : (
                  <span className="text-muted-foreground text-xs tracking-tight">
                    {placeholder}
                  </span>
                )}
              </span>
              <span className="truncate text-left text-sm">
                {chosen ? chosenLabel : placeholder}
              </span>
            </span>
            <ChevronDown className="text-muted-foreground size-4 shrink-0" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-2" align="start">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search country…"
            className="mb-2 h-9"
            aria-controls={listId}
          />
          <div className="max-h-64 overflow-y-auto pr-1">
            <ul id={listId} role="listbox" className="space-y-0.5">
              {filtered.map((c) => {
                const isSelected = chosen === c;
                return (
                  <li key={c} role="none">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        "hover:bg-muted focus:bg-muted flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-sm outline-none",
                        isSelected && "bg-muted",
                      )}
                      onClick={() => {
                        onChange(c);
                        setOpen(false);
                        triggerRef.current?.focus();
                      }}
                    >
                      <span className="flex size-9 shrink-0 items-center overflow-hidden rounded-sm">
                        <FlagBadge country={c} />
                      </span>
                      <span className="flex-1 leading-snug">
                        {nationalityLabelForCountry(c)}
                      </span>
                      {isSelected ? <Check className="text-primary size-4 shrink-0" /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">No matches.</p>
          ) : null}
        </PopoverContent>
      </Popover>
      {showError ? <p className="text-destructive text-xs">{errorText}</p> : null}
    </div>
  );
};
