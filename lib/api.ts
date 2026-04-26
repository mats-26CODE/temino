import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { API_TIMEOUT, AUTH_TOKEN_STORAGE_KEY } from "@/constants/values";

/**
 * Centralised axios instance for the Temino backend.
 * Base URL is read from NEXT_PUBLIC_API_BASE_URL.
 *
 * Usage:
 *   const { data } = await api.get<Trip[]>("/api/trips/");
 */
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.temino.co.tz";

export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Request interceptor: attach auth token ───────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
  }
  return config;
});

// ── Response interceptor: normalise errors ───────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorShape>) => {
    // Normalise error message so callers can do `error.message` reliably.
    const data = error.response?.data;
    const detail = data?.detail || data?.message;

    let fieldError: string | undefined;
    if (data?.errors && typeof data.errors === "object") {
      const firstKey = Object.keys(data.errors)[0];
      if (firstKey) {
        const value = data.errors[firstKey];
        fieldError = Array.isArray(value) ? value[0] : value;
      }
    }

    const message = detail || fieldError || error.message || "Something went wrong";
    error.message = message;
    return Promise.reject(error);
  },
);

/**
 * Tiny helper to extract a clean message from an unknown error (axios or other).
 */
export const getApiErrorMessage = (error: unknown, fallback = "Something went wrong"): string => {
  if (axios.isAxiosError(error)) {
    return error.message || fallback;
  }
  if (error instanceof Error) return error.message || fallback;
  return fallback;
};

export default api;
