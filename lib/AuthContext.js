"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accountType, setAccountType] = useState(() => {
    try {
      return localStorage.getItem('account_type') || 'live';
    } catch { return 'live'; }
  });
  const router = useRouter();

  useEffect(() => {
    // Initialize authentication: try localStorage, then cookie via /api/auth/me, then mark loading=false
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        // Step 1: local storage
        try {
          const storedToken = localStorage.getItem('auth_token') || localStorage.getItem('token');
          const userData = localStorage.getItem('user_data') || localStorage.getItem('user');
          if (storedToken && userData) {
            if (!cancelled) {
              setToken(storedToken);
              try { setUser(JSON.parse(userData)); } catch { setUser(null); }
            }
          } else {
            // Step 2: cookie-based hydration
            const res = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' });
            if (res.ok) {
              const data = await res.json();
              if (!cancelled) {
                if (data?.token) {
                  setToken(data.token);
                  try { localStorage.setItem('auth_token', data.token); localStorage.setItem('token', data.token); } catch {}
                }
                if (data?.user) {
                  setUser(data.user);
                  try { localStorage.setItem('user_data', JSON.stringify(data.user)); localStorage.setItem('user', JSON.stringify(data.user)); } catch {}
                }
              }
            }
          }
        } catch {}
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    // Listen for global login-required events from API layer
    if (typeof window !== 'undefined') {
      const onLoginRequired = () => {
        try {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('token');
          localStorage.removeItem('user_data');
          localStorage.removeItem('user');
        } catch {}
        setUser(null);
        setToken(null);
        // Preserve redirect target
        const redirectTo = encodeURIComponent(window.location.pathname + window.location.search);
        router.push(`/auth/login?redirect=${redirectTo}`);
      };
      window.addEventListener('auth:login-required', onLoginRequired);
      return () => window.removeEventListener('auth:login-required', onLoginRequired);
    }
  }, []);

  const checkAuth = () => {
    try {
      const storedToken = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const userData = localStorage.getItem('user_data') || localStorage.getItem('user');
      if (storedToken && userData) {
        setToken(storedToken);
        try {
          setUser(JSON.parse(userData));
        } catch {
          setUser(null);
        }
      }
      const storedType = localStorage.getItem('account_type');
      if (storedType) setAccountType(storedType);
    } catch (error) {
      console.error('Error checking auth:', error);
      // Clear invalid data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store authentication data
        if (data.token) {
          setToken(data.token);
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('token', data.token);
        }
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('user_data', JSON.stringify(data.user));
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const refreshSession = async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' });
      if (!res.ok) return { ok: false };
      const data = await res.json();
      if (data?.token) {
        setToken(data.token);
        try { localStorage.setItem('auth_token', data.token); localStorage.setItem('token', data.token); } catch {}
      }
      if (data?.user) {
        setUser(data.user);
        try { localStorage.setItem('user_data', JSON.stringify(data.user)); localStorage.setItem('user', JSON.stringify(data.user)); } catch {}
      }
      return { ok: true, user: data?.user };
    } catch {
      return { ok: false };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setAccountType('live');
    const redirectTo = encodeURIComponent(typeof window !== 'undefined' ? (window.location.pathname + window.location.search) : '/');
    router.push(`/auth/login?redirect=${redirectTo}`);
  };

  const changeAccountType = (type) => {
    const normalized = (type || 'live').toLowerCase();
    setAccountType(normalized);
    try { localStorage.setItem('account_type', normalized); } catch {}
  };

  const updateUser = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem('user_data', JSON.stringify(userData));
      localStorage.setItem('user', JSON.stringify(userData));
    } catch {}
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!token,
    accountType,
    setAccountType: changeAccountType,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
