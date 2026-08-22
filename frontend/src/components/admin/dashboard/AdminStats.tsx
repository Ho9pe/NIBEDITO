"use client";

import React, { useState, useEffect } from "react";
import {
  FiUsers,
  FiShoppingBag,
  FiDollarSign,
  FiBox,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiAlertCircle,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { adminService } from "@/services/adminService";
import type { DashboardStats } from "@/types";

interface GrowthStats {
  usersGrowth: number;
  ordersGrowth: number;
  revenueGrowth: number;
  productsGrowth: number;
}

interface StatsState extends DashboardStats {
  growthStats: GrowthStats;
  isLoading: boolean;
  error: string | null;
}

interface StatCard {
  title: string;
  value: string;
  icon: IconType;
  gradient: string;
  bgColor: string;
  textColor: string;
  growth: number;
  growthLabel: string;
}

export default function AdminStats(): React.JSX.Element {
  const [stats, setStats] = useState<StatsState>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    growthStats: {
      usersGrowth: 0,
      ordersGrowth: 0,
      revenueGrowth: 0,
      productsGrowth: 0,
    },
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchStats = async (): Promise<void> => {
      try {
        const data: DashboardStats = await adminService.getDashboardStats();
        setStats({
          ...data,
          growthStats: data.growthStats || {
            usersGrowth: 12,
            ordersGrowth: 8,
            revenueGrowth: 15,
            productsGrowth: 5,
          },
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        setStats((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message || "Failed to load statistics",
        }));
      }
    };

    fetchStats();
  }, []);

  if (stats.isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 h-32">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                <div className="w-16 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="w-20 h-8 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
              <div className="w-24 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiAlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
          Error Loading Statistics
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          {stats.error}
        </p>
      </div>
    );
  }

  const statCards: StatCard[] = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: FiUsers,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      growth: stats.growthStats.usersGrowth,
      growthLabel: "vs last month",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: FiShoppingBag,
      gradient: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      textColor: "text-emerald-600 dark:text-emerald-400",
      growth: stats.growthStats.ordersGrowth,
      growthLabel: "vs last month",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: FiDollarSign,
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
      growth: stats.growthStats.revenueGrowth,
      growthLabel: "vs last month",
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      icon: FiBox,
      gradient: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-600 dark:text-orange-400",
      growth: stats.growthStats.productsGrowth,
      growthLabel: "vs last month",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const isPositiveGrowth: boolean = stat.growth >= 0;
        const GrowthIcon: IconType = isPositiveGrowth
          ? FiTrendingUp
          : FiTrendingDown;

        return (
          <div
            key={index}
            className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:-translate-y-1"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
              >
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>

              <div className="flex items-center gap-1">
                <GrowthIcon
                  className={`w-4 h-4 ${
                    isPositiveGrowth
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                />
                <span
                  className={`text-sm font-semibold ${
                    isPositiveGrowth
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {isPositiveGrowth ? "+" : ""}
                  {stat.growth}%
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {stat.title}
              </h3>

              <p className="text-3xl font-bold text-slate-800 dark:text-slate-200 group-hover:scale-105 transition-transform duration-200">
                {stat.value}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {stat.growthLabel}
              </p>
            </div>

            {/* Hover Effect */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-200 pointer-events-none`}
            ></div>

            {/* Animated Border */}
            <div
              className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 pointer-events-none -z-10`}
            ></div>
          </div>
        );
      })}
    </div>
  );
}
