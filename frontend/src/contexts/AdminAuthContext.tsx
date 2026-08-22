"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { adminService } from "@/services/adminService";
import type { Admin, AdminLoginCredentials } from "@/types";

interface AdminAuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  loginAdmin: (credentials: AdminLoginCredentials) => Promise<void>;
  logoutAdmin: () => Promise<void>;
}

interface AdminAuthProviderProps {
  children: ReactNode;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

export function AdminAuthProvider({
  children,
}: AdminAuthProviderProps): React.JSX.Element {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAdminAuth = async (): Promise<void> => {
      try {
        const adminData: Admin | null = await adminService.getCurrentAdmin();
        if (adminData) {
          setAdmin(adminData);
        }
      } catch (error: any) {
        console.error("Admin auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initAdminAuth();
  }, []);

  const loginAdmin = async (
    credentials: AdminLoginCredentials
  ): Promise<void> => {
    try {
      const adminInfo: Admin = await adminService.login(credentials);
      setAdmin(adminInfo);
    } catch (error: any) {
      throw error;
    }
  };

  const logoutAdmin = async (): Promise<void> => {
    try {
      await adminService.logout();
      setAdmin(null);
    } catch (error: any) {
      console.error("Logout error:", error);
      // Still clear local state even if API call fails
      setAdmin(null);
    }
  };

  const contextValue: AdminAuthContextType = {
    admin,
    loginAdmin,
    logoutAdmin,
    isLoading,
  };

  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
