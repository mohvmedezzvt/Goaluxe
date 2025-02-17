import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include credentials (cookies)
  headers: { "Content-Type": "application/json" },
});
axiosInstance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const newAccessToken = await auth.refresh();
      if (newAccessToken) {
        error.config.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(error.config);
      }
    }
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
    try {
      const response = await api.post("/auth/login", { email, password });
      if (!response.success) throw new Error("Login failed");

      const data = (await response.data) as LoginResponse;
      let accessToken = data.token;
      const user = data.user;

      if (response.success && response.data) {
        sessionStorage.setItem("token", accessToken);
        sessionStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("user", JSON.stringify(user));
      }
      return {
        success: true,
        data: { token: accessToken, user },
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Login failed",
      };
    }
  },
  register: async (
    username: string,
    email: string,
    password: string
  ): Promise<ApiResponse<RegisterResponse>> => {
    try {
      const response = await api.post("/auth/register", {
        username,
        email,
        password,
      });

      if (response.success && response.data) {
        window.location.href = "/login";
      }
      return {
        success: true,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Registration failed",
      };
    }
  },

  refresh: async (): Promise<string> => {
    try {
      const response = await api.post(`/auth/refresh`, {});

      if (!response.success) {
        throw new Error("Refresh failed");
      }

      const data = (await response.data) as LoginResponse;
      let accessToken = data.token;
      const user = data.user;
      // Update the access token in memory or sessionStorage
      sessionStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      return accessToken;
    } catch (error) {
      // If refresh fails, clear storage and redirect to login
      sessionStorage.clear();
      localStorage.clear;
      window.location.href = "/login";
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await api.post("/auth/logout", {});
      if (!response.success) {
        throw new Error("Logout failed");
      }
      sessionStorage.clear();
      localStorage.clear();
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Registration failed",
      };
    }
  },
  isAuthenticated: () => !!sessionStorage.get("token"),
};
