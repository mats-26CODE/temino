"use client";

import { useEffect, useMemo } from "react";
import { BusFront as BusFrontIcon } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  boardingStationOptionsForTrip,
  cityNameFromStation,
  resolveTripRouteNested,
} from "@/lib/boarding-stations";
import { useBookingStore } from "@/lib/stores/booking-store";
import { useTranslation } from "@/hooks/use-translation";

interface BoardingStationsCardProps {
  trip: Trip;
}

export const BoardingStationsCard = ({ trip }: BoardingStationsCardProps) => {
  const { t } = useTranslation();
  const pickupStation = useBookingStore((s) => s.pickupStation);
  const dropoffStation = useBookingStore((s) => s.dropoffStation);
  const setPickupStation = useBookingStore((s) => s.setPickupStation);
  const setDropoffStation = useBookingStore((s) => s.setDropoffStation);

  const pickupOptions = useMemo(() => boardingStationOptionsForTrip(trip, true), [trip]);
  const dropoffOptions = useMemo(() => boardingStationOptionsForTrip(trip, false), [trip]);

  const route = useMemo(() => resolveTripRouteNested(trip), [trip]);
  const originCity = useMemo(() => {
    const fromRoute = cityNameFromStation(route?.origin_station);
    if (fromRoute) return fromRoute;
    if (typeof trip.route === "object" && trip.route && "origin" in trip.route) {
      const o = (trip.route as Route).origin;
      return typeof o === "string" ? o : "";
    }
    return "";
  }, [route?.origin_station, trip.route]);

  const destCity = useMemo(() => {
    const fromRoute = cityNameFromStation(route?.destination_station);
    if (fromRoute) return fromRoute;
    if (typeof trip.route === "object" && trip.route && "destination" in trip.route) {
      const d = (trip.route as Route).destination;
      return typeof d === "string" ? d : "";
    }
    return "";
  }, [route?.destination_station, trip.route]);

  useEffect(() => {
    if (pickupStation && !pickupOptions.some((s) => s.id === pickupStation.id)) {
      setPickupStation(pickupOptions[0] ?? null);
    }
  }, [pickupOptions, pickupStation, setPickupStation]);

  useEffect(() => {
    if (dropoffStation && !dropoffOptions.some((s) => s.id === dropoffStation.id)) {
      setDropoffStation(dropoffOptions[0] ?? null);
    }
  }, [dropoffOptions, dropoffStation, setDropoffStation]);

  const pickupValue = pickupStation?.id ?? pickupOptions[0]?.id ?? "";
  const dropoffValue = dropoffStation?.id ?? dropoffOptions[0]?.id ?? "";

  return (
    <Card className="pb-0">
      <CardHeader>
        <CardTitle className="text-lg font-bold tracking-tight">
          {t("seat.boarding.title")}
        </CardTitle>
      </CardHeader>
      <div className="-mt-3 flex flex-col gap-4 px-6 pb-6 md:flex-row md:gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            {t("seat.boarding.pickupLabel", { city: originCity || "—" })}
          </Label>
          <Select
            value={pickupValue}
            onValueChange={(id) => {
              const next = pickupOptions.find((s) => s.id === id);
              if (next) setPickupStation(next);
            }}
          >
            <SelectTrigger className="w-full">
              <div className="flex min-w-0 items-center gap-2">
                <BusFrontIcon className="text-muted-foreground size-4 shrink-0" />
                <SelectValue placeholder={t("seat.boarding.placeholder")} />
              </div>
            </SelectTrigger>
            <SelectContent>
              {pickupOptions.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <span className="font-medium">{s.name}</span>
                  {s.address ? (
                    <span className="text-muted-foreground block text-xs">{s.address}</span>
                  ) : null}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            {t("seat.boarding.dropoffLabel", { city: destCity || "—" })}
          </Label>
          <Select
            value={dropoffValue}
            onValueChange={(id) => {
              const next = dropoffOptions.find((s) => s.id === id);
              if (next) setDropoffStation(next);
            }}
          >
            <SelectTrigger className="w-full">
              <div className="flex min-w-0 items-center gap-2">
                <BusFrontIcon className="text-muted-foreground size-4 shrink-0 rotate-180" />
                <SelectValue placeholder={t("seat.boarding.placeholder")} />
              </div>
            </SelectTrigger>
            <SelectContent>
              {dropoffOptions.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <span className="font-medium">{s.name}</span>
                  {s.address ? (
                    <span className="text-muted-foreground block text-xs">{s.address}</span>
                  ) : null}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};
