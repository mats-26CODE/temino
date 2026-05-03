"use client";

import { Star, ShieldCheck } from "lucide-react";
import { SearchBar } from "@/components/shared/search-bar";
import { HeroIllustration } from "@/components/shared/hero-illustration";
import { useTranslation } from "@/hooks/use-translation";

export const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden">
      {/* Layered tinted background */}
      <div
        className="from-primary/15 via-primary/5 to-background absolute inset-0 -z-10 bg-linear-to-br"
        aria-hidden
      />
      <div
        className="bg-primary/10 absolute -top-32 -right-32 -z-10 size-144 rounded-full blur-3xl"
        aria-hidden
      />

      <div className="container mx-auto w-full px-4 pt-6 pb-6 md:max-w-6xl md:pt-8 md:pb-10">
        <div className="grid items-center gap-5 md:grid-cols-2 md:gap-10 md:gap-y-6">
          {/* Left: copy — first on mobile so search can sit directly under the intro */}
          <div className="flex flex-col gap-3 md:gap-6">
            <div className="space-y-1.5 md:space-y-2">
              <h1 className="font-display text-foreground text-4xl text-balance md:text-6xl lg:text-7xl">
                {t("landing.headline")}
              </h1>
              <p className="text-muted-foreground max-w-xl text-base leading-relaxed text-pretty md:text-xl">
                {t("landing.subheadline")}
              </p>
            </div>

            {/* Search: high on small screens so it is visible without scrolling */}
            <div className="md:hidden">
              <SearchBar variant="hero" />
            </div>

            {/* Social-proof badges */}
            <div className="my-5 flex flex-wrap items-center gap-x-4 gap-y-4 md:mt-6 md:mb-6 md:gap-x-6 md:gap-y-3">
              <div className="flex items-center gap-2 md:gap-2.5">
                <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg md:size-10 md:rounded-xl">
                  <Star className="size-4 fill-current md:size-5" />
                </div>
                <div className="leading-tight">
                  <p className="text-foreground text-xs font-semibold md:text-sm">
                    {t("landing.heroBadge.rating")}
                  </p>
                  <p className="text-muted-foreground text-[11px] md:text-xs">
                    {t("landing.heroBadge.ratingMeta")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-2.5">
                <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg md:size-10 md:rounded-xl">
                  <ShieldCheck className="size-4 md:size-5" />
                </div>
                <div className="leading-tight">
                  <p className="text-foreground text-xs font-semibold md:text-sm">
                    {t("landing.heroBadge.bookings")}
                  </p>
                  <p className="text-muted-foreground text-[11px] md:text-xs">
                    {t("landing.heroBadge.bookingsMeta")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: illustration — natural column order on mobile (after copy + search + badges) */}
          <div className="relative max-md:-mt-1 md:-mt-16 md:self-center lg:-mt-5 lg:self-start 2xl:self-center">
            <HeroIllustration />
          </div>
        </div>

        {/* Bottom: search on md+ (mobile uses inline instance above) */}
        <div className="mt-1.5 hidden md:mt-2 md:block">
          <SearchBar variant="hero" />
        </div>
      </div>
    </section>
  );
};
