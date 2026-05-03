"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Bus, LogOut, Menu, Plane, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useLogout } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { DASHBOARD_NAV_ACCOUNT, DASHBOARD_NAV_MAIN } from "@/constants/dashboard-nav";
import { cn } from "@/lib/utils";
import Logo from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";

type ModeKey = "buses" | "flights";

interface ModeDef {
  key: ModeKey;
  icon: LucideIcon;
  active?: boolean;
  soon?: boolean;
}

const MODES: ModeDef[] = [
  { key: "buses", icon: Bus, active: true },
  { key: "flights", icon: Plane, soon: true },
];

const NavBar = () => {
  const pathname = usePathname();
  const { user } = useUser();
  const logout = useLogout();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLanding = ["/", "/about-us", "/support", "/terms", "/privacy"].includes(pathname);

  const initials = (user?.full_name ?? user?.phone ?? "T")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLinkClick = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-background/85 supports-backdrop-filter:bg-background/65 sticky top-0 z-50 w-full backdrop-blur">
      <div className="container mx-auto flex h-16 w-full items-center justify-between gap-4 px-4 md:max-w-6xl">
        {/* Left: brand */}
        <div className="flex shrink-0 items-center">
          <Logo size="lg" />
        </div>

        {/* Center: mode tabs (landing only on desktop) */}
        {isLanding ? (
          <div className="hidden md:flex">
            <div className="bg-muted/60 ring-border/60 inline-flex items-center gap-0.5 rounded-full p-1 ring-1">
              {MODES.map((mode) => {
                const Icon = mode.icon;
                const label = t(`nav.modes.${mode.key}`);
                return (
                  <button
                    key={mode.key}
                    type="button"
                    disabled={mode.soon}
                    aria-pressed={mode.active}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
                      mode.active
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                      mode.soon && "hover:text-muted-foreground cursor-not-allowed opacity-70",
                    )}
                  >
                    <Icon className={cn("size-4", mode.active && "text-primary")} />
                    {label}
                    {mode.soon ? (
                      <Badge
                        variant="outline"
                        className="ml-0.5 rounded-full border-dashed px-1.5 py-0 text-[9px] font-medium"
                      >
                        {t("nav.modes.soon")}
                      </Badge>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Right cluster */}
        <div className="hidden shrink-0 items-center gap-1 md:flex">
          <LanguageToggle />
          <ThemeToggle />

          {isLanding ? (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground rounded-full font-medium"
            >
              <Link href="/support">{t("nav.help")}</Link>
            </Button>
          ) : null}

          {user ? (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="border-primary/10 hover:bg-muted ml-1 inline-flex items-center gap-2 rounded-full border px-2 py-1.5 text-sm font-medium"
                  aria-label={t("nav.dashboard")}
                >
                  <Avatar className="size-6">
                    {user.avatar_url ? <AvatarImage src={user.avatar_url} /> : null}
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <span>{t("nav.dashboard")}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 rounded-xl" align="end">
                <div className="space-y-3">
                  <div className="flex flex-col items-center space-y-0.5">
                    <p className="text-sm font-semibold">{user.full_name}</p>
                    <p className="text-muted-foreground text-xs">{user.phone}</p>
                  </div>
                  <div className="flex flex-col gap-2 border-t pt-2">
                    <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                      <Link href="/dashboard">Go to {t("nav.dashboard")}</Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={logout}
                    >
                      <LogOut className="mr-1 size-4" />
                      {t("nav.logout")}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <Button variant="ghost" asChild size="sm" className="rounded-full font-medium">
              <Link href="/login">{t("nav.login")}</Link>
            </Button>
          )}
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1 md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="size-7" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex h-full w-full! max-h-dvh flex-col gap-0 overflow-hidden p-0 sm:max-w-full!"
            >
              <SheetHeader className="shrink-0 border-b px-6 pt-6 pb-4">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>

              <div className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
                  <div className="flex flex-col gap-4 pb-2">
                    {/* Mobile mode tabs */}
                    <div className="bg-muted/60 ring-border/60 inline-flex items-center justify-around gap-0.5 rounded-full p-1 ring-1">
                      {MODES.map((mode) => {
                        const Icon = mode.icon;
                        return (
                          <button
                            key={mode.key}
                            type="button"
                            disabled={mode.soon}
                            className={cn(
                              "inline-flex flex-1 items-center justify-center gap-1 rounded-full px-2 py-1.5 text-xs font-medium",
                              mode.active
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground",
                              mode.soon && "opacity-60",
                            )}
                          >
                            <Icon className={cn("size-3.5", mode.active && "text-primary")} />
                            {t(`nav.modes.${mode.key}`)}
                          </button>
                        );
                      })}
                    </div>

                    {user ? (
                      <div className="space-y-4 border-b pb-4">
                        <Button
                          asChild
                          size="sm"
                          className="group/btn w-full shrink-0 gap-2 rounded-full px-5 shadow-sm"
                        >
                          <Link href="/" onClick={handleLinkClick}>
                            <Search className="size-4 opacity-90" strokeWidth={2.25} />
                            {t("dashboard.searchTrips")}
                            <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
                          </Link>
                        </Button>

                        <div>
                          <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
                            {t("dashboard.accountTitle")}
                          </p>
                          <nav className="flex flex-col gap-0.5" aria-label={t("nav.dashboard")}>
                            {[...DASHBOARD_NAV_MAIN, ...DASHBOARD_NAV_ACCOUNT].map(
                              ({ href, labelKey, Icon, isActive }) => {
                                const active = isActive(pathname);
                                return (
                                  <Link
                                    key={href}
                                    href={href}
                                    onClick={handleLinkClick}
                                    className={cn(
                                      "text-foreground flex items-center gap-3 rounded-lg px-2 py-3 text-base transition-colors",
                                      active
                                        ? "bg-muted text-primary font-semibold"
                                        : "hover:bg-muted/80",
                                    )}
                                  >
                                    <Icon className="size-4 shrink-0 opacity-90" />
                                    {t(labelKey)}
                                  </Link>
                                );
                              },
                            )}
                          </nav>
                        </div>
                      </div>
                    ) : null}

                    <Link
                      href="/support"
                      onClick={handleLinkClick}
                      className="text-foreground py-2 text-base"
                    >
                      {t("nav.help")}
                    </Link>
                    <Link
                      href="/about-us"
                      onClick={handleLinkClick}
                      className="text-foreground py-2 text-base"
                    >
                      {t("footer.aboutUs")}
                    </Link>
                  </div>
                </div>

                <div className="bg-background shrink-0 space-y-4 border-t px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground text-sm">Theme</span>
                    <ThemeToggle />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground text-sm">{t("nav.language")}</span>
                    <LanguageToggle />
                  </div>
                  {user ? (
                    <div className="flex flex-col gap-3">
                      <Link
                        href="/dashboard"
                        onClick={handleLinkClick}
                        className="border-primary/10 hover:bg-muted flex items-center gap-3 rounded-full border px-2 py-1.5"
                      >
                        <Avatar className="size-8">
                          {user.avatar_url ? <AvatarImage src={user.avatar_url} /> : null}
                          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{user.full_name}</p>
                          <p className="text-muted-foreground text-xs">{t("nav.dashboard")}</p>
                        </div>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          logout();
                          handleLinkClick();
                        }}
                      >
                        <LogOut className="mr-2 size-4" />
                        {t("nav.logout")}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Button asChild variant="outline" className="rounded-full">
                        <Link href="/login" onClick={handleLinkClick}>
                          {t("nav.login")}
                        </Link>
                      </Button>
                      <Button asChild className="rounded-full">
                        <Link href="/sign-up" onClick={handleLinkClick}>
                          {t("nav.signup")}
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
