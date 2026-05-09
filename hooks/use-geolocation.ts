"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { findNearestCity } from "@/helpers/helpers";
import { locationsApi } from "@/lib/api/locations-api";

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

const catalogFromStations = (
  stations: Station[],
): { name: string; lat: number; lng: number }[] => {
  const byCity = new Map<string, { name: string; lat: number; lng: number }>();
  for (const s of stations) {
    const city =
      (typeof s.city === "object" && s.city?.name ? s.city.name : "").trim() ||
      (s.city_name ?? "").trim();
    if (!city || s.latitude == null || s.longitude == null) continue;
    const lat = Number(s.latitude);
    const lng = Number(s.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    if (!byCity.has(city)) byCity.set(city, { name: city, lat, lng });
  }
  return [...byCity.values()];
};

/**
 * Resolve the user's nearest **city** using station coordinates from
 * `GET /api/locations/stations/` (one representative station per city).
 */
export const useGeolocation = (options?: { auto?: boolean }) => {
  const auto = options?.auto ?? true;
  const [state, setState] = useState<GeolocationState>(INITIAL);
  const catalogRef = useRef<{ name: string; lat: number; lng: number }[]>([]);

  useEffect(() => {
    let cancelled = false;
    locationsApi
      .fetchStations()
      .then((rows) => {
        if (!cancelled) catalogRef.current = catalogFromStations(rows);
      })
      .catch(() => {
        if (!cancelled) catalogRef.current = [];
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const request = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setState({ ...INITIAL, status: "unsupported" });
      return;
    }

    setState((s) => ({ ...s, status: "requesting", error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const pool = catalogRef.current;
        const nearest = pool.length > 0 ? findNearestCity(coords, pool) : null;
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
