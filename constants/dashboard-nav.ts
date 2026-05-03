import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Settings, Ticket, User } from "lucide-react";

export type DashboardNavTranslationKey =
  | "dashboard.sidebarOverview"
  | "dashboard.myTrips"
  | "dashboard.profile"
  | "dashboard.settings";

export type DashboardNavItemConfig = {
  href: string;
  labelKey: DashboardNavTranslationKey;
  Icon: LucideIcon;
  isActive: (pathname: string) => boolean;
};

export const DASHBOARD_NAV_MAIN: DashboardNavItemConfig[] = [
  {
    href: "/dashboard",
    labelKey: "dashboard.sidebarOverview",
    Icon: LayoutDashboard,
    isActive: (pathname) => pathname === "/dashboard" || pathname === "/dashboard/",
  },
  {
    href: "/dashboard/trips",
    labelKey: "dashboard.myTrips",
    Icon: Ticket,
    isActive: (pathname) => pathname.startsWith("/dashboard/trips"),
  },
];

export const DASHBOARD_NAV_ACCOUNT: DashboardNavItemConfig[] = [
  {
    href: "/dashboard/profile",
    labelKey: "dashboard.profile",
    Icon: User,
    isActive: (pathname) => pathname.startsWith("/dashboard/profile"),
  },
  {
    href: "/dashboard/settings",
    labelKey: "dashboard.settings",
    Icon: Settings,
    isActive: (pathname) => pathname.startsWith("/dashboard/settings"),
  },
];
