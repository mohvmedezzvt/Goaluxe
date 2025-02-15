"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/api";
import { toast } from "sonner";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user data");
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData: User) => {
    try {
      setUser(userData);
      // Let the auth form handle navigation
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to complete login");
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
      setUser(null);

      toast.success("Logged out successfully");
      window.location.href = "/login";
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
