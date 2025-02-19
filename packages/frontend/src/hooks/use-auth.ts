"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Custom hook to manage authentication state in a Next.js application.
 *
 * This hook provides methods for login, logout, and authentication status.
 * It also synchronizes authentication state with session storage.
 *
 * @returns {object} Authentication state and actions:
 * - `user`: The currently authenticated user (or `null` if not logged in).
 * - `loading`: Boolean indicating whether authentication is being checked.
 * - `isAuthenticated`: Boolean indicating if a user is logged in.
 * - `login`: Function to authenticate and set user state.
 * - `logout`: Function to log out and clear user state.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Run authentication check on mount
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Checks if a user is stored in session storage and sets authentication state accordingly.
   */
  const checkAuth = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user data from session storage:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logs in the user by setting the user state.
   *
   * @param {User} userData - The authenticated user data.
   */
  const login = async (userData: User) => {
    try {
      setUser(userData);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to complete login");
    }
  };

  /**
   * Logs out the user by clearing authentication state and redirecting to login.
   */
  const logout = async () => {
    try {
      await auth.logout();
      queryClient.removeQueries(); // Clear all cached queries related to authentication
      setUser(null);
      toast.success("Logged out successfully");
      router.push("login"); // Redirect user to login page
    } catch (error) {
      console.error("Logout error:", error);
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
