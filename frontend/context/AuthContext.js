"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "@/lib/api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    // Show any session-invalidation message stored by the API interceptor
    const msg = sessionStorage.getItem("auth_message");
    if (msg) {
      toast.error(msg);
      sessionStorage.removeItem("auth_message");
    }
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await authAPI.getMe();
      if (data.success) {
        setUser(data.user);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Student login — backend rejects admin accounts.
   */
  const login = async (email, password) => {
    try {
      const { data } = await authAPI.login({ email, password });
      if (data.success) {
        setUser(data.user);
        toast.success("Welcome back!");
        return data.user;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      throw error;
    }
  };

  /**
   * Admin login — backend rejects student accounts.
   */
  const adminLogin = async (email, password) => {
    try {
      const { data } = await authAPI.adminLogin({ email, password });
      if (data.success) {
        setUser(data.user);
        toast.success(`Welcome back, ${data.user.name}!`);
        return data.user;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Admin login failed");
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await authAPI.register({ name, email, password });
      if (data.success) {
        setUser(data.user);
        toast.success("Account created!");
        return data.user;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Even if the request fails, clear local state
    } finally {
      setUser(null);
      toast.success("Logged out");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, adminLogin, register, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
