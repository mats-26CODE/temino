"use client";

import { Fragment } from "react";
import { ShipWheel } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

interface SeatMapProps {
  seats: Seat[];
  selectedSeatId: string | null;
  onSelect: (seat: Seat) => void;
  /** Optional: number of seats per row. Default 4 (2-2 layout with aisle). */
  columns?: number;
}

/**
 * Bus seat map — renders a clickable grid of seats with a center aisle.
 *
 * Status colors:
 *  - available  → outlined, primary on hover
 *  - selected   → filled primary
 *  - taken      → muted, disabled
 */
export const SeatMap = ({ seats, selectedSeatId, onSelect, columns = 4 }: SeatMapProps) => {
  const { t } = useTranslation();
  const rows: Seat[][] = [];

  const sorted = [...seats].sort((a, b) => {
    const ar = a.row ?? Number.parseInt(a.number) ?? 0;
    const br = b.row ?? Number.parseInt(b.number) ?? 0;
    if (ar !== br) return ar - br;
    return (a.column ?? 0) - (b.column ?? 0);
  });

  for (let i = 0; i < sorted.length; i += columns) {
    rows.push(sorted.slice(i, i + columns));
  }

  const aisleAfter = Math.floor(columns / 2);

  return (
    <Card className="w-full max-w-md gap-0 self-start rounded-2xl p-6">
      {/* Driver — front of bus; keep wheel on the right, align block to the start of the column (no mx-auto). */}
      <div className="mb-6 flex w-full min-w-0 justify-end">
        <div
          className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-md"
          title="Driver"
        >
          <ShipWheel className="size-5" />
        </div>
      </div>

      {/* Seats — row width matches the driver/seat block; no extra left gutter */}
      <div className="space-y-2">
        {rows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="flex w-full min-w-0 items-center justify-center gap-1.5"
          >
            {row.map((seat, colIdx) => {
              const isSelected = seat.id === selectedSeatId;
              const isTaken = seat.status !== "available";
              return (
                <Fragment key={seat.id}>
                  <button
                    type="button"
                    disabled={isTaken}
                    onClick={() => onSelect(seat)}
                    className={cn(
                      "border-border relative flex size-10 items-center justify-center rounded-md border text-xs font-semibold transition-all",
                      isSelected && "bg-primary text-primary-foreground border-primary scale-105",
                      !isSelected &&
                        !isTaken &&
                        "hover:border-primary hover:bg-primary/10 hover:text-primary cursor-pointer",
                      isTaken &&
                        "bg-muted text-muted-foreground cursor-not-allowed line-through opacity-60",
                    )}
                    title={`Seat ${seat.number} — ${seat.status}`}
                  >
                    {seat.number}
                  </button>
                  {colIdx + 1 === aisleAfter && colIdx < row.length - 1 && <div className="w-3" />}
                </Fragment>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend — left-aligned to match page header / column start */}
      <div className="border-border mt-6 flex w-full min-w-0 flex-wrap items-center justify-start gap-x-4 gap-y-2 border-t pt-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="border-border size-4 rounded border" />
          <span className="text-muted-foreground">{t("seat.legend.available")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="bg-primary size-4 rounded" />
          <span className="text-muted-foreground">{t("seat.legend.selected")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="bg-muted size-4 rounded" />
          <span className="text-muted-foreground">{t("seat.legend.taken")}</span>
        </div>
      </div>
    </Card>
  );
};
