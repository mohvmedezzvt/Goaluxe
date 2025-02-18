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

/**
 * Request interceptor to attach the token to request headers.
 *
 * @param {AxiosRequestConfig} config - Axios request configuration.
 * @returns {AxiosRequestConfig} - Modified configuration with Authorization header.
 */
axiosInstance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Response interceptor to handle 401 Unauthorized errors by refreshing the token.
 *
 * @param {AxiosError} error - The error object from Axios response.
 * @returns {Promise<AxiosResponse>} - Retries the request with the new token.
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const newAccessToken = await auth.refresh();
      if (newAccessToken) {
        error.config.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(error.config); // Retry the original request with new token
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Utility function for interacting with API using axios.
 */
export const api = {
  /**
   * GET request to the API.
   *
   * @param {string} endpoint - The API endpoint to call.
   * @returns {Promise<ApiResponse<T>>} - The API response wrapped in a success/failure object.
   */
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

  /**
   * POST request to the API.
   *
   * @param {string} endpoint - The API endpoint to call.
   * @param {any} body - The body to send with the request.
   * @returns {Promise<ApiResponse<T>>} - The API response wrapped in a success/failure object.
   */
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

  /**
   * PUT request to the API.
   *
   * @param {string} endpoint - The API endpoint to call.
   * @param {any} body - The body to send with the request.
   * @returns {Promise<ApiResponse<T>>} - The API response wrapped in a success/failure object.
   */
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

  /**
   * DELETE request to the API.
   *
   * @param {string} endpoint - The API endpoint to call.
   * @returns {Promise<ApiResponse<T>>} - The API response wrapped in a success/failure object.
   */
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

/**
 * Authentication-related API calls.
 */
export const auth = {
  /**
   * Logs in a user with email and password.
   *
   * @param {string} email - User's email.
   * @param {string} password - User's password.
   * @returns {Promise<ApiResponse<LoginResponse>>} - Response containing user data and token.
   */
  login: async (
    email: string,
    password: string
  ): Promise<ApiResponse<LoginResponse>> => {
    try {
      const response = await api.post("/auth/login", { email, password });
      if (!response.success) throw new Error("Login failed");

      const data = response.data as LoginResponse;
      let accessToken = data.token;
      const user = data.user;

      if (response.success && response.data) {
        sessionStorage.setItem("token", accessToken);
        sessionStorage.setItem("user", JSON.stringify(user));
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

  /**
   * Registers a new user with a username, email, and password.
   *
   * @param {string} username - User's chosen username.
   * @param {string} email - User's email.
   * @param {string} password - User's password.
   * @returns {Promise<ApiResponse<RegisterResponse>>} - Registration result.
   */
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
        window.location.href = "/login"; // Redirect to login page after successful registration
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

  /**
   * Refreshes the access token when expired.
   *
   * @returns {Promise<string>} - The new access token.
   * @throws Will throw an error if the refresh fails.
   */
  refresh: async (): Promise<string> => {
    try {
      const response = await api.post(`/auth/refresh`, {});
      if (!response.success) throw new Error("Refresh failed");

      const data = response.data as LoginResponse;
      const accessToken = data.token;

      sessionStorage.setItem("token", accessToken);
      return accessToken;
    } catch (error) {
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = "/login"; // Redirect to login on refresh failure
      throw error;
    }
  },

  /**
   * Logs out the user by clearing session data.
   */
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
        error: err instanceof Error ? err.message : "Logout failed",
      };
    }
  },

  /**
   * Checks if the user is authenticated.
   *
   * @returns {boolean} - Returns true if the user is authenticated, otherwise false.
   */
  isAuthenticated: () => !!sessionStorage.getItem("token"),
};
