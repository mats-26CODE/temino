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
    className: "rotate-[-3deg] md:translate-x-2",
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
    className: "rotate-[2deg] md:-translate-x-4 md:translate-y-3",
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
    className: "rotate-[-1deg] md:translate-x-6 md:translate-y-2",
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
    <div className="relative isolate aspect-4/3 w-full md:aspect-5/4">
      {/* Soft background blob */}
      <div
        className="bg-primary/15 absolute -top-6 -right-6 size-72 rounded-full blur-3xl md:size-96"
        aria-hidden
      />
      <div
        className="bg-primary/10 absolute bottom-0 left-0 size-56 rounded-full blur-3xl md:size-72"
        aria-hidden
      />

      {/* Floating route badge */}
      <div className="bg-card ring-border/40 absolute top-2 left-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium shadow-md ring-1 md:left-6">
        <MapPin className="text-primary size-3" />
        <span className="text-foreground">DAR → ARU</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">7h 30m</span>
      </div>

      {/* Stacked mini cards */}
      <div className="absolute inset-0 -top-10 flex flex-col items-center justify-center gap-3 px-4 md:gap-2 md:px-8">
        {MINI_TRIPS.map((trip) => (
          <MiniTripCard key={`${trip.operator}-${trip.destination}`} trip={trip} />
        ))}
      </div>

      {/* Floating accent chip */}
      <div className="bg-primary text-primary-foreground absolute right-2 bottom-8 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-lg md:right-4">
        <Star className="size-3 fill-current" />
        Trusted by 10K+ travellers
      </div>
    </div>
  );
};
