"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  FiUsers,
  FiPackage,
  FiGrid,
  FiTag,
  FiTruck,
  FiShoppingCart,
  FiMessageCircle,
  FiLayers,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiActivity,
} from "react-icons/fi";
import { useState, useEffect } from "react";

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  onMobileClose?: () => void;
}

export default function AdminSidebar({
  isOpen,
  onToggle,
  isMobile = false,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { admin } = useAdminAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: "/admin/dashboard", icon: FiHome, label: "Dashboard" },
    { href: "/admin/analytics", icon: FiActivity, label: "Analytics" },
    { href: "/admin/users", icon: FiUsers, label: "Users" },
    { href: "/admin/categories", icon: FiGrid, label: "Categories" },
    { href: "/admin/subcategories", icon: FiLayers, label: "Subcategories" },
    { href: "/admin/products", icon: FiPackage, label: "Products" },
    { href: "/admin/orders", icon: FiShoppingCart, label: "Orders" },
    { href: "/admin/coupons", icon: FiTag, label: "Coupons" },
    { href: "/admin/shipping", icon: FiTruck, label: "Shipping" },
    { href: "/admin/faqs", icon: FiMessageCircle, label: "FAQs" },
  ];

  const handleLinkClick = () => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  if (!mounted) return null;

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onMobileClose}
          />
        )}

        {/* Mobile Sidebar */}
        <aside
          className={`
          fixed top-0 left-0 h-full w-80 bg-white dark:bg-slate-900 
          border-r border-slate-200 dark:border-slate-800 shadow-xl z-50 lg:hidden
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
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
                <span className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  Admin Panel
                </span>
              </div>
              <button
                onClick={onMobileClose}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Admin Info */}
            {admin && (
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-600 to-rose-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">
                      {admin?.name?.charAt(0).toUpperCase() || "A"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {admin?.name || "Admin"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {admin?.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navLinks.map(({ href, icon: Icon, label }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={handleLinkClick}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium
                      transition-all duration-200 group
                      ${
                        isActive
                          ? "bg-rose-600 text-white shadow-lg shadow-rose-600/25"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }
                    `}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isActive ? "text-white" : "group-hover:scale-110"
                      } transition-transform`}
                    />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <aside
      className={`
      fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 
      border-r border-slate-200 dark:border-slate-800 shadow-lg z-30
      transform transition-all duration-300 ease-in-out hidden lg:block
      ${isOpen ? "w-64" : "w-16"}
    `}
    >
      <div className="flex flex-col h-full">
        {/* Header with Admin Panel text and Toggle Button */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          {isOpen && (
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-to-br from-rose-600 to-rose-700 rounded-md flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
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
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Admin Panel
              </span>
            </div>
          )}
          <button
            onClick={onToggle}
            className={`p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
              !isOpen ? "mx-auto" : ""
            }`}
            title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? (
              <FiChevronLeft className="w-5 h-5" />
            ) : (
              <FiChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Admin Profile - Desktop */}
        {admin && isOpen && (
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-600 to-rose-700 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {admin?.name?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {admin?.name || "Admin"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {admin?.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed state - show admin avatar only */}
        {admin && !isOpen && (
          <div className="p-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-600 to-rose-700 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">
                  {admin?.name?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto admin-sidebar-scroll">
          {navLinks.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex items-center rounded-xl text-sm font-medium
                  transition-all duration-200 group relative
                  ${isOpen ? "px-3 py-2.5 space-x-3" : "p-2.5 justify-center"}
                  ${
                    isActive
                      ? "bg-rose-600 text-white shadow-lg shadow-rose-600/25"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }
                `}
                title={!isOpen ? label : undefined}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-white" : "group-hover:scale-110"
                  } transition-transform`}
                />
                {isOpen && <span>{label}</span>}

                {/* Tooltip for collapsed state */}
                {!isOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer - Collapsed indicator */}
        {!isOpen && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-rose-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
