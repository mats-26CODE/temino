"use client";

import { MapPin, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketingTripCard } from "@/components/dashboard/trip-booking-card";

interface MiniTrip {
  operator: string;
  origin: string;
  destination: string;
  depart: string;
  arrive: string;
  duration: string;
  price: string;
  rating: number;
  className?: string;
}

export const MINI_TRIPS: MiniTrip[] = [
  {
    operator: "Kilimanjaro Express",
    origin: "Dar es Salaam",
    destination: "Arusha",
    depart: "06:30",
    arrive: "14:00",
    duration: "7h 30m",
    price: "TSh 45,000",
    rating: 4.8,
    className:
      "max-md:z-1 w-full max-sm:max-w-none! max-md:rotate-0 max-md:scale-100 sm:min-w-0 sm:flex-1 sm:basis-0 sm:max-w-none md:max-w-[17rem] md:origin-top md:scale-[0.94] md:translate-x-2 md:rotate-[-3deg] lg:max-w-[20rem] lg:origin-center lg:scale-100",
  },
  {
    operator: "Shabiby Line",
    origin: "Dar es Salaam",
    destination: "Dodoma",
    depart: "08:15",
    arrive: "14:00",
    duration: "5h 45m",
    price: "TSh 32,000",
    rating: 4.6,
    className:
      "max-md:z-2 w-full max-sm:max-w-none! max-md:rotate-0 max-md:scale-100 sm:min-w-0 sm:flex-1 sm:basis-0 sm:max-w-none md:z-10 md:max-w-[17rem] md:origin-top md:scale-[0.94] md:-translate-x-4 md:translate-y-1.5 md:rotate-[2deg] lg:max-w-[20rem] lg:origin-center lg:scale-100 lg:translate-y-3",
  },
  {
    operator: "Abood Bus Service",
    origin: "Dar es Salaam",
    destination: "Mwanza",
    depart: "16:00",
    arrive: "08:30",
    duration: "16h 30m",
    price: "TSh 65,000",
    rating: 4.7,
    className:
      "max-md:hidden md:max-w-[17rem] md:origin-top md:scale-[0.94] md:translate-x-6 md:translate-y-1 md:rotate-[-1deg] lg:max-w-[20rem] lg:origin-center lg:scale-100 lg:translate-y-2",
  },
];

/** First two trips — paired flex illustration on desktop compact hero. */
const DESKTOP_HERO_TRIP_PAIR = MINI_TRIPS.slice(0, 2);

export const MiniTripCard = ({
  trip,
  compact,
  layoutClassName,
}: {
  trip: MiniTrip;
  compact?: boolean;
  layoutClassName?: string;
}) => (
  <MarketingTripCard
    title={trip.operator}
    origin={trip.origin}
    destination={trip.destination}
    depart={trip.depart}
    arrive={trip.arrive}
    duration={trip.duration}
    price={trip.price}
    rating={trip.rating}
    compact={compact}
    className={cn(compact ? layoutClassName : trip.className)}
  />
);

export type HeroIllustrationVariant = "default" | "compact";

export type HeroIllustrationProps = {
  variant?: HeroIllustrationVariant;
};

/**
 * Decorative hero illustration: stacked, slightly-rotated mini trip cards.
 * Mirrors the product UI (recommendation cards) inside the hero, which is a
 * known SaaS pattern for showing the product in the hero without static art.
 *
 * `compact` — md+ desktop hero: two equal-width small cards, one shifted up and one
 * absolutely anchored lower with breathing room between them.
 */
export const HeroIllustration = ({ variant = "default" }: HeroIllustrationProps) => {
  if (variant === "compact") {
    const cardShell = "w-64 min-w-64 max-w-64 shadow-xs ring-border/35 ring-1";

    const [upperTrip, lowerTrip] = DESKTOP_HERO_TRIP_PAIR;

    return (
      <div className="pointer-events-none relative isolate ml-auto h-50 w-[min(100%,19.5rem)] shrink-0 origin-right scale-90 overflow-visible pt-1 pl-4 md:h-54 md:w-86 md:scale-[0.94] md:pl-6 lg:h-56 lg:w-92 lg:scale-[0.96]">
        <div
          className="bg-primary/12 absolute -inset-x-8 -inset-y-6 -z-10 rounded-4xl blur-2xl"
          aria-hidden
        />

        {/* Upper card */}
        <div className="absolute top-1 left-0 z-1 w-52 rotate-[-5deg]">
          <MiniTripCard trip={upperTrip} compact layoutClassName={cardShell} />
        </div>

        {/* Lower card — offset down & right for separation */}
        <div className="absolute right-10 bottom-2 z-2 w-52 rotate-3 md:bottom-2 lg:bottom-3">
          <MiniTripCard trip={lowerTrip} compact layoutClassName={cardShell} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative isolate aspect-16/11 w-full max-md:-mt-6 max-md:aspect-auto max-md:min-h-0 max-md:pb-1 md:-mt-6 md:aspect-5/4 md:max-h-none md:pb-0 lg:mt-0">
      {/* Soft background blob */}
      <div
        className="bg-primary/15 absolute -top-6 -right-6 size-56 rounded-full blur-3xl max-md:opacity-80 md:size-96"
        aria-hidden
      />
      <div
        className="bg-primary/10 absolute bottom-0 left-0 size-44 rounded-full blur-3xl max-md:opacity-80 md:size-72"
        aria-hidden
      />

      {/* Floating route badge — above cards on mobile so it is not covered */}
      <div className="bg-card ring-border/40 absolute top-1 left-2 z-30 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium shadow-md ring-1 max-md:top-1 max-md:left-1/2 max-md:-translate-x-1/2 md:top-0 md:left-5 md:translate-x-0 md:gap-1.5 md:px-3 md:py-1.5 md:text-[11px] lg:top-2 lg:left-6 lg:gap-1.5 lg:px-3 lg:py-1.5 lg:text-[11px]">
        <MapPin className="text-primary size-2.5 md:size-3" />
        <span className="text-foreground">DAR → ARU</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground max-md:hidden">7h 30m</span>
      </div>

      {/* Cards + chip: <md chip hugs bottom of cards via absolute top-full + negative translate-y */}
      <div className="relative mt-9 w-full max-w-full md:absolute md:inset-0 md:-top-24 md:mt-0 md:flex md:max-w-none md:flex-col md:justify-start md:gap-1.5 md:px-6 md:pt-8 lg:-top-10 lg:justify-center lg:gap-2 lg:px-8 lg:pt-0">
        <div className="relative w-full max-md:pb-1 md:static md:flex-1">
          <div className="flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-nowrap sm:items-stretch sm:gap-3 md:flex-col md:items-center md:justify-start md:gap-1.5 lg:gap-2">
            {MINI_TRIPS.map((trip) => (
              <MiniTripCard key={`${trip.operator}-${trip.destination}`} trip={trip} />
            ))}
          </div>

          <div className="bg-primary text-primary-foreground absolute top-full left-1/2 z-30 inline-flex -translate-x-1/2 translate-y-[-62%] items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold whitespace-nowrap shadow-lg max-md:text-[9px] md:inset-x-auto md:top-auto md:right-4 md:bottom-6 md:left-auto md:translate-x-0 md:translate-y-0 md:gap-1.5 md:px-3 md:py-1.5 md:text-[11px] lg:bottom-8">
            <Star className="size-2.5 fill-current md:size-3" />
            <span className="max-md:hidden">Trusted by 10K+ travellers</span>
            <span className="md:hidden">10K+ travellers</span>
          </div>
        </div>
      </div>
    </div>
  );
};
