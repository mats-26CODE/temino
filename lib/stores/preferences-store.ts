"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useSyncExternalStore } from "react";
import {
  translations,
  defaultLanguage,
  t as translate,
  type Language,
} from "@/lib/i18n/translations";

type Theme = "light" | "dark";

interface PreferencesState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const createPreferencesStore = () =>
  create<PreferencesState>()(
    persist(
      (set, get) => ({
        theme: "light",
        language: defaultLanguage,
        setTheme: (theme: Theme) => {
          set({ theme });
          if (typeof window !== "undefined") {
            document.documentElement.classList.toggle("dark", theme === "dark");
          }
        },
        setLanguage: (lang: Language) => {
          set({ language: lang });
          if (typeof window !== "undefined") {
            document.documentElement.lang = lang;
          }
        },
        t: (key: string, vars?: Record<string, string | number>) => {
          const { language } = get();
          return translate(language, key, vars);
        },
      }),
      {
        name: "preferences-store",
        storage: createJSONStorage(() => localStorage),
        onRehydrateStorage: () => (state) => {
          if (state && typeof window !== "undefined") {
            const isDark = state.theme === "dark";
            document.documentElement.classList.toggle("dark", isDark);
            document.documentElement.lang = state.language;
          }
        },
      },
    ),
  );

export const usePreferencesStore = createPreferencesStore();

// Module-level cached snapshots. `useSyncExternalStore` requires its
// `getServerSnapshot` callback to return a referentially-stable value;
// otherwise React warns "The result of getServerSnapshot should be cached
// to avoid an infinite loop" and bails out of hydration.
const DEFAULT_THEME: Theme = "light";
const DEFAULT_T: PreferencesState["t"] = (key: string, vars?: Record<string, string | number>) =>
  translate(defaultLanguage, key, vars);

const getServerThemeSnapshot = () => DEFAULT_THEME;
const getServerLanguageSnapshot = () => defaultLanguage;
const getServerTSnapshot = () => DEFAULT_T;

const getThemeSnapshot = () => usePreferencesStore.getState().theme;
const getLanguageSnapshot = () => usePreferencesStore.getState().language;
const getTSnapshot = () => usePreferencesStore.getState().t;

export const useTheme = () => {
  const theme = useSyncExternalStore(
    usePreferencesStore.subscribe,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const setTheme = usePreferencesStore((state) => state.setTheme);

  return {
    theme,
    setTheme,
    toggleTheme: () => {
      const current = usePreferencesStore.getState().theme;
      setTheme(current === "light" ? "dark" : "light");
    },
  };
};

export const useLanguage = () => {
  const language = useSyncExternalStore(
    usePreferencesStore.subscribe,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );
  const setLanguage = usePreferencesStore((state) => state.setLanguage);
  const t = useSyncExternalStore(usePreferencesStore.subscribe, getTSnapshot, getServerTSnapshot);

  return { language, setLanguage, t, translations };
};

export { translations };
