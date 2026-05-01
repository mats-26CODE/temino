"use client";

import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { MINI_TRIPS, MiniTripCard } from "@/components/shared/hero-illustration";

/** File in `public/` — must match actual filename exactly. */
const AUTH_ARTWORK_BG = "/bg_artwork.png";

/**
 * Auth sign-in/up right column: full-bleed artwork background with stacked trip preview cards on the left.
 */
export const AuthAsideArtwork = ({ className }: { className?: string }) => {
  const { t } = useTranslation();

  const trips = MINI_TRIPS.slice(0, 3);

  return (
    <div
      className={cn(
        "relative hidden min-h-0 flex-1 overflow-hidden lg:flex lg:min-h-0 lg:flex-col",
        className,
      )}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${AUTH_ARTWORK_BG}')` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-background/45 via-muted/20 to-muted/40" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-between gap-8 px-8 py-10 lg:max-w-none lg:flex-1 lg:px-10 lg:py-12">
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-3">
          <div className="flex max-w-[20rem] flex-col gap-3 self-start lg:gap-4">
            {trips.map((trip) => (
              <MiniTripCard key={`${trip.operator}-${trip.destination}`} trip={trip} />
            ))}
          </div>
        </div>

        <p className="text-muted-foreground max-w-xl shrink-0 self-start text-left text-sm leading-relaxed">
          {t("auth.aside.blurb")}
        </p>
      </div>
    </div>
  );
};
