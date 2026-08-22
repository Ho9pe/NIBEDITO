"use client";

import {
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiCalendar,
  FiMapPin,
  FiEdit3,
  FiSettings,
} from "react-icons/fi";
import type { Admin } from "@/types";
import React from "react";
import { logger } from "@/utils/logger";

interface AdminProfileProps {
  admin: Admin | null;
}

interface AdminInfo {
  name: string;
  email: string;
  phone: string;
  role: string;
  joinDate: string;
  location: string;
  lastLogin: string;
}

export default function AdminProfile({
  admin,
}: AdminProfileProps): React.JSX.Element {
  const defaultInfo: AdminInfo = {
    name: admin?.name || "Admin User",
    email: admin?.email || "No email provided",
    phone: admin?.phone || "Not Provided",
    role: admin?.role || "admin",
    joinDate: admin?.createdAt || new Date().toISOString(),
    location: "Not specified",
    lastLogin: admin?.lastLogin || new Date().toISOString(),
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleEditClick = (): void => {
    // TODO: Implement edit functionality
    logger.debug("Edit profile clicked");
  };

  const handleSettingsClick = (): void => {
    // TODO: Implement settings functionality
    logger.debug("Settings clicked");
  };

  const handleQuickActionClick = (action: string): void => {
    // TODO: Implement quick action navigation
    logger.debug(`Quick action clicked: ${action}`);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6">
        <div className="relative group">
          <div className="w-24 h-24 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
            <span className="text-white text-3xl font-bold">
              {defaultInfo.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            {defaultInfo.name}
          </h2>
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
            <FiShield className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span className="text-sm font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wide">
              {defaultInfo.role} Administrator
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Managing the platform since {formatDate(defaultInfo.joinDate)}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleEditClick}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
          >
            <FiEdit3 className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            onClick={handleSettingsClick}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
          >
            <FiSettings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>

      {/* Profile Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <FiUser className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            Contact Information
          </h3>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiMail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Email Address
                </label>
                <p className="text-slate-800 dark:text-slate-200 font-medium break-all">
                  {defaultInfo.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiPhone className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Phone Number
                </label>
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  {defaultInfo.phone}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiMapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Location
                </label>
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  {defaultInfo.location}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <FiShield className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            Account Details
          </h3>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiShield className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="min-w-0 flex-1">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Account Type
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-800 dark:text-slate-200 font-medium capitalize">
                    {defaultInfo.role}
                  </span>
                  <span className="px-2 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-xs font-medium rounded-full">
                    Super Admin
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiCalendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="min-w-0 flex-1">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Member Since
                </label>
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  {formatDate(defaultInfo.joinDate)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiCalendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Last Login
                </label>
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  {formatDate(defaultInfo.lastLogin)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 border-t border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group">
            <FiUser className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Manage Users</span>
          </button>

          <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group">
            <FiShield className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Security Settings</span>
          </button>

          <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group">
            <FiSettings className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">System Config</span>
          </button>
        </div>
      </div>
    </div>
  );
}
