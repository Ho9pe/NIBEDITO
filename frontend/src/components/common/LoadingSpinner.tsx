"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({
  size = "md",
  fullPage = true,
  className,
}: LoadingSpinnerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const spinner = (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-700/25 bg-[size:20px_20px] opacity-50"></div>

        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg animate-pulse">
            {mounted && spinner}
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-medium animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return mounted ? spinner : <div className={cn(sizeClasses[size])} />;
}
