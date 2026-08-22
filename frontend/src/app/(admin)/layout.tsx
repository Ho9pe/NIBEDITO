"use client";

import React, { ReactNode } from "react";
import AdminNavbar from "@/components/admin/common/AdminNavbar";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({
  children,
}: AdminLayoutProps): React.JSX.Element {
  return (
    <div className="admin-layout">
      <main className="admin-main">{children}</main>
    </div>
  );
}
