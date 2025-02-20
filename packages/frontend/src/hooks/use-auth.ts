"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/api";
import { addToast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Custom hook to manage authentication state in a Next.js application.
 *
 * This hook provides methods for login, logout, and authentication status.
 * It also synchronizes authentication state with session storage.
 *
 * @returns {AuthState} Authentication state and actions:
 * - `user`: The currently authenticated user (or `null` if not logged in).
 * - `loading`: Boolean indicating whether authentication is being checked.
 * - `isAuthenticated`: Boolean indicating if a user is logged in.
 * - `login`: Function to authenticate and set user state.
 * - `logout`: Function to log out and clear user state.
 */
export function useAuth(): AuthState {
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
  const checkAuth = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to parse user data from session storage:", error);
      addToast({
        title: "Authentication Error",
        description: "Failed to load user data. Please log in again.",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logs in the user by setting the user state and storing it in session storage.
   *
   * @param {User} userData - The authenticated user data.
   */
  const login = async (userData: User) => {
    try {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      addToast({
        title: "Login Successful",
        description: `Welcome back, ${userData.username}!`,
        color: "success",
      });
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  /**
   * Logs out the user by clearing authentication state, session storage, and redirecting to login.
   */
  const logout = async () => {
    try {
      await auth.logout();
      setUser(null);
      localStorage.removeItem("user");
      queryClient.clear(); // Clear all cached queries
      addToast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
        color: "success",
      });
      router.push("/login"); // Redirect user to login page
    } catch (error) {
      console.error("Logout error:", error);
      addToast({
        title: "Logout Failed",
        description: "An error occurred during logout. Please try again.",
        color: "danger",
      });
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
