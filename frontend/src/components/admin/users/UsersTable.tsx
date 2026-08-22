"use client";

import React from "react";
import Pagination from "@/components/common/Pagination";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiUserCheck,
  FiUserX,
  FiTrash2,
} from "react-icons/fi";
import type { User, PaginationInfo } from "@/types";

interface UsersTableProps {
  users: User[];
  pagination: PaginationInfo;
  setPagination: (pagination: Partial<PaginationInfo>) => void;
  onBanUser: (userId: string) => Promise<void>;
  onUnbanUser: (userId: string) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  loading: boolean;
}

export default function UsersTable({
  users,
  pagination,
  setPagination,
  onBanUser,
  onUnbanUser,
  onDeleteUser,
  loading,
}: UsersTableProps): React.JSX.Element {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handlePageChange = (newPage: number): void => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination({ page: newPage });
    }
  };

  const handleLimitChange = (newLimit: number): void => {
    setPagination({
      limit: newLimit,
      page: 1, // Reset to first page when changing limit
    });
  };

  const getStatusBadge = (user: User): React.JSX.Element => {
    if (user.isBanned) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <FiUserX className="w-3 h-3" />
          Banned
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        <FiUserCheck className="w-3 h-3" />
        Active
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
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

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <FiUser className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
          No Users Found
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          No users match your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-400">
                User
              </th>
              <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-400">
                Contact
              </th>
              <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-400">
                Status
              </th>
              <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-400">
                Joined
              </th>
              <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {user.name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        ID: {user._id.slice(-8)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <FiMail className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-700 dark:text-slate-300">
                        {user.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FiPhone className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-700 dark:text-slate-300">
                        {user.phone}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">{getStatusBadge(user)}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <FiCalendar className="w-3 h-3" />
                    <span>{formatDate(user.createdAt)}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    {user.isBanned ? (
                      <button
                        onClick={() => onUnbanUser(user._id)}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                        title="Unban User"
                      >
                        <FiUserCheck className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onBanUser(user._id)}
                        className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                        title="Ban User"
                      >
                        <FiUserX className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteUser(user._id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete User"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        showLimitSelector={true}
        limitOptions={[5, 10, 25, 50]}
        compact={true}
        className="flex-shrink-0"
      />
    </div>
  );
}
