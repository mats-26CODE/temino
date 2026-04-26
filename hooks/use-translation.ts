import { useLanguage } from "@/lib/stores/preferences-store";

/**
 * Hook to access translations
 * @example
 * const { t } = useTranslation();
 * const text = t("nav.brand");
 * const greeting = t("nav.hello", { name: "John" });
 */
export const useTranslation = () => {
  const { t, language } = useLanguage();
  return { t, language };
};
