"use client";

import { ArrowRight, Bus, MapPin, Star, Wifi, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

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
  <div
    className={cn(
      "bg-card/95 ring-border/40 supports-backdrop-filter:bg-card/80 w-full max-w-[20rem] rounded-2xl p-3 shadow-xl ring-1 transition-transform hover:scale-[1.02] supports-backdrop-filter:backdrop-blur",
      trip.className,
    )}
  >
    <div className="flex items-center gap-2.5">
      <div className="bg-primary/15 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
        <Bus className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-[13px] leading-tight font-semibold">
          {trip.operator}
        </p>
        <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            {trip.rating.toFixed(1)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Wifi className="size-3" />
          </span>
          <span className="inline-flex items-center gap-1">
            <Zap className="size-3" />
          </span>
        </div>
      </div>
      <div className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold">
        {trip.price}
      </div>
    </div>

    <div className="mt-3 flex items-center gap-2">
      <div className="text-left">
        <p className="text-foreground text-[15px] leading-none font-bold">{trip.depart}</p>
        <p className="text-muted-foreground mt-0.5 truncate text-[10px]">{trip.origin}</p>
      </div>
      <div className="flex flex-1 flex-col items-center gap-0.5">
        <span className="text-muted-foreground text-[10px]">{trip.duration}</span>
        <div className="bg-border relative h-px w-full">
          <div className="bg-primary absolute top-1/2 left-0 size-1 -translate-y-1/2 rounded-full" />
          <div className="bg-primary absolute top-1/2 right-0 size-1 -translate-y-1/2 rounded-full" />
        </div>
        <ArrowRight className="text-muted-foreground/70 size-3" />
      </div>
      <div className="text-right">
        <p className="text-foreground text-[15px] leading-none font-bold">{trip.arrive}</p>
        <p className="text-muted-foreground mt-0.5 truncate text-[10px]">{trip.destination}</p>
      </div>
    </div>
  </div>
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
