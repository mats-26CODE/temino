"use client";

import { MapPin, Star } from "lucide-react";
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
      "max-md:z-[1] max-md:w-full max-md:max-w-[19rem] max-md:rotate-0 max-md:scale-100 md:max-w-[17rem] md:origin-top md:scale-[0.94] md:translate-x-2 md:rotate-[-3deg] lg:max-w-[20rem] lg:origin-center lg:scale-100",
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
      "max-md:z-[2] max-md:w-full max-md:max-w-[19rem] max-md:rotate-0 max-md:scale-100 md:z-10 md:max-w-[17rem] md:origin-top md:scale-[0.94] md:-translate-x-4 md:translate-y-1.5 md:rotate-[2deg] lg:max-w-[20rem] lg:origin-center lg:scale-100 lg:translate-y-3",
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

export const MiniTripCard = ({ trip }: { trip: MiniTrip }) => (
  <MarketingTripCard
    title={trip.operator}
    origin={trip.origin}
    destination={trip.destination}
    depart={trip.depart}
    arrive={trip.arrive}
    duration={trip.duration}
    price={trip.price}
    rating={trip.rating}
    className={trip.className}
  />
);

/**
 * Decorative hero illustration: stacked, slightly-rotated mini trip cards.
 * Mirrors the product UI (recommendation cards) inside the hero, which is a
 * known SaaS pattern for showing the product in the hero without static art.
 */
export const HeroIllustration = () => {
  return (
    <div className="relative isolate aspect-16/11 w-full max-md:-mt-6 max-md:aspect-auto max-md:min-h-58 max-md:pb-9 md:-mt-6 md:aspect-5/4 md:max-h-none md:pb-0 lg:mt-0">
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

      {/* Mini cards: vertical stack on mobile (readable, no horizontal overlap); layered column on md+ */}
      <div className="flex flex-col items-center justify-center gap-2 max-md:relative max-md:inset-auto max-md:mt-9 max-md:w-full md:absolute md:inset-0 md:-top-24 md:mt-0 md:justify-start md:pt-8 md:gap-1.5 md:px-6 lg:-top-10 lg:justify-center lg:pt-0 lg:gap-2 lg:px-8">
        {MINI_TRIPS.map((trip) => (
          <MiniTripCard key={`${trip.operator}-${trip.destination}`} trip={trip} />
        ))}
      </div>

      {/* Floating accent chip — z above cards; tucked clear on mobile */}
      <div className="bg-primary text-primary-foreground absolute bottom-4 z-30 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold shadow-lg max-md:right-auto max-md:bottom-3 max-md:left-1/2 max-md:-translate-x-1/2 max-md:text-[9px] md:right-4 md:left-auto md:translate-x-0 md:gap-1.5 md:px-3 md:py-1.5 md:text-[11px] lg:bottom-8 lg:right-4">
        <Star className="size-2.5 fill-current md:size-3" />
        <span className="max-md:hidden">Trusted by 10K+ travellers</span>
        <span className="md:hidden">10K+ travellers</span>
      </div>
    </div>
  );
};
