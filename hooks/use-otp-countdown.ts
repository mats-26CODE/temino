import { useState, useEffect, useCallback } from "react";

/**
 * Hook to manage OTP resend countdown timer
 * @param initialSeconds - Initial countdown seconds (default: 60)
 * @returns Object with countdown state and control functions
 */
export const useOtpCountdown = (initialSeconds: number = 60) => {
  const [countdown, setCountdown] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, countdown]);

  const startCountdown = useCallback(() => {
    setCountdown(initialSeconds);
    setIsActive(true);
  }, [initialSeconds]);

  const resetCountdown = useCallback(() => {
    setCountdown(0);
    setIsActive(false);
  }, []);

  const canResend = countdown === 0 && !isActive;

  return {
    countdown,
    canResend,
    startCountdown,
    resetCountdown,
    isActive,
  };
};
