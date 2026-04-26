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

      <div className="container mx-auto w-full px-4 pt-8 pb-6 md:max-w-6xl md:pt-8 md:pb-10">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-10">
          {/* Left: copy */}
          <div className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <h1 className="font-display text-foreground text-5xl text-balance md:text-7xl">
                {t("landing.headline")}
              </h1>
              <p className="text-muted-foreground max-w-xl text-lg leading-relaxed text-pretty md:text-xl">
                {t("landing.subheadline")}
              </p>
            </div>

            {/* Social-proof badges */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2.5">
                <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                  <Star className="size-5 fill-current" />
                </div>
                <div className="leading-tight">
                  <p className="text-foreground text-sm font-semibold">
                    {t("landing.heroBadge.rating")}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {t("landing.heroBadge.ratingMeta")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                  <ShieldCheck className="size-5" />
                </div>
                <div className="leading-tight">
                  <p className="text-foreground text-sm font-semibold">
                    {t("landing.heroBadge.bookings")}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {t("landing.heroBadge.bookingsMeta")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: illustration */}
          <div className="relative order-first md:order-last">
            <HeroIllustration />
          </div>
        </div>

        {/* Bottom: search bar (full-width pill) */}
        <div className="mt-1.5 md:mt-2">
          <SearchBar variant="hero" />
        </div>
      </div>
    </section>
  );
};
