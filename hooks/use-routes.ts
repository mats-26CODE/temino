"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { POPULAR_ROUTES, TZ_CITIES } from "@/constants/values";
import { MOCK_ROUTES } from "@/lib/mocks/trips";

export const ROUTES_QUERY_KEY = ["routes"] as const;

/**
 * GET /api/routes/ — list of all available routes.
 *
 * Fallback: if the endpoint isn't ready yet, we surface the mock route set
 * (which is also used by the recommendations section) so the UI never breaks.
 */
export const useRoutes = () =>
  useQuery<Route[]>({
    queryKey: [...ROUTES_QUERY_KEY, "list"],
    queryFn: async () => {
      try {
        const { data } = await api.get<Route[] | ApiPaginated<Route>>("/api/routes/");
        return Array.isArray(data) ? data : data.results;
      } catch {
        return MOCK_ROUTES;
      }
    },
  });

/**
 * Static-list helpers, used by the search bar selectors.
 */
export const useCities = () => TZ_CITIES;
export const usePopularRoutes = () => POPULAR_ROUTES;
