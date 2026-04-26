"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage, translations } from "@/lib/stores/preferences-store";
import { useTranslation } from "@/hooks/use-translation";

export const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="dark:border-primary/10 h-9 w-9 rounded-full shadow-none"
          title={t("nav.language")}
          aria-label={t("nav.language")}
        >
          <Languages className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40 space-y-1 p-1">
        {Object.keys(translations).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setLanguage(lang as keyof typeof translations)}
            className={`hover:bg-accent/5 w-full rounded-sm px-2 py-1.5 text-left text-sm outline-none ${
              language === lang ? "bg-accent/10 font-medium" : ""
            }`}
          >
            {translations[lang as keyof typeof translations].languageLabel}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
};
