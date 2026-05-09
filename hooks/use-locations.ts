"use client";

import { useQuery } from "@tanstack/react-query";
import { locationsApi } from "@/lib/api/locations-api";

export const LOCATIONS_QUERY_KEY = ["locations"] as const;

export const useCities = () =>
  useQuery({
    queryKey: [...LOCATIONS_QUERY_KEY, "cities"],
    queryFn: () => locationsApi.fetchCities(),
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });
