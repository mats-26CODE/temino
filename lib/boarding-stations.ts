import { resolveTripStopLabels } from "@/helpers/helpers";
import { MOCK_BOARDING_STATIONS_FOR_CITY, MOCK_ROUTES } from "@/lib/mocks/trips";

const TZ_COUNTRY: Country = { id: "tz", name: "Tanzania", code: "TZ" };

/**
 * Best-effort full `Route` shape for the trip — matches how `resolveTripStopLabels`
 * resolves mock routes when the API sends only `route_code` / city strings.
 */
export const resolveTripRouteNested = (trip: Trip): Route | null => {
  const rawRoute = trip.route as unknown as Route | string | undefined;
  const nested =
    rawRoute && typeof rawRoute === "object" && !Array.isArray(rawRoute)
      ? (rawRoute as Route)
      : null;

  const hasStations =
    nested?.origin_station?.name?.trim() && nested?.destination_station?.name?.trim();

  if (nested && hasStations) return nested;

  const tripRouteCode = trip.route_code?.trim() ?? "";
  const codeRaw =
    tripRouteCode ||
    (nested?.route_code ?? nested?.code ?? "").toString().trim();
  if (codeRaw) {
    const upper = codeRaw.toUpperCase();
    const mock = MOCK_ROUTES.find(
      (m) =>
        m.route_code.toUpperCase() === upper ||
        (Boolean(m.code) && m.code!.toUpperCase() === upper),
    );
    if (mock) return mock;
  }

  const originCity =
    nested && typeof nested.origin === "string" ? nested.origin.trim() : "";
  const destCity =
    nested && typeof nested.destination === "string" ? nested.destination.trim() : "";
  if (originCity && destCity) {
    const mock = MOCK_ROUTES.find((m) => m.origin === originCity && m.destination === destCity);
    if (mock) return mock;
  }

  return nested;
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
  const route = resolveTripRouteNested(trip);
  const hub = pickup ? route?.origin_station : route?.destination_station;
  const cityKey = cityNameFromStation(hub).trim();
  const pool = cityKey ? MOCK_BOARDING_STATIONS_FOR_CITY[cityKey] : undefined;
  if (pool?.length) return pool;
  if (hub?.name?.trim()) return [{ ...hub }];

  const labels = resolveTripStopLabels(trip);
  const lbl = (pickup ? labels.origin : labels.destination).trim();
  return [
    {
      id: `${pickup ? "pickup" : "dropoff"}-fallback-${trip.id}`,
      name: lbl || (pickup ? "Origin" : "Destination"),
      city: {
        id: "",
        name: lbl,
        region: { id: "", name: "", country: TZ_COUNTRY },
      },
    },
  ];
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
