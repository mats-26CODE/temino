import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { MOCK_ROUTES } from "@/lib/mocks/trips";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Time-of-day greeting (e.g. "Good Morning 🌅").
 */
export const getGreeting = (): string => {
  const hour = dayjs().hour();
  if (hour >= 5 && hour < 12) return "Good Morning 🌅";
  if (hour >= 12 && hour < 17) return "Good Afternoon ☀️";
  if (hour >= 17 && hour < 21) return "Good Evening 🌆";
  return "Good Night 🌙";
};

export const getCasualGreeting = (): string => `${getGreeting()}`;

/**
 * Display-format a Tanzanian phone number as 0XXXXXXXXX.
 */
export const formatPhoneForDisplay = (phoneNumber: string): string => {
  const cleanNumber = phoneNumber.replace(/\D/g, "");
  if (cleanNumber.startsWith("255") && cleanNumber.length === 12) {
    return `0${cleanNumber.slice(3)}`;
  }
  if (cleanNumber.length === 9) return `0${cleanNumber}`;
  if (cleanNumber.startsWith("0") && cleanNumber.length === 10) return cleanNumber;
  return cleanNumber;
};

/**
 * Validate a TZ phone number (digits only, starts with 0, 10 digits).
 */
export const validatePhoneNumber = (phoneNumber: string): { isValid: boolean; error?: string } => {
  const cleaned = phoneNumber.trim();
  if (!cleaned) return { isValid: false, error: "Phone number is required" };
  if (!/^\d+$/.test(cleaned))
    return { isValid: false, error: "Phone number must contain only numbers" };
  if (!cleaned.startsWith("0")) return { isValid: false, error: "Phone number must start with 0" };
  if (cleaned.length < 10)
    return { isValid: false, error: "Phone number must be at least 10 digits" };
  return { isValid: true };
};

/**
 * Add Tanzania country code (+255) if missing. Returns "2557XXXXXXXX".
 */
export const addCountryCode = (phoneNumber: string): string => {
  const cleanedNumber = phoneNumber.replace(/[^0-9+]/g, "");
  const normalized = cleanedNumber.startsWith("+") ? cleanedNumber.slice(1) : cleanedNumber;
  if (normalized.startsWith("255")) return normalized;
  if (normalized.startsWith("0")) return "255" + normalized.slice(1);
  return "255" + normalized;
};

/**
 * Format a number with thousands separators. Example: 200000 → "200,000".
 */
export const formatNumberAddCommas = (value: number | null | undefined, decimals = 0): string => {
  if (value === null || value === undefined || !Number.isFinite(value)) return "0";
  const parts = value.toFixed(decimals).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

const getSymbolFromCode = (code: string): string => {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    TZS: "TSh",
    KES: "KSh",
    UGX: "USh",
  };
  return symbols[code] || code;
};

const getCompactValueAndSuffix = (amount: number): { value: number; suffix: string } => {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000_000) return { value: amount / 1_000_000_000_000, suffix: "T" };
  if (abs >= 1_000_000_000) return { value: amount / 1_000_000_000, suffix: "B" };
  if (abs >= 1_000_000) return { value: amount / 1_000_000, suffix: "M" };
  if (abs >= 1_000) return { value: amount / 1_000, suffix: "K" };
  return { value: amount, suffix: "" };
};

export const formatCompact = (
  amount: number,
  config?: {
    code?: string;
    symbol?: string;
    decimalDigits: number;
    symbolPosition: "left" | "right";
    spaceBetween: boolean;
    locale: string;
  },
): string => {
  const { value, suffix } = getCompactValueAndSuffix(amount);
  if (config) {
    const currencySymbol = config.symbol || (config.code ? getSymbolFromCode(config.code) : "");
    const formattedValue = value.toFixed(config.decimalDigits);
    return `${currencySymbol}${config.spaceBetween ? " " : ""}${formattedValue}${suffix}`;
  }
  return `${value.toFixed(1)}${suffix}`;
};

const simpleFormat = (
  amount: number,
  {
    symbol,
    decimalDigits,
    symbolPosition,
    spaceBetween,
  }: {
    symbol: string;
    decimalDigits: number;
    symbolPosition: "left" | "right";
    spaceBetween: boolean;
  },
): string => {
  const fixed = amount.toFixed(decimalDigits);
  const space = spaceBetween ? " " : "";
  return symbolPosition === "left" ? `${symbol}${space}${fixed}` : `${fixed}${space}${symbol}`;
};

/**
 * Format a currency amount. Defaults to TZS-friendly output (no decimals).
 */
export const formatCurrency = (
  amount: number,
  config: CurrencyConfig = {},
  locale?: string,
): string => {
  const {
    code = "TZS",
    symbol,
    decimalDigits = 0,
    symbolPosition = "left",
    spaceBetween = true,
    compact = false,
    compactThreshold = 1_000,
  } = config;

  const safeLocale = locale ?? (typeof navigator !== "undefined" ? navigator.language : "en-US");

  if (!Number.isFinite(amount)) return symbol ? `${symbol}–` : "–";

  if (compact && Math.abs(amount) >= compactThreshold) {
    return formatCompact(amount, {
      code,
      symbol,
      decimalDigits,
      symbolPosition,
      spaceBetween,
      locale: safeLocale,
    });
  }

  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: decimalDigits,
    maximumFractionDigits: decimalDigits,
  };

  if (code) {
    options.style = "currency";
    options.currency = code;
    options.currencyDisplay = "narrowSymbol";
  } else {
    options.style = "decimal";
  }

  try {
    const formatter = new Intl.NumberFormat(safeLocale, options);
    let result = formatter.format(amount);

    if (symbol && !code) {
      result = result.replace(/[^\d.,-]/g, "").trim();
      const space = spaceBetween ? " " : "";
      return symbolPosition === "left"
        ? `${symbol}${space}${result}`
        : `${result}${space}${symbol}`;
    }

    return result;
  } catch {
    return simpleFormat(amount, {
      symbol: symbol || (code ? getSymbolFromCode(code) : ""),
      decimalDigits,
      symbolPosition,
      spaceBetween,
    });
  }
};

export const formatMap: Record<string, string> = {
  DB_TIMESTAMP: "YYYY-MM-DD HH:mm:ss",
  SHORT_DATE: "MM/DD/YYYY",
  SHORT_DATE_DM: "DD/MM/YYYY",
  LONG_DATE: "MMMM D, YYYY",
  DATE_TIME: "MM/DD/YYYY h:mm A",
  TIME_12HR: "h:mm A",
  ISO8601: "",
  HUMAN_READABLE: "MMM D, YYYY [at] h:mm A",
  CALENDAR_DAY: "dddd, MMMM D",
};

/**
 * Format a date with sensible presets.
 */
export const formatDate = (
  dateInput: string | number | Date | null | Dayjs | undefined,
  format: DateFormatPreset = "HUMAN_READABLE",
  options: FormatDateOptions = {},
): string => {
  const { inputFormat, timezone: tz = "UTC", fallback = "Invalid date" } = options;
  if (!dateInput) return fallback;

  try {
    let date = dayjs(dateInput, inputFormat);
    if (inputFormat === "DB_TIMESTAMP" || !inputFormat) date = date.utc();
    if (tz !== "UTC") date = date.tz(tz);
    const formatString = formatMap[format] || format;
    return date.isValid() ? date.format(formatString) : fallback;
  } catch (error) {
    console.warn("Date formatting error:", error);
    return fallback;
  }
};

export const formatTime = (time: dayjs.Dayjs) => {
  const hours = time.format("HH");
  const minutes = time.format("mm");
  return { hours, minutes };
};

/**
 * Title-case a string ("dar es salaam" → "Dar Es Salaam").
 */
export const capitalize = (str: string): string => {
  if (!str) return str;
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Compute trip duration in a human format ("8h 30m") from two ISO timestamps.
 */
export const formatTripDuration = (departureIso: string, arrivalIso: string): string => {
  const start = dayjs(departureIso);
  const end = dayjs(arrivalIso);
  if (!start.isValid() || !end.isValid()) return "—";
  const minutes = Math.max(0, end.diff(start, "minute"));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h <= 0) return `${m}m`;
  if (m <= 0) return `${h}h`;
  return `${h}h ${m}m`;
};

/**
 * Format a route code from origin & destination ("Dar es Salaam", "Arusha" → "DAR-ARU").
 * Uses the first 3 letters of the first significant word, uppercased.
 */
export const buildRouteCode = (origin: string, destination: string): string => {
  const tokenize = (s: string) => s.trim().split(/\s+/)[0]?.slice(0, 3).toUpperCase() ?? "";
  return `${tokenize(origin)}-${tokenize(destination)}`;
};

/**
 * Labels under departure / arrival times on cards. Uses nested stations from the
 * API when present; otherwise maps `route_code` or origin/destination cities to
 * `MOCK_ROUTES` so the live API (which often omits `origin_station`) still shows
 * terminal names in dev.
 *
 * Django `TripSerializer` usually sends `route` as a PK (string) and puts
 * `route_code` on the trip root — we must read both shapes.
 */
export const resolveTripStopLabels = (
  trip: Trip,
): { origin: string; destination: string } => {
  // DRF often serializes `route` as a PK string; mocks use a full `Route` object.
  const rawRoute = trip.route as unknown as Route | string;
  const nested =
    rawRoute && typeof rawRoute === "object" && !Array.isArray(rawRoute)
      ? (rawRoute as Route)
      : null;

  const tripRouteCode = trip.route_code?.trim() ?? "";

  const fromApiOrigin = nested?.origin_station?.name?.trim();
  const fromApiDest = nested?.destination_station?.name?.trim();
  if (fromApiOrigin && fromApiDest) {
    return { origin: fromApiOrigin, destination: fromApiDest };
  }

  const codeRaw =
    tripRouteCode ||
    (nested?.route_code ?? nested?.code ?? "").toString().trim();
  if (codeRaw) {
    const upper = codeRaw.toUpperCase();
    const mock = MOCK_ROUTES.find(
      (m) => m.route_code.toUpperCase() === upper || (m.code && m.code.toUpperCase() === upper),
    );
    if (mock) {
      return {
        origin: fromApiOrigin ?? mock.origin_station.name,
        destination: fromApiDest ?? mock.destination_station.name,
      };
    }
  }

  const originCity =
    nested && typeof nested.origin === "string" ? nested.origin.trim() : "";
  const destCity =
    nested && typeof nested.destination === "string" ? nested.destination.trim() : "";
  if (originCity && destCity) {
    const mock = MOCK_ROUTES.find((m) => m.origin === originCity && m.destination === destCity);
    if (mock) {
      return {
        origin: fromApiOrigin ?? mock.origin_station.name,
        destination: fromApiDest ?? mock.destination_station.name,
      };
    }
  }

  return {
    origin: fromApiOrigin || originCity || "",
    destination: fromApiDest || destCity || "",
  };
};

const toRadians = (deg: number) => (deg * Math.PI) / 180;

/**
 * Great-circle distance between two points (lat/lng) in kilometres.
 * Used by `findNearestCity` to resolve the user's geolocation to a known city.
 */
export const haversineKm = (
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number => {
  const R = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
};

/**
 * Find the closest city in `cities` to a given coordinate.
 * Returns `{ city, distanceKm }` or `null` if `cities` is empty.
 */
export const findNearestCity = <T extends { name: string; lat: number; lng: number }>(
  coords: { lat: number; lng: number },
  cities: readonly T[],
): { city: T; distanceKm: number } | null => {
  if (!cities.length) return null;
  let best: { city: T; distanceKm: number } | null = null;
  for (const city of cities) {
    const distanceKm = haversineKm(coords, city);
    if (!best || distanceKm < best.distanceKm) best = { city, distanceKm };
  }
  return best;
};
