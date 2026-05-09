"use client";

import { Star, ShieldCheck } from "lucide-react";
import { HeroIllustration } from "@/components/shared/hero-illustration";
import { useTranslation } from "@/hooks/use-translation";

/**
 * Compact landing hero for md+ viewports: copy + trust badges + small stacked cards,
 * then search sits directly below in `HeroSection`.
 */
export const HeroSectionDesktop = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto w-full max-w-6xl px-4 pt-6 pb-3 md:pt-7 md:pb-4 lg:pt-8 lg:pb-5">
      <div className="flex flex-col items-stretch gap-6 md:flex-row md:items-start md:gap-8 lg:gap-10">
        <div className="min-w-0 flex-1">
          <div className="space-y-1.5">
            <h1 className="font-display text-foreground text-4xl leading-[1.12] text-balance md:text-5xl md:leading-[1.1] lg:text-6xl lg:leading-[1.08]">
              {t("landing.headline")}
            </h1>
            <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed text-pretty md:text-[0.9375rem] lg:text-base">
              {t("landing.subheadline")}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                <Star className="size-4 fill-current" />
              </div>
              <div className="leading-tight">
                <p className="text-foreground text-xs font-semibold">
                  {t("landing.heroBadge.rating")}
                </p>
                <p className="text-muted-foreground text-[11px]">
                  {t("landing.heroBadge.ratingMeta")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                <ShieldCheck className="size-4" />
              </div>
              <div className="leading-tight">
                <p className="text-foreground text-xs font-semibold">
                  {t("landing.heroBadge.bookings")}
                </p>
                <p className="text-muted-foreground text-[11px]">
                  {t("landing.heroBadge.bookingsMeta")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 md:pl-2 lg:pl-6">
          <HeroIllustration variant="compact" />
        </div>
      </div>
    </div>
  );
};
