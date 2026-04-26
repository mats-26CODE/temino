"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/stores/preferences-store";

export const ThemeToggle = ({ className }: { className?: string }) => {
  const { theme, toggleTheme } = useTheme();
  const title = theme === "light" ? "Switch to dark mode" : "Switch to light mode";

  return (
    <Button
      variant="outline"
      size="icon"
      className={className ?? "h-9 w-9 rounded-full shadow-none"}
      onClick={toggleTheme}
      title={title}
      aria-label={title}
    >
      {theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
};
