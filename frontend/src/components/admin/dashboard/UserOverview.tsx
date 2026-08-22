"use client";

import React, { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import type { UserStats } from "@/types/admin";
import type { IconType } from "react-icons";
import {
  FiUser,
  FiUserCheck,
  FiUserX,
  FiUsers,
  FiAlertCircle,
  FiMail,
  FiPhone,
  FiTrendingUp,
} from "react-icons/fi";

interface UserStatsState extends UserStats {
  isLoading: boolean;
  error: string | null;
}

interface StatCardData {
  title: string;
  value: number;
  icon: IconType;
  gradient: string;
  bgColor: string;
  textColor: string;
  change: string | number | null;
  changeLabel: string | null;
}

export default function UserOverview(): React.JSX.Element {
  const [userStats, setUserStats] = useState<UserStatsState>({
    totalUsers: 0,
    activeUsers: 0,
    bannedUsers: 0,
    recentRegistrations: 0,
    verificationStats: {
      emailVerified: 0,
      phoneVerified: 0,
    },
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchUserStats = async (): Promise<void> => {
      try {
        const response: UserStats = await adminService.getUserStats();
        setUserStats({
          ...response,
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        setUserStats((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message || "Failed to load user statistics",
        }));
      }
    };

    fetchUserStats();
  }, []);

  if (userStats.isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (userStats.error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiAlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
          Error Loading User Stats
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          {userStats.error}
        </p>
      </div>
    );
  }

  const statsData: StatCardData[] = [
    {
      title: "Total Users",
      value: userStats.totalUsers,
      icon: FiUsers,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      change: `+${userStats.recentRegistrations}`,
      changeLabel: "this week",
    },
    {
      title: "Active Users",
      value: userStats.activeUsers,
      icon: FiUserCheck,
      gradient: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      textColor: "text-emerald-600 dark:text-emerald-400",
      change: userStats.verificationStats.emailVerified,
      changeLabel: "verified",
    },
    {
      title: "Banned Users",
      value: userStats.bannedUsers,
      icon: FiUserX,
      gradient: "from-red-500 to-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      textColor: "text-red-600 dark:text-red-400",
      change: null,
      changeLabel: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* User Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className="group relative bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div
                  className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}
                >
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>

                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  {stat.title}
                </h3>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    {stat.value}
                  </span>

                  {stat.change !== null && (
                    <div className="flex items-center gap-1">
                      <FiTrendingUp className={`w-3 h-3 ${stat.textColor}`} />
                      <span className={`text-xs font-medium ${stat.textColor}`}>
                        +{stat.change}
                      </span>
                    </div>
                  )}
                </div>

                {stat.changeLabel && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {stat.changeLabel}
                  </p>
                )}
              </div>
            </div>

            {/* Hover Effect */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-200 pointer-events-none`}
            ></div>
          </div>
        ))}
      </div>

      {/* Verification Stats */}
      <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <FiUser className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          Verification Status
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <FiMail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Email Verified
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Users with verified emails
                </p>
              </div>
            </div>
            <span className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {userStats.verificationStats.emailVerified}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <FiPhone className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Phone Verified
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Users with verified phones
                </p>
              </div>
            </div>
            <span className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {userStats.verificationStats.phoneVerified}
            </span>
          </div>
        </div>
      </div>

      {/* View All Users Button */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <button className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group">
          <span className="flex items-center justify-center gap-2">
            Manage All Users
            <FiUsers className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </span>
        </button>
      </div>
    </div>
  );
}
