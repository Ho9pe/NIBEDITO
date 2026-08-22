"use client";

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";
import { useEffect } from "react";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  useEffect(() => {
    // Ensure theme classes are applied correctly
    const observer = new MutationObserver(() => {
      const html = document.documentElement;
      const isDark = html.classList.contains("dark");
      html.setAttribute("data-theme", isDark ? "dark" : "light");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
