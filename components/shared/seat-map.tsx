"use client";

import { useCallback, useMemo, type ReactNode } from "react";
import { Armchair, Bath, DoorOpen, ShipWheel } from "lucide-react";
import { GiSteeringWheel } from "react-icons/gi";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { getToiletRow1Based, parseRowFromNumber } from "@/lib/mocks/trip-seats";

/** Two seat buttons (min-w-11) + gap-1.5, matching each pair + aisle layout. */
const PAIR_W = "w-[5.875rem]";

const RESTROOM = "restroom";

interface SeatMapProps {
  seats: Seat[];
  /** All currently selected seat ids (order = passenger tab order). */
  selectedSeatIds: string[];
  onToggleSeat: (seat: Seat) => void;
  columns?: number;
  busAmenities?: string[] | null;
}

const seatIconClass = (args: { selected: boolean; taken: boolean }): string => {
  if (args.taken) return "text-muted-foreground/45";
  if (args.selected) return "text-primary-foreground drop-shadow-sm";
  return "text-primary/90";
};

type SeatMapRowProps = {
  children: ReactNode;
};

const DeckRow = ({ children }: SeatMapRowProps) => (
  <div className="flex w-full min-w-0 items-center justify-center gap-1.5">{children}</div>
);

/**
 * Left pair | aisle | right pair, or a full-width 5-across rear row (no aisle).
 */
export const SeatMap = ({
  seats,
  selectedSeatIds,
  onToggleSeat,
  columns: _columns = 4,
  busAmenities,
}: SeatMapProps) => {
  const { t } = useTranslation();
  const hasRestroom = (busAmenities ?? []).some((a) => a.toLowerCase() === RESTROOM);

  const byRow = useMemo(() => {
    const m = new Map<number, Seat[]>();
    for (const s of seats) {
      const r = s.row ?? parseRowFromNumber(s.number);
      if (r < 1) continue;
      if (!m.has(r)) m.set(r, []);
      m.get(r)!.push(s);
    }
    for (const arr of m.values()) {
      arr.sort((a, b) => (a.column ?? 0) - (b.column ?? 0));
    }
    return m;
  }, [seats]);

  const rowOrder = useMemo(() => Array.from(byRow.keys()).sort((a, b) => a - b), [byRow]);

  const maxR = rowOrder.length > 0 ? Math.max(...rowOrder) : 0;
  const lastRowSeats = maxR > 0 ? byRow.get(maxR) : undefined;
  const isLastRowFive = (lastRowSeats?.length ?? 0) === 5;

  /** 4-ad rows in the 2+2 section — used to place the mid-bus WC. */
  const n4ForWc = useMemo(() => {
    if (!isLastRowFive || rowOrder.length <= 1) return rowOrder.length;
    return rowOrder.filter((r) => r < maxR).length;
  }, [isLastRowFive, maxR, rowOrder]);

  const toilet1Based = useMemo(
    () => (hasRestroom && n4ForWc >= 3 ? getToiletRow1Based(n4ForWc) : null),
    [hasRestroom, n4ForWc],
  );

  const showToilet = useCallback(
    (row1: number) => {
      if (toilet1Based == null || toilet1Based !== row1) return false;
      const aLabel = `${row1}A`.toUpperCase();
      const has6A = byRow.get(row1)?.some((s) => s.number.toUpperCase() === aLabel) ?? false;
      return !has6A;
    },
    [byRow, toilet1Based],
  );

  const getSeat = useCallback(
    (row1: number, letter: "A" | "B" | "C" | "D" | "E") => {
      const want = `${row1}${letter}`.toUpperCase();
      return byRow.get(row1)?.find((s) => s.number.toUpperCase() === want) ?? null;
    },
    [byRow],
  );

  const renderSeat = (seat: Seat) => {
    const isSelected = selectedSeatIds.includes(seat.id);
    const isTaken = seat.status !== "available";
    return (
      <button
        key={seat.id}
        type="button"
        disabled={isTaken}
        onClick={() => onToggleSeat(seat)}
        className={cn(
          "flex min-h-14 w-full max-w-full min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl border-2 px-1 py-1.5 text-[10px] font-bold tracking-tight transition-all",
          isSelected &&
            "border-primary bg-primary text-primary-foreground shadow-primary/25 scale-[1.02] shadow-md",
          !isSelected &&
            !isTaken &&
            "border-primary/30 bg-primary/5 text-foreground hover:border-primary hover:bg-primary/15 cursor-pointer hover:shadow-sm active:scale-[0.99]",
          isTaken &&
            "bg-muted/60 text-muted-foreground cursor-not-allowed border-transparent opacity-80",
        )}
        title={`${seat.number} — ${seat.status}`}
        aria-pressed={isSelected}
        aria-label={`Seat ${seat.number} ${isTaken ? "taken" : isSelected ? "selected" : "available"}`}
      >
        <Armchair
          className={cn("size-5 shrink-0", seatIconClass({ selected: isSelected, taken: isTaken }))}
          strokeWidth={2.25}
        />
        <span
          className={cn(
            "tabular-nums",
            isTaken && "line-through opacity-60",
            isSelected && "text-primary-foreground/95",
            !isTaken && !isSelected && "text-foreground/90",
          )}
        >
          {seat.number}
        </span>
      </button>
    );
  };

  const Aisle = () => (
    <div className="bg-border/35 h-14 w-1.5 shrink-0 self-center rounded-full" aria-hidden />
  );

  return (
    <Card className="w-full max-w-md gap-0 self-start overflow-hidden rounded-2xl p-0">
      <div className="bg-muted/25 border-b px-4 py-3.5">
        <p className="text-muted-foreground mb-2.5 text-[10px] font-semibold tracking-widest uppercase">
          {t("seat.map.direction")}
        </p>
        <div className="flex flex-wrap items-center gap-4 sm:gap-5">
          <div className="flex items-center gap-2">
            <div
              className="bg-background/80 border-primary/25 flex size-9 items-center justify-center rounded-lg border-2 shadow-sm"
              aria-hidden
            >
              <Armchair className="text-primary/90 h-5 w-5" strokeWidth={2.25} />
            </div>
            <span className="text-muted-foreground text-xs font-medium">
              {t("seat.legend.available")}
            </span>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-initial">
            <div
              className="bg-primary border-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-lg border-2 shadow-sm"
              aria-hidden
            >
              <Armchair className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <span className="text-muted-foreground text-xs font-medium">
                {t("seat.legend.selected")} ({selectedSeatIds.length})
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="bg-muted/90 flex size-9 items-center justify-center rounded-lg border-2 border-transparent opacity-80"
              aria-hidden
            >
              <Armchair className="text-muted-foreground/50 h-5 w-5" strokeWidth={2.25} />
            </div>
            <span className="text-muted-foreground text-xs font-medium">
              {t("seat.legend.taken")}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-0 p-5">
        <div className="from-muted/30 to-background border-border/60 mb-3 rounded-xl border bg-linear-to-b p-3">
          <p className="text-muted-foreground mb-2.5 text-center text-[10px] font-semibold tracking-widest uppercase">
            {t("seat.map.front")}
          </p>
          <div className="mb-0.5 flex w-full min-w-0 items-start justify-between gap-1.5">
            <div className={cn("flex min-h-18 flex-col items-center justify-end gap-1.5", PAIR_W)}>
              <div
                className="border-border bg-primary/5 text-primary flex h-16 w-16 items-center justify-center rounded-xl border-2"
                title={t("seat.map.door")}
              >
                <DoorOpen className="size-8" strokeWidth={2} />
              </div>
              <span className="text-muted-foreground text-[10px] leading-tight font-medium">
                {t("seat.map.door")}
              </span>
            </div>
            <Aisle />
            <div className={cn("flex min-h-18 flex-col items-center justify-end gap-1.5", PAIR_W)}>
              <div
                className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                title={t("seat.map.driver")}
              >
                <GiSteeringWheel className="size-8" strokeWidth={2} />
              </div>
              <span className="text-muted-foreground text-[10px] leading-tight font-medium">
                {t("seat.map.driver")}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {rowOrder.map((r) => {
            const inRow = byRow.get(r) ?? [];
            const fiveAcross = inRow.length === 5;
            if (fiveAcross) {
              const withDivider = r === maxR && isLastRowFive && rowOrder.length > 1;
              return (
                <div key={r} className="w-full min-w-0">
                  {withDivider && (
                    <div className="border-border/50 space-y-1.5 border-t border-dashed pt-3">
                      <p className="text-center text-[10px] font-semibold tracking-widest text-amber-700/90 uppercase dark:text-amber-400/90">
                        {t("seat.map.rearRow")}
                      </p>
                    </div>
                  )}
                  <div className="grid w-full grid-cols-5 gap-1.5">
                    {inRow.map((seat) => (
                      <div key={seat.id} className="min-w-0">
                        {renderSeat(seat)}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            const isLastSingle = r === maxR && inRow.length === 1 && rowOrder.length > 1;
            if (isLastSingle) {
              return (
                <div key={r} className="grid w-full grid-cols-5 gap-1.5">
                  <div className="col-start-3 col-end-4 min-w-0">{renderSeat(inRow[0])}</div>
                </div>
              );
            }

            const wc = showToilet(r);
            const sA = getSeat(r, "A");
            const sB = getSeat(r, "B");
            const sC = getSeat(r, "C");
            const sD = getSeat(r, "D");

            return (
              <DeckRow key={r}>
                {wc ? (
                  <div className="flex min-h-14 min-w-16 flex-1 flex-col">
                    <div
                      className="flex min-h-14 w-full flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-amber-200/80 bg-amber-50/95 py-1.5 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-100"
                      role="img"
                      title={t("seat.map.wc")}
                      aria-label={t("seat.map.wc")}
                    >
                      <Bath className="size-5 opacity-90" strokeWidth={2} />
                      <span className="px-0.5 text-center text-[8px] leading-tight font-bold">
                        {t("seat.map.wcShort")}
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    {sA && renderSeat(sA)}
                    {sB && renderSeat(sB)}
                  </>
                )}
                <Aisle />
                {wc ? (
                  <div
                    className={cn(
                      "flex shrink-0 gap-1.5",
                      "[&>button]:w-auto [&>button]:max-w-none [&>button]:min-w-[94px] [&>button]:shrink-0",
                    )}
                  >
                    {sC && renderSeat(sC)}
                    {sD && renderSeat(sD)}
                  </div>
                ) : (
                  <>
                    {sC && renderSeat(sC)}
                    {sD && renderSeat(sD)}
                  </>
                )}
              </DeckRow>
            );
          })}
        </div>

        <div className="border-border/60 mt-4 flex flex-col items-center gap-1 border-t border-dashed pt-3 text-center">
          <p className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
            {t("seat.map.rear")}
          </p>
        </div>
      </div>
    </Card>
  );
};
