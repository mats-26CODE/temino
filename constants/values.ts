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
