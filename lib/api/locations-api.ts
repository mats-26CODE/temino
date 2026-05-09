import { endpoints } from "@/lib/endpoints";
import { fetchAllPages } from "@/lib/fetch-all-pages";

export const locationsApi = {
  fetchRegions: (): Promise<Region[]> => fetchAllPages<Region>(endpoints.locations.regions),

  fetchCities: (): Promise<City[]> => fetchAllPages<City>(endpoints.locations.cities),

  fetchStations: (): Promise<Station[]> =>
    fetchAllPages<Station>(endpoints.locations.stations),
};
