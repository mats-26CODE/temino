import { QueryClient, isServer } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ToastAlert } from "./toast";

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: (failureCount, error: Error) => {
          const axiosError = error as AxiosError<unknown>;

          // Check if offline
          if (typeof navigator !== "undefined" && !navigator.onLine) {
            ToastAlert.error("You're offline. Please check your internet connection.");
            return false;
          }

          // Don't retry on 4xx errors except 408, 429
          const status = axiosError?.response?.status;
          if (status && status >= 400 && status < 500) {
            if (status === 408 || status === 429) return failureCount < 2;
            return false;
          }
          // Retry up to 2 times for other errors
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
        networkMode: "online",
      },
      mutations: {
        retry: () => {
          if (typeof navigator !== "undefined" && !navigator.onLine) {
            ToastAlert.error("You're offline. Please check your internet connection.");
            return false;
          }
          return false;
        },
        networkMode: "online",
      },
    },
  });

let browserQueryClient: QueryClient | undefined = undefined;

export const getQueryClient = () => {
  if (isServer) return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
};
