// Global types for the Temino booking app

// ── API ──────────────────────────────────────────────────────────────────────
type ApiSuccess<T> = T;

type ApiPaginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

type ApiErrorShape = {
  detail?: string;
  message?: string;
  errors?: Record<string, string[] | string>;
  status?: number;
};

// ── Domain models (aligned with backend `temino-api` Django models) ──────────
type Currency = "TZS" | "USD";

// ── Locations ────────────────────────────────────────────────────────────────
interface Country {
  id: string;
  name: string;
  code: string;
}

interface Region {
  id: string;
  name: string;
  country?: Country | string;
}

interface City {
  id: string;
  name: string;
  region?: Region | string;
}

interface Station {
  id: string;
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  city?: City | string;
}

// ── Operators ────────────────────────────────────────────────────────────────
interface OperatorManager {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
}

interface Operator {
  id: string;
  name: string;
  code: string;
  contact_email?: string | null;
  phone_number?: string | null;
  website?: string | null;
  description?: string | null;
  managers?: OperatorManager[];
  // UI-only conveniences
  logo_url?: string | null;
  rating?: number | null;
}

// ── Bus ──────────────────────────────────────────────────────────────────────
type BusType = "standard" | "executive" | "vip" | "mini_bus" | "coaster";

interface Bus {
  id: string;
  operator: Operator;
  plate_number: string;
  bus_number?: string | null;
  bus_type: BusType;
  capacity: number;
  manufacture_year?: number | null;
  is_active: boolean;
  // UI-only conveniences
  amenities?: string[];
  /** Alias of `capacity` kept for components that pre-date the backend rename. */
  total_seats?: number;
  /** Alias of `bus_type` kept for components that pre-date the backend rename. */
  bus_class?: BusType | string;
}

// ── Routes ───────────────────────────────────────────────────────────────────
interface Route {
  id: string;
  route_code: string; // e.g. "DAR-ARU"
  origin_station: Station;
  destination_station: Station;
  distance_km?: number | null;
  estimated_duration_minutes: number;
  notes?: string | null;
  // UI-only conveniences (flat city names — populated client-side)
  origin: string;
  destination: string;
  /** Backwards-compat alias of `route_code`. */
  code?: string;
  /** Backwards-compat alias of `estimated_duration_minutes`. */
  duration_minutes?: number;
}

type SeatStatus = "available" | "booked" | "reserved" | "blocked";

interface Seat {
  id: string;
  number: string; // e.g. "1A"
  row?: number;
  column?: number;
  status: SeatStatus;
  price?: number;
}

/** Raw `trips.TripSeat` row from Django REST (`TripSeatSerializer`). */
interface TripSeatApi {
  id: string;
  trip: string;
  seat_number: string;
  status: SeatStatus;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

type TripStatus =
  | "scheduled"
  | "boarding"
  | "departed"
  | "arrived"
  | "cancelled"
  | "delayed"
  | "full";

interface Trip {
  id: string;
  trip_code: string;
  /** From API when `route` is serialized as an id only (see `resolveTripStopLabels`). */
  route_code?: string;
  route: Route;
  operator: Operator;
  bus: Bus;
  departure_time: string; // ISO datetime
  arrival_time: string; // ISO datetime
  base_price: string | number;
  status: TripStatus;
  available_seats: number;
  booked_seats_count?: number;
  occupancy_rate?: number;
  day_of_week?: number;
  month?: number;
  holiday_flag?: boolean;
  seats?: Seat[];
  // UI-only convenience: alias of base_price kept for components that read `price`.
  price?: string | number;
}

type BookingStatus = "pending" | "confirmed" | "paid" | "cancelled" | "expired";

interface PassengerInfo {
  passenger_name: string;
  passenger_phone: string;
  passenger_email?: string;
}

interface Booking extends PassengerInfo {
  id: string;
  trip_id: string;
  seat_id: string;
  amount: string | number;
  status: BookingStatus;
  reference?: string;
  created_at: string;
  trip?: Trip;
}

interface CreateBookingPayload extends PassengerInfo {
  trip_id: string;
  seat_id: string;
  amount: string;
}

// ── Search ───────────────────────────────────────────────────────────────────
interface SearchTripsParams {
  origin?: string;
  destination?: string;
  route_code?: string; // e.g. "DAR-ARU"
  date?: string; // ISO date (YYYY-MM-DD)
  passengers?: number;
}

// ── User / Auth (frontend-shaped, mocked client-side until backend exposes) ──
interface AppUser {
  id: string;
  full_name: string;
  phone: string; // E.164-ish without leading + (e.g. 2557XXXXXXXX)
  email?: string | null;
  avatar_url?: string | null;
  created_at: string;
}

// ── Helpers / formatting ─────────────────────────────────────────────────────
interface CurrencyConfig {
  code?: string;
  symbol?: string;
  decimalDigits?: number;
  symbolPosition?: "left" | "right";
  spaceBetween?: boolean;
  compact?: boolean;
  compactThreshold?: number;
}

type DateFormatPreset =
  | "DB_TIMESTAMP"
  | "SHORT_DATE"
  | "SHORT_DATE_DM"
  | "LONG_DATE"
  | "DATE_TIME"
  | "TIME_12HR"
  | "ISO8601"
  | "HUMAN_READABLE"
  | "CALENDAR_DAY";

interface FormatDateOptions {
  inputFormat?: string;
  timezone?: string;
  fallback?: string;
}
