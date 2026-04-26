"use client";

import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { ToastAlert } from "@/config/toast";
import { ThemeProvider } from "@/contexts/theme-context";
import { getQueryClient } from "@/config/query-client";

const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = getQueryClient();

  if (!queryClient) {
    ToastAlert.error("Failed to setup client query provider connection");
    return null;
  }

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" />
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default Providers;
