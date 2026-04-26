/**
 * Mock data for the recommendations section (and any other "no real data yet"
 * surfaces). Shapes mirror the `temino-api` Django models so the component
 * code never has to change when the live backend takes over.
 *
 * Design notes:
 * - Operators / buses / stations / routes are deduplicated and shared between
 *   trips, so the data graph is internally consistent.
 * - Trip departure / arrival times are relative to "now" (computed at call
 *   time in `buildMockTrips`) so the recommendations always look fresh.
 * - Real Tanzanian operator names are used to keep the UI plausible.
 */

import dayjs from "dayjs";

const TZ = "Tanzania";

// ── Operators ────────────────────────────────────────────────────────────────
export const MOCK_OPERATORS: Operator[] = [
  {
    id: "op-001",
    name: "Kilimanjaro Express",
    code: "KEX",
    contact_email: "info@kilimanjaroexpress.co.tz",
    phone_number: "+255 22 218 4500",
    website: "https://kilimanjaroexpress.co.tz",
    description: "Premier long-distance coach service across northern Tanzania.",
    managers: [
      { id: "u-101", full_name: "Joseph Mushi", email: "joseph@kilimanjaroexpress.co.tz" },
      { id: "u-102", full_name: "Anna Kimaro", email: "anna@kilimanjaroexpress.co.tz" },
    ],
    rating: 4.7,
  },
  {
    id: "op-002",
    name: "Shabiby Bus Service",
    code: "SHB",
    contact_email: "support@shabiby.co.tz",
    phone_number: "+255 22 215 5021",
    website: "https://shabiby.co.tz",
    description: "Tanzania's everyday inter-city coach line, serving the southern corridor.",
    managers: [{ id: "u-201", full_name: "Hassan Shabiby", email: "hassan@shabiby.co.tz" }],
    rating: 4.4,
  },
  {
    id: "op-003",
    name: "Royal Coach",
    code: "RCH",
    contact_email: "bookings@royalcoach.co.tz",
    phone_number: "+255 22 277 0810",
    website: "https://royalcoach.co.tz",
    description: "VIP and Executive class long-haul coaches with onboard refreshments.",
    managers: [{ id: "u-301", full_name: "Grace Mwita" }],
    rating: 4.6,
  },
  {
    id: "op-004",
    name: "Sumry Bus",
    code: "SUM",
    contact_email: "info@sumry.co.tz",
    phone_number: "+255 22 245 1199",
    website: "https://sumry.co.tz",
    description: "Reliable daily departures across central and northern Tanzania.",
    managers: [{ id: "u-401", full_name: "Daniel Massawe" }],
    rating: 4.3,
  },
  {
    id: "op-005",
    name: "Dar Express",
    code: "DEX",
    contact_email: "hello@darexpress.co.tz",
    phone_number: "+255 22 211 9090",
    website: "https://darexpress.co.tz",
    description: "Express coastal-to-inland coach service operating out of Dar es Salaam.",
    managers: [{ id: "u-501", full_name: "Salim Juma" }],
    rating: 4.5,
  },
  {
    id: "op-006",
    name: "Abood Bus Service",
    code: "ABD",
    contact_email: "info@aboodbus.co.tz",
    phone_number: "+255 23 261 4080",
    website: "https://aboodbus.co.tz",
    description: "Long-running Morogoro-based operator with a focus on safety.",
    managers: [{ id: "u-601", full_name: "Mohamed Abood" }],
    rating: 4.2,
  },
];

const opByCode = (code: string): Operator => {
  const op = MOCK_OPERATORS.find((o) => o.code === code);
  if (!op) throw new Error(`Unknown operator code: ${code}`);
  return op;
};

// ── Stations (one main terminal per major city) ──────────────────────────────
const station = (id: string, city: string, name: string, lat: number, lng: number): Station => ({
  id,
  name,
  city: {
    id: `city-${id}`,
    name: city,
    region: { id: `region-${id}`, name: city, country: { id: "tz", name: TZ, code: "TZ" } },
  },
  latitude: lat,
  longitude: lng,
});

export const MOCK_STATIONS: Record<string, Station> = {
  DAR: station("st-dar", "Dar es Salaam", "Ubungo Bus Terminal", -6.7732, 39.2097),
  ARU: station("st-aru", "Arusha", "Arusha Main Terminal", -3.3854, 36.6829),
  DOM: station("st-dom", "Dodoma", "Dodoma Bus Terminal", -6.1722, 35.7395),
  MWZ: station("st-mwz", "Mwanza", "Buzuruga Bus Terminal", -2.5164, 32.9175),
  MBE: station("st-mbe", "Mbeya", "Mwanjelwa Bus Terminal", -8.9094, 33.4608),
  IRI: station("st-iri", "Iringa", "Iringa Bus Stand", -7.7706, 35.6889),
  MOR: station("st-mor", "Morogoro", "Msamvu Bus Terminal", -6.8278, 37.6591),
  MOS: station("st-mos", "Moshi", "Moshi Bus Terminal", -3.35, 37.3333),
  TAN: station("st-tan", "Tanga", "Tanga Bus Stand", -5.0689, 39.0986),
};

// ── Routes ───────────────────────────────────────────────────────────────────
const route = (
  code: string,
  origin: keyof typeof MOCK_STATIONS,
  destination: keyof typeof MOCK_STATIONS,
  distance_km: number,
  estimated_duration_minutes: number,
): Route => ({
  id: `route-${code.toLowerCase()}`,
  route_code: code,
  origin_station: MOCK_STATIONS[origin],
  destination_station: MOCK_STATIONS[destination],
  distance_km,
  estimated_duration_minutes,
  origin: (MOCK_STATIONS[origin].city as City).name,
  destination: (MOCK_STATIONS[destination].city as City).name,
  code,
  duration_minutes: estimated_duration_minutes,
});

export const MOCK_ROUTES: Route[] = [
  route("DAR-ARU", "DAR", "ARU", 638, 9 * 60),
  route("DAR-DOM", "DAR", "DOM", 453, 6 * 60 + 30),
  route("DAR-MWZ", "DAR", "MWZ", 1148, 17 * 60),
  route("DAR-MBE", "DAR", "MBE", 815, 12 * 60),
  route("DAR-IRI", "DAR", "IRI", 502, 7 * 60 + 30),
  route("DAR-MOR", "DAR", "MOR", 196, 3 * 60 + 30),
  route("DAR-TAN", "DAR", "TAN", 354, 5 * 60 + 30),
  route("ARU-DAR", "ARU", "DAR", 638, 9 * 60),
  route("ARU-MOS", "ARU", "MOS", 79, 1 * 60 + 30),
  route("ARU-MWZ", "ARU", "MWZ", 692, 11 * 60),
  route("DOM-DAR", "DOM", "DAR", 453, 6 * 60 + 30),
  route("DOM-MWZ", "DOM", "MWZ", 696, 11 * 60),
  route("MWZ-DAR", "MWZ", "DAR", 1148, 17 * 60),
  route("MBE-DAR", "MBE", "DAR", 815, 12 * 60),
  route("IRI-DAR", "IRI", "DAR", 502, 7 * 60 + 30),
  route("MOR-DAR", "MOR", "DAR", 196, 3 * 60 + 30),
];

const routeByCode = (code: string): Route => {
  const r = MOCK_ROUTES.find((rt) => rt.route_code === code);
  if (!r) throw new Error(`Unknown route code: ${code}`);
  return r;
};

// ── Buses ────────────────────────────────────────────────────────────────────
const bus = (
  id: string,
  opCode: string,
  plate_number: string,
  bus_number: string,
  bus_type: BusType,
  capacity: number,
  manufacture_year: number,
  amenities: string[],
): Bus => {
  const operator = opByCode(opCode);
  return {
    id,
    operator,
    plate_number,
    bus_number,
    bus_type,
    capacity,
    manufacture_year,
    is_active: true,
    amenities,
    total_seats: capacity,
    bus_class: bus_type,
  };
};

export const MOCK_BUSES: Bus[] = [
  bus("bus-001", "KEX", "T 234 ABC", "KEX-07", "vip", 49, 2022, [
    "wifi",
    "socket",
    "ac",
    "tv",
    "reclining",
  ]),
  bus("bus-002", "KEX", "T 412 DEF", "KEX-12", "executive", 45, 2021, [
    "wifi",
    "socket",
    "ac",
    "reclining",
  ]),
  bus("bus-003", "SHB", "T 318 GHI", "SHB-04", "standard", 60, 2020, ["socket", "ac"]),
  bus("bus-004", "SHB", "T 671 JKL", "SHB-09", "executive", 49, 2023, [
    "wifi",
    "socket",
    "ac",
    "meal",
  ]),
  bus("bus-005", "RCH", "T 102 MNO", "RCH-01", "vip", 41, 2024, [
    "wifi",
    "socket",
    "usb",
    "ac",
    "meal",
    "tv",
    "reclining",
  ]),
  bus("bus-006", "RCH", "T 558 PQR", "RCH-03", "executive", 49, 2023, [
    "wifi",
    "socket",
    "ac",
    "meal",
  ]),
  bus("bus-007", "SUM", "T 290 STU", "SUM-15", "standard", 60, 2019, ["socket"]),
  bus("bus-008", "SUM", "T 845 VWX", "SUM-22", "executive", 45, 2022, ["wifi", "socket", "ac"]),
  bus("bus-009", "DEX", "T 137 YZA", "DEX-08", "vip", 41, 2023, [
    "wifi",
    "socket",
    "ac",
    "meal",
    "tv",
  ]),
  bus("bus-010", "DEX", "T 765 BCD", "DEX-11", "coaster", 28, 2021, ["socket", "ac"]),
  bus("bus-011", "ABD", "T 489 EFG", "ABD-02", "standard", 56, 2020, ["socket", "ac"]),
  bus("bus-012", "ABD", "T 612 HIJ", "ABD-05", "mini_bus", 22, 2022, ["socket", "ac"]),
];

const busById = (id: string): Bus => {
  const b = MOCK_BUSES.find((x) => x.id === id);
  if (!b) throw new Error(`Unknown bus id: ${id}`);
  return b;
};

// ── Trips ────────────────────────────────────────────────────────────────────
type TripSeed = {
  id: string;
  trip_code: string;
  routeCode: string;
  busId: string;
  departOffsetHours: number; // offset from "now" so trips always look upcoming
  basePrice: number;
  available_seats: number;
  status?: TripStatus;
  /** Terminal / platform line under departure time on recommendation cards */
  originTerminal?: string;
  /** Terminal / platform line under arrival time on recommendation cards */
  destinationTerminal?: string;
};

const TRIP_SEEDS: TripSeed[] = [
  // From Dar es Salaam
  {
    id: "trip-001",
    trip_code: "KEX-DAR-ARU-0600",
    routeCode: "DAR-ARU",
    busId: "bus-001",
    departOffsetHours: 6,
    basePrice: 45000,
    available_seats: 12,
    originTerminal: "Ubungo Bus Terminal — Platform 1",
    destinationTerminal: "Arusha Main Terminal — Bay 3",
  },
  {
    id: "trip-002",
    trip_code: "RCH-DAR-ARU-0700",
    routeCode: "DAR-ARU",
    busId: "bus-005",
    departOffsetHours: 7,
    basePrice: 65000,
    available_seats: 4,
    originTerminal: "Ubungo Bus Terminal — Platform 4",
    destinationTerminal: "Arusha Main Terminal — Bay 1",
  },
  {
    id: "trip-003",
    trip_code: "DEX-DAR-DOM-0900",
    routeCode: "DAR-DOM",
    busId: "bus-009",
    originTerminal: "Ubungo Bus Terminal — Platform 2",
    destinationTerminal: "Ubungo Bus Terminal — Platform 3",
    departOffsetHours: 9,
    basePrice: 32000,
    available_seats: 18,
  },
  {
    id: "trip-004",
    trip_code: "SHB-DAR-MBE-1830",
    routeCode: "DAR-MBE",
    busId: "bus-003",
    originTerminal: "Mwanjelwa Bus Terminal — Platform 2",
    destinationTerminal: "Ubungo Bus Terminal — Platform 3",
    departOffsetHours: 18.5,
    basePrice: 38000,
    available_seats: 24,
  },
  {
    id: "trip-005",
    trip_code: "SUM-DAR-MWZ-2100",
    routeCode: "DAR-MWZ",
    busId: "bus-007",
    originTerminal: "Buzuruga Bus Terminal — Platform 2",
    destinationTerminal: "Ubungo Bus Terminal — Platform 3",
    departOffsetHours: 21,
    basePrice: 60000,
    available_seats: 30,
  },
  {
    id: "trip-006",
    trip_code: "ABD-DAR-MOR-1100",
    routeCode: "DAR-MOR",
    busId: "bus-011",
    originTerminal: "Msamvu Bus Terminal — Platform 1",
    destinationTerminal: "Ubungo Bus Terminal — Platform 4",
    departOffsetHours: 11,
    basePrice: 12000,
    available_seats: 22,
  },
  {
    id: "trip-007",
    trip_code: "RCH-DAR-IRI-0830",
    routeCode: "DAR-IRI",
    busId: "bus-006",
    originTerminal: "Iringa Bus Stand — Platform 1",
    destinationTerminal: "Ubungo Bus Terminal — Platform 4",
    departOffsetHours: 8.5,
    basePrice: 35000,
    available_seats: 9,
  },
  {
    id: "trip-008",
    trip_code: "DEX-DAR-TAN-1300",
    routeCode: "DAR-TAN",
    busId: "bus-010",
    originTerminal: "Ubungo Bus Terminal — Platform 2",
    destinationTerminal: "Ubungo Bus Terminal — Platform 3",
    departOffsetHours: 13,
    basePrice: 22000,
    available_seats: 14,
  },

  // From Arusha
  {
    id: "trip-101",
    trip_code: "KEX-ARU-DAR-0700",
    routeCode: "ARU-DAR",
    busId: "bus-002",
    originTerminal: "Arusha Main Terminal — Bay 2",
    destinationTerminal: "Ubungo Bus Terminal — Platform 3",
    departOffsetHours: 7,
    basePrice: 45000,
    available_seats: 19,
  },
  {
    id: "trip-102",
    trip_code: "RCH-ARU-DAR-2030",
    routeCode: "ARU-DAR",
    busId: "bus-005",
    originTerminal: "Arusha Main Terminal — Bay 3",
    destinationTerminal: "Ubungo Bus Terminal — Platform 4",
    departOffsetHours: 20.5,
    basePrice: 60000,
    available_seats: 6,
  },
  {
    id: "trip-103",
    trip_code: "SHB-ARU-MOS-1000",
    routeCode: "ARU-MOS",
    busId: "bus-004",
    originTerminal: "Moshi Bus Terminal — Platform 1",
    destinationTerminal: "Ubungo Bus Terminal — Platform 3",
    departOffsetHours: 10,
    basePrice: 8000,
    available_seats: 26,
  },
  {
    id: "trip-104",
    trip_code: "KEX-ARU-MWZ-0500",
    routeCode: "ARU-MWZ",
    busId: "bus-001",
    originTerminal: "Arusha Main Terminal — Bay 2",
    destinationTerminal: "Ubungo Bus Terminal — Platform 2",
    departOffsetHours: 29,
    basePrice: 55000,
    available_seats: 11,
  },

  // From Dodoma
  {
    id: "trip-201",
    trip_code: "SUM-DOM-DAR-0800",
    routeCode: "DOM-DAR",
    busId: "bus-008",
    departOffsetHours: 8,
    basePrice: 32000,
    available_seats: 16,
  },
  {
    id: "trip-202",
    trip_code: "SHB-DOM-MWZ-1900",
    routeCode: "DOM-MWZ",
    busId: "bus-003",
    originTerminal: "Dodoma Bus Terminal — Platform 2",
    destinationTerminal: "Ubungo Bus Terminal — Platform 4",
    departOffsetHours: 19,
    basePrice: 42000,
    available_seats: 28,
  },

  // From Mwanza
  {
    id: "trip-301",
    trip_code: "SUM-MWZ-DAR-1700",
    routeCode: "MWZ-DAR",
    busId: "bus-007",
    originTerminal: "Buzuruga Bus Terminal — Platform 2",
    destinationTerminal: "Ubungo Bus Terminal — Platform 3",
    departOffsetHours: 17,
    basePrice: 60000,
    available_seats: 32,
  },
  {
    id: "trip-302",
    trip_code: "KEX-MWZ-DAR-0600",
    routeCode: "MWZ-DAR",
    busId: "bus-002",
    originTerminal: "Buzuruga Bus Terminal — Platform 1",
    destinationTerminal: "Ubungo Bus Terminal — Platform 2",
    departOffsetHours: 30,
    basePrice: 65000,
    available_seats: 8,
  },

  // From Mbeya
  {
    id: "trip-401",
    trip_code: "SHB-MBE-DAR-1830",
    routeCode: "MBE-DAR",
    busId: "bus-004",
    originTerminal: "Mwanjelwa Bus Terminal — Platform 2",
    destinationTerminal: "Ubungo Bus Terminal — Platform 3",
    departOffsetHours: 18.5,
    basePrice: 38000,
    available_seats: 21,
  },
  {
    id: "trip-402",
    trip_code: "RCH-MBE-DAR-0900",
    routeCode: "MBE-DAR",
    busId: "bus-006",
    departOffsetHours: 33,
    basePrice: 55000,
    available_seats: 5,
  },

  // From Iringa
  {
    id: "trip-501",
    trip_code: "RCH-IRI-DAR-0830",
    routeCode: "IRI-DAR",
    busId: "bus-006",
    originTerminal: "Iringa Bus Stand — Platform 1",
    destinationTerminal: "Ubungo Bus Terminal — Platform 4",
    departOffsetHours: 8.5,
    basePrice: 35000,
    available_seats: 13,
  },
  {
    id: "trip-502",
    trip_code: "SHB-IRI-DAR-2100",
    routeCode: "IRI-DAR",
    busId: "bus-003",
    originTerminal: "Iringa Bus Stand — Platform 2",
    destinationTerminal: "Ubungo Bus Terminal — Platform 1",
    departOffsetHours: 21,
    basePrice: 28000,
    available_seats: 30,
  },

  // From Morogoro
  {
    id: "trip-601",
    trip_code: "ABD-MOR-DAR-0700",
    routeCode: "MOR-DAR",
    busId: "bus-011",
    originTerminal: "Msamvu Bus Terminal — Platform 1",
    destinationTerminal: "Ubungo Bus Terminal — Platform 4",
    departOffsetHours: 7,
    basePrice: 12000,
    available_seats: 20,
  },
  {
    id: "trip-602",
    trip_code: "ABD-MOR-DAR-1500",
    routeCode: "MOR-DAR",
    busId: "bus-012",
    originTerminal: "Msamvu Bus Terminal — Platform 2",
    destinationTerminal: "Ubungo Bus Terminal — Platform 3",
    departOffsetHours: 15,
    basePrice: 14000,
    available_seats: 8,
  },
];

/**
 * Build the full mock trip set with departure times anchored to "now".
 */
export const buildMockTrips = (): Trip[] => {
  const now = dayjs();
  return TRIP_SEEDS.map((seed) => {
    const baseRoute = routeByCode(seed.routeCode);
    const bus = busById(seed.busId);
    const departure = now.add(seed.departOffsetHours, "hour").startOf("hour");
    const arrival = departure.add(baseRoute.estimated_duration_minutes, "minute");
    const route: Route = {
      ...baseRoute,
      origin_station: {
        ...baseRoute.origin_station,
        name: seed.originTerminal ?? baseRoute.origin_station.name,
      },
      destination_station: {
        ...baseRoute.destination_station,
        name: seed.destinationTerminal ?? baseRoute.destination_station.name,
      },
    };
    return {
      id: seed.id,
      trip_code: seed.trip_code,
      route,
      operator: bus.operator,
      bus,
      departure_time: departure.toISOString(),
      arrival_time: arrival.toISOString(),
      base_price: seed.basePrice,
      price: seed.basePrice,
      status: seed.status ?? "scheduled",
      available_seats: seed.available_seats,
      booked_seats_count: bus.capacity - seed.available_seats,
      occupancy_rate: Math.round(((bus.capacity - seed.available_seats) / bus.capacity) * 100),
      day_of_week: departure.day(),
      month: departure.month() + 1,
      holiday_flag: false,
    };
  });
};

/**
 * Pick mock trips originating from a city. Falls back to the busiest origin
 * (Dar es Salaam) if the requested city has no mock departures, so the
 * recommendations grid always has something to show.
 */
export const getRecommendedTripsByOrigin = (origin?: string | null): Trip[] => {
  const all = buildMockTrips();
  if (!origin) return all;
  const matched = all.filter((t) => t.route.origin === origin);
  if (matched.length > 0) return matched;
  return all.filter((t) => t.route.origin === "Dar es Salaam");
};
