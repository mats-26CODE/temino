"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Ticket, User, Settings, History } from "lucide-react";
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
import { cn } from "@/lib/utils";

export const DashboardSidebar = () => {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard" || pathname === "/dashboard/";
    return pathname.startsWith(path);
  };
  const showLabels = state !== "collapsed";

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader className="border-sidebar-border flex flex-row items-center justify-between border-b p-4">
        <span className={cn("font-semibold", state === "collapsed" && "hidden")}>Account</span>
        <SidebarTrigger className="shrink-0 group-data-[collapsible=icon]:-ml-1.5" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={cn("text-xs uppercase", !showLabels && "sr-only")}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard")} tooltip="Overview">
                  <Link href="/dashboard">
                    <LayoutDashboard className="size-4" />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/dashboard/trips")}
                  tooltip="My trips"
                >
                  <Link href="/dashboard/trips">
                    <Ticket className="size-4" />
                    <span>My trips</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/dashboard/history")}
                  tooltip="Trip history"
                >
                  <Link href="/dashboard/history">
                    <History className="size-4" />
                    <span>Trip history</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={cn("text-xs uppercase", !showLabels && "sr-only")}>
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/dashboard/profile")}
                  tooltip="Profile"
                >
                  <Link href="/dashboard/profile">
                    <User className="size-4" />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/dashboard/settings")}
                  tooltip="Settings"
                >
                  <Link href="/dashboard/settings">
                    <Settings className="size-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
