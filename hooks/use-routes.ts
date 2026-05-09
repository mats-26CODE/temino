"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAllPages } from "@/lib/fetch-all-pages";

export const ROUTES_QUERY_KEY = ["routes"] as const;

/**
 * GET /api/routes/
 */
export const useRoutes = () =>
  useQuery<Route[]>({
    queryKey: [...ROUTES_QUERY_KEY, "list"],
    queryFn: () => fetchAllPages<Route>("/api/routes/"),
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
