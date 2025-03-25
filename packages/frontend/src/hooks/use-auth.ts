"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { auth } from "@/lib/api";
import { addToast } from "@heroui/react";
interface AuthResponse {
  success: boolean;
  error?: string;
  data?: {
    user: User;
  };
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  handleAuth: (
    mode: "login" | "register",
    formData: any,
    validateForm: () => boolean,
    setErrors: (errors: any) => void,
    setIsLoading: (loading: boolean) => void
  ) => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to parse user data from storage:", error);
      addToast({
        title: "Authentication Error",
        description: "Failed to load user data. Please log in again.",
        color: "danger",
        timeout: 2500,
      });
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData: User) => {
    try {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
      setUser(null);
      localStorage.removeItem("user");
      queryClient.clear();
      addToast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
        timeout: 2500,
      });
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      addToast({
        title: "Logout Failed",
        description: "An error occurred during logout. Please try again.",
        color: "danger",
      });
    }
  };

  const handleAuth = useCallback(
    async (
      mode: "login" | "register",
      formData: any,
      validateForm: () => boolean,
      setErrors: (errors: any) => void,
      setIsLoading: (loading: boolean) => void
    ) => {
      if (!validateForm()) return;

      setIsLoading(true);

      try {
        let response: AuthResponse;
        if (mode === "login") {
          response = await auth.login(formData.email, formData.password);
        } else {
          response = await auth.register(
            `${formData.firstName} ${formData.secondName}`,
            formData.email,
            formData.password
          );
        }

        if (!response.success || !response.data) {
          throw new Error(response.error || "Authentication failed");
        }

        addToast({
          title:
            mode === "login"
              ? `Welcome back, ${response.data.user.username}!`
              : "Account created successfully!",
          color: "success",
          timeout: 2000,
        });

        await login(response.data.user);
        router.push("/dashboard");
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again later.";
        setErrors({
          general:
            mode === "login"
              ? "Login failed. Incorrect email or password. Please try again."
              : "Signup failed. Please check your details and try again.",
        });
        addToast({
          title: mode === "login" ? "Login Error" : "SignUp Error",
          description: errorMessage,
          color: "danger",
          timeout: 2000,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [login, router]
  );

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    handleAuth,
  };
}
