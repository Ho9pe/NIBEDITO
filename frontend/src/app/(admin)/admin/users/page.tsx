"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { adminService } from "@/services/adminService";
import UserFilters from "@/components/admin/users/UserFilters";
import UsersTable from "@/components/admin/users/UsersTable";
import ConfirmDialog from "@/components/admin/users/ConfirmDialog";
import type {
  Admin,
  User,
  GetAllUsersParams,
  GetAllUsersResponse,
  ApiResponse,
  PaginationInfo,
} from "@/types";
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiActivity,
  FiAlertCircle,
} from "react-icons/fi";

interface AdminAuthContextType {
  admin: Admin | null;
  isLoading: boolean;
}

interface FiltersState {
  search: string;
  filter: "all" | "active" | "banned";
  sortBy: string;
  order: "asc" | "desc";
}

interface DialogConfig {
  isOpen: boolean;
  title: string;
  message: string;
  actionType: "ban" | "unban" | "delete";
  onConfirm: (() => Promise<void>) | null;
}

export default function UsersPage(): React.JSX.Element {
  const router = useRouter();
  const { admin, isLoading }: AdminAuthContextType = useAdminAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    pages: 1,
    page: 1,
    limit: 10,
    hasNext: false,
    hasPrev: false,
    nextPage: null,
    prevPage: null,
  });
  const [filters, setFilters] = useState<FiltersState>({
    search: "",
    filter: "all",
    sortBy: "createdAt",
    order: "desc",
  });
  const [dialogConfig, setDialogConfig] = useState<DialogConfig>({
    isOpen: false,
    title: "",
    message: "",
    actionType: "ban",
    onConfirm: null,
  });

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push("/admin-login");
    }
  }, [isLoading, admin, router]);

  useEffect(() => {
    const fetchUsers = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const params: GetAllUsersParams = {
          page: pagination.page,
          limit: pagination.limit,
          ...filters,
        };

        const response: ApiResponse<GetAllUsersResponse> =
          await adminService.getAllUsers(params);

        if (response.success && response.payload) {
          setUsers(response.payload.users);
          setPagination(response.payload.pagination);
        } else {
          throw new Error(response.message || "Failed to fetch users");
        }
      } catch (error: any) {
        console.error("Error fetching users:", error);
        setError(error.message || "Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (admin) {
      fetchUsers();
    }
  }, [admin, pagination.page, pagination.limit, filters]);

  const showConfirmDialog = (config: Omit<DialogConfig, "isOpen">): void => {
    setDialogConfig({ ...config, isOpen: true });
  };

  const closeDialog = (): void => {
    setDialogConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const refreshUsers = async (): Promise<void> => {
    try {
      const params: GetAllUsersParams = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };

      const response: ApiResponse<GetAllUsersResponse> =
        await adminService.getAllUsers(params);

      if (response.success && response.payload) {
        setUsers(response.payload.users);
      }
    } catch (error: any) {
      console.error("Error refreshing users:", error);
    }
  };

  const handleBanUser = async (userId: string): Promise<void> => {
    const user: User | undefined = users.find((u) => u._id === userId);
    if (!user) return;

    showConfirmDialog({
      title: "Ban User",
      message: `Are you sure you want to ban ${user.name}? They will no longer be able to access their account.`,
      actionType: "ban",
      onConfirm: async (): Promise<void> => {
        try {
          await adminService.banUser(userId);
          await refreshUsers();
          closeDialog();
        } catch (error: any) {
          console.error("Error banning user:", error);
          setError(error.message || "Failed to ban user");
        }
      },
    });
  };

  const handleUnbanUser = async (userId: string): Promise<void> => {
    const user: User | undefined = users.find((u) => u._id === userId);
    if (!user) return;

    showConfirmDialog({
      title: "Unban User",
      message: `Are you sure you want to unban ${user.name}? They will regain access to their account.`,
      actionType: "unban",
      onConfirm: async (): Promise<void> => {
        try {
          await adminService.unbanUser(userId);
          await refreshUsers();
          closeDialog();
        } catch (error: any) {
          console.error("Error unbanning user:", error);
          setError(error.message || "Failed to unban user");
        }
      },
    });
  };

  const handleDeleteUser = async (userId: string): Promise<void> => {
    const user: User | undefined = users.find((u) => u._id === userId);
    if (!user) return;

    showConfirmDialog({
      title: "Delete User",
      message: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      actionType: "delete",
      onConfirm: async (): Promise<void> => {
        try {
          await adminService.deleteUser(userId);
          await refreshUsers();
          closeDialog();
        } catch (error: any) {
          console.error("Error deleting user:", error);
          setError(error.message || "Failed to delete user");
        }
      },
    });
  };

  const handleFiltersChange = (newFilters: Partial<FiltersState>): void => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    // Reset to first page when filters change
    if (pagination.page !== 1) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  };

  const handlePaginationChange = (
    newPagination: Partial<PaginationInfo>
  ): void => {
    setPagination((prev) => ({ ...prev, ...newPagination }));
  };

  if (isLoading || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  const totalUsers: number = pagination.total;
  const activeUsers: number = users.filter((user) => !user.isBanned).length;
  const bannedUsers: number = users.filter((user) => user.isBanned).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="dashboard-header-gradient rounded-2xl mx-4 sm:mx-6 lg:mx-8 mt-4 sm:mt-6 lg:mt-8 mb-6 sm:mb-8">
          <div className="relative z-10 px-6 sm:px-8 lg:px-12 py-8 sm:py-10 lg:py-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Title Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <FiUsers className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-1">
                      User Management
                    </h1>
                    <p className="text-white/90 text-lg sm:text-xl font-medium">
                      Manage and monitor your users
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-center">
                    <FiUsers className="w-6 h-6 text-white mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      {totalUsers}
                    </p>
                    <p className="text-white/80 text-xs">Total</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-center">
                    <FiUserCheck className="w-6 h-6 text-white mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      {activeUsers}
                    </p>
                    <p className="text-white/80 text-xs">Active</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-center">
                    <FiUserX className="w-6 h-6 text-white mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      {bannedUsers}
                    </p>
                    <p className="text-white/80 text-xs">Banned</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Filters Section */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <FiActivity className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                User Filters
              </h2>
            </div>
            <UserFilters filters={filters} setFilters={handleFiltersChange} />
          </div>

          {/* Content Section */}
          <div className="p-6">
            {error ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiAlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  Error Loading Users
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <UsersTable
                users={users}
                pagination={pagination}
                setPagination={handlePaginationChange}
                onBanUser={handleBanUser}
                onUnbanUser={handleUnbanUser}
                onDeleteUser={handleDeleteUser}
                loading={loading}
              />
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={dialogConfig.isOpen}
        onClose={closeDialog}
        onConfirm={dialogConfig.onConfirm}
        title={dialogConfig.title}
        message={dialogConfig.message}
        actionType={dialogConfig.actionType}
      />
    </div>
  );
}
