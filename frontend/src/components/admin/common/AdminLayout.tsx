"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { admin } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isPublicRoute =
    pathname === "/admin-login" || pathname === "/admin-register";

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  // Handle responsive sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
        setMobileSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  if (isPublicRoute || !admin) {
    return (
      <>
        <AdminNavbar />
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
          {children}
        </main>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Navbar */}
      <AdminNavbar onMobileMenuToggle={toggleMobileSidebar} />

      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Mobile Sidebar */}
      <AdminSidebar
        isOpen={mobileSidebarOpen}
        onToggle={toggleMobileSidebar}
        isMobile={true}
        onMobileClose={closeMobileSidebar}
      />

      {/* Main Content */}
      <main
        className={`
        transition-all duration-300 ease-in-out min-h-[calc(100vh-4rem)]
        lg:ml-16 ${sidebarOpen ? "lg:ml-64" : "lg:ml-16"}
        pt-0
      `}
      >
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
