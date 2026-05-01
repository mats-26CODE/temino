"use client";

import {
  Armchair,
  Coffee,
  DoorClosed,
  Plug,
  Snowflake,
  Tv,
  Usb,
  Wifi,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export const BUS_AMENITY_META: Record<string, { icon: LucideIcon; key: string }> = {
  wifi: { icon: Wifi, key: "bus.amenities.wifi" },
  socket: { icon: Plug, key: "bus.amenities.socket" },
  usb: { icon: Usb, key: "bus.amenities.usb" },
  ac: { icon: Snowflake, key: "bus.amenities.ac" },
  meal: { icon: Coffee, key: "bus.amenities.meal" },
  tv: { icon: Tv, key: "bus.amenities.tv" },
  restroom: { icon: DoorClosed, key: "bus.amenities.restroom" },
  reclining: { icon: Armchair, key: "bus.amenities.reclining" },
};

export type BusAmenityPillsProps = {
  amenities: readonly string[];
  compact?: boolean;
  maxVisible?: number;
  className?: string;
};

export const BusAmenityPills = ({
  amenities,
  compact = false,
  maxVisible = 6,
  className,
}: BusAmenityPillsProps) => {
  const { t } = useTranslation();
  const safe = [...amenities].filter((a) => a in BUS_AMENITY_META).slice(0, maxVisible);
  const iconClass = compact ? "size-3 shrink-0" : "size-3.5 shrink-0";
  const padding = compact ? "px-2 py-0.5 text-[11px] gap-1" : "px-2.5 py-1 text-xs gap-1.5";

  return (
    <div className={className ?? "flex min-w-0 flex-wrap items-center gap-2"}>
      {safe.map((a) => {
        const Icon = BUS_AMENITY_META[a].icon;
        return (
          <span
            key={a}
            className={`bg-muted/60 text-muted-foreground inline-flex items-center rounded-full font-medium ${padding}`}
          >
            <Icon className={iconClass} strokeWidth={2} />
            {!compact ? t(BUS_AMENITY_META[a].key) : null}
          </span>
        );
      })}
    </div>
  );
};
