// Authentication utility functions

// Simulate user authentication state
let currentUser = null;

export const authUtils = {
  // Check if user is authenticated
  isAuthenticated: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      return !!token;
    }
    return false;
  },

  // Get current user
  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  },

  // Login function
  login: async (email, password) => {
    try {
      // Simulate API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store authentication data
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user_data', JSON.stringify(data.user));
        }
        
        return { success: true, user: data.user };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Register function
  register: async (userData) => {
    try {
      // Simulate API call
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, message: 'Registration successful' };
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Logout function
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
    currentUser = null;
  },

  // Reset password function
  resetPassword: async (email) => {
    try {
      // Simulate API call
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        return { success: true, message: 'Reset instructions sent' };
      } else {
        throw new Error('Failed to send reset instructions');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// Hook for React components to use authentication
export const useAuth = () => {
  const isAuthenticated = authUtils.isAuthenticated();
  const user = authUtils.getCurrentUser();

  return {
    isAuthenticated,
    user,
    login: authUtils.login,
    register: authUtils.register,
    logout: authUtils.logout,
    resetPassword: authUtils.resetPassword,
  };
};

// ------------------ API Helper: verifyToken ------------------
// API routes are importing { verifyToken } from '@/lib/auth'
// এখানে আমরা একটি সিম্পল প্লেসহোল্ডার ভ্যালিডেশন করছি।
// বাস্তবে JWT_SECRET দিয়ে verify করে DB থেকে user ফেচ করতে হবে।

import jwt from 'jsonwebtoken';
import prisma from './prisma';

export async function verifyToken(token) {
  if (!token) return null;
  // DEV shortcut: Authorization: Bearer DEVUSER:<email>
  if (token.startsWith('DEVUSER:')) {
    const email = token.substring('DEVUSER:'.length);
    const user = await prisma.users.findFirst({ where: { email } });
    if (!user) return null;
    return { id: user.id, email: user.email, is_admin: user.is_admin };
  }
  try {
    const secret = process.env.JWT_SECRET || 'dev_secret';
    const payload = jwt.verify(token, secret);
    if (!payload?.id && payload?.email) {
      // Try lookup by email
      const user = await prisma.users.findFirst({ where: { email: payload.email } });
      if (user) return { id: user.id, email: user.email, is_admin: user.is_admin };
    }
    return { id: payload.id, email: payload.email, is_admin: payload.is_admin || false };
  } catch (e) {
    return null;
  }
}
