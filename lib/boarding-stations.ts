import { resolveTripStopLabels } from "@/helpers/helpers";

/**
 * Full nested `Route` when the API expands `trip.route` with stations.
 */
export const resolveTripRouteNested = (trip: Trip): Route | null => {
  const rawRoute = trip.route as unknown as Route | string | undefined;
  const nested =
    rawRoute && typeof rawRoute === "object" && !Array.isArray(rawRoute)
      ? (rawRoute as Route)
      : null;

  const hasStations =
    nested?.origin_station?.name?.trim() && nested?.destination_station?.name?.trim();

  return nested && hasStations ? nested : null;
};

export const cityNameFromStation = (st: Station | undefined | null): string => {
  const c = st?.city;
  return typeof c === "object" && c?.name
    ? c.name.trim()
    : typeof c === "string"
      ? c.trim()
      : "";
};

/** Passengers choose where they board / alight for the trip’s origin and destination cities. */
export const boardingStationOptionsForTrip = (trip: Trip, pickup: boolean): Station[] => {
  const stationId = pickup ? trip.origin_station_id : trip.destination_station_id;
  const stationName = pickup ? trip.origin_station_name : trip.destination_station_name;
  const cityName = pickup ? trip.origin_city_name : trip.destination_city_name;

  if (stationId && stationName?.trim()) {
    return [
      {
        id: String(stationId),
        name: stationName.trim(),
        city: cityName?.trim()
          ? ({ id: "", name: cityName.trim() } as City)
          : undefined,
      },
    ];
  }

  const route = resolveTripRouteNested(trip);
  const hub = pickup ? route?.origin_station : route?.destination_station;
  if (hub?.name?.trim()) return [{ ...hub }];

  const labels = resolveTripStopLabels(trip);
  const lbl = (pickup ? labels.origin : labels.destination).trim();
  return lbl ? [{ id: `${pickup ? "origin" : "dest"}-${trip.id}`, name: lbl }] : [];
};

/** Default stations (first hub option in each list) when the user opens the seat step. */
export const initialBoardingSelectionForTrip = (trip: Trip): {
  pickup: Station;
  dropoff: Station;
} => {
  const pickups = boardingStationOptionsForTrip(trip, true);
  const drops = boardingStationOptionsForTrip(trip, false);
  return {
    pickup: pickups[0] as Station,
    dropoff: drops[0] as Station,
  };
};
