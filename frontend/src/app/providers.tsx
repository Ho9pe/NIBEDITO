"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      themes={["light", "dark", "system"]}
    >
      {children}
      <Toaster />
    </ThemeProvider>
  );
};

export default Providers;
