"use client"

import { useState, useEffect } from 'react';
import { auth } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter, usePathname } from 'next/navigation';
import { setCookie, deleteCookie } from 'cookies-next';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user data');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData: User) => {
    try {
      setUser(userData);
      // Let the auth form handle navigation
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to complete login');
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      deleteCookie('token');
      toast.success('Logged out successfully');
      window.location.href = '/login';
    } catch (error) {
      toast.error('Error logging out');
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