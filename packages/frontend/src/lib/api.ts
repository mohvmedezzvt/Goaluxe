import axios from "axios";

// API base URL, can be overridden by environment variable
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Create axios instance with default configurations
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include credentials (cookies) in requests
  headers: { "Content-Type": "application/json" },
});

// Request Interceptor - Attach Token
axiosInstance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response Interceptor - Handle 401 Errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await auth.refresh();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch {
        sessionStorage.clear();
        localStorage.clear();
        return {
          success: false,
          error: "Session expired. Please log in again.",
        };
      }
    }
    return {
      success: false,
      error: error.response?.data?.message || "Request failed",
    };
  }
);

/**
 * API Utility Functions - All return structured responses (No Throws)
 */
export const api = {
  get: async <T>(
    endpoint: string
  ): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
      const { data } = await axiosInstance.get<T>(endpoint);
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Request failed",
      };
    }
  },

  post: async <T>(
    endpoint: string,
    body: any
  ): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
      const { data } = await axiosInstance.post<T>(endpoint, body);
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Request failed",
      };
    }
  },

  put: async <T>(
    endpoint: string,
    body: any
  ): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
      const { data } = await axiosInstance.put<T>(endpoint, body);
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Request failed",
      };
    }
  },

  patch: async <T>(
    endpoint: string,
    body: any
  ): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
      const { data } = await axiosInstance.patch<T>(endpoint, body);
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Request failed",
      };
    }
  },

  delete: async <T>(
    endpoint: string
  ): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
      const { data } = await axiosInstance.delete<T>(endpoint);
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Request failed",
      };
    }
  },
};

/**
 * Authentication API - Returns structured responses (No Throws)
 */
export const auth = {
  login: async (
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    data?: { token: string; user: any };
    error?: string;
  }> => {
    const response = await api.post<{ token: string; user: any }>(
      "/auth/login",
      { email, password }
    );

    if (response.success) {
      sessionStorage.setItem("token", response.data!.token);
      sessionStorage.setItem("user", JSON.stringify(response.data!.user));
      localStorage.setItem("user", JSON.stringify(response.data!.user));
    }

    return response;
  },

  register: async (
    username: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const response = await api.post("/auth/register", {
      username,
      email,
      password,
    });

    if (response.success) {
      window.location.href = "/login";
    }

    return response;
  },

  refresh: async (): Promise<{
    success: boolean;
    token?: string;
    error?: string;
  }> => {
    const response = await api.post<{ token: string }>("/auth/refresh", {});

    if (response.success) {
      sessionStorage.setItem("token", response.data!.token);
      return { success: true, token: response.data!.token };
    } else {
      sessionStorage.clear();
      localStorage.clear();
      return response;
    }
  },

  logout: async (): Promise<{ success: boolean; error?: string }> => {
    const response = await api.post("/auth/logout", {});
    if (response.success) {
      sessionStorage.clear();
      localStorage.removeItem("user");
    }
    return response;
  },

  isAuthenticated: (): boolean => !!sessionStorage.getItem("token"),
};
