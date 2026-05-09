"use client";

import { Star, ShieldCheck } from "lucide-react";
import { SearchBar } from "@/components/shared/search-bar";
import { HeroIllustration } from "@/components/shared/hero-illustration";
import { HeroSectionDesktop } from "@/components/shared/hero-section-desktop";
import { useTranslation } from "@/hooks/use-translation";

export const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-primary/5 relative overflow-hidden">
      {/* Layered tinted background */}
      <div
        className="from-primary/15 via-primary/5 to-background absolute inset-0 -z-10 bg-linear-to-br"
        aria-hidden
      />
      <div
        className="bg-primary/10 absolute -top-32 -right-32 -z-10 size-144 rounded-full blur-3xl"
        aria-hidden
      />

      {/* Full hero: below md only */}
      <div className="container mx-auto w-full px-4 pt-6 pb-4 md:hidden">
        <div className="grid items-center gap-5">
          {/* Left: copy — first on mobile so search can sit directly under the intro */}
          <div className="flex flex-col gap-3">
            <div className="space-y-2">
              <h1 className="font-display text-foreground text-5xl leading-[1.05] tracking-tight text-balance lg:text-6xl">
                {t("landing.headline")}
              </h1>
              <p className="text-muted-foreground max-w-xl text-base leading-relaxed text-pretty">
                {t("landing.subheadline")}
              </p>
            </div>

            <SearchBar variant="hero" />

            {/* Social-proof badges */}
            <div className="my-5 flex flex-wrap items-center gap-x-4 gap-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
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
                <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
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

          {/* Illustration */}
          <div className="relative -mt-1">
            <HeroIllustration />
          </div>
        </div>
      </div>

      {/* Compact hero + search: md and up */}
      <div className="hidden md:block">
        <HeroSectionDesktop />
        <div className="container mx-auto w-full max-w-6xl px-4 pt-1 pb-8 lg:pb-10">
          <SearchBar variant="hero" />
        </div>
      </div>
    </section>
  );
};
