/**
 * Central place for backend URL paths.
 *
 * Keeps axios callers small and avoids scattering string literals.
 */
export const endpoints = {
  locations: {
    countries: "/api/locations/countries/",
    regions: "/api/locations/regions/",
    cities: "/api/locations/cities/",
    stations: "/api/locations/stations/",
  },
} as const;
