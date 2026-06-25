"use client";

import { Star, ShieldCheck } from "lucide-react";
import { SearchBar } from "@/components/shared/search-bar";
import { useTranslation } from "@/hooks/use-translation";

export const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="from-primary/5 via-primary/10 to-primary/0 relative overflow-hidden bg-linear-to-b">
      {/* Layered tinted background */}
      <div
        className="from-primary/15 via-primary/5 to-background absolute inset-0 -z-10 bg-linear-to-br"
        aria-hidden
      />
      <div
        className="bg-primary/10 absolute -top-32 -right-32 -z-10 size-144 rounded-full blur-3xl"
        aria-hidden
      />

      <div className="container mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-4 pt-8 pb-10 md:pt-12 md:pb-10 lg:pt-16 lg:pb-10">
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Copy */}
          <div className="space-y-2.5">
            <h1 className="font-display text-foreground mx-auto max-w-4xl text-4xl leading-[1.08] tracking-tight text-balance md:text-5xl lg:text-6xl">
              {t("landing.headline")}
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-base leading-relaxed text-pretty md:text-lg">
              {t("landing.subheadline")}
            </p>
          </div>

          {/* Social-proof badges — hidden while the mobile menu button is shown (below md) */}
          <div className="hidden flex-wrap items-center justify-center gap-x-8 gap-y-3 md:flex">
            <div className="flex items-center gap-2">
              <div className="text-primary bg-background flex size-9 shrink-0 items-center justify-center rounded-full">
                <Star className="size-4 fill-current" />
              </div>
              <div className="text-left leading-tight">
                <p className="text-foreground text-xs font-semibold">
                  {t("landing.heroBadge.rating")}
                </p>
                <p className="text-muted-foreground text-[11px]">
                  {t("landing.heroBadge.ratingMeta")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-primary bg-background flex size-9 shrink-0 items-center justify-center rounded-full">
                <ShieldCheck className="size-4" />
              </div>
              <div className="text-left leading-tight">
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

        {/* Search */}
        <SearchBar variant="hero" className="w-full max-w-5xl" />
      </div>
    </section>
  );
};
