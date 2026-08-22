"use client";

import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import RecentOrders from "@/components/dashboard/RecentOrders";
import type { AuthContextType } from "@/contexts/AuthContext";

export default function DashboardPage(): React.JSX.Element {
  // The sidebar, the signed-out redirect and the page chrome now live in
  // (user)/layout.tsx, so they apply to every account page instead of this one.
  const { user, isLoading }: AuthContextType = useAuth();

  if (isLoading || !user) {
    return <LoadingSpinner fullPage={true} />;
  }

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 lg:py-8 max-w-5xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1">
          {getGreeting()},{" "}
          <span className="text-rose-600 dark:text-rose-400">
            {user.name.split(" ")[0]}
          </span>
          !
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Here&apos;s what&apos;s happening with your account today.
        </p>
      </div>

      {/* Stats Overview */}
      <section aria-label="Order statistics" className="mb-6">
        <DashboardOverview />
      </section>

      {/* Recent Orders */}
      <section aria-label="Recent orders">
        <RecentOrders />
      </section>
    </div>
  );
}
