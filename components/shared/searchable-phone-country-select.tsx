"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { Country } from "react-phone-number-input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Options shape from `react-phone-number-input` country picker. */
type CountryPickOption = {
  value?: string;
  label: string;
  divider?: boolean;
};

export type PhoneLibraryCountrySelectProps = {
  name?: string;
  value?: Country;
  onChange: (country?: Country) => void;
  options: CountryPickOption[];
  disabled?: boolean;
  readOnly?: boolean;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  onBlur?: React.FocusEventHandler<HTMLElement>;
  "aria-label"?: string;
  iconComponent: (props: {
    country?: string;
    label: string;
    aspectRatio?: number;
  }) => ReactElement;
};

export const SearchablePhoneCountrySelect = ({
  name: _name,
  value,
  onChange,
  options,
  disabled,
  readOnly,
  onFocus,
  onBlur,
  "aria-label": ariaLabel,
  iconComponent: Icon,
}: PhoneLibraryCountrySelectProps) => {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const blocked = Boolean(disabled || readOnly);

  const selectable = useMemo(
    () => options.filter((o) => !o.divider && o.label),
    [options],
  );

  const selected = useMemo(
    () => selectable.find((o) => (!value && (!o.value || o.value === "ZZ")) || o.value === value),
    [selectable, value],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return selectable;
    return selectable.filter((o) => o.label.toLowerCase().includes(q));
  }, [selectable, query]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const resolveCountry = (v?: string): Country | undefined => {
    if (!v || v === "ZZ" || v === "|") return undefined;
    return v as Country;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          type="button"
          variant="ghost"
          aria-label={ariaLabel}
          disabled={blocked}
          onFocus={onFocus as React.FocusEventHandler<HTMLButtonElement>}
          onBlur={onBlur as React.FocusEventHandler<HTMLButtonElement>}
          className={cn(
            "border-input text-foreground h-9 shrink-0 gap-1 rounded-md border bg-transparent px-2 font-normal shadow-none",
            "hover:bg-muted/80 focus-visible:bg-muted/80",
          )}
        >
          <Icon country={resolveCountry(selected?.value)} label={selected?.label ?? "—"} />
          <ChevronDown className="text-muted-foreground size-4 shrink-0" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(24rem,calc(100vw-2rem))] p-2"
      >
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search country…"
          className="mb-2 h-9"
          aria-controls={listId}
        />
        <div className="max-h-64 overflow-y-auto pr-1">
          <ul id={listId} role="listbox" className="space-y-0.5">
            {filtered.map((opt) => {
              const resolved = resolveCountry(opt.value);
              const isSelected =
                (!value && (!opt.value || opt.value === "ZZ")) || opt.value === value;
              return (
                <li key={`${opt.value ?? "intl"}-${opt.label}`} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={cn(
                      "hover:bg-muted focus:bg-muted flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-sm outline-none",
                      isSelected && "bg-muted",
                    )}
                    onClick={() => {
                      const next = resolveCountry(opt.value);
                      onChange(next);
                      setOpen(false);
                      triggerRef.current?.focus();
                    }}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center">
                      <Icon country={resolved} label={opt.label} />
                    </span>
                    <span className="min-w-0 flex-1 leading-snug">{opt.label}</span>
                    {isSelected ? <Check className="text-primary size-4 shrink-0" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">No matches.</p>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
};
