import axios from "axios";
import { deleteCookie, setCookie } from "cookies-next";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const storage = {
  get: (key: string) => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error("Error accessing localStorage:", e);
      return null;
    }
  },
  set: (key: string, value: string) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error("Error setting localStorage:", e);
    }
  },
  remove: (key: string) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("Error removing from localStorage:", e);
    }
  },
};

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
  const token = storage.get("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export const api = {
  get: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      const { data } = await axiosInstance.get<T>(endpoint);
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Request failed",
      };
    }
  },
  post: async <T>(endpoint: string, body: any): Promise<ApiResponse<T>> => {
    try {
      const { data } = await axiosInstance.post<T>(endpoint, body);
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Request failed",
      };
    }
  },
  put: async <T>(endpoint: string, body: any): Promise<ApiResponse<T>> => {
    try {
      const { data } = await axiosInstance.put<T>(endpoint, body);
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Request failed",
      };
    }
  },
  delete: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      const { data } = await axiosInstance.delete<T>(endpoint);
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Request failed",
      };
    }
  },
};

export const auth = {
  login: async (
    email: string,
    password: string
  ): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    if (response.success && response.data) {
      setCookie("token", response.data.token);
      storage.set("token", response.data.token);
      storage.set("user", JSON.stringify(response.data.user));
    }
    return response;
  },
  register: async (
    username: string,
    email: string,
    password: string
  ): Promise<ApiResponse<RegisterResponse>> => {
    const response = await api.post<RegisterResponse>("/auth/register", {
      username,
      email,
      password,
    });
    if (response.success && response.data) {
      storage.set("token", response.data.token);
      storage.set("user", JSON.stringify(response.data.user));
    }
    return response;
  },
  logout: () => {
    deleteCookie("token");
    storage.remove("token");
    storage.remove("user");
  },
  isAuthenticated: () => !!storage.get("token"),
};
