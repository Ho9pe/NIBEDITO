"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// The sidebar used to be rendered by the dashboard page itself, so it existed
// on /dashboard and nowhere else - following any link in it made the panel
// disappear. Rendering it from the layout keeps it in place across the whole
// account area, and keeps it mounted between navigations rather than rebuilding
// it each time.
//
// Cart and checkout live in this route group as well but are not account pages:
// they want the full width and have their own flow, so they render bare.
const ACCOUNT_PATHS = [
  "/dashboard",
  "/my-orders",
  "/my-reviews",
  "/profile",
  "/security",
  "/wishlist",
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  const isAccountPage = ACCOUNT_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // The signed-out redirect has to happen here, not only in the pages. A layout
  // that renders a spinner in place of its children stops those pages mounting
  // at all, so their own guards would never run.
  useEffect(() => {
    if (isAccountPage && !isLoading && !user) {
      router.push("/login");
    }
  }, [isAccountPage, isLoading, user, router]);

  if (!isAccountPage) return <>{children}</>;
  if (isLoading || !user) return <LoadingSpinner fullPage={true} />;

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex min-h-screen">
        <DashboardSidebar user={user} onLogout={handleLogout} />
        <main className="flex-1 min-w-0 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
