import api from "@/lib/api";

const MAX_PAGES = 500;

/**
 * Aggregates every page from a DRF `PageNumberPagination` list endpoint.
 * If the server returns a bare array, it is returned as-is.
 */
export const fetchAllPages = async <T>(
  path: string,
  extraParams?: Record<string, string | number | undefined>,
): Promise<T[]> => {
  const items: T[] = [];
  let page = 1;

  while (page <= MAX_PAGES) {
    const { data } = await api.get<T[] | ApiPaginated<T>>(path, {
      params: { ...extraParams, page },
    });

    if (Array.isArray(data)) return data;

    items.push(...(data.results ?? []));
    if (!data.next) break;
    page += 1;
  }

  return items;
};
