"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ToastAlert } from "@/config/toast";
import { useAuthStore } from "@/lib/stores/auth-store";
import { addCountryCode } from "@/helpers/helpers";

/**
 * Auth hooks.
 *
 * The Temino backend (per HANDOFF.md) does NOT yet expose phone-OTP endpoints,
 * so until they do these hooks simulate the behaviour client-side. The
 * surface stays identical, so swapping in real endpoints later is a 1-file change.
 *
 * Real wiring (when ready):
 *   POST /api/auth/send-otp/      → useSendOtp
 *   POST /api/auth/verify-otp/    → useVerifyOtp
 *   POST /api/auth/logout/        → useLogout
 */

const MOCKED_OTP = "123456";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useSendOtp = () =>
  useMutation({
    mutationFn: async (payload: { phone: string }) => {
      await wait(700);
      const phone = addCountryCode(payload.phone);
      // In real life, the backend would SMS the user.
      console.info("[mock OTP] sent to", phone, "→ use", MOCKED_OTP);
      return { phone };
    },
    onSuccess: () => {
      ToastAlert.success(`OTP sent (use ${MOCKED_OTP} for testing)`);
    },
    onError: (error: Error) => {
      ToastAlert.error(error.message || "Failed to send OTP");
    },
  });

export const useVerifyOtp = (options?: { redirect?: string }) => {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (payload: { phone: string; otp: string; fullName?: string }) => {
      await wait(700);
      if (payload.otp !== MOCKED_OTP) {
        throw new Error("Invalid OTP. (Hint: 123456)");
      }
      const phone = addCountryCode(payload.phone);
      const user: AppUser = {
        id: `mock-${phone}`,
        full_name: payload.fullName?.trim() || "Temino Traveler",
        phone,
        email: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
      };
      const token = `mock-token-${user.id}`;
      return { user, token };
    },
    onSuccess: (data) => {
      setAuth({ user: data.user, token: data.token });
      ToastAlert.success("Phone verified successfully! 🎉");
      router.push(options?.redirect ?? "/dashboard");
    },
    onError: (error: Error) => {
      ToastAlert.error(error.message || "Invalid OTP. Please try again.");
    },
  });
};

export const useLogout = () => {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  return () => {
    logout();
    ToastAlert.success("Logged out");
    router.push("/");
  };
};

export const useUser = () => {
  const user = useAuthStore((s) => s.user);
  return { user, loading: false };
};
