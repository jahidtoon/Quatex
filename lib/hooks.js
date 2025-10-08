// DEPRECATED: useAuth / useApi in this file kept for backward compatibility.
// New code should import from AuthContext (useAuth) and useOpenTrades where appropriate.
import { useAuth as useAuthCtx } from '@/lib/AuthContext';

export function useAuth() {
  const ctx = useAuthCtx();
  // Provide the same shape legacy callers expect (token, user, updateUser, isAuthenticated etc.)
  return ctx;
}

export function useApi() {
  const { token } = useAuth();

  const apiCall = async (endpoint, options = {}) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(endpoint, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  return { apiCall };
}
