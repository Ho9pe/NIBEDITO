"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import AdminStats from "@/components/admin/dashboard/AdminStats";
import RecentOrders from "@/components/admin/dashboard/RecentOrders";
import UserOverview from "@/components/admin/dashboard/UserOverview";
import AdminProfile from "@/components/admin/dashboard/AdminProfile";
import type { Admin } from "@/types";
import {
  FiUser,
  FiShield,
  FiClock,
  FiCalendar,
  FiActivity,
  FiTrendingUp,
} from "react-icons/fi";

interface AdminAuthContextType {
  admin: Admin | null;
  isLoading: boolean;
}

export default function AdminDashboardPage(): React.JSX.Element {
  const router = useRouter();
  const { admin, isLoading }: AdminAuthContextType = useAdminAuth();
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoading && admin) {
      setIsDataLoaded(true);
    }
  }, [isLoading, admin]);

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push("/admin-login");
    }
  }, [isLoading, admin, router]);

  if (isLoading || !admin || !isDataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  const currentTime: string = new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const getAdminInitial = (): string => {
    return admin.name?.charAt(0).toUpperCase() || "A";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="dashboard-header-gradient rounded-2xl mx-4 sm:mx-6 lg:mx-8 mt-4 sm:mt-6 lg:mt-8 mb-6 sm:mb-8">
          <div className="relative z-10 px-6 sm:px-8 lg:px-12 py-8 sm:py-10 lg:py-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Welcome Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <FiShield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-1">
                      Welcome Back!
                    </h1>
                    <p className="text-white/90 text-lg sm:text-xl font-medium">
                      {admin.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <FiCalendar className="w-4 h-4" />
                  <span className="text-sm font-medium">{currentTime}</span>
                </div>
              </div>

              {/* Admin Info Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <span className="text-white text-xl font-bold">
                      {getAdminInitial()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      {admin.name}
                    </h3>
                    <p className="text-white/80 text-sm font-medium">
                      Super Administrator
                    </p>
                    <p className="text-white/70 text-xs">{admin.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8 space-y-8">
        {/* Quick Stats Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <FiActivity className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200">
              System Overview
            </h2>
          </div>
          <AdminStats />
        </section>

        {/* Profile Information Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <FiUser className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200">
              Profile Information
            </h2>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <AdminProfile admin={admin} />
          </div>
        </section>

        {/* Data Overview Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <FiTrendingUp className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200">
              Recent Activity
            </h2>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* Recent Orders */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <FiClock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                    Recent Orders
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <RecentOrders />
              </div>
            </div>

            {/* User Overview */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                    User Overview
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <UserOverview />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
