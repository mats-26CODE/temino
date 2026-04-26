export const APP_NAME = "Temino";
export const APP_TAGLINE = "Travel Tanzania, the simple way";
export const API_TIMEOUT = 15_000; // 15 seconds

// Storage keys (used by lib/api.ts and stores)
export const AUTH_TOKEN_STORAGE_KEY = "temino_auth_token";
export const AUTH_USER_STORAGE_KEY = "temino_auth_user";

// Contact / brand
export const SUPPORT_EMAIL = "support@temino.co.tz";
export const CAREERS_EMAIL = "careers@temino.co.tz";
export const CONTACT_US_PHONE = "+255 767 000 000";
export const CONTACT_US_ADDRESS = "Dar es Salaam, Tanzania";
export const PAYMENT_GATEWAY_NAME = "Selcom"; // planned
export const PAYMENT_GATEWAY_URL = "https://selcom.net";

// Default search params
export const DEFAULT_CURRENCY = "TZS" as const;
export const DEFAULT_PAGE_SIZE = 10;

// A small starter list of popular Tanzanian routes — used for search
// suggestions, "popular routes" sections, etc. Expand as needed.
export const POPULAR_ROUTES = [
  { code: "DAR-ARU", origin: "Dar es Salaam", destination: "Arusha" },
  { code: "DAR-DOM", origin: "Dar es Salaam", destination: "Dodoma" },
  { code: "DAR-MWZ", origin: "Dar es Salaam", destination: "Mwanza" },
  { code: "DAR-MBE", origin: "Dar es Salaam", destination: "Mbeya" },
  { code: "DAR-IRI", origin: "Dar es Salaam", destination: "Iringa" },
  { code: "ARU-DAR", origin: "Arusha", destination: "Dar es Salaam" },
  { code: "ARU-MWZ", origin: "Arusha", destination: "Mwanza" },
  { code: "DOM-DAR", origin: "Dodoma", destination: "Dar es Salaam" },
] as const;

// Cities used for origin/destination dropdowns
export const TZ_CITIES = [
  "Dar es Salaam",
  "Arusha",
  "Dodoma",
  "Mwanza",
  "Mbeya",
  "Iringa",
  "Morogoro",
  "Tanga",
  "Tabora",
  "Kigoma",
  "Songea",
  "Singida",
  "Moshi",
  "Bukoba",
  "Sumbawanga",
  "Mtwara",
  "Lindi",
  "Shinyanga",
] as const;

/**
 * Same TZ cities with approximate (city-centre) coordinates. Used to resolve
 * the user's geolocation to the nearest known city via a haversine match.
 * Coordinates are rounded to 4dp — accurate enough for "which city are you in?"
 * but not precise enough to leak anyone's address.
 */
export const TZ_CITIES_WITH_COORDS = [
  { name: "Dar es Salaam", lat: -6.7924, lng: 39.2083 },
  { name: "Arusha", lat: -3.3869, lng: 36.683 },
  { name: "Dodoma", lat: -6.1722, lng: 35.7395 },
  { name: "Mwanza", lat: -2.5164, lng: 32.9175 },
  { name: "Mbeya", lat: -8.9094, lng: 33.4608 },
  { name: "Iringa", lat: -7.7706, lng: 35.6889 },
  { name: "Morogoro", lat: -6.8278, lng: 37.6591 },
  { name: "Tanga", lat: -5.0689, lng: 39.0986 },
  { name: "Tabora", lat: -5.0167, lng: 32.8 },
  { name: "Kigoma", lat: -4.8765, lng: 29.6266 },
  { name: "Songea", lat: -10.6833, lng: 35.65 },
  { name: "Singida", lat: -4.8167, lng: 34.75 },
  { name: "Moshi", lat: -3.35, lng: 37.3333 },
  { name: "Bukoba", lat: -1.3267, lng: 31.8128 },
  { name: "Sumbawanga", lat: -7.9667, lng: 31.6167 },
  { name: "Mtwara", lat: -10.2667, lng: 40.1833 },
  { name: "Lindi", lat: -10.0, lng: 39.7167 },
  { name: "Shinyanga", lat: -3.6667, lng: 33.4333 },
] as const;

/**
 * Bus amenities recognised by the backend. The string keys are the values we
 * store in `Bus.amenities[]`; map them to icons + labels via `AMENITY_META`.
 */
export const BUS_AMENITIES = [
  "wifi",
  "socket",
  "usb",
  "ac",
  "meal",
  "tv",
  "restroom",
  "reclining",
] as const;

export type BusAmenity = (typeof BUS_AMENITIES)[number];
