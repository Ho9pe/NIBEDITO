"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiGrid,
  FiShoppingBag,
  FiHeart,
  FiMessageSquare,
  FiUser,
  FiLock,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { getImageUrl } from "@/utils/imageUtils";
import { orderService } from "@/services/orderService";
import type { User } from "@/types";

interface DashboardSidebarProps {
  user: User;
  onLogout: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

export default function DashboardSidebar({
  user,
  onLogout,
}: DashboardSidebarProps): React.JSX.Element {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const result = await orderService.getUserOrders();
        if (result.success && result.data) {
          const count = result.data.filter(
            (o) =>
              o.status?.toLowerCase() === "pending" ||
              o.status?.toLowerCase() === "processing"
          ).length;
          setPendingCount(count);
        }
      } catch {
        // silently fail
      }
    };
    fetchPending();
  }, []);

  const navItems: NavItem[] = [
    {
      title: "Overview",
      href: "/dashboard",
      icon: <FiGrid className="w-5 h-5 flex-shrink-0" />,
    },
    {
      title: "My Orders",
      href: "/my-orders",
      icon: <FiShoppingBag className="w-5 h-5 flex-shrink-0" />,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    // /wishlist has no page yet, so this 404s for now. Kept deliberately: the entry
    // stays visible while the page is built. Tracked in the README.
    {
      title: "Wishlist",
      href: "/wishlist",
      icon: <FiHeart className="w-5 h-5 flex-shrink-0" />,
    },
    {
      title: "My Reviews",
      href: "/my-reviews",
      icon: <FiMessageSquare className="w-5 h-5 flex-shrink-0" />,
    },
    // "Addresses" and "Edit Profile" were two entries pointing at the same
    // /profile page, which manages both. One entry, one destination.
    {
      title: "Profile & Addresses",
      href: "/profile",
      icon: <FiUser className="w-5 h-5 flex-shrink-0" />,
    },
    {
      title: "Security",
      href: "/security",
      icon: <FiLock className="w-5 h-5 flex-shrink-0" />,
    },
  ];

  const isActive = (href: string) => pathname === href;

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div
      className={`flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${
        isMobile ? "w-72" : isCollapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Header: Toggle button + User info */}
      <div
        className={`flex items-center border-b border-slate-200 dark:border-slate-800 ${
          isCollapsed && !isMobile ? "flex-col py-4 px-2 gap-3" : "px-4 py-4 gap-3"
        }`}
      >
        {/* Avatar */}
        <Link
          href="/profile"
          onClick={() => setIsMobileOpen(false)}
          className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-slate-200 dark:ring-slate-700 hover:ring-rose-400 dark:hover:ring-rose-500 transition-all duration-200 flex-shrink-0"
        >
          {user.profilePicture ? (
            <Image
              src={getImageUrl(user.profilePicture)}
              alt={user.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>

        {/* Name + email (hidden when collapsed) */}
        {(!isCollapsed || isMobile) && (
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
              {user.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user.email}
            </p>
          </div>
        )}

        {/* Collapse toggle — desktop only */}
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 flex-shrink-0"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <FiChevronRight className="w-4 h-4" />
            ) : (
              <FiChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Close button — mobile only */}
        {isMobile && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 flex-shrink-0 ml-auto"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.title}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              title={isCollapsed && !isMobile ? item.title : undefined}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              } ${isCollapsed && !isMobile ? "justify-center px-2" : ""}`}
            >
              {/* Icon */}
              <span
                className={`transition-colors duration-200 ${
                  active
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                }`}
              >
                {item.icon}
              </span>

              {/* Label (hidden when collapsed) */}
              {(!isCollapsed || isMobile) && (
                <span className="flex-1 truncate">{item.title}</span>
              )}

              {/* Badge */}
              {item.badge !== undefined && (!isCollapsed || isMobile) && (
                <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-rose-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}

              {/* Badge (icon-only mode) */}
              {item.badge !== undefined && isCollapsed && !isMobile && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />
              )}

              {/* Active pill indicator */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-rose-500 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={() => {
            setIsMobileOpen(false);
            onLogout();
          }}
          title={isCollapsed && !isMobile ? "Logout" : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group ${
            isCollapsed && !isMobile ? "justify-center px-2" : ""
          }`}
        >
          <FiLogOut className="w-5 h-5 flex-shrink-0 transition-colors duration-200 group-hover:text-red-500" />
          {(!isCollapsed || isMobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar
          h-full collapsed to the height of its own nav items, leaving the panel
          floating in the top-left corner: h-full needs a parent with a definite
          height, and the layout row only sets min-h-screen. Pinning it to a
          viewport-derived height fills the column instead. top-16 / 4rem is the
          navbar, which is sticky h-16 above this, so the sidebar sits directly
          beneath it rather than sliding underneath. */}
      <aside className="hidden lg:flex flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
        <SidebarContent />
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-6 left-4 z-40 flex items-center justify-center w-12 h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg shadow-rose-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Open account menu"
      >
        <FiMenu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="relative z-10 h-full overflow-y-auto animate-slide-in-left">
            <SidebarContent isMobile />
          </div>
        </div>
      )}
    </>
  );
}
