"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import AdminLayout from "./AdminLayout";

export default function AdminRouteHandler({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
