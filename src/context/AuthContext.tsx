import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { User, LoginCredentials, RegisterData } from "@/types/auth";
import * as api from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ user?: User }>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const checkAuth = async () => {
    try {
      const response = await api.checkAuth();
      if (response.authenticated && response.user) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("[Auth] Check auth failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      // Get CSRF token first
      await api.getCsrfTokenFromServer();
      
      const response = await api.login(credentials);
      if (response.user) {
        queryClient.clear();
        setUser(response.user);
        return { user: response.user };
      } else {
        throw new Error(response.error || "Login failed");
      }
    } catch (error) {
      console.error("[Auth] Login failed:", error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      // Get CSRF token first
      await api.getCsrfTokenFromServer();
      
      const response = await api.register(data);
      if (response.user) {
        setUser(response.user);
      } else {
        throw new Error(response.error || "Registration failed");
      }
    } catch (error) {
      console.error("[Auth] Registration failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      queryClient.clear();
      setUser(null);
    } catch (error) {
      console.error("[Auth] Logout failed:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
