"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { DashboardSidebar } from "@/components/shared/dashboard-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useUser } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading) return;
    // check if the user is authenticated
    if (!user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <NavBar />
      <div className="dashboard-sidebar flex min-h-0 flex-1">
        <SidebarProvider>
          <DashboardSidebar />
          <SidebarInset className="flex w-full flex-col">
            <main className="border-border/40 from-background to-muted/20 w-full flex-1 overflow-auto border-t bg-gradient-to-b p-6 md:p-8">
              <div className="mx-auto w-full max-w-6xl">{children}</div>
            </main>
            <Footer />
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default DashboardLayout;
