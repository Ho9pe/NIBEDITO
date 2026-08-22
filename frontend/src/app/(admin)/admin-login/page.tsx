"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import AdminLoginForm from "@/components/admin/auth/AdminLoginForm";
import type { Admin } from "@/types";

interface AdminAuthContextType {
  admin: Admin | null;
  isLoading: boolean;
}

export default function AdminLoginPage(): React.JSX.Element {
  const router = useRouter();
  const { admin, isLoading }: AdminAuthContextType = useAdminAuth();

  useEffect(() => {
    if (!isLoading && admin) {
      router.push("/admin/dashboard");
    }
  }, [isLoading, admin, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-surface to-surface-elevated">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-text-secondary text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-surface to-surface-elevated p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Admin Portal Card */}
        <div className="card-modern p-6 sm:p-8 space-y-6 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Admin Portal
            </h1>
            <p className="text-text-secondary text-sm sm:text-base">
              Login to manage your ecommerce platform
            </p>
          </div>

          {/* Login Form */}
          <AdminLoginForm />

          {/* Footer */}
          <div className="text-center pt-4 border-t border-border">
            <p className="text-xs text-text-tertiary">
              Protected admin area • Authorized access only
            </p>
          </div>
        </div>

        {/* Additional Info Card - Hidden on mobile */}
        <div className="hidden sm:block mt-6 p-4 bg-surface-elevated/50 backdrop-blur-sm rounded-lg border border-border/50">
          <div className="flex items-center space-x-3 text-sm text-text-secondary">
            <svg
              className="w-4 h-4 text-info"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Secure admin authentication with session management</span>
          </div>
        </div>
      </div>
    </div>
  );
}
