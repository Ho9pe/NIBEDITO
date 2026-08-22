"use client";

import { Button } from "@/components/ui/button";
import { FiLogOut } from "react-icons/fi";
import type { User } from "@/types";

interface DashboardHeaderProps {
  user: User;
  onLogout: () => void;
}

export default function DashboardHeader({
  user,
  onLogout,
}: DashboardHeaderProps): React.JSX.Element {
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800 relative">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1">
          {getGreeting()}, <span className="text-rose-600 dark:text-rose-400">{user.name.split(" ")[0]}</span>!
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Welcome to your account dashboard
        </p>
      </div>
      {/* Hide logout button on mobile, show only on desktop */}
      <Button
        onClick={onLogout}
        variant="outline"
        className="hidden sm:flex gap-2 border-slate-300 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:border-rose-400 dark:hover:border-rose-600 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
      >
        <FiLogOut className="w-4 h-4" />
        <span>Logout</span>
      </Button>
    </div>
  );
}
