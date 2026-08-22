"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { FiLogOut, FiMenu } from "react-icons/fi";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface AdminNavbarProps {
  onMobileMenuToggle?: () => void;
}

export default function AdminNavbar({ onMobileMenuToggle }: AdminNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { admin, logoutAdmin } = useAdminAuth();

  const isPublicRoute =
    pathname === "/admin-login" || pathname === "/admin-register";

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      router.push("/admin-login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-40 backdrop-blur-sm bg-white/95 dark:bg-slate-900/95">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Mobile menu + Logo */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            {!isPublicRoute && admin && (
              <button
                onClick={onMobileMenuToggle}
                className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <FiMenu className="w-6 h-6" />
              </button>
            )}

            {/* Logo */}
            <Link
              href={admin ? "/admin/dashboard" : "/"}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-rose-600 to-rose-700 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-200">
                Nibedito Admin
              </span>
            </Link>
          </div>

          {/* Right side - Theme toggle and admin actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {!isPublicRoute && admin ? (
              <>
                {/* Desktop admin info */}
                <div className="hidden md:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {admin?.name || "Admin"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Administrator
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-rose-600 to-rose-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {admin?.name?.charAt(0).toUpperCase() || "A"}
                    </span>
                  </div>
                </div>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all duration-200"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </>
            ) : (
              <Link
                href="/"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>Back to Store</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
