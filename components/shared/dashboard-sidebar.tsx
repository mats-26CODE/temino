"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { DASHBOARD_NAV_ACCOUNT, DASHBOARD_NAV_MAIN } from "@/constants/dashboard-nav";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

export const DashboardSidebar = () => {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { t } = useTranslation();
  const showLabels = state !== "collapsed";

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader className="border-sidebar-border flex flex-row items-center justify-between border-b p-4">
        <span className={cn("font-semibold", state === "collapsed" && "hidden")}>
          {t("dashboard.accountTitle")}
        </span>
        <SidebarTrigger className="shrink-0 group-data-[collapsible=icon]:-ml-1.5" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={cn("text-xs uppercase", !showLabels && "sr-only")}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {DASHBOARD_NAV_MAIN.map(({ href, labelKey, Icon, isActive }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(pathname)}
                    tooltip={t(labelKey)}
                  >
                    <Link href={href}>
                      <Icon className="size-4" />
                      <span>{t(labelKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={cn("text-xs uppercase", !showLabels && "sr-only")}>
            {t("dashboard.accountTitle")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {DASHBOARD_NAV_ACCOUNT.map(({ href, labelKey, Icon, isActive }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(pathname)}
                    tooltip={t(labelKey)}
                  >
                    <Link href={href}>
                      <Icon className="size-4" />
                      <span>{t(labelKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border border-t p-2 group-data-[collapsible=icon]:hidden">
        <p className="text-sidebar-foreground/50 text-center text-xs">
          © {new Date().getFullYear()} All rights reserved.
        </p>
      </SidebarFooter>
    </Sidebar>
  );
};
