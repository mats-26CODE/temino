"use client";

import { useCallback, useEffect, useState } from "react";
import { TZ_CITIES_WITH_COORDS } from "@/constants/values";
import { findNearestCity } from "@/helpers/helpers";

export type GeolocationStatus =
  | "idle"
  | "requesting"
  | "ready"
  | "denied"
  | "unsupported"
  | "error";

interface GeolocationState {
  status: GeolocationStatus;
  coords: { lat: number; lng: number } | null;
  city: string | null;
  distanceKm: number | null;
  error: string | null;
}

const INITIAL: GeolocationState = {
  status: "idle",
  coords: null,
  city: null,
  distanceKm: null,
  error: null,
};

/**
 * Detect the user's nearest TZ city via `navigator.geolocation`.
 *
 * - Prompts on mount when `auto` is true (default). Pass `auto: false` to
 *   trigger manually with `request()`.
 * - We only resolve to one of `TZ_CITIES_WITH_COORDS`; this avoids needing an
 *   external reverse-geocoding API and keeps the request 100% client-side.
 * - If the user denies, isn't in TZ, or the API isn't supported, the consumer
 *   can fall back to a sensible default city (e.g. Dar es Salaam).
 */
export const useGeolocation = (options?: { auto?: boolean }) => {
  const auto = options?.auto ?? true;
  const [state, setState] = useState<GeolocationState>(INITIAL);

  const request = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setState({ ...INITIAL, status: "unsupported" });
      return;
    }

    setState((s) => ({ ...s, status: "requesting", error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const nearest = findNearestCity(coords, TZ_CITIES_WITH_COORDS);
        setState({
          status: "ready",
          coords,
          city: nearest?.city.name ?? null,
          distanceKm: nearest?.distanceKm ?? null,
          error: null,
        });
      },
      (err) => {
        const status: GeolocationStatus = err.code === err.PERMISSION_DENIED ? "denied" : "error";
        setState({ ...INITIAL, status, error: err.message || "Location unavailable" });
      },
      { enableHighAccuracy: false, timeout: 8_000, maximumAge: 5 * 60_000 },
    );
  }, []);

  useEffect(() => {
    if (auto) request();
  }, [auto, request]);

  return { ...state, request };
};
