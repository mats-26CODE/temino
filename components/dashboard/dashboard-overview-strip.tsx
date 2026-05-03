"use client";

import Link from "next/link";
import { ArrowRight, Search, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

type DashboardOverviewStripProps = {
  upcomingCount: number;
  pastCount: number;
  loading?: boolean;
  className?: string;
};

const MiniStat = ({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col justify-center gap-1 px-4 py-2.5 sm:min-h-[72px] sm:px-5 sm:py-3">
    <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.12em] uppercase">
      {label}
    </span>
    <span className="text-foreground text-xl leading-none font-semibold tracking-tight tabular-nums sm:text-2xl">
      {value}
    </span>
  </div>
);

export const DashboardOverviewStrip = ({
  upcomingCount,
  pastCount,
  loading,
  className,
}: DashboardOverviewStripProps) => {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2 sm:items-stretch lg:grid-cols-[minmax(0,1fr)_minmax(280px,400px)]",
        className,
      )}
    >
      {loading ? (
        <>
          <Skeleton className="h-[88px] w-full rounded-2xl" />
          <Skeleton className="h-[88px] w-full rounded-2xl" />
        </>
      ) : (
        <>
          <div className="divide-border/50 bg-muted/15 border-border/50 grid grid-cols-2 divide-x rounded-2xl border shadow-sm">
            <MiniStat label={t("dashboard.upcomingTrips")} value={upcomingCount} />
            <MiniStat label={t("dashboard.archivedTrips")} value={pastCount} />
          </div>

          <div className="border-primary/15 from-primary/[0.07] via-background to-muted/40 dark:from-primary/[0.12] dark:via-background dark:to-muted/30 relative overflow-hidden rounded-2xl border bg-gradient-to-br p-[1px] shadow-sm">
            <div className="bg-background/80 dark:bg-background/70 flex h-full flex-col justify-center gap-3 rounded-[15px] px-4 py-3.5 backdrop-blur-[2px] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-4">
              <div className="min-w-0 space-y-0.5">
                <div className="text-primary inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] uppercase">
                  <Ticket className="size-3.5" strokeWidth={2.5} />
                  {t("dashboard.quickBook")}
                </div>
                <p className="text-muted-foreground text-sm leading-snug">
                  {t("dashboard.quickBookHint")}
                </p>
              </div>
              <Button
                asChild
                size="sm"
                className="group/btn shrink-0 gap-2 rounded-full px-5 shadow-sm"
              >
                <Link href="/">
                  <Search className="size-4 opacity-90" strokeWidth={2.25} />
                  {t("dashboard.searchTrips")}
                  <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
                </Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
