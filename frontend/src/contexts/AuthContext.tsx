"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService } from "@/services/auth";
import { logger } from "@/utils/logger";
import {
  User,
  LoginCredentials,
  RegisterData,
  LoginResponse,
  RegisterResponse,
} from "@/types";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (formData: LoginCredentials) => Promise<LoginResponse>;
  register: (userData: RegisterData) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setUser(user);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (formData: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await authService.login(formData);
      if (response?.user) {
        setUser(response.user);
        return response;
      }
      throw new Error("Invalid response from server");
    } catch (error) {
      throw error;
    }
  };

  const register = async (
    userData: RegisterData
  ): Promise<RegisterResponse> => {
    try {
      const response = await authService.register(userData);
      logger.debug("AuthContext register response:", response);
      return response;
    } catch (error) {
      console.error("AuthContext register error:", error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
