const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Safe localStorage operations
const storage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Error accessing localStorage:', e);
      return null;
    }
  },
  set: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('Error setting localStorage:', e);
    }
  },
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing from localStorage:', e);
    }
  }
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type LoginResponse = {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
};

export type RegisterResponse = LoginResponse;

export const api = {
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const token = storage.get('token');
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while fetching data',
      };
    }
  },

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const token = storage.get('token');
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while sending data',
      };
    }
  },

  // Add other methods (PUT, DELETE) as needed
};

export const auth = {
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    if (response.success && response.data) {
      storage.set('token', response.data.token);
      storage.set('user', JSON.stringify(response.data.user));
    }
    return response;
  },

  async register(username: string, email: string, password: string): Promise<ApiResponse<RegisterResponse>> {
    const response = await api.post<RegisterResponse>('/auth/register', { username, email, password });
    if (response.success && response.data) {
      storage.set('token', response.data.token);
      storage.set('user', JSON.stringify(response.data.user));
    }
    return response;
  },

  async logout(): Promise<void> {
    storage.remove('token');
    storage.remove('user');
  },

  isAuthenticated(): boolean {
    return !!storage.get('token');
  }
};