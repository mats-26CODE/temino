"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AUTH_TOKEN_STORAGE_KEY, AUTH_USER_STORAGE_KEY } from "@/constants/values";

interface AuthState {
  user: AppUser | null;
  token: string | null;
  setAuth: (payload: { user: AppUser; token: string }) => void;
  setUser: (user: AppUser | null) => void;
  logout: () => void;
}

/**
 * Auth store — keeps the authenticated user + bearer token in localStorage so
 * `lib/api.ts` interceptors can attach Authorization headers automatically.
 *
 * NOTE: Until the backend exposes auth endpoints, this is populated by the
 * mocked phone-OTP flow in `hooks/use-auth.ts`.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: ({ user, token }) => {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
        }
        set({ user, token });
      },
      setUser: (user) => set({ user }),
      logout: () => {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
          window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
        }
        set({ user: null, token: null });
      },
    }),
    {
      name: AUTH_USER_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
